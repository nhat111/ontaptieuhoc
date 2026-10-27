// scripts/similar-check.ts — "câu tương tự" của Sổ câu sai (lib/similarRows.ts): mọi dạng câu của
// mọi bài làm được (Toán 1–5, Tiếng Việt 1–2) tìm lại được hàm sinh, ra câu cùng dạng chấm đúng,
// và câu trong bài thật đều mang `src` tìm lại được.
//
// Chạy: npx tsx scripts/similar-check.ts

import { rowToQuestion } from "../lib/quickExam";
import { scoreAnswer } from "../lib/quizData";
import { buildSgkRows, sgkLessons, sgkReady, SGK_BOOKS, TV_BOOKS } from "../lib/sgk";
import { resolveSrc, similarRows } from "../lib/similarRows";

let failures = 0, dang = 0, rowsChecked = 0;
const fail = (where: string, msg: string) => { if (++failures <= 40) console.log(`✗ ${where}: ${msg}`); };

for (const book of [...SGK_BOOKS, ...TV_BOOKS]) {
  for (const { lesson } of sgkLessons(book.grade, book.slug)) {
    if (!sgkReady(book.grade, lesson, book.slug)) continue;
    const where = `${book.id} bài ${lesson.so}`;
    // Câu trong bài thật: có src, tìm lại được.
    for (const r of buildSgkRows(book.grade, lesson, "kt", book.slug)) {
      rowsChecked++;
      if (!r.src || !resolveSrc(r.src)) fail(where, `câu không có / sai dạng: ${r.src} — ${r.content.slice(0, 40)}`);
    }
    // Mọi dạng của bài: 5 câu tương tự, đúng dạng, chấm đúng.
    (lesson.mix ?? []).forEach((_, gi) => {
      const src = `${book.id}-${lesson.so}#${gi}`;
      dang++;
      const rows = similarRows([src], 5, "kt");
      if (rows.length < 3) fail(`${where} dạng ${gi}`, `chỉ ra ${rows.length} câu`);
      if (rows[0]?.src !== src) fail(`${where} dạng ${gi}`, "câu đầu không thuộc dạng được hỏi");
      rows.forEach((r, i) => {
        if (!r.src?.startsWith(`${book.id}-${lesson.so}#`)) fail(`${where} dạng ${gi}`, `câu bù không cùng bài: ${r.src}`);
        const q = rowToQuestion(r, i + 1);
        const ans = q.type === "short" ? q.correctAnswer.split("|")[0] : q.correctAnswer;
        if (!scoreAnswer(q, ans)) fail(`${where} dạng ${gi}`, `chấm sai: ${r.content}`);
      });
      if (JSON.stringify(similarRows([src], 5, "kt")) !== JSON.stringify(rows)) fail(`${where} dạng ${gi}`, "cùng seed ra bộ khác");
    });
  }
}
if (resolveSrc("kntt-toan-3-99999#0") || resolveSrc("abc") || resolveSrc("kntt-toan-3-15#99")) fail("src lạ", "phải trả null");

console.log(failures ? `✗ ${failures} lỗi` : `✓ Câu tương tự: ${dang} dạng đều sinh lại được và chấm đúng; ${rowsChecked} câu trong bài đều mang dạng`);
process.exit(failures ? 1 : 0);
