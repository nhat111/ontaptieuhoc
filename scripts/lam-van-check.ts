// scripts/lam-van-check.ts — kiểm tra nội dung hướng dẫn làm văn lớp 5 (lib/lamVan.ts).
// Chạy: npx tsx scripts/lam-van-check.ts
//  - mọi đề viết lớp 5 trong WRITING_PROMPTS thuộc đúng một dạng bài có hướng dẫn;
//  - dạng nào cũng có ít nhất một đề; đề luyện thêm và đề của từng bài tham khảo nhận về đúng dạng;
//  - đoạn văn mẫu là một đoạn, 8–10 câu; bài văn mẫu có ít nhất 3 đoạn;
//  - biểu điểm cộng đủ 10; không có ngoặc kép thẳng.

import { WRITING_PROMPTS } from "../lib/exam5/tvContent";
import { CHECKLIST, GENERAL_TIPS, GUIDES, RUBRIC, STEPS, guideForPrompt, promptsForGuide } from "../lib/lamVan";

let errors = 0;
const fail = (msg: string) => { errors++; console.error("✗ " + msg); };

for (const p of new Set(Object.values(WRITING_PROMPTS).flat())) {
  if (!guideForPrompt(p)) fail(`Đề lớp 5 chưa thuộc dạng nào: ${p}`);
}

const ids = new Set<string>();
for (const g of GUIDES) {
  if (ids.has(g.id)) fail(`Trùng id ${g.id}`);
  ids.add(g.id);
  if (promptsForGuide(g.id).length === 0) fail(`${g.id}: không có đề nào trong WRITING_PROMPTS`);
  for (const ep of g.extraPrompts ?? []) {
    if (guideForPrompt(ep)?.id !== g.id) fail(`${g.id}: đề luyện thêm không nhận về đúng dạng: ${ep}`);
  }
  if (g.outline.length !== 3) fail(`${g.id}: dàn ý phải có 3 phần`);
  for (const k of ["tips", "openings", "endings", "words", "mistakes", "check"] as const) {
    if (g[k].length < 2) fail(`${g.id}: ${k} quá ít`);
  }
  if (g.samples.length === 0) fail(`${g.id}: chưa có bài tham khảo`);
  const sentences = (s: string) => s.split(/(?<=[.!?…])\s+(?=[A-ZÀ-Ỹ“])/u).filter(Boolean).length;
  for (const [i, sm] of g.samples.entries()) {
    const tag = `${g.id} bài tham khảo ${i + 1}`;
    if (guideForPrompt(sm.prompt)?.id !== g.id) fail(`${tag}: đề không nhận về đúng dạng`);
    if (g.form === "doan-van") {
      if (sm.paragraphs.length !== 1) fail(`${tag}: đoạn văn mẫu phải là một đoạn`);
      const n = sentences(sm.paragraphs[0]);
      if (n < 8 || n > 10) fail(`${tag}: đoạn văn mẫu có ${n} câu (cần 8–10)`);
    } else if (sm.paragraphs.length < 3) {
      fail(`${tag}: bài văn mẫu cần ít nhất 3 đoạn`);
    }
  }
}

for (const [form, rows] of Object.entries(RUBRIC)) {
  const sum = rows.reduce((s, [, p]) => s + p, 0);
  if (Math.abs(sum - 10) > 1e-9) fail(`Biểu điểm ${form} cộng được ${sum}, không phải 10`);
}

const text = JSON.stringify({ GUIDES, STEPS, GENERAL_TIPS, CHECKLIST });
if (/\\"/.test(text)) fail("Có ngoặc kép thẳng \" — dùng “ ”");
const opens = (text.match(/“/g) ?? []).length, closes = (text.match(/”/g) ?? []).length;
if (opens !== closes) fail(`Ngoặc kép cong lệch: ${opens} “ và ${closes} ”`);

if (errors) {
  console.error(`\n${errors} lỗi`);
  process.exit(1);
}
console.log(`✓ ${GUIDES.length} dạng bài, mọi đề lớp 5 đều có hướng dẫn`);
