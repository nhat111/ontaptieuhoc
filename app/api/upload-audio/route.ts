import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { createHash } from "crypto";

// Nhận file giọng đọc sinh sẵn ngoài web (Piper, Audacity, thu âm thật…) và cất
// vào kho, trả về URL để gắn cho câu hỏi.
//
// Khác `/api/tts` ở chỗ đây KHÔNG sinh gì cả — chỉ nhận file có sẵn. Nhờ vậy
// không dính hạn mức của bất kỳ nhà cung cấp nào.

const BUCKET = "question-audio";
// File WAV không nén khá nặng: một câu đọc 20 giây ở 22kHz đã cỡ 1MB. 25MB dư
// sức cho một câu mà vẫn chặn được file nhầm (video, ảnh RAW…).
const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = new Map<string, string>([
  ["audio/wav", "wav"],
  ["audio/x-wav", "wav"],
  ["audio/wave", "wav"],
  ["audio/mpeg", "mp3"],
  ["audio/mp3", "mp3"],
  ["audio/ogg", "ogg"],
  ["audio/mp4", "m4a"],
  ["audio/x-m4a", "m4a"],
]);

type Sb = ReturnType<typeof getSupabaseServer>;

async function ensureBucket(sb: Sb): Promise<{ error?: string }> {
  const { error } = await sb.storage.createBucket(BUCKET, {
    public: true,
    allowedMimeTypes: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"],
  });
  if (!error) return {};
  if (/already exists|duplicate/i.test(error.message)) return {};
  return { error: error.message };
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Không tìm thấy file trong yêu cầu." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File quá lớn (tối đa 25MB)." }, { status: 413 });
  }

  // Một số trình duyệt gửi type rỗng cho .wav — lúc đó đoán theo đuôi tên file.
  const byName = /\.(wav|mp3|ogg|m4a)$/i.exec(file.name)?.[1]?.toLowerCase();
  const ext = ALLOWED.get(file.type) ?? byName;
  if (!ext) {
    return NextResponse.json(
      { error: "Chỉ nhận file WAV, MP3, OGG hoặc M4A." },
      { status: 415 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  // Đặt tên theo nội dung: tải lại đúng file cũ thì ghi đè chính nó, không sinh
  // rác trong kho.
  const key = createHash("sha256").update(bytes).digest("hex");
  const path = `manual/${key}.${ext}`;
  const contentType =
    ext === "wav" ? "audio/wav" : ext === "mp3" ? "audio/mpeg" : ext === "ogg" ? "audio/ogg" : "audio/mp4";

  const sb = getSupabaseServer();
  const opts = { contentType, upsert: true };
  let { error } = await sb.storage.from(BUCKET).upload(path, bytes, opts);

  if (error && /bucket not found|not found/i.test(error.message)) {
    const ensured = await ensureBucket(sb);
    if (ensured.error) {
      return NextResponse.json(
        { error: `Không tạo được bucket "${BUCKET}": ${ensured.error}` },
        { status: 500 }
      );
    }
    ({ error } = await sb.storage.from(BUCKET).upload(path, bytes, opts));
  }

  if (error) {
    console.error("[/api/upload-audio]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
