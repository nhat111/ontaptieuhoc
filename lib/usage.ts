// Đếm lượt dùng các tính năng chính — để biết phụ huynh thật sự dùng gì
// (Tạo đề nhanh, phiếu bài tập, trò chơi…) trước khi chọn việc làm tiếp.
//
// Cố ý tối giản và không định danh: không lưu IP, không lưu tài khoản, không
// cookie. Mỗi sự kiện chỉ có tên + lớp + một chuỗi ngắn (môn, loại đề, đường
// dẫn trò chơi). Gửi hỏng thì thôi — đếm thiếu một lượt không sao, làm hỏng
// nút "In" của phụ huynh thì có sao.

/** Tên sự kiện → nhãn hiển thị ở /import/thong-ke. Thêm sự kiện mới ở đây. */
export const USAGE_EVENTS = {
  quiz_start: "Bắt đầu làm bài",
  quiz_submit: "Nộp bài",
  lesson_print: "In / tải đề có sẵn",
  quick_exam_create: "Tạo đề nhanh",
  quick_exam_print: "Tạo đề nhanh · In PDF",
  quick_exam_word: "Tạo đề nhanh · Tải Word",
  worksheet_print: "Phiếu bài tập · In PDF",
  worksheet_word: "Phiếu bài tập · Tải Word",
  daily_print: "Phiếu hằng ngày · In PDF",
  daily_word: "Phiếu hằng ngày · Tải Word",
  ai_sheet_print: "Phiếu AI · In PDF",
  game_start: "Chơi trò chơi",
} as const;

export type UsageEventName = keyof typeof USAGE_EVENTS;

export type UsageEvent = { name: UsageEventName; grade: number | null; detail: string | null };

export const MAX_DETAIL = 80;

/** Kiểm tra dữ liệu gửi lên: tên phải nằm trong danh sách, lớp 1–9, chuỗi phụ ngắn. */
export function parseUsageEvent(body: unknown): UsageEvent | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.name !== "string" || !Object.hasOwn(USAGE_EVENTS, b.name)) return null;
  const grade = Number.isInteger(b.grade) && (b.grade as number) >= 1 && (b.grade as number) <= 9 ? (b.grade as number) : null;
  const detail = typeof b.detail === "string" ? b.detail.trim().slice(0, MAX_DETAIL) || null : null;
  return { name: b.name as UsageEventName, grade, detail };
}

/**
 * Ghi một lượt dùng. Gọi được ở bất kỳ đâu phía trình duyệt, không bao giờ ném lỗi.
 * `sendBeacon` để lượt vẫn tới khi trang chuyển đi ngay sau đó (Nộp bài → /result).
 */
export function track(name: UsageEventName, opts: { grade?: number | null; detail?: string | null } = {}) {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ name, grade: opts.grade ?? null, detail: opts.detail ?? null });
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon?.("/api/usage", blob)) return;
    fetch("/api/usage", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  } catch {
    // đếm thiếu một lượt, không sao
  }
}

/** Lớp trong đường dẫn trò chơi: /lop/3/tro-choi/dua-xe → 3. */
export function gradeFromPath(path: string): number | null {
  const m = /^\/lop\/(\d)\//.exec(path);
  return m ? Number(m[1]) : null;
}
