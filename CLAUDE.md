# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Shorter feature index: `.claude/ai-context/README.md` · Codegen skill: `.claude/skills/gen-code-ontaptieuhoc/SKILL.md`.

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

DB schema lives in `schema.sql` — run it once in the Supabase SQL editor to provision tables and seed sample data. Note: the seeded `subjects` block resets the SERIAL, so sample chapter inserts use hard-coded subject id `61` (last seeded row). `questions.type` is in `schema.sql`; these columns are **used in app code but may be missing on a fresh DB** — add if needed:

- `lessons.type` (`'lesson' | 'exam'`, legacy NULL treated as lesson): `ALTER TABLE lessons ADD COLUMN type TEXT;`
- `quiz_results.user_id` (nullable FK → `auth.users`): add UUID column + FK when enabling progress tracking
- NXBGD idempotency: `chapters.source_id`, `lessons.source_id` (+ unique partial indexes) — see `schema.sql` comments

**Removed routes (do not recreate):** `/teacher`, `/import/ai` (no `/api/ai-import`; `ANTHROPIC_API_KEY` reserved for future use).

## Architecture

### Three Supabase clients — pick the right one

The codebase uses three distinct Supabase wrappers and mixing them up causes auth and RLS bugs:

1. **`lib/supabase/server.ts` → `getSupabaseServer()`** — service-role client. Bypasses RLS. Use in API routes and server components for **data access** (subjects/chapters/lessons/questions/quiz_results reads & writes). No session, no cookies.
2. **`lib/supabase/server-client.ts` → `createSessionClient()` / `getUser()`** — SSR cookie-bound client using `@supabase/ssr`. Use **only when you need the current user** (e.g., `quiz_results.user_id`, `progress` page). Don't query data tables through this; queries hit RLS.
3. **`lib/supabase/client.ts` → `createClient()` / `supabase`** — browser client. Used for auth only (login/logout/sign-up). Image uploads go through `/api/upload-image` (server-side, service-role) so Storage RLS doesn't have to allow anon writes.

### Next.js 16 quirks

- **`proxy.ts` at the repo root is Next.js 16's renamed middleware** (`export async function proxy` + `export const config = { matcher }`). It only refreshes Supabase auth cookies on `/import/*` navigations (`supabase.auth.getUser()` triggers token rotation); there is no auth gate — `/import` and `/import/exam` are intentionally open to guests so anyone can create lessons/exams.
- `searchParams` and `params` in server components are `Promise<...>` — always `await` them (see `app/quiz/page.tsx`, `app/lop/[grade]/page.tsx`).

### Data model

`subjects (per grade) → chapters → lessons (type 'lesson' | 'exam') → questions`. `lessons.id` is the URL identifier everywhere (`/quiz?lessonId=X`, `/import/edit/[id]`). `questions.explanation` is reused as a JSON blob carrying `{ images: [{url, position}], imageUrl, solution }` — image attachments (no dedicated image column) plus an optional worked solution ("lời giải") shown on `/result`. Legacy rows may hold just `{ imageUrl }`.

`questions.type` (added later — `ALTER TABLE questions ADD COLUMN type TEXT NOT NULL DEFAULT 'mcq';` if upgrading) is one of `'mcq' | 'multi' | 'short' | 'numeric'`. `options` is variable length 2–6 for `mcq`/`multi`, `[]` for `short`/`numeric`. `correct_answer` encoding is **per-type** — get this wrong and scoring breaks silently:
- `mcq`: the literal text of the correct option (must match one of `options`).
- `multi`: `JSON.stringify(string[])` of all correct option texts.
- `short`: pipe-delimited accepted answers (`"Hà Nội|Ha Noi|hà nội"`), compared case-insensitive after `trim()`.
- `numeric`: number as string. `,` and `.` are both accepted as decimal separators; compared with `Math.abs(a-b) < 1e-9`.

Scoring lives in `lib/quizData.ts → scoreAnswer(q, answer)`. The `answers[i]` slot for `multi` is itself a `JSON.stringify(string[])` of selected option texts; for short/numeric it's the raw user input. QuizClient normalizes `""` and `"[]"` back to `null` so the palette and unanswered count stay correct.

### Page routes

- `/` — landing, grade picker. "Xem đề mẫu" CTA links to `/de-thi`.
- `/de-thi` — server-rendered list of all `type='exam'` lessons grouped by grade.
- `/lop/[grade]?subject=...&view=lesson|exam` — server-rendered subject tabs + chapters + leaderboard sidebar.
- `/quiz?lessonId=X` — quiz page. Renders a Start screen first (title, # questions, duration). Timer (`lessons.duration_minutes`, default 15) only begins after user clicks Start. On submit (manual or 0-timeout), posts to `/api/quiz-result`, stashes payload in `sessionStorage.quizResult`, redirects to `/result`.
- `/result` — reads `sessionStorage.quizResult`. Pure client component; never refresh-friendly.
- `/progress` — authenticated user's quiz history.
- `/import`, `/import/exam`, `/import/edit/[id]` — all render `ImportClient` with different `examMode` / `initialData` props. **`proxy.ts` only refreshes auth cookies on `/import/*` — guests can create/edit; it is not an auth gate.**
- `/import/chapter/[id]` — server dashboard: lesson fill progress in a chapter (`getChapterContext`, `getLessonsInChapter`); linked from `ImportClient`.
- `/login`, `/reset-password`, `/auth/callback` — Supabase email-password auth + magic-link callback that exchanges `code` for a session.

Browse and quiz work **without login**; auth is optional (progress + `quiz_results.user_id`).

### API routes (`app/api/*`)

All use the service-role client unless noted:

- `GET /api/subjects?grade=N`, `GET|POST /api/chapters` — used by the import form's cascading dropdowns.
- `GET /api/lesson/[id]` — returns lesson + questions as `QDraft` (`type`, variable `options`, `correctIdx` / `correctIdxs` / `answer`, optional `imageUrl` from `explanation` JSON).
- `POST /api/create-lesson`, `POST /api/update-lesson` — write lesson + replace all questions (update wipes and reinserts).
- `POST /api/quiz-result` — uses **both** clients: session client to look up `user.id` (nullable for guests), service-role client to insert.
- `GET /api/fetch-exam?url=...` — scrapes a remote page's `<p>` tags into plain text for the paste-import flow.
- `POST /api/upload-image` — accepts a multipart `file` field, uploads to the `question-images` bucket via service-role, returns `{ url }`. Used by `QuestionCard` (10 MB cap, jpg/png/webp/gif/svg only).
- `POST /api/auth/logout` — clears Supabase session.

### Import flow (`components/import/`)

`ImportClient.tsx` is the central editor. Key behaviors:

- **Autosaves to `localStorage`** under `ontap_import_draft_v1` (lessons) or `ontap_exam_draft_v1` (exams), debounced 500 ms. Skipped in edit mode. The hydration race is handled via `pendingSubjectId`/`pendingChapterId` refs — preserve this when refactoring the cascading-fetch effects, or restored drafts will lose their subject/chapter selection.
- Distinguishes lesson vs. exam through `examMode` prop AND `initialData.type`; both flow into the `type` column in the API payload.
- Keyboard shortcuts (global `keydown` listener): `Ctrl/Cmd+S` saves, `Ctrl/Cmd+Enter` adds a blank question.
- **Paste-import (`PasteImportModal`)** accepts plain text or HTML. Primary parser: `lib/examParser.ts` (question starts `Câu N.` / `Câu N:`, options `A.`…, answer markers `Đáp án:`, `Answer:`, `Chọn X.`). **URL import:** `GET /api/fetch-exam?url=` returns HTML/plain text; if it looks like a loigiaihay/vietjack solution page, `lib/loigiaihayParser.ts` (`parseLoigiaihay`) is used instead of `examParser`. Type is inferred at commit time: ≥2 options + one letter → `mcq`; ≥2 options + multiple letters → `multi`; no options + numeric → `numeric`; else → `short`. Letter answers (`Đáp án: B`) only apply when options exist — otherwise `Đáp án: Cần Thơ` stays `short`.
- **Tiptap → focused editor singleton**: `lib/focusedEditor.ts` tracks whichever Tiptap instance currently has focus so the LaTeX cheat-sheet buttons in the sidebar can insert into the right field. `onMouseDown` with `preventDefault` is required on those buttons or focus shifts before insertion.
- **Image uploads** go through `POST /api/upload-image` → public Supabase Storage bucket `question-images` (service-role, bypasses RLS). Bucket must exist and be public for the returned URLs to be readable.

### Math handling

- **Display**: `components/MathText.tsx` parses `$...$`, `$$...$$`, `\(...\)`, `\[...\]` and renders via KaTeX (uses `dangerouslySetInnerHTML` after escaping non-math segments). `katex/dist/katex.min.css` is imported once in `app/layout.tsx`.
- **Normalization**: `lib/mathNormalizer.ts` opportunistically converts plain `sqrt(x)` and bare fractions `n/m` to LaTeX, but skips text already inside math delimiters. Used by the paste import to upgrade pasted text before persisting.
- When writing question content into the DB, leave LaTeX raw (`$\frac{1}{2}$`) — rendering is the consumer's job.

### Quiz lifecycle

1. `app/quiz/page.tsx` (server): fetches `questions` + `lesson` meta in parallel via `lib/db.ts`. `LessonMeta.durationMinutes` comes from `lessons.duration_minutes` (default 15).
2. `QuizClient` (client): boots in `started=false` state showing a Start screen with title / question count / duration. Once user clicks **Bắt đầu làm bài**, sets `started=true`; the countdown effect (gated on `started`) starts ticking from `durationMinutes * 60`. Auto-submits when time hits 0. Refreshing the page resets to the Start screen (timer never persists).
3. On submit, posts a `quiz_results` row (best-effort; failures are swallowed), then hands off to `/result` via `sessionStorage`.
4. `/result` is stateless beyond `sessionStorage` — navigating directly with no session storage redirects home.

### Leaderboard

`getLeaderboardByGrade` in `lib/db.ts` does a 4-table join in app code (subjects → chapters → lessons → quiz_results) plus an `auth.admin.listUsers({ perPage: 1000 })` call to resolve emails, which it then masks to `abc***`. Top 10 by average best-score-per-lesson. Wrapped in `try/catch` returning `[]` because it requires service-role access.

### Offline NXBGD import (`scripts/`)

Node scripts (not part of Next.js runtime) to bulk-load content from NXBGD API into Supabase via service role:

- `scripts/nxbgd-import.mjs` — chapter/lesson skeletons (`source_id`)
- `scripts/nxbgd-import-questions.mjs` — questions into existing lessons (needs `NXBGD_TOKEN`; idempotent skip if lesson already has questions)

Run with `node --env-file=.env.local scripts/...`. See `.claude/ai-context/scripts/nxbgd-import.md`.

## Conventions

- All files use 2-space indent.
- `getSupabaseServer()` calls and `try/catch` returning a safe default (`[] / null`) is the established pattern for SSR data fetches — failures should not crash the page.
- Vietnamese is the source of truth for user-facing strings, including error messages from API routes.
- Existing code uses `(data as any)` in a few places to work around Supabase's generated types not knowing about the `type` column. Don't propagate this further than necessary.
- The schema's `lessons.status` is `'completed' | 'active' | 'locked'` but the app surface only really uses `'active'` (new lessons default to it via `create-lesson`); UI lock states are not currently enforced.
