#!/usr/bin/env node
// Pull "Luyện tập" / "Luyện tập chung" lessons from one or more NXBGD
// workbooks (Vở bài tập) and upsert them into our DB as skeletons —
// just chapter + lesson titles, no questions. Bro then fills questions
// per lesson via the existing paste-import flow.
//
// Requirements:
//   - Node 18+ (global fetch)
//   - NXBGD_TOKEN          fresh Bearer from hanhtrangso.nxbgd.vn DevTools (~3h TTL)
//   - SUPABASE_URL         e.g. https://xxx.supabase.co
//   - SUPABASE_SERVICE_ROLE_KEY   service role (bypasses RLS)
//
// Usage:
//   NXBGD_TOKEN=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//     node scripts/nxbgd-import.mjs --books 402,110 [--dry-run] [--match "luyện tập"]
//
// Idempotency: matches existing chapters/lessons by source_id
// (`book_<bookId>` for chapters, `bookindex_<bookIndexId>` for lessons).
// Re-running won't dup. Manual rows (source_id NULL) untouched.

const NXBGD = "https://apihanhtrangso.nxbgd.vn:8080/api";

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

const bookIdsRaw = arg("--books");
const dryRun = hasFlag("--dry-run");
const matchPrefix = (arg("--match", "luyện tập") || "").toLowerCase().trim();

const token = process.env.NXBGD_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!bookIdsRaw) {
  console.error("Missing --books <id1,id2,...>");
  process.exit(1);
}
if (!token) {
  console.error("Missing NXBGD_TOKEN env var");
  process.exit(1);
}
if (!dryRun && (!supabaseUrl || !serviceKey)) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (or pass --dry-run)");
  process.exit(1);
}

const bookIds = bookIdsRaw.split(",").map((s) => Number(s.trim())).filter(Boolean);

// ── NXBGD helpers ────────────────────────────────────────────────────────────

async function nxbgdGetBook(bookId) {
  const url = `${NXBGD}/book/${bookId}`;
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
  if (body.status !== "success" || !body.data) {
    throw new Error(`NXBGD ${url} → bad status: ${JSON.stringify(body)}`);
  }
  return body.data;
}

// Collect leaf bookIndexs (nodes with no children) from the recursive tree.
function flattenLeaves(indexs) {
  const out = [];
  function walk(items) {
    for (const it of items ?? []) {
      if (it.bookIndexChilds && it.bookIndexChilds.length > 0) {
        walk(it.bookIndexChilds);
      } else {
        out.push(it);
      }
    }
  }
  walk(indexs);
  return out;
}

function matchesLuyenTap(name) {
  const n = (name || "").toLowerCase().trim();
  return n.startsWith(matchPrefix);
}

function bookSlugUrl(book) {
  return `https://hanhtrangso.nxbgd.vn/sach-dien-tu/${book.slug}-${book.bookId}`;
}

// ── Supabase helpers ─────────────────────────────────────────────────────────

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
    throw new Error(`Supabase ${method} ${path} → HTTP ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function findOrCreateSubject(grade, name) {
  const rows = await sb("GET", `subjects?grade=eq.${grade}&name=eq.${encodeURIComponent(name)}&select=id,name,grade`);
  if (rows.length > 0) return rows[0];
  const created = await sb("POST", `subjects?select=id,name,grade`, { grade, name, order_index: 99 }, { Prefer: "return=representation" });
  return Array.isArray(created) ? created[0] : created;
}

async function findChapterBySourceId(sourceId) {
  const rows = await sb("GET", `chapters?source_id=eq.${encodeURIComponent(sourceId)}&select=id,title,subject_id,source_id`);
  return rows[0] ?? null;
}

async function insertChapter(row) {
  const created = await sb("POST", `chapters?select=id,title,subject_id,source_id`, row, { Prefer: "return=representation" });
  return Array.isArray(created) ? created[0] : created;
}

async function findLessonBySourceId(sourceId) {
  const rows = await sb("GET", `lessons?source_id=eq.${encodeURIComponent(sourceId)}&select=id,title,chapter_id,source_id`);
  return rows[0] ?? null;
}

async function insertLesson(row) {
  const created = await sb("POST", `lessons?select=id,title,chapter_id,source_id`, row, { Prefer: "return=representation" });
  return Array.isArray(created) ? created[0] : created;
}

// ── Per-book processing ──────────────────────────────────────────────────────

async function processBook(bookId) {
  console.log(`\n━━ Book ${bookId} ━━`);
  const book = await nxbgdGetBook(bookId);
  console.log(`  ${book.name}`);
  console.log(`  className=${book.className} subject=${book.subjectName} grade=${book.classNo} bookGroup=${book.bookTypeName ?? "?"}`);

  const leaves = flattenLeaves(book.bookIndexs);
  const matched = leaves.filter((l) => matchesLuyenTap(l.name));
  console.log(`  leaves=${leaves.length}, matched "${matchPrefix}*" = ${matched.length}`);

  if (matched.length === 0) {
    console.log(`  (skip — nothing to import)`);
    return { matched: 0, created: 0, existing: 0 };
  }

  if (!book.classNo || !book.subjectName) {
    console.warn(`  ✗ Missing classNo/subjectName, skipping`);
    return { matched: matched.length, created: 0, existing: 0 };
  }

  if (dryRun) {
    console.log(`  [dry-run] would upsert chapter "${book.name}" + ${matched.length} lessons:`);
    for (const m of matched.slice(0, 5)) {
      console.log(`    - "${m.name}" (Bài ${m.title?.trim() || "?"}, page ${m.pageNo})`);
    }
    if (matched.length > 5) console.log(`    … +${matched.length - 5} more`);
    return { matched: matched.length, created: 0, existing: 0 };
  }

  const subjectName = book.subjectName.trim();
  const grade = book.classNo;
  const subject = await findOrCreateSubject(grade, subjectName);
  console.log(`  subject: id=${subject.id} "${subject.name}" lớp ${subject.grade}`);

  const chapterSourceId = `book_${book.bookId}`;
  let chapter = await findChapterBySourceId(chapterSourceId);
  if (!chapter) {
    chapter = await insertChapter({
      title: book.name,
      subject_id: subject.id,
      order_index: book.bookId,
      source_id: chapterSourceId,
      source_url: bookSlugUrl(book),
    });
    console.log(`  chapter: id=${chapter.id} (created)`);
  } else {
    console.log(`  chapter: id=${chapter.id} (existing)`);
  }

  let created = 0;
  let existing = 0;
  for (const leaf of matched) {
    const sourceId = `bookindex_${leaf.bookIndexId}`;
    const found = await findLessonBySourceId(sourceId);
    if (found) {
      existing += 1;
      continue;
    }
    const indexLabel = (leaf.title && leaf.title.trim()) || `Bài ${leaf.orderNo + 1}`;
    await insertLesson({
      title: leaf.name,
      index_label: indexLabel.slice(0, 32),
      chapter_id: chapter.id,
      status: "active",
      order_index: leaf.orderNo ?? 0,
      duration_minutes: 15,
      source_id: sourceId,
      source_url: `${bookSlugUrl(book)}#p${leaf.pageNo ?? 0}`,
    });
    created += 1;
  }
  console.log(`  lessons: +${created} created, ${existing} already existed`);
  return { matched: matched.length, created, existing };
}

async function main() {
  console.log(`NXBGD import — books=[${bookIds.join(", ")}] dryRun=${dryRun} matchPrefix="${matchPrefix}"`);
  let totals = { matched: 0, created: 0, existing: 0 };
  for (const id of bookIds) {
    try {
      const r = await processBook(id);
      totals.matched += r.matched;
      totals.created += r.created;
      totals.existing += r.existing;
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
    }
  }
  console.log(`\n━━ Done ━━`);
  console.log(`  matched=${totals.matched}, created=${totals.created}, existing=${totals.existing}`);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
