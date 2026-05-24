import { getSupabaseServer } from "@/lib/supabase/server";
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
  const { chapterId, title, indexLabel, questions, type, durationMinutes } = await req.json();

  if (!chapterId || !title?.trim() || !questions?.length) {
    return NextResponse.json({ error: "Thiếu thông tin bài học." }, { status: 400 });
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
      chapter_id: chapterId,
      status: "active",
      order_index: 99,
      type: type === "exam" ? "exam" : "lesson",
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
