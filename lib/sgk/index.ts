// lib/sgk/index.ts — học theo từng bài sách Kết nối tri thức (trang /lop/[grade]/toan).
// Mỗi bài sinh 10 câu theo seed, không cần DB: cùng bài + seed → cùng bộ câu.
// Kế hoạch và đối chiếu từng bài: .claude/ai-context/feature-specs/toan-kntt.md.

import { buildWorksheetQuestions, type GenQuestionRow, type MathGrade, type MathLessonSpec } from "../mathGen";
import { TOAN1 } from "./books/toan1";
import { TOAN2 } from "./books/toan2";
import { TOAN3 } from "./books/toan3";
import { TOAN4 } from "./books/toan4";
import { TOAN5 } from "./books/toan5";
import type { SgkBook, SgkLesson, SgkTopic } from "./types";

export type { SgkBook, SgkLesson, SgkTopic } from "./types";

/** Mọi cuốn sách đã có mục lục. */
export const SGK_BOOKS: SgkBook[] = [TOAN1, TOAN2, TOAN3, TOAN4, TOAN5];

export const QUESTIONS_PER_LESSON = 10;

/**
 * Môn của lớp đã có sách ở đây thì tab "Bài tập" của môn đó trên /lop/[grade] không hiện
 * các bài nhập tay cũ trong DB nữa (chủ site thấy lộn xộn), chỉ mời vào học theo từng bài
 * sách. Bài cũ không bị xoá: link /quiz?lessonId= đã chia sẻ vẫn mở được; đề kiểm tra
 * (type 'exam') không bị ảnh hưởng. Bỏ ẩn = cho hàm này trả về false.
 */
export const hidesOldLessons = (grade: number, subject: string | null | undefined) =>
  !!subject && SGK_BOOKS.some((b) => b.grade === grade && b.subject === subject);

export const sgkBook = (grade: number, slug = "toan") => SGK_BOOKS.find((b) => b.grade === grade && b.slug === slug) ?? null;
export const hasSgkToan = (grade: number) => !!sgkBook(grade);
export const sgkToanHref = (grade: number, so?: number) => `/lop/${grade}/toan${so ? `/bai-${so}` : ""}`;
/** Khoá tiến độ trên máy (lib/lessonProgress.ts) — tách khỏi id bài trong DB. */
export const sgkProgressKey = (grade: number, so: number) => `${sgkBook(grade)?.id ?? `kntt-toan-${grade}`}-${so}`;

export function sgkLessons(grade: number): { topic: SgkTopic; lesson: SgkLesson }[] {
  return (sgkBook(grade)?.topics ?? []).flatMap((topic) => topic.bai.map((lesson) => ({ topic, lesson })));
}

export function findSgkLesson(grade: number, so: number) {
  return sgkLessons(grade).find((x) => x.lesson.so === so) ?? null;
}

/** Các bài được trộn của một bài luyện tập: ghi rõ, hoặc mọi bài học trước nó trong chủ đề. */
function tronOf(grade: number, lesson: SgkLesson): SgkLesson[] {
  const found = findSgkLesson(grade, lesson.so);
  if (!found || !lesson.luyen) return [];
  const pool = lesson.tron
    ? lesson.tron.map((so) => findSgkLesson(grade, so)?.lesson).filter((l): l is SgkLesson => !!l)
    : found.topic.bai.filter((l) => l.so < lesson.so && !l.luyen);
  return pool.filter((l) => !!l.mix);
}

/** Bài làm được trên máy: có dạng câu riêng, hoặc trộn được từ ít nhất một bài đã có. */
export const sgkReady = (grade: number, lesson: SgkLesson) => !!lesson.mix || tronOf(grade, lesson).length > 0;

const specOf = (grade: number, l: SgkLesson): MathLessonSpec =>
  ({ id: `${sgkBook(grade)!.id}-${l.so}`, grade: grade as MathGrade, title: l.ten, mix: l.mix! });

/** Seed cho một lần vào bài không ghi `?seed=` (trang bài render động ở server). */
export const freshSeed = () => Math.random().toString(36).slice(2, 8);

/** 10 câu của một bài. Bài luyện tập chia đều số câu cho các bài được trộn. */
export function buildSgkRows(grade: number, lesson: SgkLesson, seed: string): GenQuestionRow[] {
  const specs = lesson.mix ? [specOf(grade, lesson)] : tronOf(grade, lesson).map((l) => specOf(grade, l));
  return buildWorksheetQuestions(specs, QUESTIONS_PER_LESSON, `kntt|${lesson.so}|${seed}`);
}
