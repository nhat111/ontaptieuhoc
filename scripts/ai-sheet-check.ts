// scripts/ai-sheet-check.ts — kiểm tra phiếu hoạt động AI (lib/aiSheets).
//   - Mỗi khối có đúng 12 tiết, đánh số 1..12.
//   - Mọi mã yêu cầu cần đạt CỐT LÕI của khối đều có ít nhất một tiết dạy.
//   - Mã đúng dạng <lớp>.<mạch><số>.<số> hoặc .MR<số>, đúng lớp.
//   - Hoạt động đóng (nối, đánh dấu, xếp cột, thứ tự, bảng có ô trống) đều có đáp án.
//   - Bài nối có số dòng hai bên hợp lí; HTML không có undefined/NaN.
// Chạy: npx tsx scripts/ai-sheet-check.ts

import { AI_GRADES, buildAiSheetHtml } from "../lib/aiSheets";

const errors: string[] = [];
const BRANDS = /chatgpt|gemini|google|zalo|facebook|tiktok|youtube|siri|alexa|copilot/i;

for (const g of AI_GRADES) {
  const where = (s: string) => `Lớp ${g.grade} – ${s}`;
  if (g.sheets.length !== 12) errors.push(where(`có ${g.sheets.length} tiết, cần 12`));
  g.sheets.forEach((s, i) => { if (s.no !== i + 1) errors.push(where(`tiết thứ ${i + 1} đánh số ${s.no}`)); });

  const taught = new Set(g.sheets.flatMap((s) => s.codes));
  for (const c of g.coreCodes) if (!taught.has(c)) errors.push(where(`chưa có tiết nào dạy ${c}`));

  for (const s of g.sheets) {
    const at = where(`tiết ${s.no}`);
    for (const c of s.codes)
      if (!new RegExp(`^${g.grade}\\.[ABCD]\\d\\.(MR)?\\d+$`).test(c)) errors.push(`${at}: mã lạ "${c}"`);
    if (s.activities.length < 2) errors.push(`${at}: ít hơn 2 hoạt động`);
    if (!s.think.trim()) errors.push(`${at}: thiếu câu "Em nghĩ gì?"`);
    if (s.teacher.goals.length === 0 || s.teacher.steps.length === 0) errors.push(`${at}: trang thầy cô thiếu mục tiêu/tiến trình`);
    const text = JSON.stringify(s);
    if (BRANDS.test(text)) errors.push(`${at}: có tên thương hiệu ứng dụng (${text.match(BRANDS)![0]})`);
    s.activities.forEach((a, k) => {
      const an = `${at}, hoạt động ${k + 1}`;
      const closed = a.kind !== "write" || a.lines > 0;
      if (closed && a.kind !== "write" && !a.answer) errors.push(`${an}: thiếu đáp án`);
      if (a.kind === "match" && (a.left.length < 3 || a.right.length < 2 || a.right.length > a.left.length))
        errors.push(`${an}: bài nối lệch (${a.left.length} – ${a.right.length})`);
      if (a.kind === "sort" && a.items.length > 10) errors.push(`${an}: quá 10 mục`);
      if (a.kind === "table" && a.rows.some((r) => r.length !== a.headers.length)) errors.push(`${an}: số cột không khớp tiêu đề`);
      if (a.kind === "table" && a.widths && (a.widths.length !== a.headers.length || a.widths.reduce((x, y) => x + y, 0) !== 100))
        errors.push(`${an}: widths phải có ${a.headers.length} cột, cộng lại 100`);
    });
  }

  const html = buildAiSheetHtml(g.grade, g.sheets, { withTeacher: true, footer: "x" });
  if (/undefined|NaN|\[object/.test(html)) errors.push(where("HTML có undefined/NaN"));
  const pages = (html.match(/class="pb/g) ?? []).length + 1;
  if (pages !== 24) errors.push(where(`HTML có ${pages} trang, cần 24 (12 phiếu + 12 trang thầy cô)`));
}

console.log(`${AI_GRADES.length} khối, ${AI_GRADES.reduce((n, g) => n + g.sheets.length, 0)} phiếu — ${errors.length ? `${errors.length} lỗi` : "0 lỗi"}.`);
errors.forEach((e) => console.log("  ✗ " + e));
process.exit(errors.length ? 1 : 0);
