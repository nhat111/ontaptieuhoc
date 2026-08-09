// Sinh giọng đọc tiếng Anh chất lượng cao bằng TTS đám mây.
//
// Vì sao cần: giọng máy sẵn có trong trình duyệt (Web Speech API) trên iOS chỉ
// gồm bộ giọng cơ bản — Safari KHÔNG cho trang web dùng giọng Enhanced/Premium
// mà người dùng tải trong Cài đặt. Bé học tiếng Anh nghe giọng đó dễ nhại sai
// trọng âm. Giọng đám mây khắc phục hẳn chuyện này.
//
// Chỉ áp dụng cho TIẾNG ANH. Tiếng Việt vẫn dùng Web Speech (miễn phí) — vừa
// giữ chi phí ở mức thấp, vừa đúng nhu cầu: đề Việt bé đọc được, đề Anh mới cần
// giọng chuẩn.
//
// Kết quả được cache theo nội dung trong Supabase Storage nên mỗi câu chỉ tốn
// tiền đúng một lần, nghe lại bao nhiêu lần cũng miễn phí.

import { createHash } from "crypto";
import type { TtsVoice } from "./ttsVoices";

/** Đổi provider chỉ cần sửa `synthesizeSpeech` + 3 hằng số này. */
const MODEL = "gpt-4o-mini-tts";
const ENDPOINT = "https://api.openai.com/v1/audio/speech";

/**
 * Hướng dẫn giọng đọc. `gpt-4o-mini-tts` nhận mô tả bằng lời thay vì chỉ chỉnh
 * số, nên nói thẳng đối tượng nghe là học sinh tiểu học đang học tiếng Anh.
 */
const INSTRUCTIONS =
  "Speak clearly and warmly, like a friendly primary-school English teacher " +
  "reading a test aloud to a young learner. Use a slow, steady pace with " +
  "natural pauses between sentences. Pronounce every word distinctly.";

export type { TtsVoice } from "./ttsVoices";
export { DEFAULT_VOICE, VOICE_OPTIONS, isTtsVoice, mapRateToSpeed } from "./ttsVoices";

export function isTtsConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Ngăn cách các trường khi băm. Ký tự NUL không bao giờ xuất hiện trong nội dung
 * đề nên hai bộ trường khác nhau không thể ghép thành cùng một chuỗi.
 */
const SEP = "\u0000";

/**
 * Khoá cache: mọi thứ ảnh hưởng tới file audio đều nằm trong hash, nên đổi
 * model/giọng/hướng dẫn là tự sinh file mới thay vì phát lại bản cũ sai giọng.
 */
export function ttsCacheKey(text: string, voice: TtsVoice, speed: number): string {
  return createHash("sha256")
    .update([MODEL, voice, String(speed), INSTRUCTIONS, text].join(SEP))
    .digest("hex");
}

/**
 * Gọi provider, trả về mp3 thô. Ném lỗi kèm thông điệp đọc được để route ở trên
 * dịch sang tiếng Việt cho người dùng.
 */
export async function synthesizeSpeech(
  text: string,
  voice: TtsVoice,
  speed: number
): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("missing-key");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      voice,
      input: text,
      instructions: INSTRUCTIONS,
      speed,
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    // Thân lỗi của OpenAI là JSON `{ error: { message } }`; giữ nguyên để log.
    const body = await res.text().catch(() => "");
    const err = new Error(`tts-${res.status}: ${body.slice(0, 300)}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  return Buffer.from(await res.arrayBuffer());
}
