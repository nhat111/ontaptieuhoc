# AI Context — Ôn Tập Cùng Con

Tài liệu ngắn cho agent/LLM khi làm việc trong repo. **Nguồn chính xác nhất cho chi tiết sâu:** `CLAUDE.md` ở root. **Quy tắc codegen:** `.claude/skills/gen-code-ontaptieuhoc/SKILL.md`.

## Đọc theo task

| Task | Files |
|------|--------|
| Tổng quan / stack | `project-overview.md` |
| Cấu trúc thư mục, Supabase clients | `architecture.md` |
| Đã làm / chưa làm / **việc tiếp theo** | `current-state.md` |
| UI / Tailwind | `ui-rules.md` |
| Quiz, timer, scoring, trộn câu | `feature-specs/quiz.md`, `flows/quiz-submission.md` |
| Import, paste, tách A/B/C/D, quét ảnh đề | `feature-specs/import.md` |
| Đề kiểm tra, tải đề để in | `feature-specs/exam.md` |
| **Tạo đề nhanh** (`/tao-de`), đề lớp 5 giống đề thật, lộ trình các khối khác | `feature-specs/quick-exam.md` |
| Trang lớp, leaderboard | `feature-specs/lesson.md` |
| Toán theo từng bài sách (ví dụ giải mẫu, Kiểm tra, lời văn) | `feature-specs/toan-kntt.md` + `CLAUDE.md` |
| Đọc thành tiếng, giọng gắn sẵn | `feature-specs/tts-audio.md` |
| **Khoá `/import` + API ghi** | `feature-specs/access-control.md` |
| Đăng nhập / đăng ký / quên mật khẩu | `feature-specs/auth.md` |
| Auth, progress | `flows/auth-flow.md` |
| DB columns, encoding đáp án, blob `explanation` | `database/schema.md` |
| RLS / service role | `database/rls-rules.md` |
| Import NXBGD CLI | `scripts/nxbgd-import.md` |

## Ba cái dễ sai nhất

1. **Đừng chặn quyền trong `proxy.ts`** — trên Vercel nó không được đăng ký, chặn ở đó là khoá giả. → `feature-specs/access-control.md`
2. **`lib/subjects.ts` là nguồn sự thật về môn học**, không query bảng `subjects`. Môn có trong DB mà thiếu trong file này thì vô hình. → `architecture.md`
3. **`correct_answer` mã hoá theo từng `type`** — sai là chấm điểm lệch mà không báo lỗi. → `database/schema.md`

## Cập nhật lần cuối
Oct 2026 (cuối tháng) — xoá bài/đề/chương, tăng tốc truy vấn, Tiếng Việt theo chủ điểm lớp 4–5, Toán theo sách: ví dụ giải mẫu, nút Kiểm tra, lời văn lớp 5 trình bày "Bài giải". **Việc tiếp theo: `current-state.md`.**
Oct 2026 — Tạo đề nhanh (`/tao-de`, nút nổi trang chủ), đề Toán + Tiếng Việt lớp 5 theo cấu trúc đề thật có hình vẽ (`lib/exam5/`); lộ trình tiếp theo ở `feature-specs/quick-exam.md`.
Aug 2026 — thêm khoá `IMPORT_PASSWORD`, TTS + giọng đọc gắn sẵn, quét ảnh đề (`/api/ocr-exam`), SEO/sitemap, môn học static, chương tuỳ chọn, mở tải đề cho mọi người.
