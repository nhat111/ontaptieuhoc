// Tiến độ từng bài trên máy này (localStorage `ontap_lesson_progress_v1`), để
// trang lớp hiện nút theo trạng thái: Học ngay / Tiếp tục / Làm lại.
//
// Vì sao không lấy từ DB: `lessons.status` gần như luôn là 'active' (không ai
// cập nhật), còn `quiz_results` chỉ gắn được với tài khoản — mà đa số bé làm bài
// không đăng nhập. Lưu cục bộ thì khách cũng thấy tiến độ của mình.
//
// Đọc qua useSyncExternalStore (snapshot server = rỗng) nên không lệch hydration.

const KEY = "ontap_lesson_progress_v1";
/** Từ mức "Giỏi" (Sidebar → LEVELS) trở lên thì coi là đã xong bài. */
export const DONE_PERCENT = 80;

export type LessonRecord = {
  /** Điểm tốt nhất, phần trăm 0–100. */
  best: number;
  /** Lần làm gần nhất, phần trăm 0–100. */
  last: number;
  attempts: number;
};
export type LessonProgressMap = Record<string, LessonRecord>;
export type LessonState = "new" | "doing" | "done";

const EMPTY: LessonProgressMap = {};
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cached: LessonProgressMap = EMPTY;

function isRecord(v: unknown): v is LessonRecord {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return [r.best, r.last, r.attempts].every((n) => typeof n === "number" && Number.isFinite(n));
}

/** Đọc chuỗi đã lưu; dữ liệu hỏng thì bỏ từng mục hỏng, không vỡ trang. */
export function parseProgress(raw: string | null): LessonProgressMap {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return EMPTY;
    const out: LessonProgressMap = {};
    for (const [id, rec] of Object.entries(data)) if (isRecord(rec)) out[id] = rec;
    return out;
  } catch {
    return EMPTY;
  }
}

export function lessonState(rec: LessonRecord | undefined): LessonState {
  if (!rec || rec.attempts <= 0) return "new";
  return rec.best >= DONE_PERCENT ? "done" : "doing";
}

/** Gộp một lần làm bài mới vào bản ghi cũ. */
export function addAttempt(rec: LessonRecord | undefined, score: number, total: number): LessonRecord {
  const pct = total > 0 ? Math.round((Math.max(0, Math.min(score, total)) / total) * 100) : 0;
  return {
    best: Math.max(rec?.best ?? 0, pct),
    last: pct,
    attempts: (rec?.attempts ?? 0) + 1,
  };
}

export function getProgress(): LessonProgressMap {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  // Cùng chuỗi → cùng object, useSyncExternalStore mới không render lặp.
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parseProgress(raw);
  }
  return cached;
}

export const getServerProgress = () => EMPTY;

export function saveLessonResult(lessonId: number, score: number, total: number) {
  const all = getProgress();
  const next = { ...all, [lessonId]: addAttempt(all[lessonId], score, total) };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {/* hết chỗ hoặc bị chặn: bỏ qua, chỉ là phần thêm */}
  listeners.forEach((l) => l());
}

export function subscribeProgress(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}
