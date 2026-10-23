// lib/sgk/index.ts — học theo từng bài sách Kết nối tri thức (trang /lop/[grade]/toan, /lop/[grade]/tieng-viet).
// Mỗi bài sinh 10 câu theo seed, không cần DB: cùng bài + seed → cùng bộ câu.
// Kế hoạch và đối chiếu từng bài: .claude/ai-context/feature-specs/toan-kntt.md.

import { buildWorksheetQuestions, toQuestionRow, type GenQuestionRow, type MathGrade, type MathLessonSpec } from "../mathGen";
import { mulberry32, seedFrom, type Generator } from "../mathGen/core";
import { TOAN1 } from "./books/toan1";
import { TOAN2 } from "./books/toan2";
import { TOAN3 } from "./books/toan3";
import { TOAN4 } from "./books/toan4";
import { TOAN5 } from "./books/toan5";
import { TV2 } from "./books/tv2";
import type { SgkBook, SgkLesson, SgkTopic } from "./types";

export type { SgkBook, SgkLesson, SgkTopic } from "./types";

/** Mọi cuốn sách Toán đã có mục lục (trang /lop/[grade]/toan). */
export const SGK_BOOKS: SgkBook[] = [TOAN1, TOAN2, TOAN3, TOAN4, TOAN5];

/**
 * Sách Tiếng Việt có bài tập làm trên máy (trang /lop/[grade]/tieng-viet). Để riêng khỏi
 * SGK_BOOKS: các bài Tiếng Việt cũ trong DB vẫn hiện trên trang lớp (không bị `hidesOldLessons` ẩn).
 */
export const TV_BOOKS: SgkBook[] = [TV2];

const ALL_BOOKS = [...SGK_BOOKS, ...TV_BOOKS];

export const QUESTIONS_PER_LESSON = 10;

/**
 * Môn của lớp đã có sách ở đây thì tab "Bài tập" của môn đó trên /lop/[grade] không hiện
 * các bài nhập tay cũ trong DB nữa (chủ site thấy lộn xộn), chỉ mời vào học theo từng bài
 * sách. Bài cũ không bị xoá: link /quiz?lessonId= đã chia sẻ vẫn mở được; đề kiểm tra
 * (type 'exam') không bị ảnh hưởng. Bỏ ẩn = cho hàm này trả về false.
 */
export const hidesOldLessons = (grade: number, subject: string | null | undefined) =>
  !!subject && SGK_BOOKS.some((b) => b.grade === grade && b.subject === subject);

/** Sách của một lớp theo đoạn đường dẫn môn ("toan", "tieng-viet"). */
export const sgkBook = (grade: number, slug = "toan") => ALL_BOOKS.find((b) => b.grade === grade && b.slug === slug) ?? null;
export const hasSgkToan = (grade: number) => !!sgkBook(grade);
export const sgkHref = (grade: number, slug: string, so?: number) => `/lop/${grade}/${slug}${so ? `/bai-${so}` : ""}`;
export const sgkToanHref = (grade: number, so?: number) => sgkHref(grade, "toan", so);
/** Khoá tiến độ trên máy (lib/lessonProgress.ts) — tách khỏi id bài trong DB. */
export const sgkProgressKey = (grade: number, so: number, slug = "toan") => `${sgkBook(grade, slug)?.id ?? `kntt-${slug}-${grade}`}-${so}`;
/** Số bài hiện cho người dùng: số trong tập nếu sách đánh lại từ 1 ở tập hai. */
export const baiLabel = (l: SgkLesson) => l.soTap ?? l.so;

export function sgkLessons(grade: number, slug = "toan"): { topic: SgkTopic; lesson: SgkLesson }[] {
  return (sgkBook(grade, slug)?.topics ?? []).flatMap((topic) => topic.bai.map((lesson) => ({ topic, lesson })));
}

export function findSgkLesson(grade: number, so: number, slug = "toan") {
  return sgkLessons(grade, slug).find((x) => x.lesson.so === so) ?? null;
}

/** Các bài được trộn của một bài luyện tập: ghi rõ, hoặc mọi bài học trước nó trong chủ đề. */
function tronOf(grade: number, lesson: SgkLesson, slug: string): SgkLesson[] {
  const found = findSgkLesson(grade, lesson.so, slug);
  if (!found || !lesson.luyen) return [];
  const pool = lesson.tron
    ? lesson.tron.map((so) => findSgkLesson(grade, so, slug)?.lesson).filter((l): l is SgkLesson => !!l)
    : found.topic.bai.filter((l) => l.so < lesson.so && !l.luyen);
  return pool.filter((l) => !!l.mix);
}

/** Bài làm được trên máy: có dạng câu riêng, hoặc trộn được từ ít nhất một bài đã có. */
export const sgkReady = (grade: number, lesson: SgkLesson, slug = "toan") => !!lesson.mix || tronOf(grade, lesson, slug).length > 0;

const specOf = (grade: number, l: SgkLesson, slug: string): MathLessonSpec =>
  ({ id: `${sgkBook(grade, slug)!.id}-${l.so}`, grade: grade as MathGrade, title: l.ten, mix: l.mix! });

/** Seed cho một lần vào bài không ghi `?seed=` (trang bài render động ở server). */
export const freshSeed = () => Math.random().toString(36).slice(2, 8);

/** 10 câu của một bài. Bài luyện tập chia đều số câu cho các bài được trộn. */
export function buildSgkRows(grade: number, lesson: SgkLesson, seed: string, slug = "toan"): GenQuestionRow[] {
  const specs = lesson.mix ? [specOf(grade, lesson, slug)] : tronOf(grade, lesson, slug).map((l) => specOf(grade, l, slug));
  // Toán giữ tiền tố "kntt|" cũ: link ?seed= đã chia sẻ mở lại đúng bộ câu.
  const prefix = slug === "toan" ? "kntt" : sgkBook(grade, slug)!.id;
  return buildWorksheetQuestions(specs, QUESTIONS_PER_LESSON, `${prefix}|${lesson.so}|${seed}`);
}

export const MAX_EXAMPLES = 4;

/**
 * Ví dụ giải mẫu của một bài: mỗi dạng câu một ví dụ (bài luyện tập: các dạng của những
 * bài được trộn). Dạng nào ra đề trùng chữ với dạng trước (VD hai kiểu "Đồng hồ bên chỉ mấy
 * giờ?") thì bỏ, rồi chọn rải đều tối đa MAX_EXAMPLES. Seed cố định theo bài nên ví dụ không
 * đổi giữa các lần vào; câu lấy từ chính bộ sinh câu nên đáp án, lời giải luôn khớp bài làm.
 */
export function buildSgkExamples(grade: number, lesson: SgkLesson, slug = "toan"): GenQuestionRow[] {
  const sources = lesson.mix ? [lesson] : tronOf(grade, lesson, slug);
  const gens: Generator[] = [];
  for (const l of sources) for (const [g] of l.mix ?? []) if (!gens.includes(g)) gens.push(g);
  const r = mulberry32(seedFrom(`vidu|${sgkBook(grade, slug)?.id}|${lesson.so}`));
  const rows: GenQuestionRow[] = [];
  for (const g of gens) {
    const row = toQuestionRow(g(r), r);
    if (!rows.some((x) => x.content === row.content)) rows.push(row);
  }
  if (rows.length <= MAX_EXAMPLES) return rows;
  return Array.from({ length: MAX_EXAMPLES }, (_, i) => rows[Math.floor((i * rows.length) / MAX_EXAMPLES)]);
}
