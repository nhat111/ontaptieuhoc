# Project Overview

## Stack
- Next.js 16 (App Router) · React 19 · TypeScript 5 (strict)
- TailwindCSS 3.4
- Supabase: Postgres + Auth + Storage (`@supabase/supabase-js`, `@supabase/ssr`)
- KaTeX 0.16 (math display)
- Tiptap v3 (rich text in import editor)
- Path alias `@/*` → repo root

## Purpose
**Ôn Tập Tiểu Học** — nền tảng ôn tập / làm bài trắc nghiệm miễn phí cho học sinh tiểu học Việt Nam (Lớp 1–5). Mọi chuỗi UI bằng tiếng Việt.

Làm bài **không bắt buộc đăng nhập**. Đăng nhập (Supabase Auth) để lưu tiến độ và gắn `user_id` vào `quiz_results`.

## Core features (implemented)

| Khu vực | Route | Mô tả ngắn |
|---------|-------|------------|
| Trang chủ | `/` | Chọn lớp, CTA "Xem đề mẫu" → `/de-thi` |
| Lớp / môn | `/lop/[grade]?subject=&view=lesson\|exam` | Tab môn, danh sách chương/bài, bảng xếp hạng |
| Đề kiểm tra (list) | `/de-thi` | Tất cả `lessons.type = 'exam'` theo lớp |
| Quiz | `/quiz?lessonId=N` | Start → trộn (tuỳ chọn) → timer → nộp → `/result` |
| Kết quả | `/result` | Đọc `sessionStorage.quizResult` (không refresh-friendly) |
| Tiến độ | `/progress` | Lịch sử quiz của user đã đăng nhập |
| Nâng cấp | `/nang-cap` | Trang giới thiệu Premium — **hiện không chặn tính năng nào** |
| Tạo bài học | `/import` | `ImportClient` — lesson mới |
| Tạo đề KT | `/import/exam` | Cùng component, `examMode` |
| Sửa bài/đề | `/import/edit/[id]` | Load `GET /api/lesson/[id]`, `POST /api/update-lesson` |
| Dashboard chương | `/import/chapter/[id]` | Tiến độ bài trong chương |
| Giọng đọc | `/import/giong-doc/[id]` | Tải file audio, ghép theo số trong tên file |
| Chẩn đoán | `/import/kiem-tra` | Kết nối Supabase, số dòng, đối chiếu môn code↔DB |
| Mở khoá soạn nội dung | `/import-khoa` | Nhập `IMPORT_PASSWORD` — cố ý nằm ngoài `/import/*` |
| Đăng nhập | `/login`, `/reset-password` | Email + password Supabase |
| Callback | `/auth/callback` | Đổi magic link `code` → session |
| SEO | `/sitemap.xml`, `/robots.txt` | `app/sitemap.ts` (dynamic) + `app/robots.ts` |

## Tính năng ngang (không gắn với một route)

- **Đọc thành tiếng**: 🔊 từng câu + "Nghe cả bài". Ưu tiên file giọng đọc gắn sẵn (`audioUrl`), không có thì dùng giọng máy của trình duyệt. **Không gọi dịch vụ ngoài, không cần key.** → `feature-specs/tts-audio.md`
- **Tải đề để in**: Word (.doc) / PDF, kèm hoặc không kèm đáp án — **mở cho mọi người**.
- **Trộn thứ tự** câu hỏi / đáp án, lưu localStorage, trộn một lần lúc bấm Bắt đầu.
- **Khoá khu soạn nội dung** bằng một mật khẩu chung → `feature-specs/access-control.md`
- **Quét ảnh đề** bằng Claude vision (`POST /api/ocr-exam`) — nút tự ẩn khi chưa cấu hình key.

## NOT implemented (removed or never built)
- `/teacher` — đã bỏ; thêm/sửa câu qua `/import` và `/import/edit/[id]`
- `/import/ai`, `/api/ai-import` — **đã bỏ, đừng dựng lại**. Quét ảnh đề nay ở `POST /api/ocr-exam`, là route riêng chứ không phải hồi sinh surface cũ
- TTS đám mây (`lib/tts.ts`, `/api/tts`) — đã gỡ, hạn mức free quá nhỏ cho cả đề; `git log -- lib/tts.ts` nếu cần lại
- AI tutor, thanh toán tự động, Zustand
- Test suite

## Question types
`mcq` · `multi` · `short` · `numeric` — scoring trong `lib/quizData.ts → scoreAnswer`. Chi tiết encoding `correct_answer` xem `database/schema.md`.

## Environment variables
| Biến | Vai trò |
|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable — browser + SSR session client |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** — mọi API route + SSR data (bypass RLS) |
| `ANTHROPIC_API_KEY` | Server-only — `POST /api/ocr-exam`. Thiếu thì route trả 503 và nút quét ảnh bị ẩn; mọi thứ khác vẫn chạy |
| `IMPORT_PASSWORD` | Server-only — mật khẩu chung khoá `/import*` và mọi API ghi. **Bỏ trống = mở toang** |
| `NEXT_PUBLIC_SITE_URL` | Origin tuyệt đối, không dấu `/` cuối. Thiếu ở production thì canonical/OG trỏ về domain preview |

Copy từ `.env.local.example` → `.env.local`. Trên Vercel nhớ tick đủ cả **Production** lẫn Preview — đặt mỗi Preview là production vẫn hở.

## Offline scripts (`scripts/`)
- `nxbgd-import.mjs` — import khung chương/bài từ API NXBGD
- `nxbgd-import-questions.mjs` — kéo câu hỏi vào `questions` (cần `NXBGD_TOKEN`, service role)
- `check-subjects.mjs` — đối chiếu `lib/subjects.ts` với bảng `subjects` (chỉ đọc)

Schema DB: `schema.sql` (chạy một lần trong Supabase SQL Editor). Một số cột (`lessons.type`, `quiz_results.user_id`, `chapters.source_id`) có thể cần `ALTER` nếu DB mới — xem comment trong `schema.sql` và `CLAUDE.md`.
