// Trò chơi lớp 3: sinh câu hỏi cho đua xe bảng nhân, bắn bóng bay, chỉnh đồng hồ
// và lật thẻ từ. Hàm thuần (chỉ dùng Math.random qua `rand`), chạy sau cú bấm
// "Bắt đầu" — sinh lúc render sẽ lệch hydration. Kiểm tra: scripts/games3-check.ts.

import { pick, shuffle } from "./games";

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

/* ═════════════ Bảng nhân, bảng chia (đua xe) ═════════════ */

export const TABLES = [2, 3, 4, 5, 6, 7, 8, 9] as const;

export type TimesQuestion = {
  /** Câu hiển thị, vd "7 × 8" hoặc "56 : 7". */
  text: string;
  answer: number;
  /** 4 lựa chọn, đã xáo. */
  options: number[];
};

/**
 * Một câu nhân hoặc chia trong các bảng đã chọn. Nhiễu là lỗi bé hay mắc thật:
 * lệch một hàng của bảng (±a), lệch 1, và lấy nhầm bảng bên cạnh.
 */
export function makeTimesQuestion(tables: readonly number[], avoid?: string): TimesQuestion {
  for (let t = 0; t < 20; t++) {
    const a = pick(tables);
    const b = randInt(2, 10);
    const p = a * b;
    const divide = Math.random() < 0.35;
    const text = divide ? `${p} : ${a}` : Math.random() < 0.5 ? `${a} × ${b}` : `${b} × ${a}`;
    if (text === avoid) continue;
    const answer = divide ? b : p;
    const cands = divide
      ? [b - 1, b + 1, b + 2, b - 2, a]
      : [p - a, p + a, p - 1, p + 1, (a + 1) * b, (a - 1) * b, a * (b + 1)];
    const wrong = shuffle([...new Set(cands.filter((x) => x > 0 && x !== answer))]).slice(0, 3);
    return { text, answer, options: shuffle([answer, ...wrong]) };
  }
  return makeTimesQuestion(tables);
}

/* ═════════════ Bắn bóng bay ═════════════ */

export type BalloonMode = { kind: "bang"; table: number } | { kind: "bang-nhau"; target: number };

export type Balloon = { id: number; label: string; good: boolean };

/** Kết quả có ít nhất 2 cách viết thành tích trong bảng 2–9 → câu "bằng nhau" có nhiều bóng đúng. */
export const EQUAL_TARGETS = [12, 16, 18, 24, 36] as const;

export function balloonRule(mode: BalloonMode): string {
  return mode.kind === "bang"
    ? `Chạm bóng có kết quả của bảng nhân ${mode.table}`
    : `Chạm bóng có phép tính bằng ${mode.target}`;
}

let nextBalloonId = 1;

/**
 * Một quả bóng mới. Khoảng 45% là bóng đúng để bé phải đọc từng quả chứ không
 * chạm bừa. Bóng sai là số "gần giống": lệch 1 so với bội số, hoặc bội số của
 * bảng khác.
 */
export function makeBalloon(mode: BalloonMode): Balloon {
  const id = nextBalloonId++;
  const good = Math.random() < 0.45;
  if (mode.kind === "bang") {
    const k = mode.table;
    if (good) return { id, label: String(k * randInt(1, 10)), good: true };
    for (;;) {
      const n = Math.random() < 0.5 ? k * randInt(1, 10) + pick([-1, 1, 2, -2]) : pick(TABLES) * randInt(2, 10);
      if (n > 0 && !(n % k === 0 && n / k <= 10)) return { id, label: String(n), good: false };
    }
  }
  const pairs: [number, number][] = [];
  for (const a of TABLES) for (let b = 2; b <= 10; b++) if (a * b === mode.target) pairs.push([a, b]);
  if (good) {
    const [a, b] = pick(pairs);
    return { id, label: Math.random() < 0.5 ? `${a} × ${b}` : `${b} × ${a}`, good: true };
  }
  for (;;) {
    const a = pick(TABLES), b = randInt(2, 10);
    if (a * b !== mode.target && Math.abs(a * b - mode.target) <= 12) return { id, label: `${a} × ${b}`, good: false };
  }
}

/** Giá trị một nhãn bóng ("7 × 8" → 56, "42" → 42) — dùng cho script kiểm tra. */
export function balloonValue(label: string): number {
  const m = label.match(/^(\d+) × (\d+)$/);
  return m ? +m[1] * +m[2] : +label;
}

/* ═════════════ Chỉnh đồng hồ ═════════════ */

export type ClockSetLevel = "5-phut" | "tung-phut" | "gio-kem" | "sau-bao-lau";

export type ClockMission = {
  emoji: string;
  /** Câu nhiệm vụ đầy đủ, vd "Trống vào học lúc 7 giờ 15 phút." */
  text: string;
  /** Giờ cần chỉnh, 1–12. */
  hour: number;
  minute: number;
};

/** Cách đọc giờ lớp 3: "7 giờ 5 phút", "7 giờ", hoặc giờ kém "8 giờ kém 10 phút". */
export function readTime(hour: number, minute: number, kem = false): string {
  if (minute === 0) return `${hour} giờ`;
  if (kem) return `${(hour % 12) + 1} giờ kém ${60 - minute} phút`;
  return `${hour} giờ ${minute} phút`;
}

const SCENES: { emoji: string; text: string; hours: number[] }[] = [
  { emoji: "⏰", text: "Bé thức dậy lúc", hours: [5, 6] },
  { emoji: "🏫", text: "Trống vào học lúc", hours: [7, 1] },
  { emoji: "🍚", text: "Cả nhà ăn cơm tối lúc", hours: [6, 7] },
  { emoji: "📺", text: "Phim hoạt hình bắt đầu lúc", hours: [4, 5, 7, 8] },
  { emoji: "🚂", text: "Tàu hoả rời ga lúc", hours: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { emoji: "⚽", text: "Trận bóng đá bắt đầu lúc", hours: [3, 4, 8] },
  { emoji: "🛏️", text: "Bé đi ngủ lúc", hours: [8, 9] },
  { emoji: "🧁", text: "Mẹ nướng xong bánh lúc", hours: [2, 3, 4, 10] },
  { emoji: "🚌", text: "Xe buýt đến bến lúc", hours: [6, 7, 9, 10, 11] },
  { emoji: "🏊", text: "Lớp học bơi bắt đầu lúc", hours: [8, 9, 3, 4] },
];

const DURATIONS = [10, 15, 20, 25, 30, 35, 40, 45, 50] as const;

export function makeClockMission(level: ClockSetLevel): ClockMission {
  const scene = pick(SCENES);
  const hour = pick(scene.hours);
  if (level === "sau-bao-lau") {
    const startMin = randInt(0, 11) * 5;
    const d = pick(DURATIONS);
    const total = hour * 60 + startMin + d;
    const h = ((Math.floor(total / 60) - 1) % 12) + 1;
    const m = total % 60;
    return {
      emoji: "⏳",
      text: `Bây giờ là ${readTime(hour, startMin)}. Sau ${d} phút nữa là mấy giờ?`,
      hour: h, minute: m,
    };
  }
  const minute =
    level === "5-phut" ? randInt(1, 11) * 5
      : level === "gio-kem" ? randInt(7, 11) * 5
        : (() => { let m = randInt(1, 59); while (m % 5 === 0) m = randInt(1, 59); return m; })();
  return { emoji: scene.emoji, text: `${scene.text} ${readTime(hour, minute, level === "gio-kem")}.`, hour, minute };
}

/* ═════════════ Lật thẻ từ ═════════════ */

export type WordPairKind = "trai-nghia" | "cung-nghia";

/**
 * Kho cặp từ, soạn tay. Trong mỗi loại, một từ chỉ xuất hiện ở đúng một cặp —
 * nếu không, một thẻ có thể ghép đúng với hai thẻ và bé bị chấm sai oan
 * (scripts/games3-check.ts kiểm tra điều này).
 */
export const WORD_PAIRS: Record<WordPairKind, [string, string][]> = {
  "trai-nghia": [
    ["cao", "thấp"], ["dài", "ngắn"], ["nóng", "lạnh"], ["nhanh", "chậm"], ["vui", "buồn"],
    ["sáng", "tối"], ["khoẻ", "yếu"], ["cũ", "mới"], ["rộng", "hẹp"], ["xa", "gần"],
    ["sạch", "bẩn"], ["trắng", "đen"], ["mở", "đóng"], ["lên", "xuống"], ["trước", "sau"],
    ["đúng", "sai"], ["thắng", "thua"], ["nặng", "nhẹ"], ["khó", "dễ"], ["ít", "nhiều"],
    ["sớm", "muộn"], ["dày", "mỏng"], ["già", "trẻ"], ["ướt", "khô"], ["to", "nhỏ"],
    ["chăm chỉ", "lười biếng"], ["đầy", "vơi"], ["ngọt", "đắng"],
  ],
  "cung-nghia": [
    ["to", "lớn"], ["nhỏ", "bé"], ["chăm chỉ", "siêng năng"], ["nhanh", "mau"], ["xinh", "đẹp"],
    ["lợn", "heo"], ["ngô", "bắp"], ["quả", "trái"], ["xe lửa", "tàu hoả"], ["dũng cảm", "gan dạ"],
    ["bao la", "mênh mông"], ["thông minh", "sáng dạ"], ["chăm sóc", "săn sóc"], ["bố", "ba"],
    ["mẹ", "má"], ["vui vẻ", "vui tươi"], ["cẩn thận", "cẩn trọng"],
  ],
};

export const PAIR_LABEL: Record<WordPairKind, string> = {
  "trai-nghia": "trái nghĩa",
  "cung-nghia": "cùng nghĩa",
};

export type MemoryCard = { id: number; word: string; pair: number };

/** `pairs` cặp ngẫu nhiên → 2 × pairs thẻ đã xáo. Thẻ cùng `pair` là một cặp. */
export function makeMemoryDeck(kind: WordPairKind, pairs: number): MemoryCard[] {
  const chosen = shuffle(WORD_PAIRS[kind]).slice(0, pairs);
  const cards = chosen.flatMap(([a, b], i) => [{ word: a, pair: i }, { word: b, pair: i }]);
  return shuffle(cards).map((c, id) => ({ ...c, id }));
}
