// Quy tắc quyền của khu soạn đề — hàm thuần, không đọc cookie hay DB, để test được.
// Phần đọc phiên đăng nhập / cookie nằm ở lib/editorAuth.ts.
//
// Hai vai:
// • admin   — người nhập mật khẩu chung IMPORT_PASSWORD (hoặc mọi người, khi chưa
//             đặt mật khẩu: giữ nguyên cách site chạy trước đây).
// • teacher — người đăng nhập bằng email đã xác nhận và có trong bảng `editors`.
//             Tạo được bài, chương; chỉ sửa / xoá bài của chính mình.

export type Editor =
  | { role: "admin" }
  | { role: "teacher"; userId: string; email: string };

/** Email so khớp không phân biệt hoa thường, bỏ khoảng trắng hai đầu. */
export function normalizeEmail(s: string): string {
  return s.trim().toLowerCase();
}

/** Đủ dạng một email (không cố kiểm chặt — Supabase sẽ kiểm khi đăng ký). */
export function looksLikeEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(s));
}

/**
 * Danh sách email dán vào ô "Mời người soạn": ngăn bằng xuống dòng, dấu phẩy,
 * chấm phẩy hay khoảng trắng — chép từ Zalo, Excel đều được. Bỏ trùng.
 */
export function parseEmailList(text: string): { emails: string[]; invalid: string[] } {
  const emails: string[] = [];
  const invalid: string[] = [];
  for (const raw of text.split(/[\s,;]+/)) {
    if (!raw) continue;
    const e = normalizeEmail(raw);
    if (!looksLikeEmail(e)) invalid.push(raw);
    else if (!emails.includes(e)) emails.push(e);
  }
  return { emails, invalid };
}

/** Bài có `ownerId` (NULL = bài của quản trị / bài cũ) — người này sửa, xoá được không. */
export function canEditLesson(editor: Editor | null, ownerId: string | null | undefined): boolean {
  if (!editor) return false;
  if (editor.role === "admin") return true;
  return !!ownerId && ownerId === editor.userId;
}

/** Chủ của bài vừa tạo: người soạn thì là chính họ, quản trị thì để trống. */
export function ownerForNewLesson(editor: Editor): string | null {
  return editor.role === "teacher" ? editor.userId : null;
}

export const isAdmin = (e: Editor | null): e is { role: "admin" } => e?.role === "admin";
