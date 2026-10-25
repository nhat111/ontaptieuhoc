// Trò chơi lớp 1: sinh câu hỏi ngẫu nhiên + đếm sao tích luỹ.
//
// Câu hỏi sinh ngay trên trình duyệt (không cần DB, không cần soạn tay) và chỉ
// sinh sau cú bấm "Bắt đầu" — sinh lúc render sẽ lệch hydration vì Math.random.

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Đếm hình ─────────────────────────────────────────────────────────────────

export type CountLevel = "dem" | "cong5" | "cong10" | "tru10";

/** Hình + cách gọi tên để đọc thành tiếng ("Có mấy quả táo?"). */
const THINGS = [
  { emoji: "🍎", name: "quả táo" },
  { emoji: "🐟", name: "con cá" },
  { emoji: "🐥", name: "con gà con" },
  { emoji: "🌸", name: "bông hoa" },
  { emoji: "🍌", name: "quả chuối" },
  { emoji: "🚗", name: "chiếc xe" },
  { emoji: "🎈", name: "quả bóng bay" },
  { emoji: "🐶", name: "con chó" },
] as const;

export type CountQuestion = {
  emoji: string;
  /** Nhóm trái (hoặc tổng số hình với phép trừ / đếm). */
  a: number;
  /** Nhóm phải (cộng) hoặc số hình bị gạch (trừ). 0 với cấp "đếm". */
  b: number;
  op: "dem" | "+" | "-";
  answer: number;
  /** Các lựa chọn, đã xếp tăng dần — bé lớp 1 dò số theo thứ tự dễ hơn. */
  options: number[];
  say: string;
};

// Lời đọc của các trò Toán lớp 1. Viết một chỗ để mathClipTexts() liệt kê đúng từng câu
// mà scripts/gen-game-audio.py cần đọc sẵn.
const countSay = (name: string) => `Có mấy ${name}?`;
const calcSay = (a: number, word: "cộng" | "trừ", b: number) => `${a} ${word} ${b} bằng mấy?`;
export const appleSay = (a: number, word: string, b: number) => `Hái quả táo có kết quả ${a} ${word} ${b}`;
export const compareSay = (a: number, b: number) => `So sánh ${a} và ${b}`;

/** Đáp án đúng + 3 số gần nó, nằm trong 0–10. */
function numberOptions(answer: number, min: number): number[] {
  const set = new Set([answer]);
  while (set.size < 4) {
    const n = answer + pick([-3, -2, -1, 1, 2, 3]);
    if (n >= min && n <= 10) set.add(n);
  }
  return [...set].sort((x, y) => x - y);
}

export function makeCountQuestion(level: CountLevel): CountQuestion {
  const thing = pick(THINGS);
  if (level === "dem") {
    const a = randInt(1, 10);
    return {
      emoji: thing.emoji, a, b: 0, op: "dem", answer: a,
      options: numberOptions(a, 1),
      say: countSay(thing.name),
    };
  }
  if (level === "tru10") {
    const a = randInt(2, 10);
    const b = randInt(1, a - 1);
    return {
      emoji: thing.emoji, a, b, op: "-", answer: a - b,
      options: numberOptions(a - b, 0),
      say: calcSay(a, "trừ", b),
    };
  }
  const max = level === "cong5" ? 5 : 10;
  const a = randInt(1, max - 1);
  const b = randInt(1, max - a);
  return {
    emoji: thing.emoji, a, b, op: "+", answer: a + b,
    options: numberOptions(a + b, 1),
    say: calcSay(a, "cộng", b),
  };
}

// ── Nghe và chọn chữ ─────────────────────────────────────────────────────────
//
// Đọc theo âm (“bờ”, “cờ”) như cách dạy lớp 1, không đọc tên chữ (“bê”, “xê”)
// — giọng máy đọc chữ đơn "b" sẽ ra tên chữ, nên phải đưa nó chữ "bờ".

export type LetterLevel = "nguyen-am" | "phu-am" | "tat-ca";

const VOWELS: Record<string, string> = {
  a: "a", ă: "á", â: "ớ", e: "e", ê: "ê", i: "i",
  o: "o", ô: "ô", ơ: "ơ", u: "u", ư: "ư",
};

// Bỏ k, q, y: đọc ra trùng âm với c / i nên bé không thể phân biệt bằng tai.
const CONSONANTS: Record<string, string> = {
  b: "bờ", c: "cờ", d: "dờ", đ: "đờ", g: "gờ", h: "hờ", l: "lờ", m: "mờ",
  n: "nờ", p: "pờ", r: "rờ", s: "sờ", t: "tờ", v: "vờ", x: "xờ",
};

// Cặp nghe gần như giống nhau (giọng máy miền Bắc) — không cho đứng chung một câu.
// ă đọc "á", â đọc "ớ" (tên theo SGK lớp 1) nên chỉ khác a / ơ đúng một dấu thanh.
const CONFUSABLE = [["s", "x"], ["d", "r"], ["a", "ă"], ["â", "ơ"]];

function clash(a: string, b: string): boolean {
  return CONFUSABLE.some((g) => g.includes(a) && g.includes(b));
}

export type LetterQuestion = {
  answer: string;
  options: string[];
  /** Âm để đọc, vd "bờ". */
  sound: string;
};

export function makeLetterQuestion(level: LetterLevel, avoid?: string): LetterQuestion {
  const pool: Record<string, string> =
    level === "nguyen-am" ? VOWELS : level === "phu-am" ? CONSONANTS : { ...VOWELS, ...CONSONANTS };
  const letters = Object.keys(pool);
  // Không ra lại đúng chữ vừa hỏi, đỡ nhàm.
  const answer = pick(letters.filter((l) => l !== avoid));

  const options = [answer];
  for (const l of shuffle(letters)) {
    if (options.length === 4) break;
    if (options.some((o) => o === l || clash(o, l))) continue;
    options.push(l);
  }
  return { answer, options: shuffle(options), sound: pool[answer] };
}

/** Số có dấu cách ngăn nghìn, như SGK tiểu học viết: 3 000, 12 500. */
export function fmtInt(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// ── So sánh số (> < =) ───────────────────────────────────────────────────────

export type CompareLevel = "pham-vi-10" | "pham-vi-100";
export type CompareQuestion = { a: number; b: number; answer: ">" | "<" | "="; emoji: string; reveal: string };

const COMPARE_WORDS = { ">": "lớn hơn", "<": "bé hơn", "=": "bằng" } as const;

export function makeCompareQuestion(level: CompareLevel): CompareQuestion {
  const max = level === "pham-vi-10" ? 10 : 100;
  const a = randInt(level === "pham-vi-10" ? 0 : 10, max);
  // Khoảng 1/5 số câu là "bằng nhau", phần còn lại hai số khác nhau;
  // phạm vi 100 hay hỏi cặp cùng chục (45 và 48) hoặc đảo chữ số (36 và 63).
  let b: number;
  const r = Math.random();
  if (r < 0.2) b = a;
  else if (level === "pham-vi-100" && r < 0.45 && a % 10 !== Math.floor(a / 10) && a % 10 !== 0) b = (a % 10) * 10 + Math.floor(a / 10);
  else if (level === "pham-vi-100" && r < 0.7) b = Math.floor(a / 10) * 10 + randInt(0, 9);
  else b = randInt(level === "pham-vi-10" ? 0 : 10, max);
  b = Math.min(b, max); // a = 100 ở nhánh "cùng chục" cho ra 101–109
  const answer = a > b ? ">" : a < b ? "<" : "=";
  return { a, b, answer, emoji: pick(THINGS).emoji, reveal: compareReveal(a, b) };
}

function compareReveal(a: number, b: number): string {
  const sign = a > b ? ">" : a < b ? "<" : "=";
  return `${a} ${COMPARE_WORDS[sign]} ${b}`;
}

/**
 * Mọi câu các trò Toán lớp 1 có thể đọc: Đếm hình (4 cấp), Hái táo lớp 1, So sánh phạm vi 10.
 * Phạm vi khớp makeCountQuestion / makeCompareQuestion; scripts/games-extra-check.ts rút
 * thử các generator và báo câu nào lọt ra ngoài danh sách. Phạm vi 100 (hơn 8 000 cặp số)
 * không đọc sẵn, vẫn dùng giọng máy.
 */
export function mathClipTexts(): string[] {
  const out: string[] = THINGS.map((t) => countSay(t.name));
  for (let a = 1; a <= 9; a++) for (let b = 1; a + b <= 10; b++) out.push(calcSay(a, "cộng", b), appleSay(a, "cộng", b));
  for (let a = 2; a <= 10; a++) for (let b = 1; b < a; b++) out.push(calcSay(a, "trừ", b), appleSay(a, "trừ", b));
  for (let a = 0; a <= 10; a++) for (let b = 0; b <= 10; b++) out.push(compareSay(a, b), compareReveal(a, b));
  return [...new Set(out)];
}

// ── Sao tích luỹ ─────────────────────────────────────────────────────────────
//
// Chỉ là phần thưởng hiển thị cho bé trên máy này; mất cũng không sao, nên để
// localStorage. Đọc qua useSyncExternalStore giống lib/speech.ts.

const STARS_KEY = "ontap_game_stars";
const starListeners = new Set<() => void>();

export function getTotalStars(): number {
  if (typeof window === "undefined") return 0;
  try {
    const n = Number(window.localStorage.getItem(STARS_KEY));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

export function addStars(n: number) {
  if (n <= 0) return;
  try {
    window.localStorage.setItem(STARS_KEY, String(getTotalStars() + n));
  } catch {/* ignore */}
  starListeners.forEach((l) => l());
}

export function subscribeStars(cb: () => void) {
  starListeners.add(cb);
  return () => {
    starListeners.delete(cb);
  };
}
