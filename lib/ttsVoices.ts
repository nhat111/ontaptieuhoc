// Phần TTS dùng được ở CẢ hai phía.
//
// Tách khỏi `lib/tts.ts` vì file đó `import { createHash } from "crypto"`; chỉ
// cần một component client lỡ import hằng số từ đó là kéo cả module node vào
// bundle trình duyệt.

/**
 * Tên giọng chỉ là chuỗi: mỗi nhà cung cấp có bộ tên riêng ("Kore" của Gemini,
 * "nova" của OpenAI), nên client không giữ danh sách cứng mà hỏi
 * `GET /api/tts`. Máy chủ mới là nơi kiểm tra tên giọng có hợp lệ không.
 */
export type TtsVoice = string;

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
