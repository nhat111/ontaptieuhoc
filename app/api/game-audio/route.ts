import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { blockIfNoImportAccess } from "@/lib/importAuth";
import { AUDIO_BUCKET, ensureAudioBucket } from "@/lib/audioStorage";
import { GAME_TEXTS, RECORD_DIR, clipSlug, recordingPath } from "@/lib/gameRecordings";

// Bản thu giọng thật cho trò chơi lớp 1.
//
// GET    — công khai: { clips: { "<câu>": "<url>" } } cho những câu đã thu.
// POST   — cần mật khẩu soạn đề: multipart { text, file (WAV) }, ghi đè bản cũ.
// DELETE — cần mật khẩu soạn đề: ?text=… xoá bản thu, trò chơi quay về Piper.
//
// Chỉ nhận câu có trong GAME_TEXTS: không ai ghi được file tuỳ ý vào kho.

export const dynamic = "force-dynamic";

// Bản thu từ trình duyệt là WAV mono 22kHz, một câu vài giây chỉ cỡ 100–300KB.
const MAX_BYTES = 3 * 1024 * 1024;

export async function GET() {
  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb.storage.from(AUDIO_BUCKET).list(RECORD_DIR, { limit: 1000 });
    if (error) throw error;

    const byName = new Map((data ?? []).map((f) => [f.name, f.updated_at ?? f.created_at ?? ""]));
    const clips: Record<string, string> = {};
    for (const text of GAME_TEXTS) {
      const name = `${clipSlug(text)}.wav`;
      if (!byName.has(name)) continue;
      const { data: pub } = sb.storage.from(AUDIO_BUCKET).getPublicUrl(`${RECORD_DIR}/${name}`);
      // Thu lại là ghi đè cùng đường dẫn; thêm ?v= để trình duyệt/CDN không phát bản cũ.
      clips[text] = `${pub.publicUrl}?v=${encodeURIComponent(byName.get(name)!)}`;
    }
    return NextResponse.json({ clips }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    // Chưa có bucket / lỗi mạng: trò chơi vẫn chạy bằng file Piper.
    console.error("[/api/game-audio GET]", e);
    return NextResponse.json({ clips: {} }, { headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(req: NextRequest) {
  const blocked = await blockIfNoImportAccess(req);
  if (blocked) return blocked;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }

  const text = form.get("text");
  const file = form.get("file");
  if (typeof text !== "string" || !GAME_TEXTS.includes(text)) {
    return NextResponse.json({ error: "Câu này không có trong danh sách trò chơi." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Không tìm thấy bản thu." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Bản thu quá dài (tối đa 3MB)." }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  // Kiểm tra đầu file thay vì tin `file.type`: chỉ nhận WAV do trang thu âm tạo.
  if (bytes.subarray(0, 4).toString("ascii") !== "RIFF" || bytes.subarray(8, 12).toString("ascii") !== "WAVE") {
    return NextResponse.json({ error: "Bản thu phải là file WAV." }, { status: 415 });
  }

  const sb = getSupabaseServer();
  const path = recordingPath(text);
  const opts = { contentType: "audio/wav", upsert: true };
  let { error } = await sb.storage.from(AUDIO_BUCKET).upload(path, bytes, opts);
  if (error && /bucket not found|not found/i.test(error.message)) {
    const ensured = await ensureAudioBucket(sb);
    if (ensured.error) {
      return NextResponse.json({ error: `Không tạo được kho âm thanh: ${ensured.error}` }, { status: 500 });
    }
    ({ error } = await sb.storage.from(AUDIO_BUCKET).upload(path, bytes, opts));
  }
  if (error) {
    console.error("[/api/game-audio POST]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = sb.storage.from(AUDIO_BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: `${data.publicUrl}?v=${Date.now()}` });
}

export async function DELETE(req: NextRequest) {
  const blocked = await blockIfNoImportAccess(req);
  if (blocked) return blocked;

  const text = req.nextUrl.searchParams.get("text");
  if (!text || !GAME_TEXTS.includes(text)) {
    return NextResponse.json({ error: "Câu này không có trong danh sách trò chơi." }, { status: 400 });
  }
  const { error } = await getSupabaseServer().storage.from(AUDIO_BUCKET).remove([recordingPath(text)]);
  if (error) {
    console.error("[/api/game-audio DELETE]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
