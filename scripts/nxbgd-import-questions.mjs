#!/usr/bin/env node
// Pull questions for imported lessons from NXBGD's get-list-question API
// and write them into our `questions` table.
//
// Lesson skeletons must already exist (run nxbgd-import.mjs first). For
// each lesson whose source_id starts with "bookindex_", this script
// fetches the parent chapter's bookId (from chapter.source_id "book_<id>"),
// pulls all questions for that book paginated, groups them by bookIndexId,
// converts each into our schema (mcq / short), and inserts.
//
// Type mapping (lossy on purpose — we accept lower coverage for cleaner output):
//   fill_blank w/ exactly 1 fill position  →  short    (correct = that content)
//   fill_blank w/ no positions, 1 answer    →  short    (correct = answer.content)
//   mcq / multiple_choice (1 correct)       →  mcq      (options + correct)
//   mcq / multiple_choice (>1 correct)      →  multi
//   anything else (math_col, multi-blank…)  →  SKIP, logged
//
// HTML in `content` and answers is cleaned: tags stripped, entities
// decoded, Wirisformula `<img alt="X over Y" ...>` rewritten to LaTeX
// like `$\frac{X}{Y}$` heuristically.
//
// Idempotency: lessons that already have ≥1 question in DB are skipped
// entirely. Re-running won't dup. To re-import a single lesson, clear
// its questions manually first.
//
// Requirements: Node 20.6+, NXBGD_TOKEN, NEXT_PUBLIC_SUPABASE_URL (or
// SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY.
//
// Usage:
//   node --env-file=.env.local scripts/nxbgd-import-questions.mjs --books 402 [--dry-run]
//
// To restrict to specific lessons (by our internal lesson id):
//   node --env-file=.env.local scripts/nxbgd-import-questions.mjs --lessons 123,456

const NXBGD = "https://apihanhtrangso.nxbgd.vn:8080/api";
const PAGE_SIZE = 100;
const MAX_PAGES = 50;
const MAX_PER_LESSON = Number(process.env.NXBGD_MAX_PER_LESSON || 20); // cap to keep quizzes reasonable

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}
function hasFlag(name) {
  return process.argv.includes(name);
}

const booksRaw = arg("--books");
const lessonsRaw = arg("--lessons");
const dryRun = hasFlag("--dry-run");
const verbose = hasFlag("--verbose");

const token = process.env.NXBGD_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!booksRaw && !lessonsRaw) {
  console.error("Pass --books <id1,id2> or --lessons <id1,id2>");
  process.exit(1);
}
if (!token) {
  console.error("Missing NXBGD_TOKEN env var");
  process.exit(1);
}
if (!supabaseUrl || !serviceKey) {
  console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// ── NXBGD ────────────────────────────────────────────────────────────────────

async function nxbgdGet(url) {
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      origin: "https://hanhtrangso.nxbgd.vn",
      referer: "https://hanhtrangso.nxbgd.vn/",
    },
  });
  if (!res.ok) throw new Error(`NXBGD ${url} → HTTP ${res.status}`);
  const body = await res.json();
  if (body.status !== "success") throw new Error(`NXBGD ${url} → bad: ${JSON.stringify(body).slice(0, 300)}`);
  return body.data;
}

// NXBGD's `bookIndexId` URL param is ignored server-side — the same pool
// comes back regardless. So we fetch the whole book once, dedupe by
// questionId (pagination otherwise loops past the actual end), and
// group locally on each question's body `bookIndexId` field, which IS
// the reliable per-leaf tag.
async function fetchAllQuestionsForBook(bookId) {
  const all = [];
  const seen = new Set();
  for (let page = 0; page < MAX_PAGES; page++) {
    const url = `${NXBGD}/Book/get-list-question?bookId=${bookId}&bookIndexId=0&pageIndex=${page}&numberOfPage=${PAGE_SIZE}`;
    const rows = await nxbgdGet(url);
    if (!rows || rows.length === 0) break;
    let added = 0;
    for (const r of rows) {
      if (seen.has(r.questionId)) continue;
      seen.add(r.questionId);
      all.push(r);
      added += 1;
    }
    if (added === 0 || rows.length < PAGE_SIZE) break;
  }
  return all;
}

// ── Supabase ─────────────────────────────────────────────────────────────────

async function sb(method, path, body, headers = {}) {
  const url = `${supabaseUrl}/rest/v1/${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      "content-type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase ${method} ${path} → ${res.status}: ${text}`);
  }
  // Supabase returns 201 with empty body when Prefer: return=representation
  // isn't set (we only need IDs back for the lookups, not inserts).
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── HTML / math cleanup ──────────────────────────────────────────────────────

// Convert Wirisformula `alt` attribute (e.g. "75 over 100", "1 space equals
// space 2 over 2") to a best-effort LaTeX or plain text. Lossy — complex
// alts fall through unchanged.
function wirisAltToText(alt) {
  if (!alt) return "";
  let s = alt;
  // "X over Y" → \frac{X}{Y}
  s = s.replace(/(\S+)\s+over\s+(\S+)/g, "\\frac{$1}{$2}");
  // " equals " → " = "
  s = s.replace(/\s+equals\s+/g, " = ");
  // " plus / minus / times / divided by "
  s = s.replace(/\s+plus\s+/g, " + ");
  s = s.replace(/\s+minus\s+/g, " - ");
  s = s.replace(/\s+times\s+/g, " \\times ");
  s = s.replace(/\s+divided\s+by\s+/g, " \\div ");
  // " space " (Wiris uses literal "space" between tokens) → " "
  s = s.replace(/\s+space\s+/g, " ");
  // Collapse spaces
  s = s.replace(/\s+/g, " ").trim();
  // Wrap in $...$ if the result has any LaTeX backslash command or fraction
  if (/\\[a-zA-Z]+|\{|\}/.test(s)) s = `$${s}$`;
  return s;
}

function stripHtmlAndEntities(s) {
  if (!s) return "";
  // 1. Replace Wirisformula images with their alt-derived math text.
  s = s.replace(/<img\b[^>]*>/gi, (tag) => {
    const isWiris = /class="[^"]*Wirisformula[^"]*"/i.test(tag) || /data-mathml=/i.test(tag);
    const alt = tag.match(/\balt="([^"]*)"/i)?.[1];
    if (isWiris && alt) return ` ${wirisAltToText(alt)} `;
    // Keep non-Wiris real image URLs (Uploads/*) inline as markdown-ish — but we strip later anyway.
    const src = tag.match(/\bsrc="([^"]*)"/i)?.[1];
    if (src && !src.startsWith("data:")) return ` [image: ${src}] `;
    return " ";
  });
  // 2. Drop remaining tags.
  s = s.replace(/<[^>]+>/g, " ");
  // 3. Decode common entities.
  s = s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#xA0;/gi, " ")
    .replace(/&#160;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
  // 4. Collapse whitespace.
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

// ── Question conversion ──────────────────────────────────────────────────────

function isPositionalFill(a) {
  return typeof a?.position === "string" && /^\d+_\d+$/.test(a.position);
}

// Returns a row ready for INSERT into `questions`, or null to skip.
function convertQuestion(q) {
  const content = stripHtmlAndEntities(q.content);
  if (!content) return { skip: "empty content" };

  const type = q.type;

  if (type === "fill_blank") {
    const answers = q.answers ?? [];
    const positional = answers.filter(isPositionalFill);
    if (positional.length === 1) {
      const ans = stripHtmlAndEntities(positional[0].content);
      if (!ans) return { skip: "fill_blank empty answer" };
      return { row: { content, type: "short", options: [], correct_answer: ans } };
    }
    if (positional.length === 0) {
      // Sometimes the lone answer carries the correct value as content with no position.
      const lone = answers.find((a) => a.content && !a.position);
      if (lone) {
        const ans = stripHtmlAndEntities(lone.content);
        if (ans) return { row: { content, type: "short", options: [], correct_answer: ans } };
      }
      return { skip: "fill_blank no usable answer" };
    }
    return { skip: `fill_blank multi-position (${positional.length})` };
  }

  // NXBGD has many MCQ-variant type names with the same answer shape.
  const MCQ_TYPES = new Set([
    "mcq",
    "multiple_choice",
    "single_choice",
    "radio",
    "select",
    "down_answer",
    "circle_answer",
  ]);
  const MULTI_TYPES = new Set(["checkbox"]);

  if (type === "group") {
    // Parent of sub-questions (which appear as separate top-level rows with
    // parentId set); the parent itself has no usable answer.
    return { skip: "group (parent of sub-questions)" };
  }

  if (MULTI_TYPES.has(type)) {
    const opts = (q.answers ?? [])
      .filter((a) => a.code && a.content != null)
      .map((a) => ({ text: stripHtmlAndEntities(a.content), correct: a.correct }))
      .filter((a) => a.text);
    if (opts.length < 2) return { skip: "checkbox <2 options" };
    const correctOpts = opts.filter((o) => o.correct === "1" || o.correct === true || o.correct === 1);
    if (correctOpts.length === 0) return { skip: "checkbox no correct" };
    return {
      row: {
        content,
        type: "multi",
        options: opts.map((o) => o.text),
        correct_answer: JSON.stringify(correctOpts.map((o) => o.text)),
      },
    };
  }

  if (MCQ_TYPES.has(type)) {
    const opts = (q.answers ?? [])
      .filter((a) => a.code && a.content != null)
      .map((a) => ({ text: stripHtmlAndEntities(a.content), correct: a.correct, code: a.code }))
      .filter((a) => a.text);
    if (opts.length < 2) return { skip: "mcq <2 options" };
    const correctOpts = opts.filter((o) => o.correct === "1" || o.correct === true || o.correct === 1);
    if (correctOpts.length === 0) return { skip: "mcq no correct flag" };
    if (correctOpts.length === 1) {
      return {
        row: {
          content,
          type: "mcq",
          options: opts.map((o) => o.text),
          correct_answer: correctOpts[0].text,
        },
      };
    }
    return {
      row: {
        content,
        type: "multi",
        options: opts.map((o) => o.text),
        correct_answer: JSON.stringify(correctOpts.map((o) => o.text)),
      },
    };
  }

  if (type === "true_false") {
    // Each answer has correct = "1"/"0". Convert to mcq with 2 options.
    const opts = (q.answers ?? [])
      .filter((a) => a.content != null)
      .map((a) => ({ text: stripHtmlAndEntities(a.content) || (a.code ?? "?"), correct: a.correct }));
    if (opts.length !== 2) return { skip: `true_false ${opts.length} options` };
    const c = opts.find((o) => o.correct === "1" || o.correct === true);
    if (!c) return { skip: "true_false no correct" };
    return {
      row: { content, type: "mcq", options: opts.map((o) => o.text), correct_answer: c.text },
    };
  }

  return { skip: `unsupported type: ${type}` };
}

// ── Per-book processing ──────────────────────────────────────────────────────

async function processChapter(chapter) {
  const m = chapter.source_id.match(/^book_(\d+)$/);
  if (!m) {
    console.log(`  chapter ${chapter.id} source_id="${chapter.source_id}" — not a book_* import, skipping`);
    return { imported: 0, lessons: 0 };
  }
  const bookId = Number(m[1]);

  console.log(`\n━━ Chapter ${chapter.id} ("${chapter.title}") · NXBGD book ${bookId} ━━`);

  // Lessons we imported under this chapter that map back to NXBGD bookIndexs.
  const lessons = await sb(
    "GET",
    `lessons?chapter_id=eq.${chapter.id}&source_id=like.bookindex_*&select=id,title,source_id`,
  );
  if (lessons.length === 0) {
    console.log("  (no imported lessons under this chapter)");
    return { imported: 0, lessons: 0 };
  }

  console.log(`  fetching all questions for book ${bookId}…`);
  const allQ = await fetchAllQuestionsForBook(bookId);
  console.log(`  fetched ${allQ.length} unique questions, grouping by bookIndexId`);
  const byBookIndex = new Map();
  for (const q of allQ) {
    const key = q.bookIndexId;
    const arr = byBookIndex.get(key) ?? [];
    arr.push(q);
    byBookIndex.set(key, arr);
  }

  let totalImported = 0;
  let touched = 0;
  const skipReasons = new Map();

  for (const lesson of lessons) {
    const mm = lesson.source_id.match(/^bookindex_(\d+)$/);
    if (!mm) continue;
    const bookIndexId = Number(mm[1]);
    const lessonQs = byBookIndex.get(bookIndexId) ?? [];
    if (lessonQs.length === 0) {
      if (verbose) console.log(`  - "${lesson.title}": no NXBGD questions tagged bookIndex=${bookIndexId}`);
      continue;
    }

    // Skip if lesson already has questions.
    const existing = await sb("GET", `questions?lesson_id=eq.${lesson.id}&select=id&limit=1`);
    if (existing.length > 0) {
      if (verbose) console.log(`  - "${lesson.title}": already has questions, skip`);
      continue;
    }

    // Sort by orderNo so the first N (after cap) are deterministic.
    const ordered = [...lessonQs].sort((a, b) => (a.orderNo ?? 0) - (b.orderNo ?? 0));

    // Convert; track skip reasons.
    const rows = [];
    for (const q of ordered) {
      const r = convertQuestion(q);
      if (r.row) rows.push(r.row);
      else skipReasons.set(r.skip, (skipReasons.get(r.skip) ?? 0) + 1);
    }

    if (rows.length === 0) {
      console.log(`  - "${lesson.title}": 0/${lessonQs.length} importable`);
      continue;
    }

    const cappedFrom = rows.length;
    if (rows.length > MAX_PER_LESSON) rows.length = MAX_PER_LESSON;
    const capInfo = cappedFrom > MAX_PER_LESSON ? ` (capped from ${cappedFrom})` : "";

    if (dryRun) {
      console.log(`  [dry-run] "${lesson.title}": would insert ${rows.length}/${lessonQs.length}${capInfo}`);
      if (verbose) {
        for (const r of rows.slice(0, 2)) {
          console.log(`      · [${r.type}] ${r.content.slice(0, 80)}`);
          console.log(`         → ${r.correct_answer.slice(0, 80)}`);
        }
      }
    } else {
      const insertRows = rows.map((r, i) => ({
        lesson_id: lesson.id,
        content: r.content,
        type: r.type,
        options: r.options,
        correct_answer: r.correct_answer,
        explanation: null,
        order_index: i + 1,
      }));
      await sb("POST", "questions", insertRows);
      console.log(`  - "${lesson.title}": +${rows.length}/${lessonQs.length}${capInfo}`);
    }
    totalImported += rows.length;
    touched += 1;
  }

  if (skipReasons.size > 0) {
    console.log(`  skip reasons (across all lessons):`);
    for (const [reason, count] of [...skipReasons.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`    × ${reason}: ${count}`);
    }
  }

  return { imported: totalImported, lessons: touched };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  let chapters;

  if (booksRaw) {
    const bookIds = booksRaw.split(",").map((s) => Number(s.trim())).filter(Boolean);
    // PostgREST `in.()` syntax for filter on source_id
    const sourceIds = bookIds.map((id) => `book_${id}`);
    const inList = `(${sourceIds.map((s) => `"${s}"`).join(",")})`;
    chapters = await sb("GET", `chapters?source_id=in.${inList}&select=id,title,source_id,subject_id`);
    if (chapters.length === 0) {
      console.error(`No chapters in DB with source_id in [${sourceIds.join(", ")}]`);
      console.error("Run scripts/nxbgd-import.mjs first to create chapter + lesson skeletons.");
      process.exit(2);
    }
  } else {
    const lessonIds = lessonsRaw.split(",").map((s) => Number(s.trim())).filter(Boolean);
    const lessons = await sb("GET", `lessons?id=in.(${lessonIds.join(",")})&select=chapter_id`);
    const chapterIds = [...new Set(lessons.map((l) => l.chapter_id))];
    chapters = await sb(
      "GET",
      `chapters?id=in.(${chapterIds.join(",")})&select=id,title,source_id,subject_id`,
    );
  }

  console.log(`NXBGD question import — chapters=${chapters.length} dryRun=${dryRun}`);
  let total = { imported: 0, lessons: 0 };
  for (const ch of chapters) {
    try {
      const r = await processChapter(ch);
      total.imported += r.imported;
      total.lessons += r.lessons;
    } catch (err) {
      console.error(`  ✗ chapter ${ch.id}: ${err.message}`);
    }
  }
  console.log(`\n━━ Done ━━`);
  console.log(`  lessons touched: ${total.lessons}`);
  console.log(`  questions inserted: ${total.imported}`);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
