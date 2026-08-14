# Architecture

## Folder structure

```
/app
  page.tsx                    Landing — chọn lớp
  layout.tsx                  Root (KaTeX CSS, metadataBase, OG mặc định)
  sitemap.ts, robots.ts       /sitemap.xml, /robots.txt
  /lop/[grade]                Môn + chương + bài (+ leaderboard)
  /de-thi                     Danh sách đề kiểm tra (type=exam)
  /quiz                       Server fetch → QuizClient
  /result                     Client — sessionStorage
  /progress                   Lịch sử quiz (auth required)
  /nang-cap                   Trang giới thiệu Premium (hiện không chặn gì)
  /login, /reset-password
  /auth/callback              Magic link / OAuth code exchange
  /import-khoa                Nhập mật khẩu khu soạn nội dung — CỐ Ý nằm ngoài /import
  /import
    layout.tsx                **Chốt chặn thật** — redirect /import-khoa khi chưa có quyền
    page.tsx                  Tạo bài học
    exam/                     Tạo đề kiểm tra
    edit/[id]/                Sửa bài/đề
    chapter/[id]/             Dashboard chương (tiến độ bài)
    giong-doc/[id]/           Ghép file giọng đọc vào từng câu
    kiem-tra/                 Chẩn đoán cấu hình (Supabase, đối chiếu môn)
  /api
    chapters                  GET/POST theo (grade, subject) — KHÔNG có /api/subjects
    lesson/[id]               GET — hydrate edit form
    create-lesson, update-lesson
    quiz-result               POST — insert quiz_results (+ user_id nếu có session)
    fetch-exam                GET ?url= — scrape <p> cho paste-import
    upload-image              POST multipart → Storage bucket question-images
    upload-audio              POST multipart → Storage bucket question-audio
    lesson-audio              POST — merge audioUrl vào explanation (read-merge-write)
    ocr-exam                  POST ảnh → Claude vision; GET → { available }
    import-login              POST/GET/DELETE cookie khoá khu soạn nội dung
    me/premium                GET { loggedIn, isPremium } — hiện không ai gọi
    auth/logout

/components
  Header.tsx                  Nav + auth menu
  GradeCard, SubjectTabs, ChapterItem, LessonItem, Sidebar
  MathText.tsx                KaTeX wrapper
  SpeakButton.tsx             🔊 một câu — file gắn sẵn hoặc giọng máy
  Spinner.tsx
  /quiz    QuizClient, QuestionCard, AnswerOption, QuestionPalette, VoicePicker
  /result  ResultSummary, ResultItem
  /import  ImportClient, QuestionCard, PasteImportModal, TiptapEditor,
           AudioMapper, ImportLoginForm

/lib
  db.ts                       Supabase queries (SSR + helpers)
  subjects.ts                 **Danh mục môn tĩnh** — nguồn sự thật duy nhất
  quizData.ts                 Types, scoreAnswer, shuffleQuiz, formatTime
  quizPrefs.ts                Tuỳ chọn trộn câu/đáp án (localStorage)
  exportLesson.ts             Sinh HTML đề để tải Word / in PDF
  examParser.ts               Paste text/HTML → draft questions
  loigiaihayParser.ts         Parser bổ sung (loigiaihay / vietjack)
  optionSplitter.ts           Tách A/B/C/D ra khỏi nội dung khi dán cả cụm
  mathNormalizer.ts           Plain math → LaTeX (paste path)
  focusedEditor.ts            Insert LaTeX vào Tiptap đang focus
  speech.ts                   Web Speech API (giọng máy, miễn phí)
  audioSpeech.ts              Phát file giọng đọc gắn sẵn
  audioFileName.ts            wav_3.wav → câu số 3
  importAuth.ts               Khoá khu soạn nội dung (cookie băm SHA-256)
  premium.ts                  isUserPremium — còn code, hiện không tính năng nào dùng
  siteUrl.ts                  SITE_URL cho sitemap / metadataBase
  nanoid.ts
  /supabase
    server.ts                 getSupabaseServer() — service role
    server-client.ts          createSessionClient(), getUser()
    client.ts                 Browser — auth only

/proxy.ts                     Next 16 middleware rename — CHỈ refresh auth cookie
/schema.sql                   DB definition + seed
/scripts                      NXBGD import + check-subjects (Node, không chạy trong app)
```

## Ba Supabase client — bắt buộc chọn đúng

1. **`getSupabaseServer()`** (`lib/supabase/server.ts`) — service role, bypass RLS. Dùng cho API routes và server components khi **đọc/ghi dữ liệu** (subjects, lessons, questions, quiz_results).
2. **`createSessionClient()` / `getUser()`** (`lib/supabase/server-client.ts`) — cookie SSR. Chỉ khi cần **user hiện tại** (`quiz_results.user_id`, `/progress`). Không query bảng nội dung qua client này (sẽ dính RLS).
3. **`createClient()`** (`lib/supabase/client.ts`) — browser. **Chỉ auth** (login/logout). Upload ảnh/audio qua API service role.

## Chặn truy cập — bẫy đã trả giá một lần

**Không đặt kiểm tra quyền trong `proxy.ts`.** `next build` để `middleware-manifest.json` rỗng ở repo này, nên trên Vercel proxy **không được đăng ký thành Edge Function**: chặn ở đó chạy đúng khi `next start` dưới máy nhưng im lặng vô hiệu khi deploy — trông như đã khoá mà thực ra mở toang. Đã kiểm bằng tay: cùng commit, cùng env, bản production dưới máy redirect, bản preview trên Vercel thì không.

- **Trang**: `app/import/layout.tsx` (cùng runtime với API route, đọc được env trên Vercel).
- **API**: mỗi route ghi tự gọi `blockIfNoImportAccess(req)` — `/api/*` không có layout, và đây mới là chỗ nguy hiểm (`update-lesson` xoá sạch câu hỏi rồi chèn lại).
- Trang nhập mật khẩu ở `/import-khoa`, **ngoài** `/import/*`; để bên trong thì chính nó bị chặn → vòng lặp redirect.
- Chưa đặt `IMPORT_PASSWORD` → mọi cổng đều là no-op, mở như cũ.

## Môn học — danh mục tĩnh, không query bảng

`lib/subjects.ts` là nguồn sự thật duy nhất. Bảng `subjects` chỉ còn là đích FK của `chapters.subject_id`, đối chiếu bằng cặp **(grade, name)** — không bao giờ hard-code id (SERIAL, khác nhau giữa các DB).

- **Đọc**: join lồng `.select('…, subjects!inner(grade, name)')` — thiếu `!inner` là filter không lọc được dòng nào.
- **Ghi**: `ensureSubjectId(grade, name)` (select-or-insert).
- Môn có trong DB mà thiếu trong `lib/subjects.ts` thì **vô hình** trên site. Đối chiếu: `node --env-file=.env.local scripts/check-subjects.mjs`, hoặc mở `/import/kiem-tra` bằng điện thoại.

## State & data flow

- Không Zustand / Redux — `useState`, `sessionStorage`, `localStorage` (draft import, tuỳ chọn trộn, tốc độ đọc), `useSyncExternalStore` cho các giá trị lưu ở localStorage.
- Grade page: môn từ `lib/subjects.ts` → `getChaptersWithLessons(grade, subject, type)` + `getLeaderboardByGrade`.
- Quiz: server prefetch → props `QuizClient`; submit → `POST /api/quiz-result` (best-effort) + `sessionStorage` → `/result`.
- Import: môn từ `lib/subjects.ts` (không gọi API), chương qua `/api/chapters?grade=&subject=`; lưu `/api/create-lesson` hoặc `/api/update-lesson`.

## Next.js 16

- `params` / `searchParams` trong server components là **`Promise`** — luôn `await`.
- `proxy.ts` thay cho tên `middleware` cũ, và **không được deploy** (xem mục chặn truy cập ở trên).
- `getQuestionsFromDB` / `getLessonMetaFromDB` bọc trong React `cache()` vì `/quiz` gọi mỗi hàm hai lần một request (`generateMetadata` + thân trang).

## Data model (tóm tắt)

`subjects → chapters → lessons (type: 'lesson' | 'exam') → questions`

- `lessons.id` = `lessonId` trong URL quiz/import.
- `questions.explanation` là **blob JSON** `{ images, imageUrl, solution, audioUrl }` — không có cột riêng cho ảnh/audio/lời giải. Dòng cũ có thể chỉ có `{ imageUrl }`.
- `lessons.duration_minutes` (default 15) — timer quiz sau khi user bấm Start.

## Conventions

- SSR fetch: `try/catch` → `[]` / `null`, không crash trang.
- User-facing strings: tiếng Việt.
- Indent 2 spaces.
- `(data as any)` tồn tại vài chỗ vì generated types thiếu cột `type` — không lan rộng thêm.
