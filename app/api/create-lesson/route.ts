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

function buildExplanation(q: QPayload): string | null {
  const images = (q.images ?? []).filter((img) => img && typeof img.url === "string" && img.url);
  const blob: Record<string, unknown> = {};
  if (images.length > 0) {
    blob.images = images;
    blob.imageUrl = images[0].url;
  } else if (q.imageUrl) {
    blob.imageUrl = q.imageUrl;
  }
  if (typeof q.solution === "string" && q.solution.trim()) blob.solution = q.solution.trim();
  return Object.keys(blob).length > 0 ? JSON.stringify(blob) : null;
}

export async function POST(req: NextRequest) {
  const { chapterId, grade, subject, title, indexLabel, questions, type, durationMinutes } =
    await req.json();

  if (!title?.trim() || !questions?.length) {
    return NextResponse.json({ error: "Thiếu tên bài và nội dung câu hỏi." }, { status: 400 });
  }

  const lessonType = type === "exam" ? "exam" : "lesson";

  // Chương là tuỳ chọn: không chọn thì gom vào chương mặc định của môn, vì
  // `lessons.chapter_id` là NOT NULL và trang lớp nhóm bài theo chương.
  let resolvedChapterId: number | null = Number(chapterId) || null;
  if (!resolvedChapterId) {
    const g = Number(grade);
    if (!g || typeof subject !== "string" || !getSubjects(g).includes(subject)) {
      return NextResponse.json(
        { error: "Chưa xác định được môn học." },
        { status: 400 }
      );
    }
    const chapter = await ensureDefaultChapterIdResult(g, subject, lessonType);
    if (!chapter.id) {
      // Trả nguyên nhân thật ra client — đây là màn hình soạn bài của quản trị,
      // và "không tạo được chương mặc định" thì không đủ để sửa.
      return NextResponse.json(
        { error: chapter.error ?? "Không tạo được chương mặc định." },
        { status: 500 }
      );
    }
    resolvedChapterId = chapter.id;
  }

  const sb = getSupabaseServer();
  const dur = Number.isFinite(Number(durationMinutes)) && Number(durationMinutes) > 0
    ? Math.floor(Number(durationMinutes))
    : 15;

  const { data: lesson, error: lessonErr } = await sb
    .from("lessons")
    .insert({
      title: title.trim(),
      index_label: indexLabel?.trim() || "01",
      chapter_id: resolvedChapterId,
      status: "active",
      order_index: 99,
      type: lessonType,
      duration_minutes: dur,
    })
    .select("id")
    .single();

  if (lessonErr || !lesson) {
    return NextResponse.json(
      { error: lessonErr?.message ?? "Không thể tạo bài học." },
      { status: 500 }
    );
  }

  const rows = (questions as QPayload[]).map((q, i) => ({
    lesson_id: lesson.id,
    content: q.content,
    options: q.options ?? [],
    correct_answer: q.correctAnswer,
    type: q.type ?? "mcq",
    explanation: buildExplanation(q),
    order_index: i + 1,
  }));

  const { error: qErr } = await sb.from("questions").insert(rows);
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  return NextResponse.json({ lessonId: lesson.id });
}
