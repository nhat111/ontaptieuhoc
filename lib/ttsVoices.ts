// Danh mục giọng đọc đám mây — phần dùng được ở CẢ hai phía.
//
// Tách khỏi `lib/tts.ts` vì file đó `import { createHash } from "crypto"`; chỉ
// cần một component client lỡ import hằng số từ đó là kéo cả module node vào
// bundle trình duyệt.

export type TtsVoice = "alloy" | "nova" | "shimmer" | "fable" | "echo" | "onyx";

/** Giọng mặc định — nữ, ấm, phát âm rõ, hợp đọc đề cho bé. */
export const DEFAULT_VOICE: TtsVoice = "nova";

export const VOICE_OPTIONS: { value: TtsVoice; label: string }[] = [
  { value: "nova", label: "Nova (nữ, ấm)" },
  { value: "shimmer", label: "Shimmer (nữ, nhẹ)" },
  { value: "alloy", label: "Alloy (trung tính)" },
  { value: "fable", label: "Fable (giọng Anh-Anh)" },
  { value: "echo", label: "Echo (nam)" },
  { value: "onyx", label: "Onyx (nam, trầm)" },
];

export function isTtsVoice(v: unknown): v is TtsVoice {
  return typeof v === "string" && VOICE_OPTIONS.some((o) => o.value === v);
}

/**
 * Đổi tốc độ của Web Speech (0.55 / 0.7 / 0.9) sang thang tốc độ của provider,
 * nơi 1.0 mới là bình thường.
 *
 * Không map tuyến tính: model đã được dặn đọc chậm sẵn, hạ xuống 0.55 nữa thì
 * giọng bị kéo dài nghe rất giả. Biên độ hẹp lại quanh 1.0 là đủ nghe khác biệt
 * mà vẫn tự nhiên.
 *
 * Trả về đúng 3 giá trị rời rạc thay vì số thực bất kỳ, để tốc độ lạ trong
 * localStorage không sinh ra vô số biến thể file trong cache.
 */
export function mapRateToSpeed(rate: number): number {
  if (!Number.isFinite(rate)) return 1.0;
  if (rate <= 0.6) return 0.85;
  if (rate >= 0.85) return 1.15;
  return 1.0;
}
