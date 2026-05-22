# Architecture

## Folder Structure

```
/app                        Next.js App Router pages + API routes
  /api
    /subjects               GET ?grade=N → Subject[]
    /chapters               GET ?subjectId=N → Chapter[]
    /create-lesson          POST → create lesson + questions in Supabase
    /ai-import              POST → call Anthropic API server-side, return parsed questions
    /fetch-exam             GET ?url=... → scrape URL, return plain text
  /lop/[grade]              Grade/subject page (server component)
  /quiz                     Quiz page (server shell + QuizClient)
  /result                   Result page (client, reads sessionStorage)
  /import                   Manual import/create lesson page
  /import/ai                AI-powered import page (image / file / URL → Claude → questions)
  /teacher                  Teacher question editor (add questions to existing lesson)
  layout.tsx                Root layout (KaTeX CSS loaded here)
  page.tsx                  Home — grade selector

/components                 Shared UI
  Header.tsx                Nav: Home · Lớp 1–5 · Tạo bài · Teacher
  GradeCard.tsx
  ChapterItem.tsx
  Sidebar.tsx
  SubjectTabs.tsx
  MathText.tsx              KaTeX renderer wrapper
  LessonItem.tsx
  /quiz
    QuizClient.tsx          Main quiz state machine (client)
    QuestionCard.tsx
    AnswerOption.tsx
    QuestionPalette.tsx
  /result
    ResultSummary.tsx
    ResultItem.tsx
  /import
    ImportClient.tsx        Full import/create-lesson UI (client)
    QuestionCard.tsx        Question editor card in import
    PasteImportModal.tsx    Paste raw text → parse into questions
    TiptapEditor.tsx        Rich text / math editor
  /teacher
    QuestionEditor.tsx      Reusable question editor card (used by /teacher page)

/lib
  db.ts                     All Supabase queries (server + client)
  quizData.ts               Types: Question, LessonMeta, QuizResult
  examParser.ts             Parse pasted exam text → DraftQuestion[]
  mathNormalizer.ts         Normalize plain-text math to KaTeX format
  focusedEditor.ts          Insert LaTeX into currently-focused editor
  nanoid.ts                 Tiny ID generator
  supabase/
    client.ts               Browser Supabase client
    server.ts               Server Supabase client
```

## Rules
- Server components fetch from Supabase directly via `lib/db.ts`
- Client components fetch via `/api/...` routes or `lib/db.ts` client functions
- No global state library — local React state + sessionStorage + localStorage only
- No `/modules` or `/services` folders
- Anthropic API is called exclusively server-side via `/api/ai-import` (key never in client bundle)

## Data Flow
- Grade page: Server → `getSubjectsByGrade` + `getChaptersWithLessons` → rendered HTML
- Quiz page: Server prefetches questions + lesson meta → passed as props to `QuizClient` (single source of truth)
- Import page: Client fetches `/api/subjects`, `/api/chapters`; saves via `/api/create-lesson`
- AI import page: Client sends image/text/url → `/api/ai-import` → Claude → parsed questions; saves via `/api/create-lesson`
- Teacher page: Client reads subjects/chapters/lessons directly from Supabase client; inserts questions directly
- Quiz result: Stored in `sessionStorage` as JSON → read by `/result` page
