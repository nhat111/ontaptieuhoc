import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { lessonId } = await req.json();
  if (!lessonId) return NextResponse.json({ error: "Thiếu lessonId." }, { status: 400 });

  const sb = getSupabaseServer();
  // questions cascade via FK ON DELETE CASCADE.
  const { error } = await sb.from("lessons").delete().eq("id", lessonId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
