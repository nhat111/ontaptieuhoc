import type { getSupabaseServer } from "@/lib/supabase/server";

// Kho file âm thanh dùng chung: giọng đọc gắn cho câu hỏi (`manual/`) và bản
// thu giọng thật cho trò chơi lớp 1 (`tro-choi/`).
export const AUDIO_BUCKET = "question-audio";

type Sb = ReturnType<typeof getSupabaseServer>;

/** Tạo bucket nếu chưa có (lần tải đầu tiên trên DB mới). */
export async function ensureAudioBucket(sb: Sb): Promise<{ error?: string }> {
  const { error } = await sb.storage.createBucket(AUDIO_BUCKET, {
    public: true,
    allowedMimeTypes: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"],
  });
  if (!error) return {};
  if (/already exists|duplicate/i.test(error.message)) return {};
  return { error: error.message };
}
