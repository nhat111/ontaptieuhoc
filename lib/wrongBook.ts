// lib/wrongBook.ts
// Sổ câu sai (/so-cau-sai): câu bé làm sai được ghi lại trên máy; làm đúng 2 lần liền thì gạch.
//
// Câu tự sinh (bài theo sách, nhiệm vụ) có `src` = dạng câu → ghi theo DẠNG, không theo từng
// câu: sai 3 câu cùng dạng là một mục "sai 3 lần", và ôn bằng câu tương tự (số khác) chứ không
// học thuộc đúng câu cũ. Câu không có dạng (đề trong kho, đề tạo nhanh) ghi nguyên câu.
// Mọi bài nộp đều cập nhật sổ (QuizClient), nên làm đúng dạng đó ở đâu cũng được tính.
//
// localStorage `ontap_wrong_book_v1`, đọc qua useSyncExternalStore giống lib/lessonProgress.ts.

import { scoreAnswer, type Question } from "./quizData";

const KEY = "ontap_wrong_book_v1";
/** Đúng liền bấy nhiêu lần thì gạch khỏi sổ. */
export const MASTER_AFTER = 2;
/** Sổ giữ tối đa bấy nhiêu mục (bỏ mục cũ nhất). */
export const MAX_ENTRIES = 60;

export interface WrongEntry {
  /** `src` của dạng câu, hoặc `q:<băm nội dung>` với câu không có dạng. */
  key: string;
  src?: string;
  /** Tên bài / đề (để bố mẹ biết sai ở đâu). */
  title: string;
  grade?: number | null;
  subject?: string | null;
  /** Câu sai gần nhất (để xem lại, và để làm lại khi không có dạng). */
  q: Question;
  /** Số lần nộp bài có sai mục này. */
  wrong: number;
  /** Số lần đúng liền từ lần sai gần nhất. */
  streak: number;
  /** Lần cập nhật cuối (ms). */
  at: number;
}

export interface WrongBook {
  entries: WrongEntry[];
  /** Số mục đã gạch (đúng đủ MASTER_AFTER lần liền) — để khen. */
  mastered: number;
}

export const EMPTY_BOOK: WrongBook = { entries: [], mastered: 0 };

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

export const entryKey = (q: Question) => q.src ?? `q:${hash(`${q.question}\u0000${q.options.join("\u0000")}\u0000${q.correctAnswer}`)}`;

export interface QuizContext { title: string; grade?: number | null; subject?: string | null }

const answered = (a: string | null | undefined) => a !== null && a !== undefined && a !== "" && a !== "[]";

/**
 * Gộp một lần nộp bài vào sổ. Câu bỏ trống không tính (bé có thể chỉ hết giờ).
 * Sai → thêm / tăng số lần sai, đặt lại chuỗi đúng. Đúng một dạng đang có trong sổ → chuỗi +1,
 * đủ MASTER_AFTER thì gạch. Trả về sổ mới và số câu vừa ghi thêm / vừa gạch.
 */
export function applyAttempt(book: WrongBook, questions: Question[], answers: (string | null)[], ctx: QuizContext, now: number):
  { book: WrongBook; added: number; cleared: number } {
  const map = new Map(book.entries.map((e) => [e.key, e]));
  let added = 0, cleared = 0, mastered = book.mastered;
  const touched = new Set<string>();
  questions.forEach((q, i) => {
    const a = answers[i];
    if (!answered(a)) return;
    const key = entryKey(q);
    const cur = map.get(key);
    if (!scoreAnswer(q, a)) {
      // Một lần nộp tính một lần sai cho mỗi mục: sai 9 câu cùng dạng trong một bài là "sai 1 lần".
      const again = touched.has(key);
      if (!again) added++;
      touched.add(key);
      map.set(key, {
        key, src: q.src, title: q.srcTitle ?? ctx.title, grade: ctx.grade ?? null, subject: ctx.subject ?? null,
        q: { ...q, id: 1 }, wrong: (cur?.wrong ?? 0) + (again ? 0 : 1), streak: 0, at: now,
      });
    } else if (cur && !touched.has(key)) {
      // Một lần nộp chỉ tính một lần đúng cho mỗi dạng: 3 câu cùng dạng đúng không gạch ngay.
      touched.add(key);
      if (cur.streak + 1 >= MASTER_AFTER) { map.delete(key); cleared++; mastered++; }
      else map.set(key, { ...cur, streak: cur.streak + 1, at: now });
    }
  });
  const entries = [...map.values()].sort((x, y) => y.at - x.at).slice(0, MAX_ENTRIES);
  return { book: { entries, mastered }, added, cleared };
}

export function removeEntry(book: WrongBook, key: string): WrongBook {
  return { ...book, entries: book.entries.filter((e) => e.key !== key) };
}

/* ─── Lưu trên máy ─── */

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cached: WrongBook = EMPTY_BOOK;

export function parseBook(raw: string | null): WrongBook {
  if (!raw) return EMPTY_BOOK;
  try {
    const d = JSON.parse(raw) as Partial<WrongBook>;
    const entries = Array.isArray(d.entries)
      ? d.entries.filter((e): e is WrongEntry => !!e && typeof e.key === "string" && !!e.q && typeof e.q.question === "string")
      : [];
    return { entries, mastered: Number.isInteger(d.mastered) ? (d.mastered as number) : 0 };
  } catch {
    return EMPTY_BOOK;
  }
}

export function getBook(): WrongBook {
  if (typeof window === "undefined") return EMPTY_BOOK;
  let raw: string | null = null;
  try { raw = window.localStorage.getItem(KEY); } catch { return EMPTY_BOOK; }
  if (raw !== cachedRaw) { cachedRaw = raw; cached = parseBook(raw); }
  return cached;
}
export const getServerBook = () => EMPTY_BOOK;

export function saveBook(book: WrongBook) {
  try { window.localStorage.setItem(KEY, JSON.stringify(book)); } catch {/* hết chỗ / bị chặn: bỏ qua */}
  listeners.forEach((l) => l());
}

/** Gọi khi nộp bài (QuizClient). */
export function recordAttempt(questions: Question[], answers: (string | null)[], ctx: QuizContext) {
  const r = applyAttempt(getBook(), questions, answers, ctx, Date.now());
  saveBook(r.book);
  return r;
}

export function subscribeBook(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) cb(); };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(cb); window.removeEventListener("storage", onStorage); };
}

/** Link ôn: các dạng (câu tương tự, sinh ở server) + `goc=1` để kèm câu gốc không có dạng. */
export function practiceHref(entries: WrongEntry[], seed: string): string {
  const srcs = entries.filter((e) => e.src).map((e) => e.src!).slice(0, 5);
  const p = new URLSearchParams();
  if (srcs.length) p.set("d", srcs.join(","));
  if (entries.some((e) => !e.src)) p.set("goc", "1");
  p.set("seed", seed);
  return `/so-cau-sai/on?${p.toString()}`;
}
