# Current State

## Done

- Home page: grade cards (Lớp 1–5) with emoji, subject list, color themes
- Grade page (`/lop/[grade]`): subject tabs + chapter/lesson accordion from Supabase
- Quiz page (`/quiz?lessonId=N`): 15-min timer, question palette, submit → result
- Result page (`/result`): score breakdown, per-question review, retry/back buttons
- Import page (`/import`): create lesson + questions, paste-import from raw text, KaTeX, localStorage draft autosave
- AI import page (`/import/ai`): parse questions from image / PDF+Word file / URL via Claude API (server-side via `/api/ai-import`)
- Teacher page (`/teacher`): add questions to an existing lesson; cascade selectors (grade → subject → chapter → lesson)
- API routes: `/api/subjects`, `/api/chapters`, `/api/create-lesson`, `/api/ai-import`, `/api/fetch-exam`
- Supabase integration: subjects, chapters, lessons, questions, quiz_results
- Math rendering: KaTeX via `MathText` component, LaTeX cheatsheet in import sidebar
- Tiptap v3 editor in import flow

## Not Done / Not Started

- Authentication (no Supabase Auth, no login/register pages)
- User accounts / profiles
- Progress tracking per user
- Subscriptions / paywall
- AI tutor
- Zustand or any global state management

## Known Structure Notes

- Quiz questions come exclusively from Supabase DB (server-fetched as props to `QuizClient`) — no localStorage fallback
- `quiz_results` table: inserts score/total per lesson but no user identity (no auth)
- AI import (`/import/ai`) requires `ANTHROPIC_API_KEY` in `.env.local`; calls are server-side only
- Teacher page (`/teacher`) adds questions to an *existing* lesson; Import page (`/import`) *creates* a new lesson — they are complementary, not duplicates
- `components/teacher/QuestionEditor.tsx` is the shared editor component used by `/teacher`
