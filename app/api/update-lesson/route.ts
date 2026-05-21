import { getSupabaseServer } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type QPayload = {
  type?: "mcq" | "multi" | "short" | "numeric";
  content: string;
  options: string[];
  correctAnswer: string;
  imageUrl?: string;
};

export async function POST(req: NextRequest) {
  const { lessonId, chapterId, title, indexLabel, questions, type, durationMinutes } = await req.json();

  if (!lessonId || !chapterId || !title?.trim() || !questions?.length) {
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
      chapter_id: chapterId,
      type: type === "exam" ? "exam" : "lesson",
      duration_minutes: dur,
    })
    .eq("id", lessonId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

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
    explanation: q.imageUrl ? JSON.stringify({ imageUrl: q.imageUrl }) : null,
    order_index: i + 1,
  }));

  const { error: qErr } = await sb.from("questions").insert(rows);
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  return NextResponse.json({ lessonId });
}
