// Góp ý / báo lỗi — dùng chung cho form (client), API và trang xem góp ý.

export const REPORT_REASONS = [
  { id: "dap-an-sai", label: "Đáp án sai" },
  { id: "de-sai", label: "Đề sai / sai chính tả" },
  { id: "thieu-hinh", label: "Thiếu hình / hình lỗi" },
  { id: "khac", label: "Khác" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["id"];

export const MAX_MESSAGE = 2000;
export const MAX_CONTACT = 200;

export type FeedbackInput = {
  kind: "question" | "general";
  reason?: ReportReason;
  message?: string;
  contact?: string;
  lessonId?: number;
  questionIndex?: number;
  questionText?: string;
  /** Ô ẩn bẫy bot — người thật không thấy nên luôn để trống. */
  website?: string;
};

export function reasonLabel(id: string | null | undefined): string {
  return REPORT_REASONS.find((r) => r.id === id)?.label ?? "";
}
