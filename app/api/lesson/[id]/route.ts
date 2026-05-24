import { getSupabaseServer } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { QDraft, QImage, QType } from "@/components/import/QuestionCard";

function decodeImages(explanation: unknown): QImage[] {
  try {
    const exp = typeof explanation === "string" ? JSON.parse(explanation) : explanation;
    if (Array.isArray(exp?.images)) {
      return exp.images
        .filter((img: any) => img && typeof img.url === "string" && img.url)
        .map((img: any) => ({
          url: img.url as string,
          position: img.position === "before" ? "before" : "after",
        }));
    }
    if (exp?.imageUrl) {
      return [{ url: exp.imageUrl, position: "after" }];
    }
  } catch {}
  return [];
}

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
    .select("id, title, index_label, chapter_id, type, duration_minutes")
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
    .select("id, content, options, correct_answer, type, explanation")
    .eq("lesson_id", lessonId)
    .order("order_index");

  const qDrafts: QDraft[] = (questions ?? []).map((q: any) => {
    const opts = Array.isArray(q.options) ? (q.options as string[]) : [];
    const type: QType = (q.type as QType | null) ?? "mcq";
    const images = decodeImages(q.explanation);
    let solution: string | undefined;
    try {
      const exp = typeof q.explanation === "string" ? JSON.parse(q.explanation) : q.explanation;
      if (typeof exp?.solution === "string" && exp.solution.trim()) solution = exp.solution;
    } catch {}

    const ca = q.correct_answer ?? "";
    let correctIdx = 0;
    let correctIdxs: number[] = [];
    let answer = "";

    if (type === "mcq") {
      correctIdx = Math.max(0, opts.indexOf(ca));
    } else if (type === "multi") {
      try {
        const arr = JSON.parse(ca) as string[];
        correctIdxs = Array.isArray(arr)
          ? arr.map((s) => opts.indexOf(s)).filter((i) => i >= 0)
          : [];
      } catch {
        correctIdxs = [];
      }
    } else {
      answer = ca;
    }

    return {
      id: String(q.id),
      type,
      content: q.content ?? "",
      options: opts,
      correctIdx,
      correctIdxs,
      answer,
      images,
      solution,
    };
  });

  return NextResponse.json({
    lessonId: lesson.id,
    title: lesson.title,
    indexLabel: lesson.index_label,
    chapterId: lesson.chapter_id,
    subjectId,
    grade,
    durationMinutes: (lesson as any).duration_minutes ?? 15,
    questions: qDrafts,
    type: lesson.type === "exam" ? "exam" : "lesson",
  });
}
