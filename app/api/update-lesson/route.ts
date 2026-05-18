import { getSupabaseServer } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { lessonId, chapterId, title, indexLabel, questions, type } = await req.json();

  if (!lessonId || !chapterId || !title?.trim() || !questions?.length) {
    return NextResponse.json({ error: "Thiếu thông tin bài học." }, { status: 400 });
  }

  const sb = getSupabaseServer();

  const { error: updateErr } = await sb
    .from("lessons")
    .update({
      title: title.trim(),
      index_label: indexLabel?.trim() || "01",
      chapter_id: chapterId,
      type: type === "exam" ? "exam" : "lesson",
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

  const rows = questions.map(
    (
      q: { content: string; options: string[]; correctAnswer: string; imageUrl?: string },
      i: number
    ) => ({
      lesson_id: lessonId,
      content: q.content,
      options: q.options,
      correct_answer: q.correctAnswer,
      explanation: q.imageUrl ? JSON.stringify({ imageUrl: q.imageUrl }) : null,
      order_index: i + 1,
    })
  );

  const { error: qErr } = await sb.from("questions").insert(rows);
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  return NextResponse.json({ lessonId });
}
