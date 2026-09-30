# Đăng nhập / đăng ký (Supabase Auth)

Tài khoản là **không bắt buộc**: chỉ dùng cho tiến độ học tập (`/progress`, `quiz_results.user_id`). Không liên quan tới khoá soạn đề (`IMPORT_PASSWORD`, xem `access-control.md`).

## File

- `app/login/page.tsx`: 3 tab Đăng nhập / Đăng ký / Quên mật khẩu.
- `app/api/auth/email/route.ts`: đăng ký, quên mật khẩu và gửi lại xác nhận chạy ở server.
- `app/auth/callback/route.ts`: đích của mọi link trong email.
- `app/reset-password/page.tsx`: đặt mật khẩu mới.
- `lib/authErrors.ts → authErrorMessage`: dịch lỗi theo `error.code`, không theo `message`.
- `lib/safeRedirect.ts → safeNext`: chỉ nhận đường dẫn nội bộ cho `?redirect=` / `?next=`, để tránh open redirect.

## Các bẫy đã gặp

- **"Failed to fetch" khi đăng ký / quên mật khẩu, dù thư vẫn tới.** Đây là các lệnh có gửi email; gọi thẳng Supabase từ trình duyệt thì Supabase trả phản hồi mà trình duyệt không đọc được (không có CORS). Giờ các lệnh này đi qua `POST /api/auth/email` ở server, và lỗi thật được ghi trong Vercel → Logs. Chỉ đăng nhập còn gọi Supabase từ trình duyệt.

- **Email đã đăng ký:** `signUp` KHÔNG trả lỗi. Supabase trả `user.identities = []` và không gửi thư (chống dò email). Phải kiểm tra trường hợp này, nếu không trang sẽ báo "kiểm tra email" mà thư không bao giờ tới.
- **Chưa xác nhận email:** lỗi `email_not_confirmed`. Trang hiện nút "Gửi lại email xác nhận" (`auth.resend`).
- **Tắt "Confirm email":** `signUp` trả luôn `session`, nên chuyển trang ngay.
- **Link email mở trên máy khác:** client dùng PKCE, nên `?code=` chỉ đổi được trên đúng trình duyệt đã bấm đăng ký. Mở ở máy khác thì callback về `/login?error=link_expired`. Email vẫn đã được xác nhận (Supabase xác minh trước khi chuyển hướng), nên trang báo "cứ thử đăng nhập". Muốn mở được trên mọi máy thì sửa mẫu email (xem dưới); callback đã hỗ trợ `token_hash`.
- **Mặc định sau đăng nhập về `/`**, không phải `/import`.
- **Giới hạn gửi thư:** SMTP mặc định của Supabase chỉ gửi vài email mỗi giờ cho cả project. Lỗi `over_email_send_rate_limit` đã có câu báo riêng. Khi có nhiều người dùng, gắn SMTP riêng (Resend, Brevo…).

- **504 / 500 lúc đăng ký**: auth-js gộp 502/503/504 với mất mạng vào `AuthRetryableFetchError`. `authErrorMessage` tách riêng theo `status` (0 = mạng, ≥500 = Supabase, thường do gửi email xác nhận lỗi). Trang hiện "Mã lỗi: HTTP 504 · …" nhỏ bên dưới để đối chiếu với Supabase → Logs → Auth.

## Cấu hình trên Supabase Dashboard (Authentication)

1. **URL Configuration**
   - **Site URL** = tên miền thật (trùng `NEXT_PUBLIC_SITE_URL`), **không có dấu `/` ở cuối**; nếu có, `{{ .SiteURL }}/auth/callback` trong mẫu email sẽ thành `//auth/callback`.
   - **Redirect URLs** thêm `https://<tên-miền>/auth/callback` (và `http://localhost:3000/auth/callback` cho dev).
   - Thiếu mục này thì Supabase bỏ qua `emailRedirectTo`, và link trong email trỏ về Site URL (thường là localhost).
2. **Email Templates**: bản tiếng Việt có sẵn trong `supabase/email-templates/` (xem README ở đó). Hoặc tối thiểu: để link mở được trên mọi máy, đổi link trong mẫu:
   - Confirm signup: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email`
   - Reset password: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
