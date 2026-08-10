import { getSupabaseServer } from "@/lib/supabase/server";
import { ensureSubjectId } from "@/lib/db";
import { getSubjects } from "@/lib/subjects";
import { NextRequest, NextResponse } from "next/server";
import { blockIfNoImportAccess } from "@/lib/importAuth";

// Chapters are addressed by (grade, subject name) — the subject catalogue lives
// in lib/subjects.ts, so the client never has to know a `subjects.id`.
function readSubject(grade: number, subject: string | null) {
  if (!grade || !subject) return null;
  return getSubjects(grade).includes(subject) ? subject : null;
}

export async function GET(req: NextRequest) {
  const grade = Number(req.nextUrl.searchParams.get("grade"));
  const subject = readSubject(grade, req.nextUrl.searchParams.get("subject"));
  if (!subject) return NextResponse.json([]);

  const { data, error } = await getSupabaseServer()
    .from("chapters")
    .select("id, title, subjects!inner(grade, name)")
    .eq("subjects.grade", grade)
    .eq("subjects.name", subject)
    .order("order_index");

  if (error) {
    console.error("[/api/chapters]", error.message, error.details);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // Drop the embedded join column — the client only wants id + title.
  return NextResponse.json((data ?? []).map((c: any) => ({ id: c.id, title: c.title })));
}

export async function POST(req: NextRequest) {
  const blocked = await blockIfNoImportAccess(req);
  if (blocked) return blocked;

  const { grade, subject: rawSubject, title } = await req.json();
  const subject = readSubject(Number(grade), rawSubject ?? null);
  if (!subject || !title?.trim()) {
    return NextResponse.json({ error: "Thiếu thông tin." }, { status: 400 });
  }

  // Creates the subjects row on first use, so a subject newly added to
  // lib/subjects.ts works without a manual SQL insert.
  const subjectId = await ensureSubjectId(Number(grade), subject);
  if (!subjectId) {
    return NextResponse.json({ error: "Không xác định được môn học." }, { status: 500 });
  }

  const sb = getSupabaseServer();
  const { data: existing } = await sb
    .from("chapters")
    .select("order_index")
    .eq("subject_id", subjectId)
    .order("order_index", { ascending: false })
    .limit(1);
  const nextOrder = (existing?.[0]?.order_index ?? 0) + 1;

  const { data, error } = await sb
    .from("chapters")
    .insert({ title: title.trim(), subject_id: subjectId, order_index: nextOrder })
    .select("id, title")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
