// scripts/exam5-check.ts — kiểm tra đề lớp 5 theo cấu trúc đề thật (lib/exam5).
//
// Tiếng Việt (nội dung viết tay, lib/exam5/tvContent.ts):
//   • mỗi câu trắc nghiệm 4 lựa chọn khác nhau, đáp án nằm trong lựa chọn;
//   • câu hỏi và lời giải trích bài đọc (“…”) thì phần trích phải có nguyên văn trong bài;
//   • kì nào cũng có bài đọc, đủ câu luyện từ và câu, đề tập làm văn; không dùng " thẳng.
// Toán (lib/exam5/toan5.ts), 400 đề mỗi kì:
//   • tính lại đáp án các câu hình vẽ từ số đo trong đề (không dùng hàm của bộ sinh);
//   • tính lại đặt tính, tìm x, tính thuận tiện bằng số thực;
//   • đếm đoạn thẳng trong hình để tính lại số tam giác; biểu đồ quạt: tổng 100%.
//
// Chạy: npx tsx scripts/exam5-check.ts

import { EXAM_KINDS } from "../lib/quickExam";
import { PASSAGES, LTVC_BANK, LTVC_BY_KIND, WRITING_PROMPTS, type TvMcq } from "../lib/exam5/tvContent";
import { buildToan5 } from "../lib/exam5/toan5";
import { isGroup, sectionPoints, type PaperQuestion } from "../lib/exam5/paper";

const errors: string[] = [];
const fail = (msg: string) => { if (errors.length < 40) errors.push(msg); };

/* ───────────── Tiếng Việt ───────────── */

function checkMcq(m: TvMcq, where: string) {
  if (m.options.length !== 4) fail(`${where}: cần 4 lựa chọn — ${m.q}`);
  if (new Set(m.options).size !== m.options.length) fail(`${where}: lựa chọn trùng — ${m.q}`);
  if (!m.options.includes(m.answer)) fail(`${where}: đáp án không nằm trong lựa chọn — ${m.q}`);
  if (!m.explain.trim()) fail(`${where}: thiếu lời giải — ${m.q}`);
  if (/"/.test(m.q + m.options.join("") + m.explain)) fail(`${where}: dùng ngoặc kép thẳng — ${m.q}`);
}

/** Phần trích “…” (không lồng) dài hơn 12 kí tự phải có trong bài; bỏ dấu câu cuối khi so. */
function checkQuotes(s: string, text: string, where: string) {
  const flat = text.replace(/\s+/g, " ");
  for (const m of s.matchAll(/“([^“”]+)”/g)) {
    const quote = m[1].trim();
    if (quote.length <= 12 || quote.includes(" / ")) continue; // “chủ ngữ / vị ngữ” là phân tích, không phải trích
    const bare = quote.replace(/[.!?…]+$/, "");
    if (!flat.includes(bare)) fail(`${where}: trích “${quote}” không có trong bài đọc`);
  }
}

for (const p of PASSAGES) {
  if (/"/.test(p.text)) fail(`${p.id}: bài đọc dùng ngoặc kép thẳng`);
  if (p.questions.length !== 6) fail(`${p.id}: cần 6 câu đọc hiểu, có ${p.questions.length}`);
  for (const m of [...p.questions, p.ltvc]) {
    checkMcq(m, p.id);
    checkQuotes(m.q, p.text, p.id);
    checkQuotes(m.explain, p.text, p.id);
  }
  if (!p.open.q.trim() || !p.open.hint.trim()) fail(`${p.id}: thiếu câu hỏi mở hoặc gợi ý`);
  const words = p.text.split(/\s+/).length;
  if (words < 150 || words > 330) fail(`${p.id}: bài đọc ${words} tiếng — nên 150–330 tiếng cho lớp 5`);
}
for (const [topic, items] of Object.entries(LTVC_BANK)) {
  if (items.length < 4) fail(`ngân hàng ${topic}: chỉ có ${items.length} câu`);
  items.forEach((m) => checkMcq(m, `ngân hàng ${topic}`));
  const qs = items.map((m) => m.q);
  if (new Set(qs).size !== qs.length) fail(`ngân hàng ${topic}: câu hỏi trùng`);
}
for (const k of EXAM_KINDS) {
  if (!PASSAGES.some((p) => p.kinds.includes(k.key))) fail(`${k.key}: chưa có bài đọc`);
  for (const t of LTVC_BY_KIND[k.key]) if (!LTVC_BANK[t]?.length) fail(`${k.key}: chủ đề ${t} rỗng`);
  if (!WRITING_PROMPTS[k.key]?.length) fail(`${k.key}: chưa có đề tập làm văn`);
}

/* ───────────── Toán ───────────── */

const num = (s: string) => Number(s.replace(/\./g, "").replace(",", "."));
const close = (a: number, b: number) => Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));
const N = String.raw`(\d[\d.]*(?:,\d+)?)`;
const firstNum = (s: string) => num(s.match(new RegExp(N))![1]);
const svgOf = (q: PaperQuestion) => {
  const u = (JSON.parse(q.row.explanation).images ?? [])[0]?.url as string | undefined;
  return u ? decodeURIComponent(u.replace(/^data:image\/svg\+xml;utf8,/, "")) : "";
};

function expected(q: PaperQuestion): number | null {
  const c = q.row.content;
  let m: RegExpMatchArray | null;
  if ((m = c.match(new RegExp(`đáy BC = ${N} \\S+, chiều cao AH = ${N}`)))) return (num(m[1]) * num(m[2])) / 2;
  if ((m = c.match(new RegExp(`AB = ${N} \\S+, AC = ${N}`)))) return (num(m[1]) * num(m[2])) / 2;
  if ((m = c.match(new RegExp(`đáy bé AB = ${N} \\S+, đáy lớn DC = ${N} \\S+, chiều cao A[HD] = ${N}`)))) return ((num(m[1]) + num(m[2])) * num(m[3])) / 2;
  if ((m = c.match(new RegExp(`có (bán kính|đường kính) ${N} \\S+ \\(như hình vẽ\\)\\. (Chu vi|Diện tích)`)))) {
    const r = m[1] === "bán kính" ? num(m[2]) : num(m[2]) / 2;
    return m[3] === "Chu vi" ? r * 2 * 3.14 : r * r * 3.14;
  }
  if ((m = c.match(new RegExp(`hình lập phương có cạnh ${N} \\S+ \\(như hình vẽ\\)\\. (Thể tích|Diện tích xung quanh|Diện tích toàn phần)`)))) {
    const a = num(m[1]);
    return { "Thể tích": a ** 3, "Diện tích xung quanh": a * a * 4, "Diện tích toàn phần": a * a * 6 }[m[2]]!;
  }
  if ((m = c.match(new RegExp(`chiều dài ${N} \\S+, chiều rộng ${N} \\S+, chiều cao ${N} \\S+ \\(như hình vẽ\\)\\. (Thể tích|Diện tích xung quanh|Diện tích toàn phần)`)))) {
    const [a, b, h] = [num(m[1]), num(m[2]), num(m[3])];
    const sxq = (a + b) * 2 * h;
    return { "Thể tích": a * b * h, "Diện tích xung quanh": sxq, "Diện tích toàn phần": sxq + 2 * a * b }[m[4]]!;
  }
  if ((m = c.match(new RegExp(`hình chữ nhật chiều dài ${N} m, chiều rộng ${N} m và một nửa hình tròn`)))) {
    const [a, b] = [num(m[1]), num(m[2])];
    if (a <= b) fail(`hình ghép: chiều dài ${a} không lớn hơn chiều rộng ${b}`);
    return a * b + ((b / 2) ** 2 * 3.14) / 2;
  }
  if (c.startsWith("Hình vẽ bên có bao nhiêu hình tam giác")) {
    const k = (svgOf(q).match(/<line /g) ?? []).length; // đoạn nối từ A xuống BC
    return ((k + 2) * (k + 1)) / 2;
  }
  if (c.startsWith("Biểu đồ hình quạt")) {
    const svg = svgOf(q);
    const pcts = [...svg.matchAll(/>(\d+)%</g)].map((x) => Number(x[1]));
    if (pcts.reduce((s, x) => s + x, 0) !== 100) fail(`biểu đồ quạt tổng ${pcts.join("+")} ≠ 100`);
    const total = firstNum(c.slice(c.indexOf("của ") + 4));
    const name = c.match(/chọn “(.+?)” là/)![1];
    const legend = [...svg.matchAll(/>([^<>%]+)<\/text>/g)].map((x) => x[1]).filter((t) => !t.includes("("));
    const i = legend.indexOf(name);
    if (i < 0) { fail(`biểu đồ quạt: không thấy “${name}” trong chú thích`); return null; }
    return (total * pcts[i]) / 100;
  }
  // Phép tính một dòng: "a op b = ___" (đặt tính, tính thuận tiện)
  if ((m = c.match(new RegExp(`^(?:Tính bằng cách thuận tiện nhất: )?${N} ([+\\-×:]) ${N}(?: ([+\\-]) ${N} × ${N})? = ___$`)))) {
    const calc = (a: number, op: string, b: number) => (op === "+" ? a + b : op === "-" ? a - b : op === "×" ? a * b : a / b);
    if (m[4]) return calc(num(m[1]) * num(m[3]), m[4], num(m[5]) * num(m[6]));
    return calc(num(m[1]), m[2], num(m[3]));
  }
  // Tìm x (số thập phân)
  if ((m = c.match(new RegExp(`^(?:Tìm x: )?(x|${N}) ([+\\-×:]) (x|${N}) = ${N}\\. Vậy x = ___$`)))) {
    const L = m[1], op = m[3], R = m[4], b = num(m[6]);
    if (L === "x") return op === "+" ? b - num(R) : op === "-" ? b + num(R) : op === "×" ? b / num(R) : b * num(R);
    const a = num(L);
    return op === "-" ? a - b : op === ":" ? a / b : op === "+" ? b - a : b / a;
  }
  return null;
}

let checked = 0;
for (const k of EXAM_KINDS) {
  for (let s = 0; s < 400; s++) {
    const paper = buildToan5(k.key, k.label, `c${s}`);
    if (sectionPoints(paper) !== 10) fail(`${k.key}/c${s}: tổng điểm ${sectionPoints(paper)}`);
    const qs = paper.sections.flatMap((sec) => sec.items).flatMap((it) => (isGroup(it) ? it.parts : [it]));
    for (const q of qs) {
      if (/undefined|NaN|Infinity/.test(JSON.stringify(q.row))) fail(`${k.key}/c${s}: chuỗi lỗi — ${q.row.content}`);
      const want = expected(q);
      if (want === null) {
        if (svgOf(q) || /^[\d.,]+ [+\-×:] [\d.,]+ = ___$/.test(q.row.content)) fail(`${k.key}/c${s}: câu có hình/phép tính nhưng không tính lại được — ${q.row.content}`);
        continue;
      }
      checked++;
      const got = q.row.type === "mcq" ? firstNum(q.row.correct_answer) : num(q.row.correct_answer.split("|")[0]);
      if (!close(got, want)) fail(`${k.key}/c${s}: ${q.row.content} → ${q.row.correct_answer}, tính lại được ${want}`);
      if (q.row.type === "mcq") {
        for (const o of q.row.options) if (o !== q.row.correct_answer && close(firstNum(o), want)) fail(`${k.key}/c${s}: nhiễu "${o}" cũng đúng — ${q.row.content}`);
      }
    }
  }
}
if (checked < 4 * 400 * 5) fail(`chỉ tính lại được ${checked} câu — biểu thức chính quy không còn khớp đề?`);

if (errors.length) {
  console.error(`✗ exam5: ${errors.length} lỗi\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log(`✓ exam5: ${PASSAGES.length} bài đọc, ${Object.values(LTVC_BANK).flat().length} câu luyện từ và câu ổn; tính lại ${checked} câu Toán khớp đáp án`);
