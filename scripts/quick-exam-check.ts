// scripts/quick-exam-check.ts — kiểm tra "Tạo đề nhanh" (lib/quickExam.ts).
//
//   1. Mọi id chủ đề trong MATH_SCOPE có thật trong MATH_LESSONS, đúng lớp.
//   2. Mỗi (lớp, môn, kì) sinh đủ số câu, không câu trùng, trắc nghiệm đứng trước tự luận,
//      tổng điểm tờ đề đúng 10 (Tiếng Việt lớp 3–5: 7 điểm đọc hiểu, còn lại là đọc thành
//      tiếng; lớp 1–2: phần đọc hiểu + đọc thành tiếng = 10, phần chấm trên máy chia điểm khác).
//   3. Cùng seed → cùng đề (link /quiz?de=…&seed=… mở lại đúng đề, server khớp trình duyệt).
//   4. Câu hỏi chuyển sang dạng của trang quiz chấm đúng đáp án đúng và chấm sai đáp án khác.
//   5. Khoá trong URL đọc lại ra đúng spec; khoá lạ, môn chưa có bộ sinh → null.
//
// Chạy: npx tsx scripts/quick-exam-check.ts

import { MATH_LESSONS } from "../lib/mathGen";
import {
  EXAM_KINDS, MATH_SCOPE, buildQuickExamRows, cleanSeed, getQuickExam, quickExamById, rowToQuestion,
} from "../lib/quickExam";
import { scoreAnswer } from "../lib/quizData";
import { sectionPoints } from "../lib/exam5/paper";

const SEEDS = 200;
const errors: string[] = [];
const fail = (msg: string) => { if (errors.length < 30) errors.push(msg); };

const SUBJECTS: [number, string][] = [
  ...Object.keys(MATH_SCOPE).map((g) => [Number(g), "Toán"] as [number, string]),
  [1, "Tiếng Việt"],
  [2, "Tiếng Việt"],
  [3, "Tiếng Việt"],
  [4, "Tiếng Việt"],
  [5, "Tiếng Việt"],
];

for (const [g, subject] of SUBJECTS) {
  for (const k of EXAM_KINDS) {
    if (subject === "Toán") {
      const ids = MATH_SCOPE[g][k.key];
      if (!ids?.length) { fail(`lớp ${g} ${k.key}: chưa có chủ đề`); continue; }
      for (const id of ids) {
        const l = MATH_LESSONS.find((x) => x.id === id);
        if (!l) fail(`lớp ${g} ${k.key}: id "${id}" không có trong MATH_LESSONS`);
        else if (l.grade !== g) fail(`lớp ${g} ${k.key}: "${id}" là chủ đề lớp ${l.grade}`);
      }
    }
    const spec = getQuickExam(g, subject, k.key);
    if (!spec) { fail(`lớp ${g} ${k.key}: getQuickExam trả null`); continue; }
    if (quickExamById(spec.id)?.id !== spec.id) fail(`${spec.id}: quickExamById không đọc lại được`);

    for (let s = 0; s < SEEDS; s++) {
      const seed = `s${s}`;
      const rows = buildQuickExamRows(spec, seed);
      const paper = spec.paper(seed);
      const pts = paper.viet
        ? sectionPoints({ ...paper, sections: paper.sections.filter((x) => !x.part) }) + (paper.readAloud?.points ?? 0)
        : sectionPoints(paper) + (subject === "Tiếng Việt" ? 3 : 0);
      if (pts !== 10) fail(`${spec.id}/${seed}: tổng điểm ${pts}`);
      if (rows.length !== spec.count) fail(`${spec.id}/${seed}: ${rows.length} câu, cần ${spec.count}`);
      const keys = rows.map((r) => r.content + "\u0000" + r.options.join("\u0000"));
      if (new Set(keys).size !== keys.length) fail(`${spec.id}/${seed}: có câu trùng`);
      const firstOpen = rows.findIndex((r) => r.type !== "mcq");
      if (firstOpen >= 0 && rows.slice(firstOpen).some((r) => r.type === "mcq")) fail(`${spec.id}/${seed}: trắc nghiệm nằm sau tự luận`);
      if (s < 5 && JSON.stringify(buildQuickExamRows(spec, seed)) !== JSON.stringify(rows)) fail(`${spec.id}/${seed}: cùng seed ra đề khác`);

      rows.forEach((r, i) => {
        const q = rowToQuestion(r, i + 1);
        const right = q.type === "short" ? q.correctAnswer.split("|")[0] : q.correctAnswer;
        if (!scoreAnswer(q, right)) fail(`${spec.id}/${seed} câu ${i + 1}: đáp án đúng bị chấm sai — ${r.content}`);
        if (q.type === "mcq") {
          if (!q.options.includes(q.correctAnswer)) fail(`${spec.id}/${seed} câu ${i + 1}: đáp án không nằm trong lựa chọn`);
          for (const o of q.options) if (o !== q.correctAnswer && scoreAnswer(q, o)) fail(`${spec.id}/${seed} câu ${i + 1}: nhiễu "${o}" cũng được tính đúng`);
        }
        if (!q.explanation) fail(`${spec.id}/${seed} câu ${i + 1}: thiếu lời giải`);
      });
    }
  }
}

if (getQuickExam(2, "Tiếng Anh", "cuoi-hk1") !== null) fail("môn chưa có bộ sinh lại ra đề");
if (getQuickExam(1, "Tiếng Việt", "giua-hk1") === null) fail("Tiếng Việt lớp 1 phải có đề");
if (getQuickExam(2, "Tiếng Việt", "cuoi-hk2") === null) fail("Tiếng Việt lớp 2 phải có đề");
if (getQuickExam(6, "Toán", "cuoi-hk1") !== null) fail("Toán lớp 6 chưa có bộ sinh lại ra đề");
if (getQuickExam(5, "Tiếng Việt", "cuoi-hk1") === null) fail("Tiếng Việt lớp 5 phải có đề");
if (getQuickExam(4, "Tiếng Việt", "giua-hk1") === null) fail("Tiếng Việt lớp 4 phải có đề");
if (getQuickExam(3, "Tiếng Việt", "giua-hk2") === null) fail("Tiếng Việt lớp 3 phải có đề");
if (quickExamById("tieng-viet-5-giua-hk2")?.subject !== "Tiếng Việt") fail("khoá tieng-viet-5-giua-hk2 không đọc lại được");
for (const bad of ["", "toan-3", "toan-9-cuoi-hk1", "toan-3-cuoi-hk3", "x-toan-3-cuoi-hk1", "tieng-viet-6-cuoi-hk1", "tieng-anh-5-cuoi-hk1", undefined]) {
  if (quickExamById(bad) !== null) fail(`khoá lạ "${bad}" lại ra đề`);
}
if (cleanSeed("Ab-12<script>") !== "ab12script") fail(`cleanSeed lọc sai: ${cleanSeed("Ab-12<script>")}`);
if (cleanSeed("") !== null || cleanSeed("--") !== null) fail("cleanSeed rỗng phải trả null");

if (errors.length) {
  console.error(`✗ quick-exam: ${errors.length} lỗi\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log(`✓ quick-exam: ${SUBJECTS.length} (lớp, môn) × ${EXAM_KINDS.length} kì × ${SEEDS} seed đều ổn`);
