// scripts/tv12-check.ts — kiểm tra đề Tiếng Việt lớp 1–2 của Tạo đề nhanh (lib/exam5/tv12.ts,
// nội dung viết tay ở tvContent1.ts, tvContent2.ts).
//
//   • Mỗi câu đọc hiểu: lớp 1 ba lựa chọn, lớp 2 bốn lựa chọn, không trùng, đáp án nằm trong
//     lựa chọn, có lời giải; phần trích “…” có nguyên văn trong bài đọc; không dùng " thẳng.
//   • Đoạn nghe – viết trích nguyên văn bài đọc; độ dài bài đọc, đoạn nghe – viết hợp kì.
//   • Lớp 1 học kì I: bài đọc, lựa chọn, đoạn nghe – viết chỉ có tiếng ghép từ âm, vần, dấu
//     bé đã học (giữa kì: hết bài 40; cuối kì: hết tập một).
//   • Kì nào cũng có bài đọc, đủ bộ sinh chính tả / luyện từ và câu, đề viết đoạn (lớp 2).
//   • 300 seed mỗi kì: phần A cộng đọc thành tiếng = 10, phần B = 10, không câu trùng, đáp án
//     đúng nằm trong lựa chọn, bản in có đủ phần B.
//
// Chạy: npx tsx scripts/tv12-check.ts

import { EXAM_KINDS, examKindLabel } from "../lib/quickExam";
import { buildTv12, tv12Passages, type Tv12Content } from "../lib/exam5/tv12";
import { KNOWN_CUOI_HK1, KNOWN_GIUA_HK1, TV1_EXAM } from "../lib/exam5/tvContent1";
import { TV2_EXAM } from "../lib/exam5/tvContent2";
import type { TvMcq } from "../lib/exam5/tvContent";
import { paperRows, questionsOf } from "../lib/exam5/paper";
import { buildPaperHtml } from "../lib/exam5/print";
import { knows, parseTieng, type Known } from "../lib/tvGen/am";

const SEEDS = 300;
const errors: string[] = [];
const fail = (msg: string) => { if (errors.length < 40) errors.push(msg); };
const tieng = (s: string) => s.match(/\p{L}+/gu) ?? [];
const flat = (s: string) => s.replace(/\s+/g, " ");

function checkMcq(m: TvMcq, n: number, where: string) {
  if (m.options.length !== n) fail(`${where}: cần ${n} lựa chọn — ${m.q}`);
  if (new Set(m.options).size !== m.options.length) fail(`${where}: lựa chọn trùng — ${m.q}`);
  if (!m.options.includes(m.answer)) fail(`${where}: đáp án không nằm trong lựa chọn — ${m.q}`);
  if (!m.explain.trim()) fail(`${where}: thiếu lời giải — ${m.q}`);
  if (/"/.test(m.q + m.options.join("") + m.explain)) fail(`${where}: dùng ngoặc kép thẳng — ${m.q}`);
}

/** Phần trích “…” dài hơn 12 kí tự phải có trong bài (bỏ dấu câu, dấu … cuối khi so). */
function checkQuotes(s: string, text: string, where: string) {
  for (const m of s.matchAll(/“([^“”]+)”/g)) {
    const quote = m[1].trim();
    if (quote.length <= 12) continue;
    const bare = quote.replace(/[.!?…]+$/, "");
    if (!flat(text).includes(flat(bare))) fail(`${where}: trích “${quote}” không có trong bài đọc`);
  }
}

function checkKnown(k: Known, s: string, where: string) {
  const bad = [...new Set(tieng(s).filter((t) => !knows(k, parseTieng(t))))];
  if (bad.length) fail(`${where}: có tiếng bé chưa học — ${bad.join(", ")}`);
}

function checkContent(c: Tv12Content) {
  const g = `lớp ${c.grade}`;
  const n = c.grade === 1 ? 3 : 4;
  for (const p of c.passages) {
    const where = `${g} ${p.id}`;
    if (/"/.test(p.text + p.dictation)) fail(`${where}: dùng ngoặc kép thẳng`);
    if (p.questions.length !== n) fail(`${where}: cần ${n} câu đọc hiểu, có ${p.questions.length}`);
    const mcqs = [...p.questions, ...(p.ltvc ? [p.ltvc] : [])];
    for (const m of mcqs) {
      checkMcq(m, n, where);
      checkQuotes(m.q, p.text, where);
      checkQuotes(m.explain, p.text, where);
    }
    if (c.grade === 2 && (!p.ltvc || !p.open?.q.trim() || !p.open.hint.trim())) fail(`${where}: lớp 2 cần câu luyện từ và câu và câu hỏi mở`);
    if (!flat(p.text).includes(flat(p.dictation))) fail(`${where}: đoạn nghe – viết không trích nguyên văn bài đọc`);
    for (const kind of p.kinds) {
      const [lo, hi] = c.words[kind];
      const w = tieng(p.text).length;
      if (w < lo || w > hi) fail(`${where}: bài đọc ${w} tiếng — nên ${lo}–${hi} tiếng cho ${kind}`);
      const [dlo, dhi] = c.dictationWords[kind];
      const d = tieng(p.dictation).length;
      if (d < dlo || d > dhi) fail(`${where}: đoạn nghe – viết ${d} tiếng — nên ${dlo}–${dhi}`);
      if (c.grade === 1 && (kind === "giua-hk1" || kind === "cuoi-hk1")) {
        const k = kind === "giua-hk1" ? KNOWN_GIUA_HK1 : KNOWN_CUOI_HK1;
        checkKnown(k, [p.title, p.text, p.dictation, ...p.questions.flatMap((q) => q.options)].join(" "), where);
      }
    }
  }
  const ids = c.passages.map((p) => p.id);
  if (new Set(ids).size !== ids.length) fail(`${g}: trùng id bài đọc`);

  for (const k of EXAM_KINDS) {
    const where = `${g} ${k.key}`;
    if (tv12Passages(c, k.key).length < 2) fail(`${where}: cần ít nhất 2 bài đọc`);
    if (c.spelling[k.key].length < (c.grade === 1 ? 3 : 2)) fail(`${where}: thiếu bộ sinh chính tả`);
    if (!c.spellingNames[k.key]) fail(`${where}: thiếu tên phần chính tả`);
    if (c.grade === 2) {
      const l = c.ltvc?.[k.key];
      if (!l?.c6.length || !l.c7.length || !l.names) fail(`${where}: thiếu luyện từ và câu`);
      const ws = c.writing?.[k.key] ?? [];
      if (!ws.length) fail(`${where}: chưa có đề viết đoạn`);
      for (const w of ws) if (!w.includes("4–5 câu") || !w.includes("Gợi ý:")) fail(`${where}: đề viết đoạn cần “4–5 câu” và gợi ý — ${w}`);
    }

    // Sinh thử.
    for (let s = 0; s < SEEDS; s++) {
      const seed = `s${s}`;
      const paper = buildTv12(c, k.key, examKindLabel(k.key), seed);
      const pts = (part?: "viet") => paper.sections.filter((x) => x.part === part).flatMap((x) => x.items.flatMap(questionsOf)).reduce((a, q) => a + q.points, 0);
      const a = pts() + (paper.readAloud?.points ?? 0);
      const b = pts("viet") + (paper.viet?.dictation.points ?? 0) + (paper.writing?.points ?? 0);
      if (Math.abs(a - 10) > 1e-9) fail(`${where}/${seed}: phần A ${a} điểm`);
      if (Math.abs(b - 10) > 1e-9) fail(`${where}/${seed}: phần B ${b} điểm`);
      for (const r of [paper.readAloud?.rubric, paper.viet?.dictation.rubric, paper.writing?.rubric]) {
        if (!r) continue;
        const sum = r.reduce((x, [, p]) => x + p, 0);
        const want = r === paper.readAloud?.rubric ? paper.readAloud!.points : r === paper.writing?.rubric ? paper.writing!.points : paper.viet!.dictation.points;
        if (Math.abs(sum - want) > 1e-9) fail(`${where}: biểu điểm cộng ${sum}, cần ${want}`);
      }
      const rows = paperRows(paper);
      const contents = rows.map((r) => r.content);
      if (new Set(contents).size !== contents.length) fail(`${where}/${seed}: có câu trùng`);
      for (const r of rows) {
        if (r.type !== "mcq" || !r.options.includes(r.correct_answer)) fail(`${where}/${seed}: câu “${r.content}” đáp án không nằm trong lựa chọn`);
        if (new Set(r.options).size !== r.options.length) fail(`${where}/${seed}: câu “${r.content}” có lựa chọn trùng`);
      }
      if (s < 3) {
        if (JSON.stringify(buildTv12(c, k.key, examKindLabel(k.key), seed)) !== JSON.stringify(paper)) fail(`${where}/${seed}: cùng seed ra đề khác`);
        const html = buildPaperHtml(paper, { answers: "solutions", schoolYear: "2026 – 2027" });
        for (const must of ["B. KIỂM TRA VIẾT", paper.viet!.dictation.text, paper.reading!.title.toUpperCase(), "HƯỚNG DẪN CHẤM"]) {
          if (!html.includes(must)) fail(`${where}/${seed}: bản in thiếu “${must.slice(0, 40)}”`);
        }
        if (/undefined|NaN/.test(html)) fail(`${where}/${seed}: bản in có undefined/NaN`);
      }
    }
  }
}

checkContent(TV1_EXAM);
checkContent(TV2_EXAM);

if (errors.length) {
  console.error(`✗ tv12: ${errors.length} lỗi\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log(`✓ tv12: lớp 1 ${TV1_EXAM.passages.length} bài đọc, lớp 2 ${TV2_EXAM.passages.length} bài đọc; ${EXAM_KINDS.length} kì × ${SEEDS} seed đều ổn`);
