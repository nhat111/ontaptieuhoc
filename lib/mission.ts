// lib/mission.ts
// Nhiệm vụ mỗi ngày (/nhiem-vu): 5 câu Toán lấy từ bài sách bé đang học, chuỗi ngày liên tục và
// album sticker mở dần theo số sao.
//
// Không lưu thêm gì: một nhiệm vụ đã làm là một mục `nv-<lớp>-<ngày>` trong tiến độ trên máy
// (lib/lessonProgress.ts, QuizClient ghi khi nộp bài), nên chuỗi ngày và sao đều TÍNH LẠI từ đó.
// Sao của album = sao trò chơi (lib/games.ts) + sao bài làm (mỗi bài một lần, theo điểm tốt nhất).
// Sticker mở theo mốc, không tiêu sao, không bốc thăm: bé không bao giờ "mất" thứ đã có.
//
// File này không import bộ sinh câu (nặng): trang /nhiem-vu chỉ nhận danh sách bài từ server.

import type { LessonProgressMap } from "./lessonProgress";

export const MISSION_SIZE = 5;
export const MISSION_GRADES = [1, 2, 3, 4, 5] as const;

/** Một bài Toán theo sách làm được trên máy (server gửi xuống cho trang /nhiem-vu). */
export interface MissionBai {
  so: number;
  label: string;
  ten: string;
  /** Khoá tiến độ của bài (sgkProgressKey). */
  key: string;
}

/* ─── Ngày theo giờ Việt Nam (UTC+7, không đổi giờ) ─── */

export const vnDate = (d: Date = new Date()): string => new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 10);

export const isDay = (s: string | null | undefined): s is string =>
  !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);

export function addDays(day: string, n: number): string {
  const t = new Date(`${day}T00:00:00Z`).getTime() + n * 86400_000;
  return new Date(t).toISOString().slice(0, 10);
}

/** "2026-10-27" → "Thứ Ba, 27/10". */
export function dayLabel(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  const thu = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"][d.getUTCDay()];
  return `${thu}, ${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

/* ─── Nhiệm vụ đã làm, chuỗi ngày ─── */

export const missionKey = (grade: number, day: string) => `nv-${grade}-${day}`;
export const missionHref = (grade: number, so: number, day: string) => `/nhiem-vu/lop-${grade}?bai=${so}&ngay=${day}`;
const MISSION_RE = /^nv-[1-9]-(\d{4}-\d{2}-\d{2})$/;

/** Những ngày đã làm nhiệm vụ (lớp nào cũng tính). */
export function missionDays(progress: LessonProgressMap): Set<string> {
  const days = new Set<string>();
  for (const [k, rec] of Object.entries(progress)) {
    const m = MISSION_RE.exec(k);
    if (m && rec.attempts > 0) days.add(m[1]);
  }
  return days;
}

/** Chuỗi hiện tại: đếm lùi từ hôm nay; hôm nay chưa làm thì chuỗi vẫn còn nếu hôm qua có làm. */
export function currentStreak(days: Set<string>, today: string): number {
  let d = days.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(d)) { n++; d = addDays(d, -1); }
  return n;
}

/** Chuỗi dài nhất từng có (để sticker theo chuỗi không bị khoá lại khi đứt chuỗi). */
export function bestStreak(days: Set<string>): number {
  let best = 0;
  for (const d of days) {
    if (days.has(addDays(d, -1))) continue; // chỉ đếm từ ngày đầu mỗi chuỗi
    let n = 0, x = d;
    while (days.has(x)) { n++; x = addDays(x, 1); }
    best = Math.max(best, n);
  }
  return best;
}

/* ─── Chọn bài cho nhiệm vụ ─── */

/** Vị trí trong năm học: 5/9 → 0, 25/5 → 1; hè (tháng 6–8) coi như cuối năm. */
export function schoolYearFraction(day: string): number {
  const [y, m] = day.split("-").map(Number);
  const startYear = m >= 9 ? y : y - 1;
  const start = Date.parse(`${startYear}-09-05T00:00:00Z`);
  const end = Date.parse(`${startYear + 1}-05-25T00:00:00Z`);
  const t = Date.parse(`${day}T00:00:00Z`);
  return Math.min(1, Math.max(0, (t - start) / (end - start)));
}

/**
 * Bài chính của nhiệm vụ: bài sách xa nhất bé đã làm trên máy (bài đang học); chưa làm bài nào
 * thì ước theo thời điểm trong năm học. Không tự nhảy sang bài kế: trên lớp có thể chưa học tới.
 */
export function pickBai(list: MissionBai[], progress: LessonProgressMap, day: string): { bai: MissionBai; from: "progress" | "date" } | null {
  if (!list.length) return null;
  const done = list.filter((b) => (progress[b.key]?.attempts ?? 0) > 0);
  if (done.length) return { bai: done.reduce((a, b) => (b.so > a.so ? b : a)), from: "progress" };
  const i = Math.min(list.length - 1, Math.floor(schoolYearFraction(day) * list.length));
  return { bai: list[i], from: "date" };
}

/* ─── Sao và sticker ─── */

/** Sao của một lần làm bài — cùng mốc với trang kết quả (ResultSummary). */
export const starsFor = (pct: number) => (pct >= 85 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0);

/** Sao từ bài làm: mỗi bài (đề, bài sách, nhiệm vụ) tính một lần theo điểm tốt nhất. */
export function lessonStars(progress: LessonProgressMap): number {
  return Object.values(progress).reduce((s, r) => s + (r.attempts > 0 ? starsFor(r.best) : 0), 0);
}

export interface Sticker {
  id: string;
  name: string;
  /** Mở khi tổng sao đạt mốc, hoặc khi từng làm nhiệm vụ liền mạch đủ số ngày. */
  need: { stars: number } | { streak: number };
}

export const STICKERS: Sticker[] = [
  { id: "star", name: "Ngôi sao", need: { stars: 1 } },
  { id: "sun", name: "Ông mặt trời", need: { stars: 3 } },
  { id: "chick", name: "Gà con", need: { stars: 6 } },
  { id: "apple", name: "Quả táo", need: { stars: 10 } },
  { id: "flower", name: "Bông hoa", need: { stars: 15 } },
  { id: "cat", name: "Mèo con", need: { stars: 20 } },
  { id: "pencil", name: "Bút chì", need: { stars: 26 } },
  { id: "frog", name: "Ếch xanh", need: { stars: 33 } },
  { id: "fish", name: "Cá vàng", need: { stars: 40 } },
  { id: "cloud", name: "Đám mây", need: { stars: 50 } },
  { id: "bunny", name: "Thỏ trắng", need: { stars: 60 } },
  { id: "turtle", name: "Rùa con", need: { stars: 72 } },
  { id: "owl", name: "Cú mèo", need: { stars: 85 } },
  { id: "panda", name: "Gấu trúc", need: { stars: 100 } },
  { id: "icecream", name: "Kem ốc quế", need: { stars: 120 } },
  { id: "dino", name: "Khủng long", need: { stars: 150 } },
  { id: "rainbow", name: "Cầu vồng", need: { streak: 2 } },
  { id: "bear", name: "Gấu nâu", need: { streak: 3 } },
  { id: "elephant", name: "Voi con", need: { streak: 5 } },
  { id: "rocket", name: "Tên lửa", need: { streak: 7 } },
];

export function stickerUnlocked(s: Sticker, stars: number, streakBest: number): boolean {
  return "stars" in s.need ? stars >= s.need.stars : streakBest >= s.need.streak;
}

/** Sticker sao gần nhất chưa mở và số sao còn thiếu. */
export function nextStarSticker(stars: number): { sticker: Sticker; missing: number } | null {
  const s = STICKERS.find((x) => "stars" in x.need && x.need.stars > stars);
  return s && "stars" in s.need ? { sticker: s, missing: s.need.stars - stars } : null;
}
