import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "Thiếu userId." }, { status: 400 });
  if (userId === admin.id) {
    return NextResponse.json({ error: "Không thể tự xoá tài khoản admin đang đăng nhập." }, { status: 400 });
  }

  const sb = getSupabaseServer();
  const { error } = await sb.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
