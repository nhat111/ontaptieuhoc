# AI Context — Ôn Tập Phổ Thông

Tài liệu ngắn cho agent/LLM khi làm việc trong repo. **Nguồn chính xác nhất cho chi tiết sâu:** `CLAUDE.md` ở root. **Quy tắc codegen:** `.claude/skills/gen-code-ontaptieuhoc/SKILL.md`.

## Đọc theo task

| Task | Files |
|------|--------|
| Tổng quan / stack | `project-overview.md` |
| Cấu trúc thư mục, Supabase clients | `architecture.md` |
| Đã làm / chưa làm | `current-state.md` |
| UI / Tailwind | `ui-rules.md` |
| Quiz, timer, scoring, trộn câu | `feature-specs/quiz.md`, `flows/quiz-submission.md` |
| Import, paste, tách A/B/C/D, quét ảnh đề | `feature-specs/import.md` |
| Đề kiểm tra, Kho đề `/de-thi` (lọc, thẻ đề), tải đề để in | `feature-specs/exam.md` |
| **Tạo đề nhanh** (`/tao-de`), đề Toán 1–5 + TV5 giống đề thật, **việc tiếp theo (Tiếng Việt lớp 4)** | `feature-specs/quick-exam.md` |
| Trang lớp, leaderboard | `feature-specs/lesson.md` |
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
Oct 2026 (sau) — Toán lớp 1–4 theo cấu trúc đề thật có hình vẽ (`lib/exam5/toan1to4.ts`, check `scripts/exam14-check.ts`, PR #83); làm lại `/de-thi` có lọc lớp/môn/tìm kiếm (PR #84). Việc tiếp theo: Tiếng Việt lớp 4 — kế hoạch ở `feature-specs/quick-exam.md`.
Oct 2026 — Tạo đề nhanh (`/tao-de`, nút nổi trang chủ), đề Toán + Tiếng Việt lớp 5 theo cấu trúc đề thật có hình vẽ (`lib/exam5/`); lộ trình tiếp theo ở `feature-specs/quick-exam.md`.
Aug 2026 — thêm khoá `IMPORT_PASSWORD`, TTS + giọng đọc gắn sẵn, quét ảnh đề (`/api/ocr-exam`), SEO/sitemap, môn học static, chương tuỳ chọn, mở tải đề cho mọi người.
