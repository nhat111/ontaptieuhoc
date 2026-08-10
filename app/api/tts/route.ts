import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  defaultVoiceFor,
  getProvider,
  resolveVoice,
  synthesizeSpeech,
  ttsCacheKey,
  voicesFor,
} from "@/lib/tts";

// Trả về URL file audio đọc sẵn cho một đoạn text tiếng Anh.
//
// Cache theo nội dung: cùng một câu hỏi thì mọi lượt nghe sau đều dùng lại file
// cũ, không gọi lại nhà cung cấp. Với gói miễn phí điều này còn quan trọng hơn
// cả với gói trả phí — hạn mức tính theo số lần SINH, nên nghe lại không tốn gì.

const BUCKET = "question-audio";
// Một câu hỏi kèm 4 đáp án hiếm khi quá 800 ký tự. Chặn ở đây để một request
// hỏng (hoặc cố tình) không đốt hết hạn mức — /quiz là trang mở, không cần
// đăng nhập.
const MAX_CHARS = 1200;

type Sb = ReturnType<typeof getSupabaseServer>;

async function ensureBucket(sb: Sb): Promise<{ error?: string }> {
  const { error } = await sb.storage.createBucket(BUCKET, {
    public: true,
    allowedMimeTypes: ["audio/mpeg", "audio/wav"],
  });
  if (!error) return {};
  if (/already exists|duplicate/i.test(error.message)) return {};
  return { error: error.message };
}

/** Đã có file trong kho chưa — hỏi trước khi tiêu hạn mức. */
async function findCached(sb: Sb, name: string): Promise<boolean> {
  const { data, error } = await sb.storage.from(BUCKET).list("tts", {
    search: name,
    limit: 1,
  });
  if (error) return false;
  return !!data?.some((f) => f.name === name);
}

/**
 * Cho client biết có bật giọng đám mây không, và nhà cung cấp đang bật có
 * những giọng nào — tên giọng của Gemini và OpenAI khác nhau hoàn toàn nên
 * client không thể tự đoán. Không trả bất kỳ phần nào của key.
 */
export async function GET() {
  const provider = getProvider();
  if (!provider) return NextResponse.json({ available: false });
  return NextResponse.json({
    available: true,
    provider,
    voices: voicesFor(provider),
    defaultVoice: defaultVoiceFor(provider),
  });
}

export async function POST(req: NextRequest) {
  const provider = getProvider();
  if (!provider) {
    return NextResponse.json(
      { error: "Máy chủ chưa cấu hình GEMINI_API_KEY hoặc OPENAI_API_KEY." },
      { status: 503 }
    );
  }

  let body: { text?: unknown; voice?: unknown; probe?: unknown };
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

  // Không nhận tốc độ: file sinh ở một tốc độ duy nhất, trình duyệt tự chỉnh
  // lúc phát. Xem ghi chú ở synthesizeSpeech.
  const voice = resolveVoice(provider, body.voice);
  const key = ttsCacheKey(provider, text, voice);

  const sb = getSupabaseServer();

  // Đuôi file phụ thuộc nhà cung cấp (Gemini trả wav, OpenAI trả mp3) mà lúc
  // tra cache thì chưa gọi API nên chưa biết. Hỏi cả hai đuôi.
  for (const ext of ["wav", "mp3"]) {
    const name = `${key}.${ext}`;
    if (await findCached(sb, name)) {
      const { data } = sb.storage.from(BUCKET).getPublicUrl(`tts/${name}`);
      return NextResponse.json({ url: data.publicUrl, cached: true, ready: true });
    }
  }

  // Chế độ chỉ hỏi "đã có file chưa": dùng để đếm tiến độ chuẩn bị của cả đề mà
  // không tiêu một chút hạn mức nào. Không có file thì trả về luôn, không sinh.
  if (body.probe === true) {
    return NextResponse.json({ ready: false });
  }

  let result;
  try {
    result = await synthesizeSpeech(provider, text, voice);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = (err as { status?: number }).status;
    console.error("[/api/tts]", provider, msg);
    if (status === 401 || status === 403) {
      return NextResponse.json({ error: "API key không hợp lệ." }, { status: 500 });
    }
    if (status === 429) {
      // Kèm nguyên văn để phân biệt hai chuyện rất khác nhau: vượt giới hạn
      // mỗi phút (chờ là qua) và hết hạn mức mỗi ngày (chờ cũng vô ích).
      return NextResponse.json(
        { error: `Vượt hạn mức nhà cung cấp — ${msg.slice(0, 200)}` },
        { status: 429 }
      );
    }
    // Kèm thông điệp thật của nhà cung cấp: "không tạo được" chung chung thì
    // không ai lần ra là sai tên model, sai quyền key hay lỗi gì khác. Thân lỗi
    // của Gemini/OpenAI không chứa API key nên hiện ra là an toàn.
    return NextResponse.json(
      { error: `Không tạo được giọng đọc — ${msg.slice(0, 200)}` },
      { status: 502 }
    );
  }

  const path = `tts/${key}.${result.ext}`;
  const opts = { contentType: result.contentType, upsert: true };
  let { error } = await sb.storage.from(BUCKET).upload(path, result.audio, opts);

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
    ({ error } = await sb.storage.from(BUCKET).upload(path, result.audio, opts));
  }

  if (error) {
    console.error("[/api/tts] upload:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, cached: false });
}
