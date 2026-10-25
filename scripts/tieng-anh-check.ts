// scripts/tieng-anh-check.ts — kiểm tra đề Tiếng Anh của Tạo đề nhanh (lib/exam5/tiengAnh.ts,
// nội dung viết tay ở enContent<lớp>.ts).
//
//   • Unit đánh số 1–20, đủ hội thoại / nhóm từ / câu ngữ pháp; `a` chứa `key` đúng một lần,
//     đáp án nhiễu khác nhau và khác `key`; câu ngữ pháp có đúng một "___", ba lựa chọn khác nhau,
//     đáp án nằm trong lựa chọn; hai nhóm từ không chung từ nào; không dùng " thẳng.
//   • Bài đọc: kì nào cũng có ít nhất 2 bài, 4 câu True / False, phần trích “…” có trong bài,
//     độ dài hợp lớp.
//   • 300 seed mỗi kì: đủ 4 + 2 + 4 + 4 + 2 câu, 4 câu hỏi nói, tổng 10 điểm, không câu trùng,
//     đáp án nằm trong lựa chọn, câu sắp xếp có đúng một đáp án đúng thứ tự, bản in có lời đọc
//     (có đáp án) hoặc trang dành cho người coi thi (không đáp án).
//   • Mọi hội thoại và mọi bài đọc có file nghe (lib/enListenClips.ts, file có thật trong public/),
//     không thừa file; trên máy có đủ 4 câu nghe, mỗi câu mang đúng file của lời đọc của nó.
//
// Chạy: npx tsx scripts/tieng-anh-check.ts

import { existsSync } from "node:fs";
import { buildTiengAnh, enPassages, listenScript, passageAudio, unitsFor, wrongOrders, type EnContent } from "../lib/exam5/tiengAnh";
import { EN_LISTEN_CLIPS, EN_PASSAGE_CLIPS } from "../lib/enListenClips";
import { EN, EXAM_KINDS, examKindLabel } from "../lib/quickExam";
import { paperRows, questionsOf } from "../lib/exam5/paper";
import { buildPaperHtml } from "../lib/exam5/print";

const SEEDS = 300;
const errors: string[] = [];
const fail = (msg: string) => { if (errors.length < 40) errors.push(msg); };
const flat = (s: string) => s.replace(/\s+/g, " ");
const count = (s: string, sub: string) => s.split(sub).length - 1;

const usedClips = new Set<string>();

function checkContent(c: EnContent) {
  for (const u of c.units) for (const x of u.qa) {
    const url = EN_LISTEN_CLIPS[listenScript(x)];
    if (!url) fail(`lớp ${c.grade} Unit ${u.n}: hội thoại chưa có file nghe (chạy scripts/gen-en-listen-audio.py) — ${listenScript(x)}`);
    else if (!existsSync(`public${url}`)) fail(`lớp ${c.grade}: thiếu file ${url}`);
    else usedClips.add(url);
  }
  for (const p of c.passages) {
    const url = passageAudio(p);
    if (!url) fail(`lớp ${c.grade}: bài đọc “${p.title}” chưa có file đọc (chạy scripts/gen-en-listen-audio.py)`);
    else if (!existsSync(`public${url}`)) fail(`lớp ${c.grade}: thiếu file ${url}`);
    else usedClips.add(url);
  }
  const g = `lớp ${c.grade}`;
  c.units.forEach((u, i) => { if (u.n !== i + 1) fail(`${g}: Unit thứ ${i + 1} đánh số ${u.n}`); });
  if (c.units.length !== 20) fail(`${g}: cần 20 Unit, có ${c.units.length}`);

  const owner = new Map<string, string>();
  for (const u of c.units) {
    const where = `${g} Unit ${u.n}`;
    if (!u.title.trim()) fail(`${where}: thiếu tên`);
    if (u.qa.length < 4) fail(`${where}: cần ít nhất 4 hội thoại`);
    if (u.gram.length < 3) fail(`${where}: cần ít nhất 3 câu ngữ pháp`);
    for (const x of u.qa) {
      if (count(x.a, x.key) !== 1) fail(`${where}: “${x.a}” phải chứa “${x.key}” đúng một lần`);
      if (new Set([x.key, ...x.wrong]).size !== 3) fail(`${where}: đáp án nhiễu trùng — ${x.q}`);
      if (/"/.test(x.q + x.a + x.wrong.join(""))) fail(`${where}: dùng " thẳng — ${x.q}`);
    }
    for (const m of u.gram) {
      if (count(m.q, "___") !== 1) fail(`${where}: câu ngữ pháp cần đúng một “___” — ${m.q}`);
      if (new Set(m.options).size !== 3) fail(`${where}: lựa chọn trùng — ${m.q}`);
      if (!m.options.includes(m.answer)) fail(`${where}: đáp án không nằm trong lựa chọn — ${m.q}`);
      if (!m.explain.trim()) fail(`${where}: thiếu lời giải — ${m.q}`);
    }
    for (const [name, words] of Object.entries(u.groups)) {
      if (words.length < 4) fail(`${where}: nhóm “${name}” cần ít nhất 4 từ`);
      for (const w of words) {
        const o = owner.get(w.toLowerCase());
        if (o && o !== name) fail(`${g}: “${w}” nằm ở cả nhóm “${o}” và “${name}”`);
        owner.set(w.toLowerCase(), name);
      }
    }
  }
  const names = new Set(c.units.flatMap((u) => Object.keys(u.groups)));
  for (const [a, b] of c.apart ?? []) if (!names.has(a) || !names.has(b)) fail(`${g}: apart nhắc nhóm không có — ${a} / ${b}`);

  for (const p of c.passages) {
    const where = `${g} ${p.id}`;
    if (/"/.test(p.text)) fail(`${where}: bài đọc dùng " thẳng`);
    if (p.tf.length !== 4) fail(`${where}: cần 4 câu True / False`);
    if (!p.tf.some((t) => t.answer === "True") || !p.tf.some((t) => t.answer === "False")) fail(`${where}: cần có cả câu True và câu False`);
    for (const t of p.tf) {
      for (const m of t.explain.matchAll(/“([^“”]+)”/g)) {
        const bare = m[1].trim().replace(/[.!?…]+$/, "");
        if (!flat(p.text).includes(flat(bare))) fail(`${where}: trích “${m[1]}” không có trong bài`);
      }
    }
    const w = p.text.split(/\s+/).length;
    if (w < c.words[0] || w > c.words[1]) fail(`${where}: bài đọc ${w} từ — nên ${c.words[0]}–${c.words[1]}`);
  }

  for (const k of EXAM_KINDS) {
    const where = `${g} ${k.key}`;
    if (enPassages(c, k.key).length < 2) fail(`${where}: cần ít nhất 2 bài đọc`);
    if (unitsFor(c, k.key).length < 5) fail(`${where}: thiếu Unit`);
    for (let s = 0; s < SEEDS; s++) {
      const seed = `s${s}`;
      const paper = buildTiengAnh(c, k.key, examKindLabel(k.key), seed);
      const sizes = paper.sections.map((x) => x.items.length).join(",");
      if (sizes !== "4,2,4,4,2") fail(`${where}/${seed}: số câu các phần ${sizes}`);
      if (paper.speaking?.questions.length !== 4) fail(`${where}/${seed}: cần 4 câu hỏi nói, có ${paper.speaking?.questions.length}`);
      const pts = paper.sections.flatMap((x) => x.items.flatMap(questionsOf)).reduce((a, q) => a + q.points, 0) + (paper.speaking?.points ?? 0);
      if (Math.abs(pts - 10) > 1e-9) fail(`${where}/${seed}: tổng ${pts} điểm`);
      const rubric = paper.speaking!.rubric.reduce((a, [, p]) => a + p, 0);
      if (Math.abs(rubric - paper.speaking!.points) > 1e-9) fail(`${where}: biểu điểm nói cộng ${rubric}`);

      const all = paper.sections.flatMap((x) => x.items.flatMap(questionsOf));
      const keys = all.map((q) => q.row.content + "\u0000" + q.row.options.join("\u0000"));
      if (new Set(keys).size !== keys.length) fail(`${where}/${seed}: có câu trùng`);
      for (const q of all) {
        const r = q.row;
        if (!r.options.includes(r.correct_answer)) fail(`${where}/${seed}: đáp án không nằm trong lựa chọn — ${r.content}`);
        if (new Set(r.options.map((o) => o.toLowerCase())).size !== r.options.length) fail(`${where}/${seed}: lựa chọn trùng — ${r.content}`);
      }
      for (const q of paper.sections[4].items.flatMap(questionsOf)) {
        if (wrongOrders(q.row.correct_answer).some((w) => w === q.row.correct_answer)) fail(`${where}: câu sắp xếp sai trùng câu đúng — ${q.row.correct_answer}`);
      }
      const rows = paperRows(paper);
      if (rows.length !== 16) fail(`${where}/${seed}: làm trên máy ${rows.length} câu, cần 16`);
      for (const q of paper.sections[0].items.flatMap(questionsOf)) {
        const url = EN_LISTEN_CLIPS[q.script ?? ""];
        const listen = (JSON.parse(q.row.explanation) as { listen?: { url: string; script: string } }).listen;
        if (q.printOnly || !listen || listen.url !== url || listen.script !== q.script) fail(`${where}/${seed}: câu nghe không có file — ${q.script}`);
        if (!rows.includes(q.row)) fail(`${where}/${seed}: câu nghe không có trong bài làm trên máy`);
      }

      if (s < 3) {
        if (JSON.stringify(buildTiengAnh(c, k.key, examKindLabel(k.key), seed)) !== JSON.stringify(paper)) fail(`${where}/${seed}: cùng seed ra đề khác`);
        const withKey = buildPaperHtml(paper, { answers: "key", schoolYear: "2026 – 2027" });
        const none = buildPaperHtml(paper, { answers: "none", schoolYear: "2026 – 2027" });
        for (const [html, must] of [[withKey, "Lời đọc:"], [withKey, "PART 4. SPEAKING"], [none, "PHẦN DÀNH CHO NGƯỜI COI THI"], [none, paper.speaking!.questions[0]]] as const) {
          if (!html.includes(must)) fail(`${where}/${seed}: bản in thiếu “${must}”`);
        }
        if (/undefined|NaN/.test(withKey + none)) fail(`${where}/${seed}: bản in có undefined/NaN`);
      }
    }
  }
}

for (const c of Object.values(EN)) checkContent(c);
const extra = [...Object.values(EN_LISTEN_CLIPS), ...Object.values(EN_PASSAGE_CLIPS)].filter((u) => !usedClips.has(u));
if (extra.length) fail(`${extra.length} file nghe không hội thoại nào dùng (chạy lại scripts/gen-en-listen-audio.py)`);

if (errors.length) {
  console.error(`✗ tieng-anh: ${errors.length} lỗi\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log(`✓ tieng-anh: ${Object.values(EN).map((c) => `lớp ${c.grade} ${c.units.length} Unit, ${c.passages.length} bài đọc`).join("; ")}; ${EXAM_KINDS.length} kì × ${SEEDS} seed đều ổn, ${usedClips.size} file nghe (hội thoại + bài đọc)`);
