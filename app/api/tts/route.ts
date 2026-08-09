import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  DEFAULT_VOICE,
  isTtsConfigured,
  isTtsVoice,
  mapRateToSpeed,
  synthesizeSpeech,
  ttsCacheKey,
  type TtsVoice,
} from "@/lib/tts";

// Trả về URL file mp3 đọc sẵn cho một đoạn text tiếng Anh.
//
// Cache theo nội dung: cùng một câu hỏi thì mọi lượt nghe sau đều dùng lại file
// cũ, không gọi lại provider. Nghĩa là mỗi câu chỉ tốn tiền đúng một lần trong
// đời, kể cả khi cả lớp cùng làm đề đó.

const BUCKET = "question-audio";
// Một câu hỏi kèm 4 đáp án hiếm khi quá 800 ký tự. Chặn ở đây để một request
// hỏng (hoặc cố tình) không biến thành hoá đơn lớn — /quiz là trang mở, không
// cần đăng nhập.
const MAX_CHARS = 1200;

type Sb = ReturnType<typeof getSupabaseServer>;

async function ensureBucket(sb: Sb): Promise<{ error?: string }> {
  const { error } = await sb.storage.createBucket(BUCKET, {
    public: true,
    allowedMimeTypes: ["audio/mpeg"],
  });
  if (!error) return {};
  if (/already exists|duplicate/i.test(error.message)) return {};
  return { error: error.message };
}

/** Đã có file trong kho chưa — hỏi trước khi tiêu tiền gọi provider. */
async function findCached(sb: Sb, name: string): Promise<boolean> {
  const { data, error } = await sb.storage.from(BUCKET).list("tts", {
    search: name,
    limit: 1,
  });
  if (error) return false;
  return !!data?.some((f) => f.name === name);
}

/**
 * Cho client biết có bật giọng đám mây không, để nút "Giọng chuẩn" chỉ hiện khi
 * dùng được — thay vì hiện rồi bấm vào báo lỗi. Chỉ trả boolean, không lộ key.
 */
export async function GET() {
  return NextResponse.json({ available: isTtsConfigured() });
}

export async function POST(req: NextRequest) {
  if (!isTtsConfigured()) {
    return NextResponse.json(
      { error: "Chưa cấu hình OPENAI_API_KEY trên máy chủ." },
      { status: 503 }
    );
  }

  let body: { text?: unknown; voice?: unknown; rate?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Thiếu nội dung cần đọc." }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `Đoạn text quá dài (tối đa ${MAX_CHARS} ký tự).` },
      { status: 413 }
    );
  }

  const voice: TtsVoice = isTtsVoice(body.voice) ? body.voice : DEFAULT_VOICE;
  const speed = mapRateToSpeed(Number(body.rate));
  const key = ttsCacheKey(text, voice, speed);
  const name = `${key}.mp3`;
  const path = `tts/${name}`;

  const sb = getSupabaseServer();
  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);

  if (await findCached(sb, name)) {
    return NextResponse.json({ url: pub.publicUrl, cached: true });
  }

  let audio: Buffer;
  try {
    audio = await synthesizeSpeech(text, voice, speed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = (err as { status?: number }).status;
    console.error("[/api/tts]", msg);
    if (status === 401) {
      return NextResponse.json({ error: "OPENAI_API_KEY không hợp lệ." }, { status: 500 });
    }
    if (status === 429) {
      return NextResponse.json(
        { error: "Đang quá tải hoặc hết hạn mức, thử lại sau ít phút." },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: "Không tạo được giọng đọc." }, { status: 502 });
  }

  const opts = { contentType: "audio/mpeg", upsert: true };
  let { error } = await sb.storage.from(BUCKET).upload(path, audio, opts);

  // Tạo bucket ngay lần dùng đầu, giống /api/upload-image — người vận hành chỉ
  // có điện thoại thì không vào dashboard tạo tay được.
  if (error && /bucket not found|not found/i.test(error.message)) {
    const ensured = await ensureBucket(sb);
    if (ensured.error) {
      console.error("[/api/tts] createBucket:", ensured.error);
      return NextResponse.json(
        { error: `Không tạo được bucket "${BUCKET}": ${ensured.error}` },
        { status: 500 }
      );
    }
    ({ error } = await sb.storage.from(BUCKET).upload(path, audio, opts));
  }

  if (error) {
    console.error("[/api/tts] upload:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ url: pub.publicUrl, cached: false });
}
