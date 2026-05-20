# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Ôn Tập Tiểu Học** — a Vietnamese free online quiz platform for primary school students (grades 1–5). All user-facing strings are in Vietnamese; preserve language and tone when editing UI text.

Stack: **Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind v3 · Supabase (auth + Postgres + Storage) · Tiptap · KaTeX**. Path alias `@/*` resolves to the repo root.

## Commands

```bash
npm run dev      # next dev (localhost:3000)
npm run build    # next build
npm run start    # next start (after build)
npm run lint     # next lint
```

No test suite is configured. There is no script for type-checking; `tsc --noEmit` works if you need it (`noEmit: true` is already set in `tsconfig.json`).

## Environment

Copy `.env.local.example` → `.env.local`. Three of the four vars are required for anything to work:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — anon/publishable, used by browser + session clients.
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only, bypasses RLS**. Used by every API route and SSR data fetch.
- `ANTHROPIC_API_KEY` — only needed if/when AI-powered exam import is added (mentioned in example but no `/import/ai` route currently exists).

DB schema lives in `schema.sql` — run it once in the Supabase SQL editor to provision tables and seed sample data. Note: the seeded `subjects` block resets the SERIAL, so sample chapter inserts use hard-coded subject id `61` (last seeded row). When working with the schema, also be aware that `lessons.type` (`'lesson' | 'exam'`, plus legacy NULL) is **referenced everywhere but not in `schema.sql`** — it exists in production. Add it with `ALTER TABLE lessons ADD COLUMN type TEXT;` if seeding a fresh DB. `quiz_results.user_id` is similarly referenced (nullable FK to `auth.users`) but missing from schema.sql.

## Architecture

### Three Supabase clients — pick the right one

The codebase uses three distinct Supabase wrappers and mixing them up causes auth and RLS bugs:

1. **`lib/supabase/server.ts` → `getSupabaseServer()`** — service-role client. Bypasses RLS. Use in API routes and server components for **data access** (subjects/chapters/lessons/questions/quiz_results reads & writes). No session, no cookies.
2. **`lib/supabase/server-client.ts` → `createSessionClient()` / `getUser()`** — SSR cookie-bound client using `@supabase/ssr`. Use **only when you need the current user** (e.g., `quiz_results.user_id`, `progress` page). Don't query data tables through this; queries hit RLS.
3. **`lib/supabase/client.ts` → `createClient()` / `supabase`** — browser client. Used for auth (login/logout/sign-up) and `question-images` storage uploads from `QuestionCard`.

### Next.js 16 quirks

- **`proxy.ts` at the repo root is Next.js 16's renamed middleware** (`export async function proxy` + `export const config = { matcher }`). It guards `/import/*`, redirecting unauthenticated users to `/login?redirect=<original>`. Edit this file — not a `middleware.ts` — when changing route protection.
- `searchParams` and `params` in server components are `Promise<...>` — always `await` them (see `app/quiz/page.tsx`, `app/lop/[grade]/page.tsx`).

### Data model

`subjects (per grade) → chapters → lessons (type 'lesson' | 'exam') → questions`. `lessons.id` is the URL identifier everywhere (`/quiz?lessonId=X`, `/import/edit/[id]`). `questions.options` is a JSONB array of 4 strings; `correct_answer` is the string value (not an index) that must match one of `options`. `questions.explanation` is reused as a JSON blob to carry `{ imageUrl }` for image attachments — there is no dedicated image column.

### Page routes

- `/` — landing, grade picker.
- `/lop/[grade]?subject=...&view=lesson|exam` — server-rendered subject tabs + chapters + leaderboard sidebar.
- `/quiz?lessonId=X` — timed quiz (15 min, fixed). Server loads questions, client manages answers + timer, posts to `/api/quiz-result`, stashes payload in `sessionStorage.quizResult`, redirects to `/result`.
- `/result` — reads `sessionStorage.quizResult`. Pure client component; never refresh-friendly.
- `/progress` — authenticated user's quiz history.
- `/import`, `/import/exam`, `/import/edit/[id]` — all render `ImportClient` with different `examMode` / `initialData` props. Auth-protected via `proxy.ts`.
- `/login`, `/reset-password`, `/auth/callback` — Supabase email-password auth + magic-link callback that exchanges `code` for a session.

### API routes (`app/api/*`)

All use the service-role client unless noted:

- `GET /api/subjects?grade=N`, `GET|POST /api/chapters` — used by the import form's cascading dropdowns.
- `GET /api/lesson/[id]` — returns lesson + questions normalized into the `QDraft` shape (4-option array, `correctIdx`, optional `imageUrl` extracted from `explanation` JSON).
- `POST /api/create-lesson`, `POST /api/update-lesson` — write lesson + replace all questions (update wipes and reinserts).
- `POST /api/quiz-result` — uses **both** clients: session client to look up `user.id` (nullable for guests), service-role client to insert.
- `GET /api/fetch-exam?url=...` — scrapes a remote page's `<p>` tags into plain text for the paste-import flow.
- `POST /api/auth/logout` — clears Supabase session.

### Import flow (`components/import/`)

`ImportClient.tsx` is the central editor. Key behaviors:

- **Autosaves to `localStorage`** under `ontap_import_draft_v1` (lessons) or `ontap_exam_draft_v1` (exams), debounced 500 ms. Skipped in edit mode. The hydration race is handled via `pendingSubjectId`/`pendingChapterId` refs — preserve this when refactoring the cascading-fetch effects, or restored drafts will lose their subject/chapter selection.
- Distinguishes lesson vs. exam through `examMode` prop AND `initialData.type`; both flow into the `type` column in the API payload.
- Keyboard shortcuts (global `keydown` listener): `Ctrl/Cmd+S` saves, `Ctrl/Cmd+Enter` adds a blank question.
- **Paste-import (`PasteImportModal`)** accepts either plain text or HTML. The parser at `lib/examParser.ts` recognizes question starts (`Câu N.` / `Câu N:`), single & two-column options (`A. ...   B. ...` with 2+ spaces), and answer markers (`Đáp án: X`, `Answer: X`, `Chọn X.` — last form is the loigiaihay.com convention).
- **Tiptap → focused editor singleton**: `lib/focusedEditor.ts` tracks whichever Tiptap instance currently has focus so the LaTeX cheat-sheet buttons in the sidebar can insert into the right field. `onMouseDown` with `preventDefault` is required on those buttons or focus shifts before insertion.
- **Image uploads** go to the public Supabase Storage bucket `question-images`. Bucket must exist and be public.

### Math handling

- **Display**: `components/MathText.tsx` parses `$...$`, `$$...$$`, `\(...\)`, `\[...\]` and renders via KaTeX (uses `dangerouslySetInnerHTML` after escaping non-math segments). `katex/dist/katex.min.css` is imported once in `app/layout.tsx`.
- **Normalization**: `lib/mathNormalizer.ts` opportunistically converts plain `sqrt(x)` and bare fractions `n/m` to LaTeX, but skips text already inside math delimiters. Used by the paste import to upgrade pasted text before persisting.
- When writing question content into the DB, leave LaTeX raw (`$\frac{1}{2}$`) — rendering is the consumer's job.

### Quiz lifecycle

1. `app/quiz/page.tsx` (server): fetches `questions` + `lesson` meta in parallel via `lib/db.ts`.
2. `QuizClient` (client): manages `answers[]`, counts down `15 * 60` seconds, auto-submits when time hits 0. On submit, posts a `quiz_results` row (best-effort; failures are swallowed), then hands off to `/result` via `sessionStorage`.
3. `/result` is stateless beyond `sessionStorage` — navigating directly with no session storage redirects home.

### Leaderboard

`getLeaderboardByGrade` in `lib/db.ts` does a 4-table join in app code (subjects → chapters → lessons → quiz_results) plus an `auth.admin.listUsers({ perPage: 1000 })` call to resolve emails, which it then masks to `abc***`. Top 10 by average best-score-per-lesson. Wrapped in `try/catch` returning `[]` because it requires service-role access.

## Conventions

- All files use 2-space indent.
- `getSupabaseServer()` calls and `try/catch` returning a safe default (`[] / null`) is the established pattern for SSR data fetches — failures should not crash the page.
- Vietnamese is the source of truth for user-facing strings, including error messages from API routes.
- Existing code uses `(data as any)` in a few places to work around Supabase's generated types not knowing about the `type` column. Don't propagate this further than necessary.
- The schema's `lessons.status` is `'completed' | 'active' | 'locked'` but the app surface only really uses `'active'` (new lessons default to it via `create-lesson`); UI lock states are not currently enforced.
