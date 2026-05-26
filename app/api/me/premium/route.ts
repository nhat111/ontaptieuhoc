import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server-client";
import { isUserPremium } from "@/lib/premium";

// Current viewer's login + premium status, for client-side gating of
// premium features (exam download, detailed reports).
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ loggedIn: false, isPremium: false });
  const isPremium = await isUserPremium(user.id);
  return NextResponse.json({ loggedIn: true, isPremium });
}
