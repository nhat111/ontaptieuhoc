import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, isPremium, premiumUntil } = await req.json();
  if (!userId) return NextResponse.json({ error: "Thiếu userId." }, { status: 400 });

  const sb = getSupabaseServer();
  const { error } = await sb
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        is_premium: !!isPremium,
        premium_until: premiumUntil || null,
      },
      { onConflict: "user_id" },
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
