import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

// Gắn / gỡ file giọng đọc cho từng câu hỏi.
//
// Ghi thẳng vào `questions.explanation` (blob JSON dùng chung cho ảnh, lời giải
// và giờ thêm audioUrl) nên không cần thêm cột nào vào DB.
//
// KHÔNG đi qua `/api/update-lesson`: route đó xoá sạch rồi chèn lại toàn bộ câu
// hỏi, dùng cho việc gắn audio thì vừa thừa vừa dễ mất dữ liệu nếu client gửi
// thiếu. Ở đây chỉ đọc–gộp–ghi đúng những câu được nêu tên.

type Item = { questionId: number; url: string | null };

export async function POST(req: NextRequest) {
  let body: { lessonId?: unknown; items?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }

  const lessonId = Number(body.lessonId);
  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return NextResponse.json({ error: "Thiếu mã bài học." }, { status: 400 });
  }

  const items: Item[] = Array.isArray(body.items)
    ? body.items
        .map((it: unknown) => {
          const o = it as { questionId?: unknown; url?: unknown };
          const questionId = Number(o?.questionId);
          const url = typeof o?.url === "string" && o.url.trim() ? o.url.trim() : null;
          return Number.isInteger(questionId) ? { questionId, url } : null;
        })
        .filter((x): x is Item => x !== null)
    : [];

  if (!items.length) {
    return NextResponse.json({ error: "Không có câu nào để cập nhật." }, { status: 400 });
  }

  const sb = getSupabaseServer();

  // Chỉ cho sửa câu thuộc đúng bài này — tránh việc gửi id câu của bài khác.
  const { data: rows, error: readErr } = await sb
    .from("questions")
    .select("id, explanation")
    .eq("lesson_id", lessonId)
    .in("id", items.map((i) => i.questionId));

  if (readErr) {
    console.error("[/api/lesson-audio] read:", readErr.message);
    return NextResponse.json({ error: `Không đọc được câu hỏi: ${readErr.message}` }, { status: 500 });
  }

  const existing = new Map<number, unknown>(
    (rows ?? []).map((r: { id: number; explanation: unknown }) => [r.id, r.explanation])
  );

  let updated = 0;
  for (const item of items) {
    if (!existing.has(item.questionId)) continue; // không thuộc bài này thì bỏ qua

    // Giữ nguyên ảnh và lời giải đang có; chỉ đụng vào audioUrl.
    let blob: Record<string, unknown> = {};
    try {
      const raw = existing.get(item.questionId);
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (parsed && typeof parsed === "object") blob = { ...(parsed as Record<string, unknown>) };
    } catch {/* blob hỏng thì coi như rỗng, không làm hỏng thêm */}

    if (item.url) blob.audioUrl = item.url;
    else delete blob.audioUrl;

    const { error } = await sb
      .from("questions")
      .update({ explanation: Object.keys(blob).length ? JSON.stringify(blob) : null })
      .eq("id", item.questionId);

    if (error) {
      console.error("[/api/lesson-audio] update:", error.message);
      return NextResponse.json({ error: `Không lưu được: ${error.message}` }, { status: 500 });
    }
    updated++;
  }

  return NextResponse.json({ updated });
}
