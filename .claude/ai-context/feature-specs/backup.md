# Sao lưu DB

`.github/workflows/backup.yml` chạy mỗi đêm lúc 02:17 giờ Việt Nam (hoặc bấm tay:
Actions → "Sao lưu DB" → Run workflow). Nó `pg_dump` schema `public` (chương, bài,
câu hỏi, kết quả, góp ý, người soạn, thống kê), nén gzip, mã hoá gpg AES256 rồi lưu
làm artifact **30 ngày**.

Không có trong bản sao: tài khoản đăng nhập (`auth.users`) và file trong Storage
(ảnh, giọng đọc). Ảnh/giọng đọc không bị xoá khi xoá bài nên vẫn còn trên Supabase.

## Bật lần đầu (chủ site làm một lần)

1. Supabase → project → **Connect** → chọn **Session pooler**, chép chuỗi
   `postgresql://postgres.<ref>:<mật khẩu DB>@aws-…pooler.supabase.com:5432/postgres`.
   Không dùng "Direct connection": nó chỉ có IPv6, máy GitHub không gọi tới được.
2. GitHub → repo → Settings → Secrets and variables → Actions → New repository secret:
   - `SUPABASE_DB_URL` = chuỗi ở bước 1
   - `BACKUP_PASSPHRASE` = một mật khẩu dài tự đặt. **Cất nó ngoài GitHub** (trình quản
     lý mật khẩu, sổ tay): mất nó là mất luôn các bản sao lưu.
3. Actions → "Sao lưu DB" → Run workflow, chờ xanh, mở lần chạy thấy artifact
   `db-<ngày>.sql.gz.gpg`.

Thiếu secret thì job chỉ cảnh báo và kết thúc xanh. Bản dump dưới 2 KB thì job đỏ
(nhiều khả năng đã hỏng). Lỗi `server version mismatch` = Supabase đã lên Postgres mới
hơn 17: đổi `postgresql-client-17` trong workflow sang số mới.

## Khôi phục

```bash
gpg -d db-2026-10-25.sql.gz.gpg | gunzip > db.sql   # hỏi BACKUP_PASSPHRASE
```

- **Mất sạch / project mới**: tạo project Supabase mới, `psql "<chuỗi kết nối>" -f db.sql`
  (dòng `schema "public" already exists` là bình thường). Bảng có khoá ngoại tới
  `auth.users` (`quiz_results.user_id`, `editors.user_id`, `lessons.owner_id`) sẽ trỏ tới
  tài khoản không còn — kết quả/bài vẫn còn, chỉ mất liên kết người dùng.
- **Lỡ xoá một bài / chương**: đừng chạy cả file vào DB đang chạy. Khôi phục vào một DB
  tạm (project phụ hoặc Postgres trên máy), rồi chép đúng các dòng `chapters`/`lessons`/
  `questions` cần lấy lại sang DB thật (giữ nguyên `id`).
