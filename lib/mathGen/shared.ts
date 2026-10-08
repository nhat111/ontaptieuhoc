// lib/mathGen/shared.ts
// Dữ liệu & generator dùng chung giữa các lớp (tên người, đồ vật, đồng hồ, sắp xếp...)

import {
  type Generator, type Rng, int, pick, chance, shuffle, mcOptions, fixedOptions,
  sign, fmtInt,
} from "./core";

export const NAMES = ["Lan", "Minh", "Hoa", "Nam", "An", "Mai", "Bình", "Khôi", "Linh", "Tú"];
export const GIVERS = ["Mẹ", "Bà", "Bố", "Ông", "Chị"];

/** Đồ vật đếm được: đơn vị + tên (để ghép "5 quả cam", "Có mấy quả cam"). */
export const THINGS = [
  { unit: "quả", name: "cam" }, { unit: "cái", name: "kẹo" }, { unit: "quyển", name: "vở" },
  { unit: "viên", name: "bi" }, { unit: "bông", name: "hoa" }, { unit: "chiếc", name: "bút chì" },
  { unit: "quả", name: "táo" }, { unit: "con", name: "tem" },
];

export const EMOJI = [
  { e: "🍎", n: "quả táo" }, { e: "🐟", n: "con cá" }, { e: "⭐", n: "ngôi sao" },
  { e: "🌸", n: "bông hoa" }, { e: "🚗", n: "chiếc ô tô" }, { e: "🐥", n: "con gà con" },
  { e: "🎈", n: "quả bóng bay" }, { e: "🍌", n: "quả chuối" },
];

export const DAYS = ["thứ Hai", "thứ Ba", "thứ Tư", "thứ Năm", "thứ Sáu", "thứ Bảy", "Chủ nhật"];
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ───────────── Đồng hồ SVG (data URI, không cần file ảnh) ───────────── */

export function clockSvg(h: number, m: number): string {
  const c = 60;
  const hand = (deg: number, len: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: (c + len * Math.sin(a)).toFixed(1), y: (c - len * Math.cos(a)).toFixed(1) };
  };
  const nums = Array.from({ length: 12 }, (_, i) => {
    const p = hand((i + 1) * 30, 42);
    return `<text x="${p.x}" y="${p.y}" font-size="12" font-family="sans-serif" text-anchor="middle" dominant-baseline="central" fill="#44403c">${i + 1}</text>`;
  }).join("");
  const hr = hand(((h % 12) + m / 60) * 30, 26);
  const mn = hand(m * 6, 38);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="160" height="160">` +
    `<circle cx="60" cy="60" r="56" fill="#fffbeb" stroke="#f59e0b" stroke-width="4"/>${nums}` +
    `<line x1="60" y1="60" x2="${hr.x}" y2="${hr.y}" stroke="#1c1917" stroke-width="5" stroke-linecap="round"/>` +
    `<line x1="60" y1="60" x2="${mn.x}" y2="${mn.y}" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>` +
    `<circle cx="60" cy="60" r="4" fill="#1c1917"/></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

/** Xem đồng hồ. minutes: các mốc phút được phép (lớp 1: [0], lớp 2: [0, 15, 30]...). */
export const xemDongHo = (minutes: number[]): Generator => (r) => {
  const h = int(r, 1, 12);
  const m = pick(r, minutes);
  const label = (hh: number, mm: number) => {
    const H = ((hh - 1 + 12) % 12) + 1;
    return mm === 0 ? `${H} giờ` : `${H} giờ ${mm} phút`;
  };
  const correct = label(h, m);
  const swapped = m === 0 ? 12 : m / 5; // nhầm kim: đọc số kim dài chỉ thành giờ
  const cands = [label(h + 1, m), label(h - 1, m), label(swapped, 0), label(h, m === 30 ? 0 : 30), label(h + 6, m)];
  if (m !== 0) cands.push(label(h + 1, 0));
  const { options, answer } = mcOptions(r, correct, cands);
  const minuteText = m === 0 ? "kim dài chỉ số 12 nên là giờ đúng" : `kim dài chỉ số ${m / 5} nghĩa là ${m} phút`;
  return {
    type: "multiple_choice", difficulty: m === 0 ? "easy" : "medium", tags: ["xem đồng hồ"],
    question: "Đồng hồ chỉ mấy giờ?", image: clockSvg(h, m), options, answer,
    explanation: `Kim ngắn (màu đen) chỉ giờ, kim dài (màu đỏ) chỉ phút. Kim ngắn chỉ ${m === 0 ? "đúng số" : "qua số"} ${h}, ${minuteText}. Đồng hồ chỉ ${correct}.`,
    hint: "Kim ngắn chỉ giờ, kim dài chỉ phút.",
  };
};

/** Ngày trong tuần: hôm qua / ngày mai / ngày kia. */
export const ngayTrongTuan: Generator = (r) => {
  const d = int(r, 0, 6);
  const [label, delta] = pick(r, [["ngày mai", 1], ["hôm qua", -1], ["ngày kia", 2]] as const);
  const target = DAYS[(d + delta + 7) % 7];
  const { options, answer } = mcOptions(r, cap(target), DAYS.map(cap));
  return {
    type: "multiple_choice", difficulty: delta === 2 ? "medium" : "easy", tags: ["ngày trong tuần"],
    question: `Hôm nay là ${DAYS[d]}. Hỏi ${label} là thứ mấy?`, options, answer,
    explanation: `Thứ tự các ngày: ${DAYS.join(", ")}. ${cap(label)} là ${target}.`,
    hint: "Em đọc lần lượt các ngày trong tuần nhé.",
  };
};

/** So sánh 2 số nguyên trong [min, max]. */
export const soSanhSo = (min: number, max: number): Generator => (r) => {
  const a = int(r, min, max);
  const b = chance(r, 0.15) ? a : int(r, min, max);
  const s = sign(a - b);
  const { options, answer } = fixedOptions([">", "<", "="], s);
  const why = s === "=" ? `Hai số bằng nhau nên ${a} = ${b}.`
    : `${s === ">" ? a : b} lớn hơn ${s === ">" ? b : a} nên ${fmtInt(a)} ${s} ${fmtInt(b)}.`;
  return {
    type: "multiple_choice", difficulty: max <= 10 ? "easy" : "medium", tags: ["so sánh số"],
    question: `Chọn dấu thích hợp: ${fmtInt(a)} ___ ${fmtInt(b)}`, options, answer,
    explanation: max >= 10 ? `So sánh từ hàng cao nhất (trăm, rồi chục, rồi đơn vị). ${why}` : why,
    hint: "Dấu > và < luôn mở về phía số lớn hơn.",
  };
};

/** Sắp xếp 4 số khác nhau theo thứ tự tăng / giảm. */
export const sapXepSo = (min: number, max: number): Generator => (r) => {
  const set = new Set<number>();
  while (set.size < 4) set.add(int(r, min, max));
  const nums = [...set];
  const asc = chance(r, 0.5);
  const sorted = [...nums].sort((x, y) => (asc ? x - y : y - x));
  const items = nums.map((n, i) => ({ id: `n${i}`, content: fmtInt(n) }));
  let shown = shuffle(r, items);
  while (shown.map((i) => i.content).join() === sorted.map(fmtInt).join()) shown = shuffle(r, items);
  return {
    type: "ordering", difficulty: max <= 10 ? "easy" : "medium", tags: ["sắp xếp số"],
    question: `Sắp xếp các số theo thứ tự từ ${asc ? "bé đến lớn" : "lớn đến bé"}.`,
    items: shown,
    correctOrder: sorted.map((n) => items.find((i) => i.content === fmtInt(n))!.id),
    explanation: `Thứ tự đúng: ${sorted.map(fmtInt).join(asc ? " < " : " > ")}.`,
    hint: asc ? "Tìm số bé nhất trước." : "Tìm số lớn nhất trước.",
  };
};

export type { Rng };
