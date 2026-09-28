// Trò chơi lớp 2 — sinh câu hỏi ngẫu nhiên trên trình duyệt, bám chương trình
// lớp 2 (SGK mới): xem đồng hồ, cộng trừ có nhớ trong phạm vi 100, bảng nhân
// chia 2 và 5, chính tả, từ chỉ sự vật / hoạt động / đặc điểm.
//
// Như lib/games.ts: chỉ sinh sau cú bấm "Bắt đầu", không sinh lúc render.

import { pick, shuffle } from "./games";

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Đáp án + 3 số nhiễu gần nó, trong [min, max], xếp tăng dần. */
function nearOptions(answer: number, deltas: number[], min: number, max: number): number[] {
  const set = new Set([answer]);
  for (const d of shuffle(deltas)) {
    if (set.size === 4) break;
    const n = answer + d;
    if (n >= min && n <= max) set.add(n);
  }
  // Phòng khi đáp án sát biên, không đủ 3 số nhiễu từ danh sách.
  for (let d = 1; set.size < 4; d++) {
    if (answer + d <= max) set.add(answer + d);
    if (set.size < 4 && answer - d >= min) set.add(answer - d);
  }
  return [...set].sort((x, y) => x - y);
}

// ── Xem đồng hồ ──────────────────────────────────────────────────────────────

export type ClockLevel = "gio-dung" | "gio-ruoi" | "15-phut";

export type ClockQuestion = { hour: number; minute: number; answer: string; options: string[] };

/** "7 giờ", "7 giờ 30 phút"… — cách đọc giờ ở lớp 2. */
export function timeText(hour: number, minute: number): string {
  return minute === 0 ? `${hour} giờ` : `${hour} giờ ${minute} phút`;
}

export function makeClockQuestion(level: ClockLevel): ClockQuestion {
  const minutes = level === "gio-dung" ? [0] : level === "gio-ruoi" ? [0, 30] : [0, 15, 30, 45];
  const hour = randInt(1, 12);
  const minute = pick(minutes);
  const answer = timeText(hour, minute);

  // Nhiễu theo lỗi bé hay mắc: nhầm kim giờ với kim phút, lệch một giờ, đọc
  // sai số phút.
  const wrap = (h: number) => ((h - 1 + 12) % 12) + 1;
  const pool = new Set<string>();
  if (minute !== 0) pool.add(timeText(wrap(minute / 5), hour * 5 === 60 ? 0 : (hour * 5) % 60));
  pool.add(timeText(wrap(hour + 1), minute));
  pool.add(timeText(wrap(hour - 1), minute));
  for (const m of [0, 15, 30, 45]) if (m !== minute) pool.add(timeText(hour, m));
  pool.delete(answer);
  const wrong = shuffle([...pool]).slice(0, 3);
  return { hour, minute, answer, options: shuffle([answer, ...wrong]) };
}

// ── Tính nhẩm lớp 2 ──────────────────────────────────────────────────────────

export type CalcLevel = "cong100" | "tru100" | "nhan25" | "chia25";

export type CalcQuestion = { a: number; b: number; op: "+" | "−" | "×" | ":"; answer: number; options: number[] };

export function makeCalcQuestion(level: CalcLevel): CalcQuestion {
  if (level === "cong100") {
    // Có nhớ: hàng đơn vị cộng lại từ 10 trở lên, tổng không quá 100.
    let a: number, b: number;
    do {
      a = randInt(11, 89);
      b = randInt(2, 89);
    } while ((a % 10) + (b % 10) < 10 || a + b > 100);
    // Nhiễu ±10 là lỗi quên nhớ, ±1/±2 là tính nhầm.
    return { a, b, op: "+", answer: a + b, options: nearOptions(a + b, [-10, 10, -1, 1, 2, -2], 0, 100) };
  }
  if (level === "tru100") {
    // Có nhớ: đơn vị của số bị trừ nhỏ hơn đơn vị của số trừ.
    let a: number, b: number;
    do {
      a = randInt(21, 100);
      b = randInt(2, a - 1);
    } while (a % 10 >= b % 10 || a - b < 1);
    return { a, b, op: "−", answer: a - b, options: nearOptions(a - b, [-10, 10, -1, 1, 2, -2], 0, 100) };
  }
  const t = pick([2, 5]);
  const k = randInt(1, 10);
  if (level === "nhan25") {
    // Nhiễu: tích liền kề trong cùng bảng (lệch một lần t).
    return { a: t, b: k, op: "×", answer: t * k, options: nearOptions(t * k, [-t, t, -1, 1, 2 * t], 0, 100) };
  }
  return { a: t * k, b: t, op: ":", answer: k, options: nearOptions(k, [-1, 1, 2, -2], 0, 20) };
}

export function calcWord(op: CalcQuestion["op"]): string {
  return op === "+" ? "cộng" : op === "−" ? "trừ" : op === "×" ? "nhân" : "chia";
}

// ── Điền chữ chính tả ────────────────────────────────────────────────────────
//
// Mỗi từ ghi rõ phần bị che (`part`) và vị trí; các lựa chọn là cả nhóm dễ lẫn.
// Chỉ lấy từ quen thuộc, có hình emoji không thể hiểu nhầm.

export type SpellGroup = "ch-tr" | "s-x" | "g-gh" | "c-k" | "l-n";

export const SPELL_GROUPS: Record<SpellGroup, string[]> = {
  "ch-tr": ["ch", "tr"],
  "s-x": ["s", "x"],
  "g-gh": ["g", "gh", "ng", "ngh"],
  "c-k": ["c", "k"],
  "l-n": ["l", "n"],
};

type SpellWord = { text: string; part: string; at: number; emoji: string; group: SpellGroup };

const SPELL_WORDS: SpellWord[] = [
  { text: "trường học", part: "tr", at: 0, emoji: "🏫", group: "ch-tr" },
  { text: "con trâu", part: "tr", at: 4, emoji: "🐃", group: "ch-tr" },
  { text: "cây tre", part: "tr", at: 4, emoji: "🎋", group: "ch-tr" },
  { text: "quả trứng", part: "tr", at: 4, emoji: "🥚", group: "ch-tr" },
  { text: "quả chuối", part: "ch", at: 4, emoji: "🍌", group: "ch-tr" },
  { text: "chim sẻ", part: "ch", at: 0, emoji: "🐦", group: "ch-tr" },
  { text: "cái chổi", part: "ch", at: 4, emoji: "🧹", group: "ch-tr" },
  { text: "con chó", part: "ch", at: 4, emoji: "🐶", group: "ch-tr" },
  { text: "xe đạp", part: "x", at: 0, emoji: "🚲", group: "s-x" },
  { text: "quả xoài", part: "x", at: 4, emoji: "🥭", group: "s-x" },
  { text: "khúc xương", part: "x", at: 5, emoji: "🦴", group: "s-x" },
  { text: "sách vở", part: "s", at: 0, emoji: "📚", group: "s-x" },
  { text: "sư tử", part: "s", at: 0, emoji: "🦁", group: "s-x" },
  { text: "con sâu", part: "s", at: 4, emoji: "🐛", group: "s-x" },
  { text: "hộp sữa", part: "s", at: 4, emoji: "🥛", group: "s-x" },
  { text: "cái ghế", part: "gh", at: 4, emoji: "🪑", group: "g-gh" },
  { text: "con gà", part: "g", at: 4, emoji: "🐔", group: "g-gh" },
  { text: "gấu bông", part: "g", at: 0, emoji: "🧸", group: "g-gh" },
  { text: "đàn ghi-ta", part: "gh", at: 4, emoji: "🎸", group: "g-gh" },
  { text: "nghe nhạc", part: "ngh", at: 0, emoji: "🎧", group: "g-gh" },
  { text: "suy nghĩ", part: "ngh", at: 4, emoji: "🤔", group: "g-gh" },
  { text: "con ngựa", part: "ng", at: 4, emoji: "🐴", group: "g-gh" },
  { text: "ngôi nhà", part: "ng", at: 0, emoji: "🏠", group: "g-gh" },
  { text: "cái kéo", part: "k", at: 4, emoji: "✂️", group: "c-k" },
  { text: "con kiến", part: "k", at: 4, emoji: "🐜", group: "c-k" },
  { text: "que kem", part: "k", at: 4, emoji: "🍦", group: "c-k" },
  { text: "cái kính", part: "k", at: 4, emoji: "👓", group: "c-k" },
  { text: "con cá", part: "c", at: 4, emoji: "🐟", group: "c-k" },
  { text: "quả cam", part: "c", at: 4, emoji: "🍊", group: "c-k" },
  { text: "con cua", part: "c", at: 4, emoji: "🦀", group: "c-k" },
  { text: "ngọn lửa", part: "l", at: 5, emoji: "🔥", group: "l-n" },
  { text: "lá cây", part: "l", at: 0, emoji: "🍃", group: "l-n" },
  { text: "lá cờ", part: "l", at: 0, emoji: "🚩", group: "l-n" },
  { text: "giọt nước", part: "n", at: 5, emoji: "💧", group: "l-n" },
  { text: "nồi cơm", part: "n", at: 0, emoji: "🍲", group: "l-n" },
  { text: "núi cao", part: "n", at: 0, emoji: "⛰️", group: "l-n" },
];

export type SpellQuestion = { before: string; after: string; word: string; emoji: string; answer: string; options: string[] };

export function makeSpellQuestion(level: SpellGroup | "tat-ca", avoid?: string): SpellQuestion {
  const pool = SPELL_WORDS.filter((w) => (level === "tat-ca" || w.group === level) && w.text !== avoid);
  const w = pick(pool);
  let options = SPELL_GROUPS[w.group];
  // Nhóm g/gh/ng/ngh: chỉ đưa cặp cùng họ với đáp án (g–gh hoặc ng–ngh).
  if (w.group === "g-gh") options = w.part.startsWith("ng") ? ["ng", "ngh"] : ["g", "gh"];
  return {
    before: w.text.slice(0, w.at),
    after: w.text.slice(w.at + w.part.length),
    word: w.text,
    emoji: w.emoji,
    answer: w.part,
    options,
  };
}

// ── Từ chỉ sự vật / hoạt động / đặc điểm ─────────────────────────────────────

export type WordKind = "su-vat" | "hoat-dong" | "dac-diem";

export const KIND_LABEL: Record<WordKind, string> = {
  "su-vat": "Từ chỉ sự vật",
  "hoat-dong": "Từ chỉ hoạt động",
  "dac-diem": "Từ chỉ đặc điểm",
};

const KIND_WORDS: Record<WordKind, string[]> = {
  "su-vat": ["cái bàn", "học sinh", "con mèo", "cây bàng", "quyển vở", "cô giáo", "bông hoa", "xe buýt", "ông mặt trời", "con đường"],
  "hoat-dong": ["chạy", "đọc sách", "nhảy dây", "ăn cơm", "viết bài", "hát", "quét nhà", "bơi", "tưới cây", "đá bóng"],
  "dac-diem": ["cao", "xinh đẹp", "đỏ tươi", "chăm chỉ", "ngọt", "nhanh nhẹn", "tròn", "thơm", "hiền lành", "sạch sẽ"],
};

export type KindQuestion = { word: string; answer: WordKind };

export function makeKindQuestion(avoid?: string): KindQuestion {
  const answer = pick(Object.keys(KIND_WORDS) as WordKind[]);
  const word = pick(KIND_WORDS[answer].filter((w) => w !== avoid));
  return { word, answer };
}
