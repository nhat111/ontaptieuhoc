// Trò chơi lớp 4 — sinh câu hỏi ngẫu nhiên trên trình duyệt, bám chương trình lớp 4
// (SGK mới): phân số (đọc hình, so sánh, rút gọn), đổi đơn vị đo (yến–tạ–tấn, giây–
// phút–thế kỉ, mm²–cm²–dm²–m²), danh từ / động từ / tính từ.
//
// Như lib/games.ts: chỉ sinh sau cú bấm "Bắt đầu". Kiểm tra: scripts/games-extra-check.ts.

import { fmtInt, pick, shuffle } from "./games";

export { fmtInt };

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

export const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** Đáp án + những lựa chọn nhiễu đầu tiên hợp lệ, không trùng, đủ `n` cái. */
function withDistractors<T>(answer: T, candidates: T[], n = 4, same: (a: T, b: T) => boolean = (a, b) => a === b): T[] {
  const out: T[] = [answer];
  for (const c of shuffle(candidates)) {
    if (out.length === n) break;
    if (!out.some((o) => same(o, c))) out.push(c);
  }
  return out;
}

/* ═════════════ Phân số ═════════════ */

export type Fraction = { n: number; d: number };
export type CompareSign = ">" | "<" | "=";

export const fracText = (f: Fraction) => `${f.n}/${f.d}`;
/** Đọc thành tiếng: "3 phần 4" (giọng máy đọc số thành chữ). */
export const fracWords = (f: Fraction) => `${f.n} phần ${f.d}`;
export const SIGN_WORDS: Record<CompareSign, string> = { ">": "lớn hơn", "<": "bé hơn", "=": "bằng" };

export function compareFractions(a: Fraction, b: Fraction): CompareSign {
  const l = a.n * b.d;
  const r = b.n * a.d;
  return l > r ? ">" : l < r ? "<" : "=";
}

export type FractionLevel = "doc-hinh" | "so-sanh" | "rut-gon";

export type FractionQuestion =
  | { kind: "doc-hinh"; shaded: number; parts: number; answer: string; options: string[]; reveal: string }
  | { kind: "so-sanh"; a: Fraction; b: Fraction; answer: CompareSign; reveal: string }
  | { kind: "rut-gon"; from: Fraction; answer: string; options: string[]; reveal: string };

export function makeFractionQuestion(level: FractionLevel): FractionQuestion {
  if (level === "doc-hinh") {
    const d = randInt(2, 10);
    const n = randInt(1, d - 1);
    const answer = fracText({ n, d });
    // Nhiễu: đếm phần không tô, đảo tử–mẫu, lấy phần tô trên phần không tô, lệch 1.
    const cands = [
      { n: d - n, d },
      { n: d, d: n },
      { n, d: d - n },
      { n: n + 1, d },
      { n, d: d + 1 },
      { n: Math.max(1, n - 1), d },
    ].map(fracText);
    return { kind: "doc-hinh", shaded: n, parts: d, answer, options: withDistractors(answer, cands), reveal: fracWords({ n, d }) };
  }
  if (level === "so-sanh") {
    // Lớp 4 so sánh: cùng mẫu số, cùng tử số, hoặc một mẫu số chia hết cho mẫu kia.
    let a: Fraction, b: Fraction;
    const kind = pick(["cung-mau", "cung-tu", "boi"] as const);
    if (kind === "cung-mau") {
      const d = randInt(3, 12);
      a = { n: randInt(1, d - 1), d };
      b = { n: randInt(1, d - 1), d };
    } else if (kind === "cung-tu") {
      const n = randInt(1, 6);
      a = { n, d: randInt(n + 1, 12) };
      b = { n, d: randInt(n + 1, 12) };
    } else {
      const d = randInt(2, 6);
      const k = randInt(2, 3);
      a = { n: randInt(1, d - 1), d };
      b = { n: randInt(1, d * k - 1), d: d * k };
      if (Math.random() < 0.5) [a, b] = [b, a];
    }
    const answer = compareFractions(a, b);
    return { kind: "so-sanh", a, b, answer, reveal: `${fracWords(a)} ${SIGN_WORDS[answer]} ${fracWords(b)}` };
  }
  // Rút gọn: p/q tối giản, nhân cả tử và mẫu với k.
  let p: number, q: number;
  do {
    q = randInt(2, 9);
    p = randInt(1, q - 1);
  } while (gcd(p, q) !== 1);
  const k = randInt(2, 5);
  const from = { n: p * k, d: q * k };
  const answer = { n: p, d: q };
  // Nhiễu: chỉ rút gọn tử hoặc mẫu, rút gọn chưa hết, cộng/trừ nhầm. Không được bằng đáp án về giá trị.
  const cands: Fraction[] = [
    { n: p, d: q * k },
    { n: p * k, d: q },
    { n: p + 1, d: q },
    { n: p, d: q + 1 },
    { n: q, d: p },
  ].filter((f) => f.n > 0 && f.d > 0 && compareFractions(f, answer) !== "=");
  // Rút gọn chưa hết (k không phải số nguyên tố): vẫn bằng giá trị nhưng chưa tối giản — là lỗi hay gặp.
  const partial = k === 4 ? { n: p * 2, d: q * 2 } : null;
  const options = withDistractors(fracText(answer), [...cands.map(fracText), ...(partial ? [fracText(partial)] : [])]);
  return { kind: "rut-gon", from, answer: fracText(answer), options, reveal: `${fracWords(from)} rút gọn được ${fracWords(answer)}` };
}

/* ═════════════ Đổi đơn vị đo ═════════════ */

export type UnitLevel = "khoi-luong" | "thoi-gian" | "dien-tich";

type Unit = { sym: string; words: string };
const U = {
  kg: { sym: "kg", words: "ki-lô-gam" },
  yen: { sym: "yến", words: "yến" },
  ta: { sym: "tạ", words: "tạ" },
  tan: { sym: "tấn", words: "tấn" },
  giay: { sym: "giây", words: "giây" },
  phut: { sym: "phút", words: "phút" },
  gio: { sym: "giờ", words: "giờ" },
  nam: { sym: "năm", words: "năm" },
  theKi: { sym: "thế kỉ", words: "thế kỉ" },
  mm2: { sym: "mm²", words: "mi-li-mét vuông" },
  cm2: { sym: "cm²", words: "xăng-ti-mét vuông" },
  dm2: { sym: "dm²", words: "đề-xi-mét vuông" },
  m2: { sym: "m²", words: "mét vuông" },
} satisfies Record<string, Unit>;

/** Một cặp đơn vị: 1 `big` = `factor` `small`. */
type Conversion = { big: Unit; small: Unit; factor: number };

const CONVERSIONS: Record<UnitLevel, Conversion[]> = {
  "khoi-luong": [
    { big: U.yen, small: U.kg, factor: 10 },
    { big: U.ta, small: U.kg, factor: 100 },
    { big: U.tan, small: U.kg, factor: 1000 },
    { big: U.tan, small: U.ta, factor: 10 },
    { big: U.ta, small: U.yen, factor: 10 },
  ],
  "thoi-gian": [
    { big: U.phut, small: U.giay, factor: 60 },
    { big: U.gio, small: U.phut, factor: 60 },
    { big: U.theKi, small: U.nam, factor: 100 },
  ],
  "dien-tich": [
    { big: U.m2, small: U.dm2, factor: 100 },
    { big: U.dm2, small: U.cm2, factor: 100 },
    { big: U.cm2, small: U.mm2, factor: 100 },
  ],
};

export type UnitQuestion = {
  /** Vế trái, vd "2 tạ 5 kg" hoặc "300 kg". */
  left: string;
  /** Đơn vị cần điền ở vế phải. */
  unit: string;
  answer: number;
  options: number[];
  reveal: string;
};

export function makeUnitQuestion(level: UnitLevel): UnitQuestion {
  const c = pick(CONVERSIONS[level]);
  const f = c.factor;
  const form = pick(["lon-ra-nho", "hai-don-vi", "nho-ra-lon"] as const);
  let left: string, leftWords: string, unit: Unit, answer: number, cands: number[];

  if (form === "lon-ra-nho") {
    const a = randInt(2, 9);
    answer = a * f;
    left = `${a} ${c.big.sym}`;
    leftWords = `${a} ${c.big.words}`;
    unit = c.small;
    // Nhiễu: nhân nhầm hệ số (10 / 100 / 1000), quên nhân.
    cands = [a * 10, a * 100, a * 1000, a * 60, a];
  } else if (form === "hai-don-vi") {
    const a = randInt(1, 9);
    const b = randInt(1, f - 1);
    answer = a * f + b;
    left = `${a} ${c.big.sym} ${b} ${c.small.sym}`;
    leftWords = `${a} ${c.big.words} ${b} ${c.small.words}`;
    unit = c.small;
    // Nhiễu: ghép chữ số ("2 tạ 5 kg" → 25, 250, 2005), cộng thẳng hai số.
    cands = [Number(`${a}${b}`), Number(`${a}${b}0`), Number(`${a}0${b}`), Number(`${a}00${b}`), a + b, a * f - b, a * f + b * 10];
  } else {
    const a = randInt(2, 9);
    answer = a;
    left = `${fmtInt(a * f)} ${c.small.sym}`;
    leftWords = `${a * f} ${c.small.words}`;
    unit = c.big;
    cands = [a * 10, a * f, a + 1, a - 1, Math.round((a * f) / 10)];
  }
  const options = withDistractors(answer, cands.filter((n) => Number.isInteger(n) && n > 0)).sort((x, y) => x - y);
  // Phòng khi nhiễu trùng nhau: thêm số liền kề cho đủ 4.
  for (let d = 1; options.length < 4; d++) if (!options.includes(answer + d)) options.push(answer + d);
  options.sort((x, y) => x - y);
  return { left, unit: unit.sym, answer, options, reveal: `${leftWords} bằng ${answer} ${unit.words}` };
}

/* ═════════════ Danh từ, động từ, tính từ ═════════════ */

export type WordClass = "danh-tu" | "dong-tu" | "tinh-tu";

export const CLASS_LABEL: Record<WordClass, string> = {
  "danh-tu": "Danh từ",
  "dong-tu": "Động từ",
  "tinh-tu": "Tính từ",
};

// Chỉ chọn từ một nghĩa, một từ loại rõ ràng khi đứng riêng (bỏ "bàn", "sáng",
// "suy nghĩ"… vì có thể là từ loại khác). Không trùng từ giữa các nhóm.
export const WORD_CLASSES: Record<WordClass, string[]> = {
  "danh-tu": [
    "học sinh", "cô giáo", "quyển vở", "cây bút", "con mèo", "dòng sông", "ngọn núi", "bầu trời",
    "mặt trời", "bông hoa", "chiếc lá", "ngôi nhà", "cánh đồng", "con đường", "trường học", "bác sĩ",
    "xe đạp", "cơn mưa", "ông nội", "thành phố",
  ],
  "dong-tu": [
    "chạy", "nhảy", "đọc", "viết", "hát", "bơi", "ăn", "uống", "ngủ", "leo", "ném", "nấu", "quét",
    "tưới", "vẽ", "lắng nghe", "trò chuyện", "thức dậy", "chăm sóc", "học bài",
  ],
  "tinh-tu": [
    "xanh", "đỏ", "cao", "thấp", "nhanh nhẹn", "chăm chỉ", "hiền lành", "dũng cảm", "thông minh",
    "rộng", "hẹp", "nóng", "lạnh", "ngọt", "thơm", "sạch sẽ", "tròn", "vui vẻ", "mềm mại", "xinh xắn",
  ],
};

export type WordClassQuestion = { word: string; answer: WordClass };

export function makeWordClassQuestion(avoid?: string): WordClassQuestion {
  let q: WordClassQuestion;
  do {
    const answer = pick(Object.keys(WORD_CLASSES) as WordClass[]);
    q = { word: pick(WORD_CLASSES[answer]), answer };
  } while (q.word === avoid);
  return q;
}
