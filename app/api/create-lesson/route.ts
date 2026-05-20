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
  const { chapterId, title, indexLabel, questions, type } = await req.json();

  if (!chapterId || !title?.trim() || !questions?.length) {
    return NextResponse.json({ error: "Thiếu thông tin bài học." }, { status: 400 });
  }

  const sb = getSupabaseServer();

  const { data: lesson, error: lessonErr } = await sb
    .from("lessons")
    .insert({
      title: title.trim(),
      index_label: indexLabel?.trim() || "01",
      chapter_id: chapterId,
      status: "active",
      order_index: 99,
      type: type === "exam" ? "exam" : "lesson",
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
    explanation: q.imageUrl ? JSON.stringify({ imageUrl: q.imageUrl }) : null,
    order_index: i + 1,
  }));

  const { error: qErr } = await sb.from("questions").insert(rows);
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  return NextResponse.json({ lessonId: lesson.id });
}
