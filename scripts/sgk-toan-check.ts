// scripts/sgk-toan-check.ts — kiểm tra Toán theo từng bài sách (lib/sgk).
// Chạy: npx tsx scripts/sgk-toan-check.ts
//  - số chủ đề, số bài liên tục; tập một đứng trước tập hai;
//  - bài trộn chỉ trỏ tới bài có thật, đứng trước nó; `mix` mỗi bài cộng đủ 10 câu;
//  - mỗi bài làm được sinh đúng 10 câu với 300 seed, cùng seed ra cùng bộ câu, không câu
//    nào trùng trong một bộ; đáp án đúng chấm là đúng, đáp án nhiễu chấm là sai
//    (bằng chính `scoreAnswer` của trang làm bài).
// Đáp án từng dạng câu được tính lại độc lập trong scripts/gen-math-check.ts.

import { scoreAnswer } from "../lib/quizData";
import { rowToQuestion } from "../lib/quickExam";
import { QUESTIONS_PER_LESSON, SGK_TOAN, buildSgkRows, sgkLessons, sgkReady } from "../lib/sgk";

const SEEDS = 300;
let errors = 0;
const fail = (msg: string) => { errors++; if (errors <= 30) console.error("✗ " + msg); };

for (const [g, topics] of Object.entries(SGK_TOAN)) {
  const grade = Number(g);
  topics!.forEach((t, i) => {
    if (t.so !== i + 1) fail(`lớp ${grade}: chủ đề thứ ${i + 1} đánh số ${t.so}`);
    if (i > 0 && t.tap < topics![i - 1].tap) fail(`lớp ${grade}: chủ đề ${t.so} thuộc tập ${t.tap} đứng sau tập ${topics![i - 1].tap}`);
  });
  const all = sgkLessons(grade);
  all.forEach(({ lesson }, i) => { if (lesson.so !== i + 1) fail(`lớp ${grade}: bài thứ ${i + 1} đánh số ${lesson.so}`); });

  let ready = 0;
  for (const { lesson } of all) {
    const tag = `Toán ${grade} bài ${lesson.so}`;
    if (lesson.mix && lesson.mix.reduce((s, [, n]) => s + n, 0) !== QUESTIONS_PER_LESSON) fail(`${tag}: mix không cộng đủ ${QUESTIONS_PER_LESSON} câu`);
    if (lesson.mix && (lesson.luyen || lesson.thucHanh)) fail(`${tag}: bài luyện tập / thực hành không có mix riêng`);
    for (const so of lesson.tron ?? []) {
      if (!all.some((x) => x.lesson.so === so)) fail(`${tag}: trộn bài ${so} không tồn tại`);
      if (so >= lesson.so) fail(`${tag}: trộn bài ${so} đứng sau nó`);
    }
    if (!sgkReady(grade, lesson)) continue;
    ready++;

    for (let s = 0; s < SEEDS; s++) {
      const seed = `s${s}`;
      let rows;
      try {
        rows = buildSgkRows(grade, lesson, seed);
      } catch (e) {
        fail(`${tag} seed ${seed}: THROW ${(e as Error).message}`);
        break;
      }
      if (rows.length !== QUESTIONS_PER_LESSON) fail(`${tag} seed ${seed}: ${rows.length} câu`);
      if (s < 20 && JSON.stringify(buildSgkRows(grade, lesson, seed)) !== JSON.stringify(rows)) fail(`${tag}: cùng seed ra bộ câu khác`);
      const keys = rows.map((r) => r.content + "\u0000" + r.options.join("\u0000"));
      if (new Set(keys).size !== keys.length && s < 50) fail(`${tag} seed ${seed}: có câu trùng`);

      rows.forEach((row, i) => {
        const q = rowToQuestion(row, i + 1);
        const right = row.type === "short" ? row.correct_answer.split("|")[0] : row.correct_answer;
        if (!scoreAnswer(q, right)) fail(`${tag} seed ${seed}: đáp án đúng bị chấm sai — ${row.content}`);
        if (row.type === "mcq") {
          if (!row.options.includes(row.correct_answer)) fail(`${tag}: đáp án không nằm trong lựa chọn — ${row.content}`);
          for (const o of row.options) if (o !== row.correct_answer && scoreAnswer(q, o)) fail(`${tag}: nhiễu "${o}" cũng được tính đúng — ${row.content}`);
        }
        if (/undefined|NaN|\[object/.test(row.content + row.options.join())) fail(`${tag}: chuỗi lỗi — ${row.content}`);
      });
    }
  }
  console.log(`✓ Toán ${grade}: ${all.length} bài, ${ready} bài làm được trên máy`);
}

if (errors) {
  console.error(`\n${errors} lỗi`);
  process.exit(1);
}
