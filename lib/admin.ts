import { getSupabaseServer } from "./supabase/server";
import { getUser } from "./supabase/server-client";

// True if the user has the admin flag in profiles. Service-role read.
export async function isUserAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const sb = getSupabaseServer();
    const { data } = await sb
      .from("profiles")
      .select("is_admin")
      .eq("user_id", userId)
      .single();
    return !!(data as any)?.is_admin;
  } catch {
    return false;
  }
}

// For server components / route handlers: returns the current admin user, or
// null if not logged in / not an admin. Callers redirect or 403 on null.
export async function getAdminUser() {
  const user = await getUser();
  if (!user) return null;
  return (await isUserAdmin(user.id)) ? user : null;
}

export type AdminStats = {
  users: number;
  premium: number;
  lessons: number;
  exams: number;
  attempts: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const sb = getSupabaseServer();
  const head = { count: "exact" as const, head: true };
  try {
    const [usersRes, premiumRes, lessonsRes, examsRes, attemptsRes] = await Promise.all([
      sb.auth.admin.listUsers({ perPage: 1000 }),
      sb.from("profiles").select("user_id", head).eq("is_premium", true),
      sb.from("lessons").select("id", head),
      sb.from("lessons").select("id", head).eq("type", "exam"),
      sb.from("quiz_results").select("id", head),
    ]);
    return {
      users: usersRes.data?.users?.length ?? 0,
      premium: premiumRes.count ?? 0,
      lessons: lessonsRes.count ?? 0,
      exams: examsRes.count ?? 0,
      attempts: attemptsRes.count ?? 0,
    };
  } catch {
    return { users: 0, premium: 0, lessons: 0, exams: 0, attempts: 0 };
  }
}

export type AdminLessonRow = {
  id: number;
  title: string;
  type: "lesson" | "exam" | null;
  questionCount: number;
  chapterTitle: string;
  subjectName: string;
  grade: number;
};

export async function listAllLessons(): Promise<AdminLessonRow[]> {
  const sb = getSupabaseServer();
  try {
    const { data: lessons } = await sb
      .from("lessons")
      .select("id, title, type, chapter_id, questions(count)")
      .order("id", { ascending: false });
    if (!lessons?.length) return [];

    const chapterIds = [...new Set((lessons as any[]).map((l) => l.chapter_id))];
    const { data: chapters } = await sb
      .from("chapters")
      .select("id, title, subject_id")
      .in("id", chapterIds);
    const subjectIds = [...new Set((chapters ?? []).map((c: any) => c.subject_id))];
    const { data: subjects } = await sb
      .from("subjects")
      .select("id, name, grade")
      .in("id", subjectIds);

    const cmap = new Map((chapters ?? []).map((c: any) => [c.id, c]));
    const smap = new Map((subjects ?? []).map((s: any) => [s.id, s]));

    return (lessons as any[]).map((l) => {
      const ch = cmap.get(l.chapter_id);
      const sub = ch ? smap.get((ch as any).subject_id) : null;
      return {
        id: l.id,
        title: l.title,
        type: (l.type === "exam" ? "exam" : l.type === "lesson" ? "lesson" : null) as AdminLessonRow["type"],
        questionCount: l.questions?.[0]?.count ?? 0,
        chapterTitle: (ch as any)?.title ?? "—",
        subjectName: (sub as any)?.name ?? "—",
        grade: (sub as any)?.grade ?? 0,
      };
    });
  } catch {
    return [];
  }
}

export type AdminUserRow = {
  id: string;
  email: string;
  createdAt: string | null;
  isPremium: boolean;
  premiumUntil: string | null;
  isAdmin: boolean;
};

export async function listUsersWithProfiles(): Promise<AdminUserRow[]> {
  const sb = getSupabaseServer();
  try {
    const { data: usersData } = await sb.auth.admin.listUsers({ perPage: 1000 });
    const users = usersData?.users ?? [];
    const { data: profiles } = await sb
      .from("profiles")
      .select("user_id, is_premium, premium_until, is_admin");
    const pmap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
    return users
      .map((u: any) => {
        const p = pmap.get(u.id);
        return {
          id: u.id,
          email: u.email ?? "(no email)",
          createdAt: u.created_at ?? null,
          isPremium: !!p?.is_premium && (!p?.premium_until || new Date(p.premium_until).getTime() > Date.now()),
          premiumUntil: p?.premium_until ?? null,
          isAdmin: !!p?.is_admin,
        };
      })
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  } catch {
    return [];
  }
}
