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
