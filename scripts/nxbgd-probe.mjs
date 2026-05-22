#!/usr/bin/env node
// Probe NXBGD's get-list-question endpoint for one book.
// Prints type distribution and one sample per type so we can plan the importer.
//
// Usage:
//   NXBGD_TOKEN="eyJ..." node scripts/nxbgd-probe.mjs <bookId>
//
// Token: open https://hanhtrangso.nxbgd.vn while logged in, copy a fresh
// Bearer from any request in DevTools → Network → Headers.

const API = "https://apihanhtrangso.nxbgd.vn:8080/api";
const PAGE_SIZE = 100;

const token = process.env.NXBGD_TOKEN;
const bookId = Number(process.argv[2]);

if (!token || !bookId) {
  console.error("Usage: NXBGD_TOKEN=<token> node scripts/nxbgd-probe.mjs <bookId>");
  process.exit(1);
}

const headers = {
  accept: "application/json",
  authorization: `Bearer ${token}`,
  origin: "https://hanhtrangso.nxbgd.vn",
  referer: "https://hanhtrangso.nxbgd.vn/",
};

async function getJson(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { ...headers, ...(init.headers ?? {}) } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
}

function stripHtml(s) {
  if (!s) return "";
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(s, n = 140) {
  const clean = stripHtml(s);
  return clean.length > n ? clean.slice(0, n) + "…" : clean;
}

async function main() {
  // 1) Book detail
  const book = (await getJson(`${API}/book/${bookId}`)).data;
  console.log(`Book ${book.bookId}: ${book.name}`);
  console.log(`  className=${book.className} subject=${book.subjectName} bookTypeId=${book.bookTypeId} bookGroupId=${book.bookGroupId}`);
  console.log(`  bookIndexs: ${book.bookIndexs?.length ?? 0} entries (top-level)`);

  // 2) Pull every question, paged.
  const all = [];
  for (let page = 0; page < 200; page++) {
    const url = `${API}/Book/get-list-question?bookId=${bookId}&bookIndexId=0&pageIndex=${page}&numberOfPage=${PAGE_SIZE}`;
    const res = await getJson(url);
    const rows = res.data ?? [];
    if (rows.length === 0) break;
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
  }
  console.log(`\nFetched ${all.length} questions`);

  // 3) Type distribution
  const byType = new Map();
  const withParent = all.filter((q) => q.parentId != null).length;
  for (const q of all) {
    byType.set(q.type, (byType.get(q.type) ?? 0) + 1);
  }
  console.log(`Sub-questions (parentId != null): ${withParent}`);
  console.log("\nType distribution:");
  for (const [t, n] of [...byType.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${t.padEnd(28)} ${n}`);
  }

  // 4) One sample per type — keep it short
  console.log("\nSamples:");
  const seen = new Set();
  for (const q of all) {
    if (seen.has(q.type)) continue;
    seen.add(q.type);
    console.log(`\n── type=${q.type} questionId=${q.questionId} title="${q.title}" parentId=${q.parentId} level=${q.level} layoutId=${q.layoutId}`);
    console.log(`   content: ${excerpt(q.content, 120)}`);
    if (q.answers?.length) {
      console.log(`   answers (${q.answers.length}):`);
      for (const a of q.answers.slice(0, 4)) {
        console.log(`     code=${a.code} pos=${a.position ?? "-"} correct=${JSON.stringify(a.correct)} content="${excerpt(a.content, 60)}"`);
      }
      if (q.answers.length > 4) console.log(`     … +${q.answers.length - 4} more`);
    } else {
      console.log(`   answers: (none)`);
    }
  }
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
