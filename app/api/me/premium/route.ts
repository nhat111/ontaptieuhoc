import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server-client";
import { isUserPremium } from "@/lib/premium";
import { isUserAdmin } from "@/lib/admin";

// Current viewer's login + premium + admin status, for client-side gating
// (exam download, Admin nav link).
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ loggedIn: false, isPremium: false, isAdmin: false });
  const [isPremium, isAdmin] = await Promise.all([
    isUserPremium(user.id),
    isUserAdmin(user.id),
  ]);
  return NextResponse.json({ loggedIn: true, isPremium, isAdmin });
}
