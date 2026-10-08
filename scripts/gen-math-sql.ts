// scripts/gen-math-sql.ts — xuất bài luyện tập Toán tự sinh (lib/mathGen) thành 1 file SQL
// để dán vào Supabase → SQL Editor → Run. Không cần service key, không gọi API nào.
//
// File SQL chạy lại bao nhiêu lần cũng được: chương/bài nhận diện qua `source_id`
// ("gen_…"), bài nào đã có câu hỏi thì bỏ qua.
//
// Chạy (chỉ khi cần sinh lại, VD sau khi sửa generator hoặc muốn bộ đề khác):
//   npx tsx scripts/gen-math-check.ts                 # kiểm tra trước
//   npx tsx scripts/gen-math-sql.ts                   # → supabase/toan-tu-sinh.sql (seed "v1")
//   npx tsx scripts/gen-math-sql.ts --seed v2         # bộ đề khác

import { writeFileSync } from "node:fs";
import { MATH_LESSONS, buildLessonQuestions, type MathGrade } from "../lib/mathGen";

const SUBJECT = "Toán"; // phải khớp lib/subjects.ts
const CHAPTER_TITLE = "Luyện tập theo chủ đề";
const CHAPTER_ORDER = 1000; // xếp sau các chương theo sách
const OUT = "supabase/toan-tu-sinh.sql";

const i = process.argv.indexOf("--seed");
const seed = i >= 0 ? process.argv[i + 1] : "v1";

/** Chuỗi SQL an toàn: nhân đôi dấu nháy đơn. */
const q = (s: string) => `'${s.replace(/'/g, "''")}'`;

const grades: MathGrade[] = [1, 2, 5];
const out: string[] = [
  `-- Bài luyện tập Toán tự sinh — lớp ${grades.join(", ")} (seed "${seed}")`,
  `-- Sinh bởi scripts/gen-math-sql.ts từ lib/mathGen. ĐỪNG sửa tay: sửa generator rồi sinh lại.`,
  `--`,
  `-- Cách dùng: Supabase → SQL Editor → dán toàn bộ file → Run.`,
  `-- Chạy lại an toàn: chương/bài nhận diện qua source_id 'gen_…', bài đã có câu hỏi thì bỏ qua.`,
  `--`,
  `-- Muốn gỡ toàn bộ (xoá luôn bài + câu hỏi bên trong, không đụng bài nhập tay / NXBGD):`,
  `--   DELETE FROM chapters WHERE source_id LIKE 'gen_toan_lop_%';`,
  `-- Muốn thay bộ đề mới: chạy câu DELETE trên, rồi dán file SQL mới.`,
  ``,
  `BEGIN;`,
];

let lessonCount = 0, questionCount = 0;

for (const grade of grades) {
  const chapterSrc = `gen_toan_lop_${grade}`;
  out.push(
    ``,
    `-- ═══════════════ LỚP ${grade} ═══════════════`,
    `INSERT INTO subjects (grade, name, order_index)`,
    `SELECT ${grade}, ${q(SUBJECT)}, 99`,
    `WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE grade = ${grade} AND name = ${q(SUBJECT)});`,
    ``,
    `INSERT INTO chapters (title, subject_id, order_index, source_id)`,
    `SELECT ${q(CHAPTER_TITLE)}, (SELECT id FROM subjects WHERE grade = ${grade} AND name = ${q(SUBJECT)} ORDER BY id LIMIT 1), ${CHAPTER_ORDER}, ${q(chapterSrc)}`,
    `WHERE NOT EXISTS (SELECT 1 FROM chapters WHERE source_id = ${q(chapterSrc)});`,
  );

  const specs = MATH_LESSONS.filter((l) => l.grade === grade);
  for (const [idx, spec] of specs.entries()) {
    const src = `gen_${spec.id}`;
    const rows = buildLessonQuestions(spec, seed);
    lessonCount++;
    questionCount += rows.length;
    out.push(
      ``,
      `-- ${spec.title}`,
      `INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)`,
      `SELECT ${q(spec.title)}, ${q(String(idx + 1).padStart(2, "0"))}, (SELECT id FROM chapters WHERE source_id = ${q(chapterSrc)}), 'active', ${idx + 1}, 15, ${q(src)}, 'lesson'`,
      `WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = ${q(src)});`,
      ``,
      `INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)`,
      `SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord`,
      `FROM lessons l, (VALUES`,
      rows.map((r, k) =>
        `  (${q(r.content)}, ${q(r.type)}, ${q(JSON.stringify(r.options))}, ${q(r.correct_answer)}, ${q(r.explanation)}, ${k + 1})`
      ).join(",\n"),
      `) AS v(content, type, options, correct_answer, explanation, ord)`,
      `WHERE l.source_id = ${q(src)}`,
      `  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);`,
    );
  }
}

out.push(``, `COMMIT;`, ``);
writeFileSync(OUT, out.join("\n"));
console.log(`Đã ghi ${OUT}: ${lessonCount} bài, ${questionCount} câu (seed "${seed}").`);
