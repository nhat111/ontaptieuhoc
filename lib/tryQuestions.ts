// lib/tryQuestions.ts — câu cho thẻ "Làm thử một câu" ở trang chủ.
// Lấy từ chính các bài theo sách (lib/sgk: Toán 1–5, Tiếng Việt 1–2) nên luôn khớp bài thật
// trên web, và không đọc DB: trang chủ không phụ thuộc dữ liệu nhập tay.
// Chỉ giữ câu vừa thẻ: trắc nghiệm một đáp án, không hình, 2–4 lựa chọn ngắn.

import { SGK_BOOKS, TV_BOOKS, baiLabel, buildSgkRows, sgkHref, sgkLessons, sgkReady } from "./sgk";
import { mulberry32, seedFrom } from "./mathGen/core";

export type TryQuestion = {
  grade: number;
  subject: string;
  question: string;
  options: string[];
  answer: string;
  /** Bài chứa câu này, để bé làm tiếp cả bài. */
  href: string;
  lessonLabel: string;
};

export const TRY_POOL_SIZE = 12;
const MAX_QUESTION = 100;
const MAX_OPTION = 22;

export function fitsCard(r: { type: string; content: string; options: string[]; correct_answer: string; explanation: string }) {
  if (r.type !== "mcq") return false;
  if (r.options.length < 2 || r.options.length > 4) return false;
  if (r.content.length > MAX_QUESTION || r.options.some((o) => o.length > MAX_OPTION)) return false;
  if (new Set(r.options).size !== r.options.length || !r.options.includes(r.correct_answer)) return false;
  try {
    const exp = JSON.parse(r.explanation);
    if (exp?.images?.length || exp?.imageUrl) return false;
  } catch {}
  return true;
}

/**
 * Bộ câu làm thử: lần lượt từng cuốn sách (thứ tự trộn), mỗi lượt một câu từ một bài ngẫu nhiên,
 * để "Câu khác" đổi cả lớp lẫn môn. Cùng `seed` → cùng bộ câu.
 */
export function pickTryQuestions(seed: string, count = TRY_POOL_SIZE): TryQuestion[] {
  const r = mulberry32(seedFrom(`lam-thu|${seed}`));
  const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)];

  const books = [...SGK_BOOKS, ...TV_BOOKS]
    .map((b) => ({ b, lessons: sgkLessons(b.grade, b.slug).filter((x) => sgkReady(b.grade, x.lesson, b.slug)) }))
    .filter((x) => x.lessons.length > 0);
  for (let i = books.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [books[i], books[j]] = [books[j], books[i]];
  }

  const out: TryQuestion[] = [];
  const seen = new Set<string>();
  for (let tries = 0; out.length < count && tries < count * 10 && books.length; tries++) {
    const { b, lessons } = books[tries % books.length];
    const { lesson } = pick(lessons);
    const rows = buildSgkRows(b.grade, lesson, `${seed}-${tries}`, b.slug).filter(fitsCard);
    if (!rows.length) continue;
    const row = pick(rows);
    if (seen.has(row.content)) continue;
    seen.add(row.content);
    out.push({
      grade: b.grade,
      subject: b.subject,
      question: row.content,
      options: row.options,
      answer: row.correct_answer,
      href: sgkHref(b.grade, b.slug, lesson.so),
      lessonLabel: baiLabel(lesson),
    });
  }
  return out;
}
