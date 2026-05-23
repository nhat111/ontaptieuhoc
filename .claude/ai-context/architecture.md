# Architecture

## Folder structure

```
/app
  page.tsx                    Landing — chọn lớp
  layout.tsx                  Root (KaTeX CSS)
  /lop/[grade]                Môn + chương + bài (+ leaderboard)
  /de-thi                     Danh sách đề kiểm tra (type=exam)
  /quiz                       Server fetch → QuizClient
  /result                     Client — sessionStorage
  /progress                   Lịch sử quiz (auth required)
  /login, /reset-password
  /auth/callback              Magic link / OAuth code exchange
  /import                     Tạo bài học
  /import/exam                Tạo đề kiểm tra
  /import/edit/[id]           Sửa bài/đề
  /import/chapter/[id]        Dashboard chương (tiến độ bài)
  /api
    subjects, chapters        GET/POST cascade cho import
    lesson/[id]               GET — hydrate edit form
    create-lesson, update-lesson
    quiz-result               POST — insert quiz_results (+ user_id nếu có session)
    fetch-exam                GET ?url= — scrape <p> cho paste-import
    upload-image              POST multipart → Storage bucket question-images
    auth/logout

/components
  Header.tsx                  Nav + auth menu
  GradeCard, SubjectTabs, ChapterItem, LessonItem, Sidebar
  MathText.tsx                KaTeX wrapper
  Spinner.tsx
  /quiz    QuizClient, QuestionCard, AnswerOption, QuestionPalette
  /result  ResultSummary, ResultItem
  /import  ImportClient, QuestionCard, PasteImportModal, TiptapEditor

/lib
  db.ts                       Supabase queries (SSR + helpers)
  quizData.ts                 Types, scoreAnswer, formatTime
  examParser.ts               Paste text/HTML → draft questions
  loigiaihayParser.ts         Parser bổ sung (loigiaihay)
  mathNormalizer.ts           Plain math → LaTeX (paste path)
  focusedEditor.ts            Insert LaTeX vào Tiptap đang focus
  nanoid.ts
  /supabase
    server.ts                 getSupabaseServer() — service role
    server-client.ts          createSessionClient(), getUser()
    client.ts                 Browser — auth only

/proxy.ts                     Next.js 16 middleware rename — refresh auth cookies trên /import/*
/schema.sql                   DB definition + seed
/scripts                      NXBGD import (Node, không chạy trong app)
```

## Ba Supabase client — bắt buộc chọn đúng

1. **`getSupabaseServer()`** (`lib/supabase/server.ts`) — service role, bypass RLS. Dùng cho API routes và server components khi **đọc/ghi dữ liệu** (subjects, lessons, questions, quiz_results).
2. **`createSessionClient()` / `getUser()`** (`lib/supabase/server-client.ts`) — cookie SSR. Chỉ khi cần **user hiện tại** (`quiz_results.user_id`, `/progress`). Không query bảng nội dung qua client này (sẽ dính RLS).
3. **`createClient()`** (`lib/supabase/client.ts`) — browser. **Chỉ auth** (login/logout). Upload ảnh qua `/api/upload-image` (service role).

## State & data flow

- Không Zustand / Redux — `useState`, `sessionStorage`, `localStorage` (draft import).
- Grade page: server → `getSubjectsByGrade` + `getChaptersWithLessons` + `getLeaderboardByGrade`.
- Quiz: server prefetch → props `QuizClient`; submit → `POST /api/quiz-result` (best-effort) + `sessionStorage` → `/result`.
- Import: client gọi `/api/subjects`, `/api/chapters`; lưu `/api/create-lesson` hoặc `/api/update-lesson`.
- `proxy.ts`: matcher `/import/:path*`, gọi `auth.getUser()` để rotate token — **không chặn guest**.

## Next.js 16

- `params` / `searchParams` trong server components là **`Promise`** — luôn `await`.
- `proxy.ts` thay cho tên `middleware` cũ.

## Data model (tóm tắt)

`subjects → chapters → lessons (type: 'lesson' | 'exam') → questions`

- `lessons.id` = `lessonId` trong URL quiz/import.
- `questions.explanation` có thể chứa JSON `{ "imageUrl": "..." }`.
- `lessons.duration_minutes` (default 15) — timer quiz sau khi user bấm Start.

## Conventions

- SSR fetch: `try/catch` → `[]` / `null`, không crash trang.
- User-facing strings: tiếng Việt.
- Indent 2 spaces.
- `(data as any)` tồn tại vài chỗ vì generated types thiếu cột `type` — không lan rộng thêm.
