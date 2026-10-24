// Ai đang dùng khu soạn đề, và được làm gì — phía máy chủ.
//
// Hai cách vào (quy tắc ở lib/editorRules.ts):
// 1. Mật khẩu chung IMPORT_PASSWORD (cookie, lib/importAuth.ts) → quản trị.
//    Chưa đặt mật khẩu thì mọi người là quản trị — giữ nguyên cách site chạy
//    trước khi có tính năng này.
// 2. Đăng nhập bằng email đã XÁC NHẬN, có trong bảng `editors` → người soạn.
//    Phải đòi email đã xác nhận: nếu Supabase tắt bước xác nhận, ai cũng đăng
//    ký được bằng email của cô giáo khác và nhận quyền của cô ấy.
//
// Chưa chạy supabase/nguoi-soan.sql (chưa có bảng `editors`) thì chỉ còn cách 1,
// đúng như trước.
//
// Mọi route ghi phải tự gọi một hàm require…() ở đây: proxy.ts không chạy cho
// /api/*, và layout chỉ chặn trang.

import { cache } from "react";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/server-client";
import { IMPORT_COOKIE, hasImportAccess, isImportProtected } from "@/lib/importAuth";
import { canEditLesson, normalizeEmail, type Editor } from "@/lib/editorRules";

export type { Editor } from "@/lib/editorRules";

/** Lỗi "chưa có bảng / chưa có cột" — tức là chưa chạy supabase/nguoi-soan.sql. */
export function isMissingSchema(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  return ["42P01", "42703", "PGRST204", "PGRST205"].includes(err.code ?? "") ||
    /does not exist|could not find/i.test(err.message ?? "");
}

export type EditorStatus = {
  editor: Editor | null;
  /** Người đang đăng nhập (nếu có) — để trang khoá nói rõ vì sao chưa vào được. */
  user: { email: string; confirmed: boolean } | null;
  invited: boolean;
  /** Chưa chạy SQL tạo bảng `editors`. */
  setupMissing: boolean;
};

/** Một lần mỗi request (layout, trang và các hàm dưới đều gọi). */
export const editorStatus = cache(async (): Promise<EditorStatus> => {
  const none: EditorStatus = { editor: null, user: null, invited: false, setupMissing: false };
  if (!isImportProtected()) return { ...none, editor: { role: "admin" } };

  const jar = await cookies();
  if (await hasImportAccess(jar.get(IMPORT_COOKIE)?.value)) return { ...none, editor: { role: "admin" } };

  let user: Awaited<ReturnType<typeof getUser>> = null;
  try { user = await getUser(); } catch { /* không có phiên */ }
  if (!user?.email) return none;
  const email = normalizeEmail(user.email);
  const confirmed = !!user.email_confirmed_at;
  const status: EditorStatus = { ...none, user: { email, confirmed } };

  const sb = getSupabaseServer();
  const { data, error } = await sb.from("editors").select("email, user_id").eq("email", email).maybeSingle();
  if (error) return { ...status, setupMissing: isMissingSchema(error) };
  if (!data) return status;
  status.invited = true;
  if (!confirmed) return status;

  // Ghi lại tài khoản của email được mời, để trang quản lý biết bài nào của ai.
  if (data.user_id !== user.id) {
    await sb.from("editors").update({ user_id: user.id }).eq("email", email);
  }
  return { ...status, editor: { role: "teacher", userId: user.id, email } };
});

export async function currentEditor(): Promise<Editor | null> {
  return (await editorStatus()).editor;
}

// ── Chặn route ───────────────────────────────────────────────────────────────

const deny = (status: number, error: string) =>
  ({ response: Response.json({ error }, { status }) }) as const;

type Gate = { editor: Editor; response?: undefined } | { editor?: undefined; response: Response };

/** Quản trị hoặc người soạn được mời. */
export async function requireEditor(): Promise<Gate> {
  const editor = await currentEditor();
  if (!editor) return deny(401, "Cần nhập mật khẩu soạn đề hoặc đăng nhập bằng tài khoản được mời. Vào /import-khoa.");
  return { editor };
}

/** Chỉ người giữ mật khẩu chung. */
export async function requireAdmin(): Promise<Gate> {
  const gate = await requireEditor();
  if (gate.response) return gate;
  if (gate.editor.role !== "admin") return deny(403, "Việc này chỉ người quản trị làm được.");
  return gate;
}

/** Chủ của một bài (`lessons.owner_id`), hoặc `undefined` khi đọc không được. */
async function lessonOwner(lessonId: number): Promise<{ found: boolean; ownerId: string | null } | undefined> {
  const { data, error } = await getSupabaseServer().from("lessons").select("owner_id").eq("id", lessonId).maybeSingle();
  if (error) return undefined;
  return { found: !!data, ownerId: (data as { owner_id?: string | null } | null)?.owner_id ?? null };
}

/** Được sửa bài này: quản trị, hoặc người soạn là chủ bài. */
export async function requireLessonEditor(lessonId: number): Promise<Gate> {
  const gate = await requireEditor();
  if (gate.response || gate.editor.role === "admin") return gate;
  const owner = await lessonOwner(lessonId);
  if (!owner) return deny(500, "Không kiểm tra được ai là người soạn bài này.");
  if (!owner.found) return deny(404, "Không tìm thấy bài học.");
  if (!canEditLesson(gate.editor, owner.ownerId)) {
    return deny(403, "Bài này do người khác soạn — bạn chỉ sửa, xoá được bài của mình.");
  }
  return gate;
}

/**
 * Xoá bài: như sửa, nhưng từ chối luôn khi chưa đặt mật khẩu — xoá không có
 * thùng rác, nên không bao giờ mở cho mọi người.
 */
export async function requireLessonDelete(lessonId: number): Promise<Gate> {
  if (!isImportProtected()) {
    return deny(403, "Chưa đặt mật khẩu soạn đề (IMPORT_PASSWORD) nên chức năng xoá đang khoá.");
  }
  return requireLessonEditor(lessonId);
}

/** Quyền với một bài, cho giao diện (ẩn nút) — API vẫn tự kiểm lại. */
export async function lessonRights(lessonId: number): Promise<{ canEdit: boolean; canDelete: boolean }> {
  const editor = await currentEditor();
  if (!editor) return { canEdit: false, canDelete: false };
  let canEdit = editor.role === "admin";
  if (!canEdit) {
    const owner = await lessonOwner(lessonId);
    canEdit = canEditLesson(editor, owner?.ownerId);
  }
  return { canEdit, canDelete: canEdit && isImportProtected() };
}

/** Trong các bài này, bài nào người này sửa được (trang chương). */
export async function editableLessonIds(editor: Editor, ids: number[]): Promise<Set<number>> {
  if (editor.role === "admin") return new Set(ids);
  if (!ids.length) return new Set();
  const { data, error } = await getSupabaseServer().from("lessons").select("id, owner_id").in("id", ids);
  if (error || !data) return new Set();
  return new Set(
    (data as { id: number; owner_id: string | null }[]).filter((l) => canEditLesson(editor, l.owner_id)).map((l) => l.id),
  );
}
