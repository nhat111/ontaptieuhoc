import { getSupabaseServer } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const grade = Number(req.nextUrl.searchParams.get("grade"));
  if (!grade) return NextResponse.json([]);
  const { data, error } = await getSupabaseServer()
    .from("subjects")
    .select("id, name")
    .eq("grade", grade)
    .order("order_index");
  if (error) {
    console.error("[/api/subjects]", error.message, error.details);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}
