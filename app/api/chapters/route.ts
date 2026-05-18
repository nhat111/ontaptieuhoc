import { getSupabaseServer } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const subjectId = Number(req.nextUrl.searchParams.get("subjectId"));
  if (!subjectId) return NextResponse.json([]);
  const { data, error } = await getSupabaseServer()
    .from("chapters")
    .select("id, title")
    .eq("subject_id", subjectId)
    .order("order_index");
  if (error) {
    console.error("[/api/chapters]", error.message, error.details);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const { subjectId, title } = await req.json();
  if (!subjectId || !title?.trim()) {
    return NextResponse.json({ error: "Thiếu thông tin." }, { status: 400 });
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
