/**
 * Chỉ nhận đường dẫn nội bộ ("/progress", "/quiz?lessonId=3") làm đích chuyển
 * hướng sau đăng nhập / sau link email.
 *
 * Không kiểm thì `/login?redirect=https://trang-gia.com` hoặc `//trang-gia.com`
 * đưa người dùng vừa đăng nhập sang trang lừa đảo; ở /auth/callback, ghép
 * `${origin}${next}` với `next=@trang-gia.com` còn thành `https://site@trang-gia.com`.
 */
export function safeNext(value: string | null | undefined, fallback = "/"): string {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  // "//host" và "/\host" đều bị trình duyệt hiểu là sang tên miền khác.
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
