# Current State

_Last synced with codebase: May 2026_

## Done

### Browse & quiz
- Home: thẻ lớp 1–5, link `/de-thi`
- `/lop/[grade]`: tab môn (`?subject=`), toggle bài tập / đề KT (`?view=lesson|exam`), accordion chương, sidebar bảng xếp hạng (top 10, email mask `abc***`)
- `/de-thi`: list động `lessons` với `type='exam'`
- `/quiz`: Start screen → timer theo `duration_minutes` → 4 loại câu → palette → nộp
- `/result`: breakdown điểm, làm lại, về trang chủ
- `POST /api/quiz-result`: ghi `quiz_results` (+ `user_id` nếu đăng nhập)

### Auth & progress
- `/login`, `/reset-password`, `/auth/callback`
- Header: menu user, link `/progress`, đăng xuất
- `/progress`: lịch sử 100 lần làm gần nhất (cần login)

### Import / content
- `/import`, `/import/exam`, `/import/edit/[id]` — `ImportClient` + Tiptap + paste modal + upload ảnh
- `/import/chapter/[id]` — dashboard tiến độ bài trong chương
- API: subjects, chapters (GET/POST), lesson/[id], create-lesson, update-lesson, fetch-exam, upload-image, auth/logout
- `localStorage` draft: `ontap_import_draft_v1` / `ontap_exam_draft_v1` (debounce 500ms, tắt khi edit)
- KaTeX qua `MathText`; cheat-sheet LaTeX + `focusedEditor`

### Data & ops
- Supabase: subjects, chapters, lessons, questions, quiz_results, Storage `question-images`
- Scripts NXBGD: `scripts/nxbgd-import.mjs`, `scripts/nxbgd-import-questions.mjs`
- `schema.sql` + cột mở rộng (`type`, `source_id`, `duration_minutes`, …)

## Not done / deferred

- AI import (`/import/ai`, Claude) — env có placeholder, route chưa có
- AI tutor, subscription
- Test suite (`npm run lint` only; `tsc --noEmit` thủ công)
- Enforce `lessons.status` locked/completed trên UI (DB có, app chủ yếu dùng `active`)

## Removed / obsolete docs

- **`/teacher`** — không còn trong repo; dùng `/import/edit/[id]` để sửa bài có sẵn
- File `feature-specs/teacher.md` đã xóa — xem `feature-specs/import.md`

## Known notes

- Quiz data: chỉ từ DB qua server props — không fallback localStorage khi làm bài
- Refresh `/quiz` → về màn Start (timer không persist)
- Refresh `/result` không có `sessionStorage` → redirect `/`
- Guest vẫn làm quiz; `quiz_results.user_id` = null
- Leaderboard cần service role + `auth.admin.listUsers`
