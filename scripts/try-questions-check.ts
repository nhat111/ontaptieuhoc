// scripts/try-questions-check.ts — kiểm tra câu "Làm thử một câu" ở trang chủ (lib/tryQuestions.ts).
// Chạy: npx tsx scripts/try-questions-check.ts
//  - 200 seed: đủ TRY_POOL_SIZE câu, không trùng, vừa thẻ (fitsCard), đáp án nằm trong lựa chọn;
//  - có cả Toán lẫn Tiếng Việt, cùng seed ra cùng bộ, link trỏ vào trang bài theo sách.

import { TRY_POOL_SIZE, pickTryQuestions } from "../lib/tryQuestions";

let errors = 0;
const fail = (msg: string) => { if (errors++ < 40) console.error("✗ " + msg); };

for (let s = 0; s < 200; s++) {
  const seed = `s${s}`;
  const qs = pickTryQuestions(seed);
  if (qs.length !== TRY_POOL_SIZE) fail(`${seed}: ${qs.length}/${TRY_POOL_SIZE} câu`);
  if (new Set(qs.map((q) => q.question)).size !== qs.length) fail(`${seed}: trùng câu`);
  const subjects = new Set(qs.map((q) => q.subject));
  if (!subjects.has("Toán") || !subjects.has("Tiếng Việt")) fail(`${seed}: thiếu môn (${[...subjects].join(", ")})`);
  for (const q of qs) {
    if (!q.options.includes(q.answer)) fail(`${seed}: “${q.question}” — đáp án không nằm trong lựa chọn`);
    if (q.options.length < 2 || q.options.length > 4) fail(`${seed}: “${q.question}” — ${q.options.length} lựa chọn`);
    if (!/^\/lop\/[1-5]\/(toan|tieng-viet)\/bai-\d+$/.test(q.href)) fail(`${seed}: link lạ ${q.href}`);
  }
  if (JSON.stringify(pickTryQuestions(seed)) !== JSON.stringify(qs)) fail(`${seed}: cùng seed ra bộ khác`);
}

console.log(errors ? `✗ ${errors} lỗi` : "✓ câu làm thử ở trang chủ ổn");
process.exit(errors ? 1 : 0);
