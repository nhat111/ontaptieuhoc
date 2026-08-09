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
- `ANTHROPIC_API_KEY` — server-only. Used by `POST /api/ocr-exam` (quét ảnh đề bằng Claude vision). Without it that route returns 503; every other feature works.
- `GEMINI_API_KEY` **or** `OPENAI_API_KEY` — server-only, either one enables `POST /api/tts` (natural English voice). Gemini wins when both are set, because it has a free tier. Without either, `GET /api/tts` reports `{ available: false }` and the quiz falls back to the browser's Web Speech voices; nothing breaks.
- `NEXT_PUBLIC_SITE_URL` — absolute origin (no trailing slash). Drives `app/sitemap.ts`, `app/robots.ts` and `metadataBase` (canonical + Open Graph URLs). Optional in dev; **set it in production** or canonical tags point at the Vercel preview domain. `lib/siteUrl.ts` falls back to `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → `http://localhost:3000`.

DB schema lives in `schema.sql` — run it once in the Supabase SQL editor to provision tables and seed sample data. Note: the seeded `subjects` block resets the SERIAL, so sample chapter inserts use hard-coded subject id `61` (last seeded row). `questions.type` is in `schema.sql`; these columns are **used in app code but may be missing on a fresh DB** — add if needed:

- `lessons.type` (`'lesson' | 'exam'`, legacy NULL treated as lesson): `ALTER TABLE lessons ADD COLUMN type TEXT;`
- `quiz_results.user_id` (nullable FK → `auth.users`): add UUID column + FK when enabling progress tracking
- NXBGD idempotency: `chapters.source_id`, `lessons.source_id` (+ unique partial indexes) — see `schema.sql` comments

**Removed routes (do not recreate):** `/teacher`, `/import/ai` / `/api/ai-import`. Image-to-exam scanning lives at **`POST /api/ocr-exam`** instead — a separate route, deliberately not a revival of the removed `/import/ai` surface.

**Premium (phase 1, manual):** `profiles (user_id, is_premium, premium_until, note)` table gates exam download (Word/PDF) — browsing/quizzes stay free. `lib/premium.ts → isUserPremium(userId)` (service-role read); `GET /api/me/premium` returns `{ loggedIn, isPremium }` for client gating; `QuizClient` redirects non-premium users to `/nang-cap` (manual bank/MoMo transfer + activate by setting `is_premium` in the dashboard). The gate is client-side only for now — fine for printable exams; not real DRM.

## Architecture

### Three Supabase clients — pick the right one

The codebase uses three distinct Supabase wrappers and mixing them up causes auth and RLS bugs:

1. **`lib/supabase/server.ts` → `getSupabaseServer()`** — service-role client. Bypasses RLS. Use in API routes and server components for **data access** (subjects/chapters/lessons/questions/quiz_results reads & writes). No session, no cookies.
2. **`lib/supabase/server-client.ts` → `createSessionClient()` / `getUser()`** — SSR cookie-bound client using `@supabase/ssr`. Use **only when you need the current user** (e.g., `quiz_results.user_id`, `progress` page). Don't query data tables through this; queries hit RLS.
3. **`lib/supabase/client.ts` → `createClient()` / `supabase`** — browser client. Used for auth only (login/logout/sign-up). Image uploads go through `/api/upload-image` (server-side, service-role) so Storage RLS doesn't have to allow anon writes.

### Next.js 16 quirks

- **`proxy.ts` at the repo root is Next.js 16's renamed middleware** (`export async function proxy` + `export const config = { matcher }`). It only refreshes Supabase auth cookies on `/import/*` navigations (`supabase.auth.getUser()` triggers token rotation); there is no auth gate — `/import` and `/import/exam` are intentionally open to guests so anyone can create lessons/exams.
- `searchParams` and `params` in server components are `Promise<...>` — always `await` them (see `app/quiz/page.tsx`, `app/lop/[grade]/page.tsx`).

### Subjects — static catalogue, not a queried table

**`lib/subjects.ts` is the single source of truth for which subjects exist.** Subjects are fixed data, so they are declared in code; nothing reads the `subjects` table to build a list. Adding/renaming a subject means editing that file only.

The `subjects` table still exists because `chapters.subject_id` is a FK to it, but it is addressed by the **(grade, name)** pair, never by a hard-coded id — ids are `SERIAL` and differ between databases (the seed comment says "subject id = 1" while the sample chapter insert uses `61`).

- **Reads** filter through an embedded join: `.select('…, subjects!inner(grade, name)').eq('subjects.grade', g).eq('subjects.name', n)`. The `!inner` is required or the filter won't restrict rows.
- **Writes** call `ensureSubjectId(grade, name)` in `lib/db.ts`, which selects-or-inserts, so a subject added to `lib/subjects.ts` works without a manual SQL insert.
- A subject present in the DB but **missing from `lib/subjects.ts` is invisible** on the site — its chapters and lessons never render. `node --env-file=.env.local scripts/check-subjects.mjs` diffs code against DB and reports both directions.
- Renaming a subject in code without renaming it in the DB empties that tab. Run `UPDATE subjects SET name = '<new>' WHERE grade = <g> AND name = '<old>';` alongside.

`app/page.tsx` (grade cards) and `/lop/[grade]` (tabs) both render from this catalogue, so they can no longer drift apart.

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
- `/quiz?lessonId=X` — quiz page. Renders a Start screen first (title, # questions, duration, **Nghe cả bài** + speech-rate picker, and **Trộn thứ tự câu hỏi / đáp án** toggles persisted in `localStorage` via `lib/quizPrefs.ts`). Shuffling happens **once**, on Start (`shuffleQuiz` in `lib/quizData.ts`) — never mid-quiz, or questions would move under the child's hand. Shuffling options is safe because `correct_answer` stores the option **text**, not its index. Timer (`lessons.duration_minutes`, default 15) only begins after user clicks Start. On submit (manual or 0-timeout), posts to `/api/quiz-result`, stashes payload in `sessionStorage.quizResult`, redirects to `/result`.
- `/result` — reads `sessionStorage.quizResult`. Pure client component; never refresh-friendly. The payload carries `grade` / `subjectName` (copied from `LessonMeta`) purely so the breadcrumb and the "Quay lại danh sách" button can point at the right `/lop/[grade]` — the page has no server props to look them up from. Payloads stashed before those fields existed just render fewer crumbs.
- `/progress` — authenticated user's quiz history.
- `/import`, `/import/exam`, `/import/edit/[id]` — all render `ImportClient` with different `examMode` / `initialData` props. **`proxy.ts` only refreshes auth cookies on `/import/*` — guests can create/edit; it is not an auth gate.**
- `/import/chapter/[id]` — server dashboard: lesson fill progress in a chapter (`getChapterContext`, `getLessonsInChapter`); linked from `ImportClient`.
- `/import/kiem-tra` — read-only diagnostics page (Supabase reachability, row counts, and the `lib/subjects.ts` ↔ `subjects` table diff). Browser equivalent of `scripts/check-subjects.mjs`, for when the operator only has a phone. Covered by the `/import` robots disallow + `robots: { index: false }`.
- `/login`, `/reset-password`, `/auth/callback` — Supabase email-password auth + magic-link callback that exchanges `code` for a session.
- `/sitemap.xml`, `/robots.txt` — `app/sitemap.ts` (dynamic, `force-dynamic`: home, `/de-thi`, `/lop/1..5` in both views, one URL per subject tab, and `/quiz?lessonId=` for every lesson that has ≥1 question) and `app/robots.ts` (disallows `/api/`, `/import`, `/result`, `/progress`, auth and `/nang-cap`).

### SEO

`app/layout.tsx` sets `metadataBase`, a `%s · Ôn Tập Tiểu Học` title template and the default Open Graph/Twitter block; every other page only overrides what differs. `generateMetadata` exists on `/lop/[grade]` (title/description vary by subject + `view=exam`; canonical drops the default subject so `/lop/3` and `/lop/3?subject=<first>` aren't indexed twice) and on `/quiz` (a lesson with 0 questions gets `robots: noindex`). Editor and per-account pages (`/import*`, `/progress`, `/nang-cap`) export `robots: { index: false }`; the client-component pages (`/result`, `/login`, `/reset-password`, `/import/edit/[id]`) can't export metadata, so `robots.txt` is what covers them.

`getQuestionsFromDB` and `getLessonMetaFromDB` are wrapped in React `cache()` because `/quiz` calls each twice per request — once in `generateMetadata`, once in the page body.

Browse and quiz work **without login**; auth is optional (progress + `quiz_results.user_id`).

### API routes (`app/api/*`)

All use the service-role client unless noted:

- `GET|POST /api/chapters?grade=N&subject=<tên môn>` — used by the import form's chapter dropdown. Chapters are addressed by (grade, subject name), never by a `subjects.id`; POST calls `ensureSubjectId` so a subject newly added to `lib/subjects.ts` gets its row created on first use. (There is no `/api/subjects` — the catalogue is static, see **Subjects** below.)
- `GET /api/lesson/[id]` — returns lesson + questions as `QDraft` (`type`, variable `options`, `correctIdx` / `correctIdxs` / `answer`, optional `imageUrl` from `explanation` JSON).
- `POST /api/create-lesson`, `POST /api/update-lesson` — write lesson + replace all questions (update wipes and reinserts). **`chapterId` is optional**: omit it and send `grade` + `subject` instead, and the route resolves a default chapter via `ensureDefaultChapterId(grade, subject, type)` — titled `Đề kiểm tra` for exams, `Chưa phân chương` for lessons. `lessons.chapter_id` is `NOT NULL` and `/lop/[grade]` groups lessons by chapter, so a chapter-less lesson would never render — hence a default chapter rather than a nullable column. Required fields are only subject, title and questions.
- `POST /api/quiz-result` — uses **both** clients: session client to look up `user.id` (nullable for guests), service-role client to insert.
- `GET /api/fetch-exam?url=...` — scrapes a remote page's `<p>` tags into plain text for the paste-import flow.
- `POST /api/upload-image` — accepts a multipart `file` field, uploads to the `question-images` bucket via service-role, returns `{ url }`. Used by `QuestionCard` (10 MB cap, jpg/png/webp/gif/svg only).
- `POST /api/ocr-exam` — multipart `file` (ảnh, 10 MB cap, jpg/png/webp/gif). Sends the image to Claude vision (`claude-opus-5`) with a `json_schema` output constraint and returns `{ title, questions: [{content, options, correctIndex}], usage }`. `correctIndex` is `-1` when no hand-drawn mark is visible — the model is told never to guess. Reads hand-circled answers, which plain OCR can't. Requires `ANTHROPIC_API_KEY`; 503 without it. `GET /api/ocr-exam` returns `{ available: boolean }` (a capability probe, never the key) — `PasteImportModal` calls it on open and **hides the "Quét ảnh đề" button entirely when no key is configured**, so nobody clicks into a 503. `stop_reason: 'refusal'` is checked before reading content. The `fallbacks` beta is best-effort: a 400 naming it retries once without it.
- `POST /api/auth/logout` — clears Supabase session.

### Import flow (`components/import/`)

`ImportClient.tsx` is the central editor. Key behaviors:

- **Autosaves to `localStorage`** under `ontap_import_draft_v1` (lessons) or `ontap_exam_draft_v1` (exams), debounced 500 ms. Skipped in edit mode. The chapter hydration race is handled via the `pendingChapterId` ref — preserve this when refactoring the chapter fetch effect, or restored drafts will lose their chapter selection. Subjects need no such ref: they come from `lib/subjects.ts` synchronously and the selection is derived, not stored. Drafts persist the subject **name**; drafts written before that (which stored a numeric `subjectId`) fall back to the grade's first subject.
- Distinguishes lesson vs. exam through `examMode` prop AND `initialData.type`; both flow into the `type` column in the API payload.
- Keyboard shortcuts (global `keydown` listener): `Ctrl/Cmd+S` saves, `Ctrl/Cmd+Enter` adds a blank question.
- **Paste-import (`PasteImportModal`)** accepts plain text or HTML. Primary parser: `lib/examParser.ts` (question starts `Câu N.` / `Câu N:`, options `A.`…, answer markers `Đáp án:`, `Answer:`, `Chọn X.`). **URL import:** `GET /api/fetch-exam?url=` returns HTML/plain text; if it looks like a loigiaihay/vietjack solution page, `lib/loigiaihayParser.ts` (`parseLoigiaihay`) is used instead of `examParser`. Type is inferred at commit time: ≥2 options + one letter → `mcq`; ≥2 options + multiple letters → `multi`; no options + numeric → `numeric`; else → `short`. Letter answers (`Đáp án: B`) only apply when options exist — otherwise `Đáp án: Cần Thơ` stays `short`.
- **Tiptap → focused editor singleton**: `lib/focusedEditor.ts` tracks whichever Tiptap instance currently has focus so the LaTeX cheat-sheet buttons in the sidebar can insert into the right field. `onMouseDown` with `preventDefault` is required on those buttons or focus shifts before insertion.
- **Image uploads** go through `POST /api/upload-image` → public Supabase Storage bucket `question-images` (service-role, bypasses RLS). Bucket must exist and be public for the returned URLs to be readable.

### Đọc thành tiếng (TTS)

`lib/speech.ts` wraps the browser's Web Speech API — **no API key, no cost, no network**. `SpeakButton` reads one question + its options; `QuizClient` also has a **"Nghe cả bài"** button that reads every question in order, announcing "Câu N" in Vietnamese before each and scrolling to whichever question is being read (`speakSegments`'s `onSegmentStart` carries the segment's `mark`).

- Language is auto-detected per segment: Vietnamese diacritics → `vi-VN`, otherwise `en-US`. Options with no letters (`"12"`, `"3,5"`) inherit the question's language, or a Vietnamese maths question would read "one, two" in an English voice.
- LaTeX and HTML are stripped before speaking (`stripForSpeech`).
- Rate lives in `localStorage` (`ontap_speech_rate`, default **0.7** — deliberately slow for primary-school kids) and is exposed as Chậm/Vừa/Nhanh in the quiz header. Read through `useSyncExternalStore` + `subscribeSpeechRate`, so no setState-in-effect and no hydration mismatch.
- Buttons hide entirely when the browser has no `speechSynthesis`.
- **Three browser bugs are worked around in `speakSegments`** — all three only bite on long reads, which is why one question worked and the whole exam didn't: (1) Chrome/Safari stop the synthesiser after ~15 s, so a `resume()` keep-alive ticks every 5 s while speaking; (2) `onend` sometimes never fires on iOS and stalls the chain, so each utterance also carries a length-based timeout that advances it; (3) iOS only allows `speak()` inside the user-gesture task, so `speakSegments` is **synchronous** — never `await` before the first `speak()` or audio is silently blocked.
- Voice quality is the device's, not ours. `voicesFor()` ranks candidates (prefers `Google`/`Enhanced`/`Premium`/`Neural`, penalises iOS `Compact`, and **drops Apple's novelty/legacy voices entirely** — Boing, Bubbles, Zarvox, Fred… sit in `getVoices()` looking like ordinary en-US voices) and `VoicePicker` lets the user override per language (`ontap_voice_<lang>`), because only the listener can judge.
- **iOS caveat that drives the whole cloud-TTS design below:** Safari does *not* expose the Enhanced/Premium voices a user downloads under Settings → Accessibility → Read & Speak (older iOS: Spoken Content) to web pages — those are reserved for Apple's own apps. Telling a user to download a better voice does nothing for this site. iOS also ships exactly one `vi-VN` voice, so `VoicePicker` hides itself for Vietnamese there.

### Giọng đọc tiếng Anh qua đám mây (`lib/tts.ts`, `lib/cloudSpeech.ts`)

Because of that iOS caveat, **English** exams can be read by a paid cloud TTS instead. Vietnamese deliberately stays on Web Speech (free) — the need was a child learning English mimicking wrong stress, not Vietnamese narration.

- **Two providers, picked by which key is set** (`getProvider()` in `lib/tts.ts`): `GEMINI_API_KEY` → Google AI Studio (free tier, no card), `OPENAI_API_KEY` → OpenAI (paid). Gemini wins when both exist. Adding a third provider means one `synthesize*` function plus a voice list.
- `POST /api/tts` → `{ url }` for one chunk of text. Audio is **cached by content hash** in Supabase Storage bucket `question-audio` (lazily created, same pattern as `/api/upload-image`), and the cache is checked **before** calling the provider, so each question is generated exactly once ever. That matters more on the free tier than on a paid one — quota is consumed per *generation*, not per listen. The cache lookup probes both `.wav` and `.mp3` because the extension depends on the provider and isn't known until the call is made.
- `GET /api/tts` → `{ available, provider, voices, defaultVoice }`. The voice list comes from the server because the names are provider-specific (Gemini `Kore`, OpenAI `nova`); the client keeps no hardcoded catalogue and ignores a saved voice that isn't in the current provider's list.
- **Gemini returns raw 16-bit PCM**, not a playable file — `pcmToWav()` prepends a 44-byte WAV header (sample rate read from the response's `audio/L16;rate=…` mime type). OpenAI returns mp3 directly. Gemini also has no speed parameter, so pace is steered by wording in the prompt.
- `lib/ttsVoices.ts` holds `mapRateToSpeed` + the `TtsVoice` alias, split out because `lib/tts.ts` imports node `crypto` and must never reach the browser bundle.
- One audio file per **question** (stem + all options), not per option — fewer calls and better prosody. The chunk announces "Question N" in English, since the file is a single English voice.
- `lib/cloudSpeech.ts` has three invariants, all commented at the top of the file: (1) `speakCloud` plays a ~5 ms silent WAV **synchronously** to unlock the audio element inside the tap — no `await` before it, or iOS blocks playback; (2) exactly one `HTMLAudioElement` for the page's lifetime, since the unlock binds to the element; (3) a `generation` counter so a stopped read's in-flight promises exit quietly. Stopping also aborts in-flight fetches — an abandoned request is still billed.
- It downloads **all** chunks before playing any (progress shown as "Đang chuẩn bị… 3/20"). Streaming as it goes would leave unpredictable multi-second gaps between questions on a first listen.
- On failure the code does **not** silently retry with Web Speech in the same tap — the gesture is already gone, so iOS would be mute with no error. It reports the failure and lets the next tap use the device voice.
- The lesson is treated as English when **≥ half the question stems** detect as `en-US` (`detectLang`), not by subject name — an English exam filed under the wrong subject still gets the good voice.

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
