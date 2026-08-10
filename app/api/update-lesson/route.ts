import { getSupabaseServer } from "@/lib/supabase/server";
import { ensureDefaultChapterIdResult } from "@/lib/db";
import { getSubjects } from "@/lib/subjects";
import { NextRequest, NextResponse } from "next/server";

type QImagePayload = { url: string; position: "before" | "after" };

type QPayload = {
  type?: "mcq" | "multi" | "short" | "numeric";
  content: string;
  options: string[];
  correctAnswer: string;
  images?: QImagePayload[];
  /** @deprecated legacy single-image — first element of images mirrored here */
  imageUrl?: string;
  solution?: string;
};

/**
 * Giọng đọc đã gắn cho từng câu, tra theo NỘI DUNG câu hỏi.
 *
 * Route này xoá sạch câu cũ rồi chèn lại, nên không giữ gì thì mọi lần sửa đề
 * đều thổi bay giọng đọc đã gắn ở /import/giong-doc — mất im lặng, không ai
 * biết cho tới lúc bé bấm nghe.
 *
 * Tra theo nội dung chứ không theo vị trí: đảo thứ tự câu thì audio vẫn theo
 * đúng câu của nó, còn sửa lời câu hỏi thì audio tự rụng — đúng như mong muốn,
 * vì file cũ đọc nội dung cũ.
 */
async function readExistingAudio(
  sb: ReturnType<typeof getSupabaseServer>,
  lessonId: number
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const { data } = await sb
      .from("questions")
      .select("content, explanation")
      .eq("lesson_id", lessonId);
    for (const row of data ?? []) {
      const r = row as { content: string; explanation: unknown };
      try {
        const exp = typeof r.explanation === "string" ? JSON.parse(r.explanation) : r.explanation;
        const url = (exp as { audioUrl?: unknown })?.audioUrl;
        if (typeof url === "string" && url.trim() && typeof r.content === "string") {
          map.set(r.content.trim(), url);
        }
      } catch {/* blob hỏng thì bỏ qua câu đó */}
    }
  } catch {/* đọc không được thì coi như chưa có audio nào */}
  return map;
}

function buildExplanation(q: QPayload, audioUrl?: string): string | null {
  const images = (q.images ?? []).filter((img) => img && typeof img.url === "string" && img.url);
  const blob: Record<string, unknown> = {};
  if (images.length > 0) {
    blob.images = images;
    blob.imageUrl = images[0].url;
  } else if (q.imageUrl) {
    blob.imageUrl = q.imageUrl;
  }
  if (typeof q.solution === "string" && q.solution.trim()) blob.solution = q.solution.trim();
  if (audioUrl) blob.audioUrl = audioUrl;
  return Object.keys(blob).length > 0 ? JSON.stringify(blob) : null;
}

export async function POST(req: NextRequest) {
  const { lessonId, chapterId, grade, subject, title, indexLabel, questions, type, durationMinutes } =
    await req.json();

  const lessonType = type === "exam" ? "exam" : "lesson";

  // Chương tuỳ chọn, giống create-lesson: bỏ trống thì gom vào chương mặc định
  // của môn (lessons.chapter_id là NOT NULL).
  let resolvedChapterId: number | null = Number(chapterId) || null;
  if (lessonId && !resolvedChapterId) {
    const g = Number(grade);
    if (g && typeof subject === "string" && getSubjects(g).includes(subject)) {
      const chapter = await ensureDefaultChapterIdResult(g, subject, lessonType);
      if (!chapter.id) {
        return NextResponse.json(
          { error: chapter.error ?? "Không tạo được chương mặc định." },
          { status: 500 }
        );
      }
      resolvedChapterId = chapter.id;
    }
    if (!resolvedChapterId) {
      return NextResponse.json({ error: "Chưa xác định được môn học." }, { status: 400 });
    }
  }

  if (!lessonId || !resolvedChapterId || !title?.trim() || !questions?.length) {
    return NextResponse.json({ error: "Thiếu thông tin bài học." }, { status: 400 });
  }

  const sb = getSupabaseServer();
  const dur = Number.isFinite(Number(durationMinutes)) && Number(durationMinutes) > 0
    ? Math.floor(Number(durationMinutes))
    : 15;

  const { error: updateErr } = await sb
    .from("lessons")
    .update({
      title: title.trim(),
      index_label: indexLabel?.trim() || "01",
      chapter_id: resolvedChapterId,
      type: type === "exam" ? "exam" : "lesson",
      duration_minutes: dur,
    })
    .eq("id", lessonId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Đọc TRƯỚC khi xoá, không thì mất luôn.
  const audioByContent = await readExistingAudio(sb, lessonId);

  const { error: deleteErr } = await sb
    .from("questions")
    .delete()
    .eq("lesson_id", lessonId);

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  const rows = (questions as QPayload[]).map((q, i) => ({
    lesson_id: lessonId,
    content: q.content,
    options: q.options ?? [],
    correct_answer: q.correctAnswer,
    type: q.type ?? "mcq",
    explanation: buildExplanation(q, audioByContent.get((q.content ?? "").trim())),
    order_index: i + 1,
  }));

  const { error: qErr } = await sb.from("questions").insert(rows);
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  // Find the next lesson in the same chapter (ordered by id, since order_index
  // is always 99 in practice) so the editor can offer "Lưu & sang bài tiếp".
  const { data: nextRows } = await sb
    .from("lessons")
    .select("id")
    .eq("chapter_id", resolvedChapterId)
    .gt("id", lessonId)
    .order("id", { ascending: true })
    .limit(1);
  const nextLessonId = nextRows?.[0]?.id ?? null;

  return NextResponse.json({ lessonId, chapterId: resolvedChapterId, nextLessonId });
}
