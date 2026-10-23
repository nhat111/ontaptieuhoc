// scripts/sgk-tv-check.ts — kiểm tra bài tập Tiếng Việt theo từng bài sách (lib/sgk TV_BOOKS,
// lib/tvGen). Chạy: npx tsx scripts/sgk-tv-check.ts
//  - mục lục: `so` liền 1..n cả năm, `soTap` liền 1..n mỗi tập, chủ điểm đánh số liền;
//  - kho chính tả: chỗ trống thuộc đúng lựa chọn của kho, luật c/k, g/gh, ng/ngh trước e/ê/i,
//    không trùng từ; kho dấu hỏi / ngã: tiếng đánh dấu mang đúng dấu hỏi hoặc ngã;
//  - kho từ: một từ chỉ ở một nhóm, đáp án nhiễu của chủ đề không trùng đáp án đúng, câu mẫu
//    không trùng, mỗi chữ hoa của bài lẻ có tên riêng / câu;
//  - mọi bài: 10 câu × 300 seed, cùng seed ra cùng bộ, lựa chọn không trùng, đáp án nằm trong
//    lựa chọn và chấm đúng bằng scoreAnswer; điền đáp án vào chỗ trống ra đúng từ ở lời giải;
//  - ví dụ giải mẫu: 1–4 câu, cố định, khác nhau.

import { TV_BOOKS, MAX_EXAMPLES, QUESTIONS_PER_LESSON, buildSgkExamples, buildSgkRows, sgkLessons, sgkReady } from "../lib/sgk";
import { TV2_ODD_LETTERS } from "../lib/sgk/books/tv2";
import { scoreAnswer } from "../lib/quizData";
import { rowToQuestion } from "../lib/quickExam";
import { SPELL_BANKS, HOI_NGA } from "../lib/tvGen/spell";
import { CHU_HOA, KIND_WORDS, SENTENCES, THEMES, END_MARKS } from "../lib/tvGen/ltvc";
import { stripTone, toneOf } from "../lib/tvGen/core";

let errors = 0;
const fail = (msg: string) => { if (errors++ < 40) console.error("✗ " + msg); };

/* ───────────── Kho chính tả ───────────── */

const FRONT = /^[eêiéèẻẽẹếềểễệíìỉĩị]/;
for (const b of SPELL_BANKS) {
  if (new Set(b.words).size !== b.words.length) fail(`kho ${b.id}: trùng từ`);
  for (const w of b.words) {
    if (/"/.test(w)) fail(`kho ${b.id}: “${w}” có ngoặc kép thẳng`);
    const parts = [...w.matchAll(/\[([^\]]+)\]/g)];
    if (parts.length === 0) fail(`kho ${b.id}: “${w}” không có chỗ trống`);
    for (const m of parts) {
      const x = b.part === "van" ? stripTone(m[1]) : m[1];
      if (!b.options.includes(x)) fail(`kho ${b.id}: “${w}” — “${m[1]}” không thuộc ${b.options.join("/")}`);
      if (b.part === "van") continue;
      const after = w.slice((m.index ?? 0) + m[0].length);
      const front = FRONT.test(after);
      if ((x === "k" || x === "gh" || x === "ngh") && !front) fail(`kho ${b.id}: “${w}” — ${x} chỉ đứng trước e, ê, i`);
      if ((x === "c" || x === "g" || x === "ng") && front) fail(`kho ${b.id}: “${w}” — trước e, ê, i phải viết ${x === "c" ? "k" : x + "h"}`);
    }
  }
}
for (const w of HOI_NGA) {
  const m = w.match(/\[([^\]]+)\]/);
  const t = m ? toneOf(m[1]) : "";
  if (t !== "hoi" && t !== "nga") fail(`hỏi/ngã: “${w}” không mang dấu hỏi hoặc ngã`);
}
if (new Set(HOI_NGA).size !== HOI_NGA.length) fail("hỏi/ngã: trùng từ");

/* ───────────── Kho từ, câu ───────────── */

const kindOf = new Map<string, string>();
for (const [k, words] of Object.entries(KIND_WORDS)) {
  for (const w of words) {
    if (kindOf.has(w)) fail(`từ loại: “${w}” ở cả ${kindOf.get(w)} và ${k}`);
    kindOf.set(w, k);
  }
}
const allSentences = Object.values(SENTENCES).flat();
if (new Set(allSentences).size !== allSentences.length) fail("kiểu câu: trùng câu");
for (const [m, list] of Object.entries(END_MARKS)) {
  for (const s of list) if (/[.?!]$/.test(s)) fail(`dấu câu ${m}: “${s}” đã có dấu cuối`);
}
for (const [id, t] of Object.entries(THEMES)) {
  const clash = t.right.filter((w) => t.wrong.includes(w));
  if (clash.length) fail(`chủ đề ${id}: “${clash.join(", ")}” vừa đúng vừa sai`);
  if (t.right.length < 4 || t.wrong.length < 4) fail(`chủ đề ${id}: quá ít từ`);
}
for (const tap of [1, 2] as const) {
  for (const letters of Object.values(TV2_ODD_LETTERS[tap])) {
    for (const l of letters) {
      const items = CHU_HOA[l];
      if (!items?.length) fail(`chữ hoa ${l}: chưa có tên riêng / câu`);
      for (const s of items ?? []) if (stripTone(s.charAt(0)) !== l) fail(`chữ hoa ${l}: “${s}” không bắt đầu bằng ${l}`);
    }
  }
}

/* ───────────── Từng bài ───────────── */

const SEEDS = 300;
let rowsChecked = 0;

/** Điền đáp án vào chỗ trống của câu chính tả rồi so với từ trong lời giải. */
function checkSpelling(content: string, answer: string, solution: string, where: string) {
  const shown = content.match(/: “([^”]+)”$/)?.[1];
  const word = solution.match(/^Viết đúng: “([^”]+)”/)?.[1];
  if (!shown || !word) return fail(`${where}: không đọc được câu chính tả “${content}”`);
  const filled = shown.replace("…", answer);
  const same = /vần/.test(content) ? stripTone(filled) === stripTone(word) : filled === word;
  if (!same) fail(`${where}: điền “${answer}” vào “${shown}” ra “${filled}”, lời giải “${word}”`);
}

function checkHoiNga(content: string, answer: string, solution: string, where: string) {
  const bare = content.match(/^Tiếng “([^”]+)”/)?.[1];
  const word = solution.match(/^Viết đúng: “([^”]+)”/)?.[1];
  if (!bare || !word) return fail(`${where}: không đọc được câu hỏi/ngã`);
  const syl = word.split(" ").find((x) => stripTone(x) === bare && x !== bare);
  const tone = syl ? toneOf(syl) : "";
  if ((answer === "dấu hỏi" ? "hoi" : "nga") !== tone) fail(`${where}: “${word}” — đáp án ${answer} không khớp`);
}

for (const book of TV_BOOKS) {
  const tag = `${book.subject} ${book.grade}`;
  const all = sgkLessons(book.grade, book.slug);
  all.forEach((x, i) => { if (x.lesson.so !== i + 1) fail(`${tag}: bài thứ ${i + 1} đánh số ${x.lesson.so}`); });
  book.topics.forEach((t, i) => { if (t.so !== i + 1) fail(`${tag}: chủ điểm thứ ${i + 1} đánh số ${t.so}`); });
  for (const tap of [1, 2] as const) {
    const nums = all.filter((x) => x.topic.tap === tap).map((x) => x.lesson.soTap);
    nums.forEach((n, i) => { if (n !== i + 1) fail(`${tag} tập ${tap}: bài thứ ${i + 1} có soTap ${n}`); });
  }

  for (const { lesson } of all) {
    const where = `${tag} bài ${lesson.so}`;
    if (!sgkReady(book.grade, lesson, book.slug)) { fail(`${where}: chưa làm được trên máy`); continue; }
    const total = (lesson.mix ?? []).reduce((n, [, k]) => n + k, 0);
    if (Math.abs(total - QUESTIONS_PER_LESSON) > 1e-9) fail(`${where}: mix cộng lại ${total}, cần ${QUESTIONS_PER_LESSON}`);

    let dup = 0;
    for (let s = 0; s < SEEDS; s++) {
      const seed = `s${s}`;
      const rows = buildSgkRows(book.grade, lesson, seed, book.slug);
      if (s < 3 && JSON.stringify(rows) !== JSON.stringify(buildSgkRows(book.grade, lesson, seed, book.slug))) fail(`${where}: cùng seed ra bộ khác`);
      if (rows.length !== QUESTIONS_PER_LESSON) fail(`${where}/${seed}: ${rows.length} câu`);
      const keys = rows.map((r) => r.content + "|" + [...r.options].sort().join("|"));
      if (new Set(keys).size !== keys.length) dup++;
      rows.forEach((row, i) => {
        rowsChecked++;
        const w = `${where}/${seed} câu ${i + 1}`;
        if (row.type !== "mcq") fail(`${w}: không phải trắc nghiệm`);
        if (row.options.length < 2 || new Set(row.options).size !== row.options.length) fail(`${w}: lựa chọn trùng hoặc quá ít: ${row.options.join(" | ")}`);
        if (!row.options.includes(row.correct_answer)) fail(`${w}: đáp án “${row.correct_answer}” không có trong lựa chọn`);
        if (!scoreAnswer(rowToQuestion(row, 1), row.correct_answer)) fail(`${w}: chấm sai đáp án đúng`);
        if (/"/.test(row.content)) fail(`${w}: có ngoặc kép thẳng`);
        const sol = (JSON.parse(row.explanation).solution as string) ?? "";
        if (!sol.trim()) fail(`${w}: thiếu lời giải`);
        if (/điền vào chỗ trống/.test(row.content)) checkSpelling(row.content, row.correct_answer, sol, w);
        if (/cần thêm dấu hỏi hay dấu ngã/.test(row.content)) checkHoiNga(row.content, row.correct_answer, sol, w);
        if (/^Từ “(.+)” là từ chỉ gì\?$/.test(row.content)) {
          const word = row.content.match(/^Từ “(.+)”/)![1];
          const k = kindOf.get(word);
          const label = { "su-vat": "sự vật", "hoat-dong": "hoạt động", "dac-diem": "đặc điểm" }[k ?? ""];
          if (row.correct_answer !== `Từ chỉ ${label}`) fail(`${w}: “${word}” là ${k}, đáp án ${row.correct_answer}`);
        }
      });
    }

    // Kho nhỏ thì thỉnh thoảng (sau 30 lần thử) vẫn lặp một câu; quá 2% bộ là kho cần thêm từ.
    if (dup > SEEDS * 0.02) fail(`${where}: ${dup}/${SEEDS} bộ có câu lặp lại`);
    const ex = buildSgkExamples(book.grade, lesson, book.slug);
    if (ex.length < 1 || ex.length > MAX_EXAMPLES) fail(`${where}: ${ex.length} ví dụ giải mẫu`);
    if (JSON.stringify(ex) !== JSON.stringify(buildSgkExamples(book.grade, lesson, book.slug))) fail(`${where}: ví dụ đổi giữa hai lần`);
    if (new Set(ex.map((r) => r.content)).size !== ex.length) fail(`${where}: ví dụ trùng nhau`);
  }
  if (!errors) console.log(`✓ ${tag}: ${book.topics.length} chủ điểm, ${all.length} bài, mỗi bài ${SEEDS} bộ câu đều ổn`);
}

if (!errors) console.log(`✓ sgk-tv: ${SPELL_BANKS.length} kho chính tả, ${HOI_NGA.length} từ hỏi/ngã, đã soát ${rowsChecked} câu`);
process.exit(errors ? 1 : 0);
