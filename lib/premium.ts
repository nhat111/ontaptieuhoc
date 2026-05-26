import { getSupabaseServer } from "./supabase/server";

// Phase-1 premium check. A row in `profiles` with is_premium=true grants
// access; if premium_until is set it must still be in the future (else
// lifetime). Reads via the service-role client (RLS-free), so callers must
// already have authenticated the user and pass a trusted userId.
export async function isUserPremium(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const sb = getSupabaseServer();
    const { data } = await sb
      .from("profiles")
      .select("is_premium, premium_until")
      .eq("user_id", userId)
      .single();
    if (!data || !(data as any).is_premium) return false;
    const until = (data as any).premium_until;
    if (until) return new Date(until).getTime() > Date.now();
    return true;
  } catch {
    return false;
  }
}
