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
| Quiz | `/quiz?lessonId=N` | Màn hình Start → timer → nộp → `/result` |
| Kết quả | `/result` | Đọc `sessionStorage.quizResult` (không refresh-friendly) |
| Tiến độ | `/progress` | Lịch sử quiz của user đã đăng nhập |
| Tạo bài học | `/import` | `ImportClient` — lesson mới |
| Tạo đề KT | `/import/exam` | Cùng component, `examMode` |
| Sửa bài/đề | `/import/edit/[id]` | Load `GET /api/lesson/[id]`, `POST /api/update-lesson` |
| Dashboard chương | `/import/chapter/[id]` | Tiến độ bài trong chương (admin/import) |
| Đăng nhập | `/login`, `/reset-password` | Email + password Supabase |
| Callback | `/auth/callback` | Đổi magic link `code` → session |

## NOT implemented (removed or never built)
- `/teacher` — đã bỏ; thêm/sửa câu qua `/import` và `/import/edit/[id]`
- `/import/ai`, `/api/ai-import` — chưa có (chỉ có `ANTHROPIC_API_KEY` trong `.env.local.example` để dùng sau)
- AI tutor, subscription, Zustand

## Question types
`mcq` · `multi` · `short` · `numeric` — scoring trong `lib/quizData.ts → scoreAnswer`. Chi tiết encoding `correct_answer` xem `database/schema.md`.

## Environment variables
| Biến | Vai trò |
|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable — browser + SSR session client |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** — mọi API route + SSR data (bypass RLS) |
| `ANTHROPIC_API_KEY` | Tùy chọn, chưa dùng trong app |

Copy từ `.env.local.example` → `.env.local`.

## Offline scripts (`scripts/`)
- `nxbgd-import.mjs` — import khung chương/bài từ API NXBGD
- `nxbgd-import-questions.mjs` — kéo câu hỏi vào `questions` (cần `NXBGD_TOKEN`, service role)

Schema DB: `schema.sql` (chạy một lần trong Supabase SQL Editor). Một số cột (`lessons.type`, `quiz_results.user_id`) có thể đã có trên production nhưng cần `ALTER` nếu DB mới — xem comment trong `schema.sql` và `CLAUDE.md`.
