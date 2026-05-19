import { getSupabaseServer } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { QDraft } from "@/components/import/QuestionCard";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lessonId = Number(id);
  if (!lessonId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const sb = getSupabaseServer();

  const { data: lesson, error: lessonErr } = await sb
    .from("lessons")
    .select("id, title, index_label, chapter_id, type")
    .eq("id", lessonId)
    .single();

  if (lessonErr || !lesson) {
    return NextResponse.json({ error: "Không tìm thấy bài học." }, { status: 404 });
  }

  const { data: chapter } = await sb
    .from("chapters")
    .select("id, subject_id")
    .eq("id", lesson.chapter_id)
    .single();

  let subjectId = 0;
  let grade = 1;
  if (chapter) {
    const { data: subject } = await sb
      .from("subjects")
      .select("id, grade")
      .eq("id", chapter.subject_id)
      .single();
    if (subject) {
      subjectId = subject.id;
      grade = subject.grade;
    }
  }

  const { data: questions } = await sb
    .from("questions")
    .select("id, content, options, correct_answer, explanation")
    .eq("lesson_id", lessonId)
    .order("order_index");

  const qDrafts: QDraft[] = (questions ?? []).map((q) => {
    const opts = (Array.isArray(q.options) ? q.options : []) as string[];
    while (opts.length < 4) opts.push("");
    const four = opts.slice(0, 4) as [string, string, string, string];
    const correctIdx = Math.max(0, four.indexOf(q.correct_answer ?? "")) as 0 | 1 | 2 | 3;
    let imageUrl: string | undefined;
    try {
      const exp = typeof q.explanation === "string" ? JSON.parse(q.explanation) : q.explanation;
      if (exp?.imageUrl) imageUrl = exp.imageUrl;
    } catch {}
    return { id: String(q.id), content: q.content ?? "", options: four, correctIdx, imageUrl };
  });

  return NextResponse.json({
    lessonId: lesson.id,
    title: lesson.title,
    indexLabel: lesson.index_label,
    chapterId: lesson.chapter_id,
    subjectId,
    grade,
    questions: qDrafts,
    type: lesson.type === "exam" ? "exam" : "lesson",
  });
}
