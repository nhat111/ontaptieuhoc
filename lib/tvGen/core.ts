// lib/tvGen/core.ts — nền chung cho bộ sinh câu hỏi Tiếng Việt (bài tập theo từng bài sách).
// Dùng lại khuôn của Toán tự sinh (Generator, Draft, Rng có seed) để chạy chung trang
// /lop/[grade]/<môn>/bai-<n> và QuizClient. Mọi câu là trắc nghiệm: đáp án là một lựa chọn
// có sẵn, không phải chấm chữ bé gõ (bé lớp 1–2 gõ chữ có dấu còn khó).

import { mcOptions, fixedOptions, mulberry32, seedFrom, type Draft, type Rng } from "../mathGen/core";

export type { Draft, Generator, Rng } from "../mathGen/core";

/**
 * Rng riêng của một câu, tính từ chính nội dung câu: cùng câu hỏi + cùng đáp án thì ra cùng
 * đáp án nhiễu, cùng thứ tự. Nhờ vậy hai lần rút trúng một từ là hai dòng giống hệt, và bộ lọc
 * câu trùng của buildWorksheetQuestions (so nội dung + lựa chọn) bỏ được câu lặp.
 */
export const itemRng = (...key: string[]): Rng => mulberry32(seedFrom(key.join("\u0000")));

/** Câu trắc nghiệm: `wrong` là các đáp án nhiễu (lấy tối đa total - 1, xáo thứ tự theo itemRng). */
export function mc(question: string, correct: string, wrong: string[], explanation: string, tags: string[], total = 4): Draft {
  const n = Math.min(total, 1 + new Set(wrong.filter((w) => w !== correct)).size);
  const opts = mcOptions(itemRng(question, correct), correct, wrong, n);
  return { type: "multiple_choice", difficulty: "easy", tags, question, explanation, ...opts };
}

/** Câu trắc nghiệm giữ nguyên thứ tự lựa chọn (VD: c / k, dấu chấm / dấu chấm hỏi). */
export function mcFixed(question: string, options: string[], correct: string, explanation: string, tags: string[]): Draft {
  return { type: "multiple_choice", difficulty: "easy", tags, question, explanation, ...fixedOptions(options, correct) };
}

const TONE_MARKS = /[̣̀́̃̉]/g;

/** Bỏ dấu thanh, giữ dấu mũ, dấu móc, dấu trăng: "ừu" → "ưu", "ào" → "ao". */
export const stripTone = (s: string) => s.normalize("NFD").replace(TONE_MARKS, "").normalize("NFC");

/** Dấu thanh của một tiếng: "hoi" (hỏi), "nga" (ngã), … hoặc "" (thanh ngang). */
export function toneOf(s: string): "" | "huyen" | "sac" | "nga" | "hoi" | "nang" {
  const d = s.normalize("NFD");
  if (d.includes("̀")) return "huyen";
  if (d.includes("́")) return "sac";
  if (d.includes("̃")) return "nga";
  if (d.includes("̉")) return "hoi";
  if (d.includes("̣")) return "nang";
  return "";
}

/** Bảng chữ cái tiếng Việt (29 chữ), đúng thứ tự trong sách lớp 2. */
export const ALPHABET = ["a", "ă", "â", "b", "c", "d", "đ", "e", "ê", "g", "h", "i", "k", "l", "m", "n", "o", "ô", "ơ", "p", "q", "r", "s", "t", "u", "ư", "v", "x", "y"];

/** Viết hoa chữ cái đầu (giữ nguyên phần còn lại). */
export const capFirst = (s: string) => s.charAt(0).toLocaleUpperCase("vi") + s.slice(1);
export const lowFirst = (s: string) => s.charAt(0).toLocaleLowerCase("vi") + s.slice(1);
