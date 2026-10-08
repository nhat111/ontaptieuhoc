// lib/mathGen/core.ts
// Nền tảng chung cho bộ sinh đề Toán: random có seed, số thập phân chính xác,
// tạo đáp án nhiễu. Không gọi AI hay dịch vụ ngoài — mọi đáp án do máy tính tính ra.

/* ───────────── Kiểu dữ liệu ─────────────
   Generator trả về một "câu thô" (Draft). `toQuestionRow` trong ./index.ts
   chuyển nó sang dòng `questions` của DB (mcq / short / numeric). */

type DraftCommon = {
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  question: string;
  /** URL ảnh (ở đây là data URI SVG, VD mặt đồng hồ). */
  image?: string;
  explanation: string;
  hint?: string;
};

export type Draft = DraftCommon &
  (
    | { type: "multiple_choice"; options: { id: string; text: string }[]; answer: string }
    /** Đúng một chỗ trống "___" trong `question`. */
    | { type: "fill_blank"; answers: string[]; acceptedAnswers?: string[][] }
    | { type: "ordering"; items: { id: string; content: string }[]; correctOrder: string[] }
    | { type: "true_false"; answer: boolean }
  );

export type Generator = (r: Rng) => Draft;

/* ───────────── Random có seed ─────────────
   Cùng seed → cùng bộ đề. Dùng seed = ngày để làm "Bài hôm nay". */

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Biến chuỗi bất kỳ (VD "2026-10-08|lop-1") thành seed số. */
export function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const int = (r: Rng, min: number, max: number) => min + Math.floor(r() * (max - min + 1));
export const pick = <T>(r: Rng, arr: readonly T[]): T => arr[int(r, 0, arr.length - 1)];
export const chance = (r: Rng, p: number) => r() < p;

export function shuffle<T>(r: Rng, arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = int(r, 0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** Thử sinh lại tới khi điều kiện đúng (tránh vòng lặp vô hạn). */
export function retry<T>(fn: () => T | null, tries = 200): T {
  for (let i = 0; i < tries; i++) {
    const v = fn();
    if (v !== null) return v;
  }
  throw new Error("retry: không sinh được giá trị hợp lệ");
}

/* ───────────── Số thập phân chính xác ─────────────
   Dec = n / 10^p (n là số nguyên). Tránh lỗi 0.1 + 0.2 = 0.30000000000000004 */

export type Dec = { n: number; p: number };

export function norm(d: Dec): Dec {
  let { n, p } = d;
  while (p > 0 && n % 10 === 0) { n /= 10; p--; }
  while (p < 0) { n *= 10; p++; }
  if (!Number.isSafeInteger(n)) throw new Error("Dec vượt giới hạn số nguyên an toàn");
  return { n, p };
}

export const dec = (n: number, p = 0): Dec => norm({ n, p });

/** Đọc chuỗi kiểu "3,75" hoặc "3.75". */
export function parseDec(s: string): Dec {
  const [i, f = ""] = s.replace(",", ".").split(".");
  return dec(Number(i + f), f.length);
}

function align(a: Dec, b: Dec): [number, number, number] {
  const p = Math.max(a.p, b.p);
  return [a.n * 10 ** (p - a.p), b.n * 10 ** (p - b.p), p];
}

export const add = (a: Dec, b: Dec): Dec => { const [x, y, p] = align(a, b); return norm({ n: x + y, p }); };
export const sub = (a: Dec, b: Dec): Dec => { const [x, y, p] = align(a, b); return norm({ n: x - y, p }); };
export const mul = (a: Dec, b: Dec): Dec => norm({ n: a.n * b.n, p: a.p + b.p });
export const cmp = (a: Dec, b: Dec): number => { const [x, y] = align(a, b); return Math.sign(x - y); };
/** Nhân với 10^k (k âm = chia). */
export const shift = (a: Dec, k: number): Dec => norm({ n: a.n, p: a.p - k });
export const toNum = (d: Dec) => d.n / 10 ** d.p;

/** Chia cho số nguyên, chỉ khi kết quả là số thập phân hữu hạn (tối đa 6 chữ số thập phân). */
export function divInt(a: Dec, k: number): Dec {
  let { n, p } = a;
  for (let i = 0; i < 6; i++) {
    if (n % k === 0) return norm({ n: n / k, p });
    n *= 10; p++;
  }
  throw new Error(`divInt: ${fmt(a)} : ${k} không chia hết`);
}

/** Định dạng kiểu Việt Nam: 1.234,5 */
export function fmt(d: Dec, minPlaces = 0): string {
  const neg = d.n < 0;
  let s = Math.abs(d.n).toString();
  let p = d.p;
  if (minPlaces > p) { s += "0".repeat(minPlaces - p); p = minPlaces; }
  s = s.padStart(p + 1, "0");
  const ip = s.slice(0, s.length - p);
  const fp = s.slice(s.length - p);
  const grouped = ip.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (neg ? "-" : "") + grouped + (p > 0 ? "," + fp : "");
}

export const fmtInt = (n: number) => fmt(dec(n));

/* ───────────── Dựng câu hỏi ───────────── */

const OPTION_IDS = "abcdef";

/**
 * Tạo 4 lựa chọn trắc nghiệm: 1 đúng + 3 đáp án nhiễu lấy từ `candidates`.
 * Tự loại trùng và loại đáp án đúng khỏi danh sách nhiễu.
 */
export function mcOptions(r: Rng, correct: string, candidates: string[], total = 4) {
  const pool = [...new Set(candidates)].filter((c) => c !== correct);
  const wrong = shuffle(r, pool).slice(0, total - 1);
  if (wrong.length < total - 1) throw new Error(`Thiếu đáp án nhiễu cho "${correct}"`);
  const texts = shuffle(r, [correct, ...wrong]);
  return {
    options: texts.map((text, i) => ({ id: OPTION_IDS[i], text })),
    answer: OPTION_IDS[texts.indexOf(correct)],
  };
}

/** Lựa chọn cố định thứ tự (VD dấu >, <, =), không xáo. */
export function fixedOptions(texts: string[], correct: string) {
  return {
    options: texts.map((text, i) => ({ id: OPTION_IDS[i], text })),
    answer: OPTION_IDS[texts.indexOf(correct)],
  };
}

/** Các số gần n — đáp án nhiễu kiểu "lệch 1, lệch 10, đảo chữ số". */
export function nearInts(n: number, min = 0, max = Number.MAX_SAFE_INTEGER): number[] {
  const out = [n - 1, n + 1, n - 2, n + 2, n - 10, n + 10];
  if (n >= 10 && n <= 99) out.push(Number(String(n).split("").reverse().join("")));
  return out.filter((x) => x >= min && x <= max && x !== n);
}

/** Các biến thể đáp án chấp nhận: "1.250,5" ~ "1250,5" ~ "1250.5" */
export function variants(ans: string): string[] {
  const noGroup = ans.replace(/\./g, "");
  return [...new Set([ans, noGroup, noGroup.replace(",", ".")])];
}

/** Dữ liệu cho câu điền chỗ trống (số ô trống = số đáp án). */
export function blanks(...answers: string[]) {
  return { answers, acceptedAnswers: answers.map(variants) };
}

/** Dấu so sánh giữa 2 số. */
export const sign = (c: number) => (c > 0 ? ">" : c < 0 ? "<" : "=");

/* ───────────── Đọc số bằng chữ (dùng cho phân số, hỗn số nhỏ) ───────────── */

const DIGIT_WORDS = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín", "mười"];
export const word = (n: number) => DIGIT_WORDS[n] ?? String(n);
