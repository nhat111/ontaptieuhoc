# Mẫu email Supabase Auth (tiếng Việt)

Dán vào Supabase Dashboard → Authentication → Emails → Templates. Supabase không đọc thư mục này; nó chỉ để lưu bản gốc.

| Mẫu trong Dashboard | Tiêu đề (Subject) | Nội dung (Body) |
|---|---|---|
| Confirm signup | `Xác nhận email – Ôn Tập Cùng Con` | `confirm-signup.html` |
| Reset password | `Đặt lại mật khẩu – Ôn Tập Cùng Con` | `reset-password.html` |

- Link dùng `token_hash`, nên mở được trên mọi máy (xem `app/auth/callback/route.ts`).
- **Site URL không được có `/` ở cuối.** Nếu có, link sẽ thành `…app//auth/callback`.
- Tên người gửi ("Supabase Auth") và địa chỉ gửi chỉ đổi được khi gắn SMTP riêng: Authentication → Emails → SMTP Settings.
