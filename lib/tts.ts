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
// Kết quả được cache theo nội dung trong Supabase Storage nên mỗi câu chỉ sinh
// đúng một lần, nghe lại bao nhiêu lần cũng không gọi lại API. Điều này quan
// trọng gấp đôi khi dùng gói miễn phí: hạn mức tính theo số lần SINH, không
// phải số lần nghe.
//
// Hai nhà cung cấp, tự chọn theo key nào được cấu hình:
//   GEMINI_API_KEY  → Google AI Studio, có gói miễn phí, không cần thẻ (ưu tiên)
//   OPENAI_API_KEY  → OpenAI, trả phí
// Có cả hai thì dùng Gemini, vì miễn phí thì ưu tiên trước.

import { createHash } from "crypto";

export type TtsProvider = "gemini" | "openai";

export type SynthResult = {
  audio: Buffer;
  contentType: string;
  /** Đuôi file, để đường dẫn trong kho khớp định dạng thật. */
  ext: string;
};

/**
 * Hướng dẫn giọng đọc. Cả hai nhà cung cấp đều nhận mô tả bằng lời thay vì chỉ
 * chỉnh số, nên nói thẳng đối tượng nghe là học sinh tiểu học đang học tiếng Anh.
 */
const STYLE =
  "Read aloud clearly and warmly, like a friendly primary-school English " +
  "teacher reading a test to a young learner. Speak at a slow, steady pace " +
  "with natural pauses. Pronounce every word distinctly";

const GEMINI_MODEL = "gemini-2.5-flash-preview-tts";
const OPENAI_MODEL = "gpt-4o-mini-tts";

// ── Danh mục giọng ───────────────────────────────────────────────────────────
//
// Tên giọng khác nhau hoàn toàn giữa hai nhà cung cấp, nên client KHÔNG tự đoán
// mà hỏi `GET /api/tts` để lấy đúng danh sách của nhà cung cấp đang bật.

export type VoiceOption = { value: string; label: string };

/** Giọng Gemini chọn lọc — bỏ các giọng trầm/khàn không hợp đọc cho bé. */
const GEMINI_VOICES: VoiceOption[] = [
  { value: "Kore", label: "Kore (nữ, rõ ràng)" },
  { value: "Sulafat", label: "Sulafat (nữ, ấm)" },
  { value: "Leda", label: "Leda (nữ, trẻ)" },
  { value: "Aoede", label: "Aoede (nữ, nhẹ nhàng)" },
  { value: "Puck", label: "Puck (nam, vui vẻ)" },
  { value: "Charon", label: "Charon (nam, điềm đạm)" },
  { value: "Iapetus", label: "Iapetus (nam, rõ ràng)" },
];

const OPENAI_VOICES: VoiceOption[] = [
  { value: "nova", label: "Nova (nữ, ấm)" },
  { value: "shimmer", label: "Shimmer (nữ, nhẹ)" },
  { value: "alloy", label: "Alloy (trung tính)" },
  { value: "fable", label: "Fable (giọng Anh-Anh)" },
  { value: "echo", label: "Echo (nam)" },
  { value: "onyx", label: "Onyx (nam, trầm)" },
];

export function getProvider(): TtsProvider | null {
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  return null;
}

export function isTtsConfigured(): boolean {
  return getProvider() !== null;
}

export function voicesFor(provider: TtsProvider): VoiceOption[] {
  return provider === "gemini" ? GEMINI_VOICES : OPENAI_VOICES;
}

export function defaultVoiceFor(provider: TtsProvider): string {
  return voicesFor(provider)[0].value;
}

/** Giọng client gửi lên phải nằm trong danh mục, không thì rơi về mặc định. */
export function resolveVoice(provider: TtsProvider, voice: unknown): string {
  const list = voicesFor(provider);
  return typeof voice === "string" && list.some((v) => v.value === voice)
    ? voice
    : list[0].value;
}

/**
 * Ngăn cách các trường khi băm. Ký tự NUL không bao giờ xuất hiện trong nội dung
 * đề nên hai bộ trường khác nhau không thể ghép thành cùng một chuỗi.
 */
const SEP = "\u0000";

/**
 * Khoá cache: mọi thứ ảnh hưởng tới file audio đều nằm trong hash, nên đổi
 * nhà cung cấp/model/giọng/hướng dẫn là tự sinh file mới thay vì phát lại bản
 * cũ sai giọng.
 */
export function ttsCacheKey(
  provider: TtsProvider,
  text: string,
  voice: string,
  speed: number
): string {
  const model = provider === "gemini" ? GEMINI_MODEL : OPENAI_MODEL;
  return createHash("sha256")
    .update([provider, model, voice, String(speed), STYLE, text].join(SEP))
    .digest("hex");
}

function httpError(status: number, body: string): Error {
  const err = new Error(`tts-${status}: ${body.slice(0, 300)}`);
  (err as Error & { status?: number }).status = status;
  return err;
}

// ── WAV ──────────────────────────────────────────────────────────────────────

/**
 * Gemini trả PCM 16-bit thô, trình duyệt không phát thẳng được. Bọc thêm 44 byte
 * header WAV là phát được ngay, không cần thư viện chuyển mã nào.
 */
function pcmToWav(pcm: Buffer, sampleRate: number): Buffer {
  const header = Buffer.alloc(44);
  const channels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // độ dài khối fmt
  header.writeUInt16LE(1, 20); // 1 = PCM không nén
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

/** `audio/L16;codec=pcm;rate=24000` → 24000. Thiếu thì lấy mặc định của Gemini. */
function sampleRateFrom(mimeType: string | undefined): number {
  const m = /rate=(\d+)/.exec(mimeType ?? "");
  const n = m ? Number(m[1]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 24000;
}

// ── Gọi nhà cung cấp ─────────────────────────────────────────────────────────

/**
 * Gemini không có tham số tốc độ; điều chỉnh bằng lời dẫn ngay trong prompt.
 * Model đọc theo hướng dẫn chứ không đọc to phần hướng dẫn ra.
 */
function geminiPrompt(text: string, speed: number): string {
  const pace =
    speed < 1 ? "Speak noticeably slower than normal. " :
    speed > 1 ? "Speak at a brisk but still clear pace. " : "";
  return `${STYLE}. ${pace}Now read exactly this, and nothing else:\n\n${text}`;
}

async function synthesizeGemini(
  text: string,
  voice: string,
  speed: number
): Promise<SynthResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("missing-key");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: geminiPrompt(text, speed) }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
          },
        },
      }),
    }
  );

  if (!res.ok) throw httpError(res.status, await res.text().catch(() => ""));

  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { data?: string } }) => p?.inlineData?.data
  );
  const b64 = part?.inlineData?.data;
  if (typeof b64 !== "string") {
    // Bị chặn bộ lọc hay hết hạn mức đều rơi vào đây; log để còn lần ra.
    throw httpError(502, JSON.stringify(data).slice(0, 300));
  }

  const pcm = Buffer.from(b64, "base64");
  return {
    audio: pcmToWav(pcm, sampleRateFrom(part.inlineData?.mimeType)),
    contentType: "audio/wav",
    ext: "wav",
  };
}

async function synthesizeOpenai(
  text: string,
  voice: string,
  speed: number
): Promise<SynthResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("missing-key");

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      voice,
      input: text,
      instructions: STYLE,
      speed,
      response_format: "mp3",
    }),
  });

  if (!res.ok) throw httpError(res.status, await res.text().catch(() => ""));

  return {
    audio: Buffer.from(await res.arrayBuffer()),
    contentType: "audio/mpeg",
    ext: "mp3",
  };
}

/** Gọi nhà cung cấp đang bật. Ném lỗi kèm `status` để route dịch sang tiếng Việt. */
export function synthesizeSpeech(
  provider: TtsProvider,
  text: string,
  voice: string,
  speed: number
): Promise<SynthResult> {
  return provider === "gemini"
    ? synthesizeGemini(text, voice, speed)
    : synthesizeOpenai(text, voice, speed);
}
