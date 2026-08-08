# Current State

_Last synced with codebase: May 2026_

## Done

### Browse & quiz
- Home: thẻ lớp 1–5, link `/de-thi`
- `/lop/[grade]`: tab môn (`?subject=`), toggle bài tập / đề KT (`?view=lesson|exam`), accordion chương, sidebar bảng xếp hạng (top 10, email mask `abc***`)
- `/de-thi`: list động `lessons` với `type='exam'`
- `/quiz`: Start screen → timer theo `duration_minutes` → 4 loại câu → palette → nộp
- **Nghe**: nút 🔊 từng câu, và **"Nghe cả bài"** đọc liền mạch cả đề (xướng "Câu N", tự cuộn tới câu đang đọc). Tốc độ Chậm/Vừa/Nhanh lưu ở localStorage, mặc định 0.7. Web Speech API của trình duyệt — miễn phí, không cần key
- `/result`: breakdown điểm, làm lại, quay lại `/lop/[grade]` (breadcrumb lấy `grade`/`subjectName` từ payload `sessionStorage`)
- `POST /api/quiz-result`: ghi `quiz_results` (+ `user_id` nếu đăng nhập)

### Auth & progress
- `/login`, `/reset-password`, `/auth/callback`
- Header: menu user, link `/progress`, đăng xuất
- `/progress`: lịch sử 100 lần làm gần nhất (cần login)

### Import / content
- `/import`, `/import/exam`, `/import/edit/[id]` — `ImportClient` + Tiptap + paste modal + upload ảnh
- `/import/chapter/[id]` — dashboard tiến độ bài trong chương
- `/import/kiem-tra` — trang chẩn đoán (kết nối Supabase, số dòng mỗi bảng, đối chiếu môn code↔DB). Bản web của `scripts/check-subjects.mjs`, dùng khi chỉ có điện thoại
- API: chapters (GET/POST, theo `grade`+`subject`), lesson/[id], create-lesson, update-lesson, fetch-exam, upload-image, ocr-exam, auth/logout — **không còn `/api/subjects`**
- Tạo bài/đề: **chương là tuỳ chọn** — bắt buộc chỉ còn môn + tên + câu hỏi. Không chọn chương thì máy chủ gom vào chương mặc định của môn (`ensureDefaultChapterId`), vì `lessons.chapter_id` NOT NULL và trang lớp nhóm bài theo chương
- `localStorage` draft: `ontap_import_draft_v1` / `ontap_exam_draft_v1` (debounce 500ms, tắt khi edit)
- KaTeX qua `MathText`; cheat-sheet LaTeX + `focusedEditor`
- **Quét ảnh đề**: nút trong `PasteImportModal` → `POST /api/ocr-exam` (Claude vision `claude-opus-5`, output theo `json_schema`). Đọc được cả đáp án khoanh bút; không thấy dấu khoanh thì trả `correctIndex: -1` và báo người dùng tự tick. Cần `ANTHROPIC_API_KEY` — chưa cấu hình thì `GET /api/ocr-exam` trả `{available:false}` và nút bị **ẩn hẳn**, không ai bấm vào lỗi.

### SEO
- `app/sitemap.ts` (`/sitemap.xml`, dynamic) + `app/robots.ts` (`/robots.txt`)
- `metadataBase` + title template `%s · Ôn Tập Tiểu Học` + OG/Twitter mặc định trong `app/layout.tsx`
- `generateMetadata` cho `/lop/[grade]` (theo môn + `view=exam`, canonical bỏ môn mặc định) và `/quiz` (bài 0 câu → `noindex`)
- Trang editor/tài khoản (`/import*`, `/progress`, `/nang-cap`) → `robots: { index: false }`
- Base URL qua `lib/siteUrl.ts` (`NEXT_PUBLIC_SITE_URL` → `VERCEL_*` → localhost)

### Môn học (static)
- `lib/subjects.ts` là nguồn sự thật duy nhất — khai báo trong code, không query bảng `subjects`
- Bảng `subjects` chỉ còn là đích FK của `chapters.subject_id`, đối chiếu bằng cặp (grade, name)
- Đọc: join lồng `subjects!inner` · Ghi: `ensureSubjectId(grade, name)` (select-or-insert)
- Trang chủ + tab `/lop/[grade]` + sitemap + dropdown import đều đọc chung danh mục này
- Đối chiếu code ↔ DB: `node --env-file=.env.local scripts/check-subjects.mjs`

### Data & ops
- Supabase: subjects, chapters, lessons, questions, quiz_results, Storage `question-images`
- Scripts NXBGD: `scripts/nxbgd-import.mjs`, `scripts/nxbgd-import-questions.mjs`
- `scripts/check-subjects.mjs`: so danh mục môn trong code với DB (chỉ đọc)
- `schema.sql` + cột mở rộng (`type`, `source_id`, `duration_minutes`, …)

## Not done / deferred

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
