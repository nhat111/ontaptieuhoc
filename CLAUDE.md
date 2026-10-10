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
- `IMPORT_PASSWORD` — server-only, shared passphrase for `/import*` and every write API. **Leave it empty and everything stays open** (dev default, and how the site behaved before). Set it in production: `/api/update-lesson` deletes a lesson's questions and reinserts them, so anyone who guesses a lesson id can wipe content, and there are no backups.
- `NEXT_PUBLIC_SITE_URL` — absolute origin (no trailing slash). Drives `app/sitemap.ts`, `app/robots.ts` and `metadataBase` (canonical + Open Graph URLs). Optional in dev; **set it in production** or canonical tags point at the Vercel preview domain. `lib/siteUrl.ts` falls back to `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → `http://localhost:3000`.

DB schema lives in `schema.sql` — run it once in the Supabase SQL editor to provision tables and seed sample data. Note: the seeded `subjects` block resets the SERIAL, so sample chapter inserts use hard-coded subject id `61` (last seeded row). `questions.type` is in `schema.sql`; these columns are **used in app code but may be missing on a fresh DB** — add if needed:

- `lessons.type` (`'lesson' | 'exam'`, legacy NULL treated as lesson): `ALTER TABLE lessons ADD COLUMN type TEXT;`
- `quiz_results.user_id` (nullable FK → `auth.users`): add UUID column + FK when enabling progress tracking
- NXBGD idempotency: `chapters.source_id`, `lessons.source_id` (+ unique partial indexes) — see `schema.sql` comments
- `feedback` table (block "GÓP Ý / BÁO LỖI" at the end of `schema.sql`): RLS on with **no policies**, so only the service role reads/writes it. Until it exists, `/api/feedback` returns 500 and `/import/gop-y` shows a hint to run that SQL.

**Removed routes (do not recreate):** `/teacher`, `/import/ai` / `/api/ai-import`. Image-to-exam scanning lives at **`POST /api/ocr-exam`** instead — a separate route, deliberately not a revival of the removed `/import/ai` surface.

**Premium — currently gates nothing.** `profiles (user_id, is_premium, …)`, `lib/premium.ts → isUserPremium(userId)`, `GET /api/me/premium` and `/nang-cap` all still exist, but **exam download (Word/PDF) is open to everyone**: the whole point of that button is letting a parent print the exam for a child to do on paper, so a paywall blocked exactly the people it was for. Nothing in the app reads `isPremium` today — wire it to a new feature rather than assuming downloads are still gated.

## Architecture

### Three Supabase clients — pick the right one

The codebase uses three distinct Supabase wrappers and mixing them up causes auth and RLS bugs:

1. **`lib/supabase/server.ts` → `getSupabaseServer()`** — service-role client. Bypasses RLS. Use in API routes and server components for **data access** (subjects/chapters/lessons/questions/quiz_results reads & writes). No session, no cookies.
2. **`lib/supabase/server-client.ts` → `createSessionClient()` / `getUser()`** — SSR cookie-bound client using `@supabase/ssr`. Use **only when you need the current user** (e.g., `quiz_results.user_id`, `progress` page). Don't query data tables through this; queries hit RLS.
3. **`lib/supabase/client.ts` → `createClient()` / `supabase`** — browser client. Used for auth only (login/logout/sign-up). Image uploads go through `/api/upload-image` (server-side, service-role) so Storage RLS doesn't have to allow anon writes.

### Next.js 16 quirks

- **`proxy.ts` at the repo root is Next.js 16's renamed middleware** (`export async function proxy` + `export const config = { matcher }`). It only refreshes Supabase auth cookies on `/import/*`; **do not put access control in it.** `next build` leaves `middleware-manifest.json` empty here, so a gate there works under `next start` locally and is silently inert once deployed to Vercel — it looks locked while standing wide open. Verified by hand: same commit, same env, local production redirects and the Vercel preview did not.
- **Access control for `/import/*` lives in `app/import/layout.tsx`** (same runtime as the API routes, which demonstrably read env vars on Vercel), and the lock page sits at **`/import-khoa`, outside that segment** — inside it, the page would block itself into a redirect loop.
- **Layout gating covers pages only; `/api/*` has no layout** — and that is exactly where content gets destroyed. Every write route calls `blockIfNoImportAccess(req)` itself (`lib/importAuth.ts`). The cookie holds a SHA-256 of the passphrase, not the passphrase, compared in constant time. No password configured → every gate is a no-op.
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

- `/` — landing: warm plain hero (no gradient/decorative stats) with a **"Làm thử một câu"** card (`components/home/TryQuestion.tsx`, hard-coded sample questions so the home page never depends on DB content, owl `Mascot` + `Burst` from `components/games/Fx.tsx`), a grade picker, and a grade-1 games banner. The ✓ list under the CTAs must only claim things the site really does. Grade cards (`components/GradeCard.tsx`) take colour/emoji from `lib/gradeTheme.ts` — the same map `/lop/[grade]` uses — so never give them their own palette: a row on phones, a 5-column standing card on `lg`. Counts are **real** (`getGradeStats` in `lib/db.ts`: lessons/exams that have ≥1 question, per grade; ISR `revalidate = 300`) — never hard-code numbers here; a grade with none shows "Đang cập nhật". Public nav (`components/Header.tsx`) is for parents/kids only; editor entry points live in the account menu and the footer. `components/Footer.tsx` groups links (Học tập / Hỗ trợ) under a brand block with grade chips coloured from `lib/gradeTheme.ts`; the editor link sits small in the bottom bar. The logo SVG is shared as `components/LogoMark.tsx`. Font is Be Vietnam Pro via `next/font` (`--font-be-vietnam`, wired as Tailwind `font-sans`).
- `/huong-dan` — static how-to page for new parents (chọn lớp → làm bài → nghe đọc → kết quả/lời giải → in đề → trò chơi → đăng nhập, plus FAQ). It names buttons **exactly as the UI labels them** and only claims what the site does — when a label or behaviour changes, update this page too. Linked from the header nav, the home hero and the footer. `/huong-dan/soan-de` is the editor-side guide (vào khu soạn đề/mật khẩu → thông tin bài → 4 loại câu → Dán đề / URL / quét ảnh → lưu & nháp → Sửa đề/Cập nhật → Gắn giọng đọc), linked from the parent guide and the "❓ Hướng dẫn soạn đề" link in the `ImportClient` header. Both render through `components/guide/GuidePage.tsx`.
- `/gop-y` — public feedback + contact page (`components/feedback/FeedbackForm.tsx`). Contact details come from `lib/contact.ts`; empty fields hide themselves, and the whole contact block hides when all are empty. Each question on `/result` also has a **"🚩 Báo lỗi câu này"** button (`components/feedback/ReportButton.tsx`, reasons in `lib/feedback.ts`) that snapshots `lessonId`, `questionIndex` and the question text, so the report still makes sense after the lesson is edited.
- `/import/gop-y` — editor inbox for those reports. **Fails closed, unlike the rest of `/import`:** with no `IMPORT_PASSWORD` set it shows a 🔒 notice instead of the list (reports carry parents' phone/email), and it re-checks the cookie itself rather than relying only on the layout; `/api/feedback/resolve` likewise returns 403 when no password is set. Tabs "Chưa xử lý" / "Tất cả" (`?tat_ca=1`), `ResolveButton` toggles `resolved`, and there are links to `/import/edit/[id]` and the quiz. Linked as "📬 Góp ý đã nhận" in the `ImportClient` header.
- `/phieu-bai-tap` — public worksheet maker (`components/worksheet/WorksheetClient.tsx`): pick a grade from `MATH_LESSONS`, one or more topics, 10/15/20 questions, 1–4 versions, answer mode (đáp án + lời giải / chỉ đáp án / không). Questions come from `buildWorksheetQuestions(specs, total, seed)` in `lib/mathGen` (topics share the count evenly, each topic keeps its `mix` ratio; same seed → same sheet) and are generated **only after the "Tạo phiếu" click** (render-time randomness would mismatch hydration). `lib/worksheetExport.ts → buildWorksheetHtml` lays it out for print: name line, Phần 1 trắc nghiệm / Phần 2 tự luận, word problems get a "Bài giải" block instead of "Trả lời: ___", each version on its own page, answers last. Options are laid out with a `<table>` — Word ignores CSS grid/flex in .doc HTML. No DB, works without Supabase content.
- `/phieu-bai-tap?loai=hang-ngay` — second tab of the same page (tabs are `Link`s on `?loai=`, each tab has its own canonical via `generateMetadata`): **phiếu luyện hằng ngày lớp 1** (`components/worksheet/DailySheetClient.tsx`, `lib/dailySheet.ts`). Dense drill sheets, one A4 each, 1/5/10 sheets per file, filled-in answer pages last. Toán (phạm vi 5/10/100; 100 = cộng trừ không nhớ, no sơ đồ tách–gộp): tách–gộp, điền > < =, tính, điền số thiếu, viết số theo thứ tự, dãy số. Tiếng Việt: điền âm đầu (c/k, ch/tr, s/x, l/n, g/gh, ng/ngh, h/th/kh, v/d/gi) from a **hand-written word bank** in `lib/dailySheet.ts` (`[c]on cò` = the bracket is the blank). Layout is tables only (Word). `npx tsx scripts/daily-sheet-check.ts` re-derives every maths answer and enforces c/k, g/gh, ng/ngh before e/ê/i on the word bank — **run it after adding words**.
- `/phieu-bai-tap?loai=ai` — third tab: **phiếu hoạt động AI** (`components/worksheet/AiSheetClient.tsx`, `lib/aiSheets/`) for the 12 core AI periods per grade required from 2026–2027 (Quyết định 2422/QĐ-BGDĐT; Công văn 5588 asks for printable/offline học liệu). **Hand-written content**, one file per grade (`lib/aiSheets/lop4.ts` only so far; other grades show "đang soạn"): one sheet = one period = one A4 student page (unplugged activities: match / tick / check / sort / order / table / write) + an optional teacher page (mục tiêu, 35-minute tiến trình, đáp án, mở rộng). Topic titles and requirement codes follow QĐ 2422 verbatim — re-check against the decision when editing. No brand names of real apps. **PDF only on the web** (Word copies are sold separately — the page points teachers to `/gop-y`); `npx tsx scripts/ai-sheet-export.ts <dir>` writes the Word files. `npx tsx scripts/ai-sheet-check.ts` checks every core code of the grade is covered, every closed activity has an answer, match sizes line up, and the HTML is clean.
- `/de-thi` — server-rendered list of all `type='exam'` lessons grouped by grade.
- `/lop/[grade]?subject=...&view=lesson|exam` — server-rendered subject tabs + chapters + leaderboard sidebar.
- `/quiz?lessonId=X` — quiz page. Renders a Start screen first (title, # questions, duration, **Nghe cả bài** + speech-rate picker, and **Trộn thứ tự câu hỏi / đáp án** toggles persisted in `localStorage` via `lib/quizPrefs.ts`). Shuffling happens **once**, on Start (`shuffleQuiz` in `lib/quizData.ts`) — never mid-quiz, or questions would move under the child's hand. Shuffling options is safe because `correct_answer` stores the option **text**, not its index. Timer (`lessons.duration_minutes`, default 15) only begins after user clicks Start. On submit (manual or 0-timeout), posts to `/api/quiz-result`, stashes payload in `sessionStorage.quizResult`, redirects to `/result`.
- `/lop/1/tro-choi` (+ `/dem-hinh`, `/hai-tao`, `/nghe-chu`, `/nhin-hinh`, `/chon-dau`) and `/lop/2/tro-choi` (+ `/dong-ho`, `/hai-tao`, `/chinh-ta`, `/loai-tu`) — learning games; the hub keeps a `GAMES_BY_GRADE` map with Lớp 1 / Lớp 2 tabs, every other grade is `notFound()`, and each game page guards its own grade (`hai-tao` serves both, `AppleGame grade={1|2}`). Grade-2 generators live in `lib/games2.ts` (analog clock times as read in lớp 2 — "7 giờ 30 phút"; carrying add/subtract within 100; ×/: tables of 2 and 5; spelling pairs ch/tr, s/x, g/gh + ng/ngh, c/k, l/n with emoji-backed words; sự vật / hoạt động / đặc điểm). Grade-2 games use device TTS (no `clips`); the spelling game never reads the word before the child answers, since ch/tr, s/x sound alike. Questions are generated client-side after the Start tap (`lib/games.ts`; generating at render would mismatch hydration), no DB. `components/games/GameShell.tsx` runs 10 rounds (no round repeats within a session — `fresh()` retries `make` against a seen-set keyed on `say|answer|reveal`, falling back to a repeat only when the pool is exhausted; keep each spelling pair at ≥10 words), a wrong pick only shakes and lets the child retry, a star counts only on a first-try correct; total stars live in `localStorage` (`ontap_game_stars`). All speech is called inside the tap handler (iOS rule, see TTS). "2.5D" look is pure CSS — keyframes in `tailwind.config.ts`, `Mascot`/`Burst` in `components/games/Fx.tsx`, all behind `motion-safe:`; no 3D/animation library. A game can replace the answer grid with its own board via the `Board` prop (the apple tree in `AppleGame`). The letter game speaks the **phonic** ("Âm bờ", "Âm á"), never the letter name, from **pre-rendered Piper mp3s** (`public/audio/tro-choi/`, map in auto-generated `lib/gameClips.ts`; `scripts/gen-game-audio.py` reads sounds/words straight out of `lib/games.ts` + `lib/vietWords.ts`, so rerun it after editing either) — device TTS spelled a lone "á" (ă) as "a sắc". Only the `vais1000` Piper voice has all six tones. `GameShell`'s `clips` prop plays files only when every line of a turn has one, else the whole turn falls back to device TTS; `GameRound.reveal` is spoken after the praise (the word, or the tone name). Games whose `say` is a generic instruction rather than the question itself (spelling, clock, word-picture) pass `promptOnce`: the instruction is spoken on round 1 and via 🔊 Nghe lại only, never re-read after every answer. Tiếng Việt word games live in `lib/vietWords.ts`: tone variants are built by swapping the Unicode combining tone mark (NFD → NFC) at the original mark's position, or by standard placement rules for toneless words; words ending in c/ch/p/t are excluded from the tone game because only sắc/nặng are valid there ("sàch" isn't Vietnamese). It drops k/q/y plus confusable pairs (s/x, d/r, a/ă, â/ơ — ă is voiced "á" and â "ớ", so they differ from a/ơ only by tone) because they can't be told apart by ear.
- `/result` — reads `sessionStorage.quizResult`. Pure client component; never refresh-friendly. The payload carries `grade` / `subjectName` (copied from `LessonMeta`) purely so the breadcrumb and the "Quay lại danh sách" button can point at the right `/lop/[grade]` — the page has no server props to look them up from. Payloads stashed before those fields existed just render fewer crumbs.
- `/progress` — authenticated user's quiz history.
- `/import`, `/import/exam`, `/import/edit/[id]` — all render `ImportClient` with different `examMode` / `initialData` props. **`proxy.ts` only refreshes auth cookies on `/import/*` — guests can create/edit; it is not an auth gate.**
- `/import/chapter/[id]` — server dashboard: lesson fill progress in a chapter (`getChapterContext`, `getLessonsInChapter`); linked from `ImportClient`.
- `/import/giong-tro-choi` — in-browser recorder for the grade-1 games' voice lines (every key of `lib/gameClips.ts`, grouped: âm / từ / dấu / câu khen). Record → review → save, auto-advancing to the next unrecorded line. Audio is captured as raw PCM straight from the mic (`lib/micRecorder.ts`, Web Audio `ScriptProcessorNode`) — **never MediaRecorder**: on iOS it emits fragmented MP4 that iOS's own `decodeAudioData` often can't decode ("Không xử lý được bản thu"). `lib/wavEncode.ts → pcmToCleanWav` then trims leading/trailing silence, normalises, halves 44.1/48 kHz by pair-averaging and writes WAV 16-bit. `stop` runs synchronously inside the tap so the review playback isn't blocked on iOS. Saved via `/api/game-audio` to Storage `question-audio/tro-choi/<clipSlug>.wav`; `clipSlug` (`lib/gameRecordings.ts`) matches the Python script's `slug()` exactly. Games load recordings once per session (`lib/recordedClips.ts`) and they **override** the Piper file for the same line — a partly recorded set just mixes voices until finished.
- `/import/kiem-tra` — read-only diagnostics page (Supabase reachability, row counts, and the `lib/subjects.ts` ↔ `subjects` table diff). Browser equivalent of `scripts/check-subjects.mjs`, for when the operator only has a phone. Covered by the `/import` robots disallow + `robots: { index: false }`.
- `/login`, `/reset-password`, `/auth/callback` — Supabase email-password auth. `?redirect=` / `?next=` go through `lib/safeRedirect.ts → safeNext` (internal paths only — open-redirect guard); default after login is `/`, not `/import`. Errors are mapped by `error.code` in `lib/authErrors.ts`. **Sign-up, forgot-password and resend-confirmation go through `POST /api/auth/email`** (server, session client so the PKCE verifier cookie still lands in the browser). Only sign-in calls Supabase from the browser. Called straight from the browser, the email-sending calls failed with a CORS-less "Failed to fetch" even when the mail was sent; server-side we see the real status and log it to Vercel. `signUp` for an existing email returns **no error but `identities: []`** — handled explicitly. The callback accepts both `?code=` (PKCE — only works in the browser that signed up) and `?token_hash=&type=` (works cross-device, needs the Supabase email template changed). Dashboard setup (Site URL, Redirect URLs, templates, SMTP rate limit): `.claude/ai-context/feature-specs/auth.md`.
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
- `GET|POST|DELETE /api/game-audio` — recorded voice lines for the games. GET is public (`{ clips: { text: url?v=updated_at } }`, `{}` on any error so games fall back to Piper); POST (multipart `text` + WAV `file`, ≤3 MB, RIFF/WAVE header checked) and DELETE (`?text=`) call `blockIfNoImportAccess`. Only texts present in `GAME_CLIPS` are accepted, so nobody can write arbitrary files into the bucket. Bucket creation is shared with `/api/upload-audio` via `lib/audioStorage.ts`.
- `POST /api/feedback` — **public** (parents report without logging in). Anti-spam: honeypot field `website` (filled → fake `{ok:true}`), length caps (`MAX_MESSAGE`/`MAX_CONTACT` in `lib/feedback.ts`), in-memory per-IP limit of 8 per 10 min → 429 (per server instance, best-effort). `kind: 'question'` requires a `reason`; `'general'` requires a `message`. `POST /api/feedback/resolve` `{id, resolved}` calls `blockIfNoImportAccess`.
- `POST /api/auth/email` — `{action: 'signup'|'recover'|'resend', email, password?, next}`. Returns `{ok:true, result:'sent'|'session'|'exists'}` or `{ok:false, error:{status, code, message, ms}}`. `next` goes through `safeNext`; email links are built from the request origin, never from client input.
- `POST /api/auth/logout` — clears Supabase session.

### Import flow (`components/import/`)

`ImportClient.tsx` is the central editor. Key behaviors:

- **Autosaves to `localStorage`** under `ontap_import_draft_v1` (lessons) or `ontap_exam_draft_v1` (exams), debounced 500 ms. Skipped in edit mode. The chapter hydration race is handled via the `pendingChapterId` ref — preserve this when refactoring the chapter fetch effect, or restored drafts will lose their chapter selection. Subjects need no such ref: they come from `lib/subjects.ts` synchronously and the selection is derived, not stored. Drafts persist the subject **name**; drafts written before that (which stored a numeric `subjectId`) fall back to the grade's first subject.
- Distinguishes lesson vs. exam through `examMode` prop AND `initialData.type`; both flow into the `type` column in the API payload.
- Keyboard shortcuts (global `keydown` listener): `Ctrl/Cmd+S` saves, `Ctrl/Cmd+Enter` adds a blank question.
- **Dán cả cụm "câu hỏi + A/B/C/D" vào ô nội dung** tự tách đáp án ra các ô riêng (`lib/optionSplitter.ts`, nối qua `TiptapEditor`'s `onPasteText`). Only splits when it is **sure**: a run of labels starting at `A` in order, a non-empty stem, no empty option, the question is mcq/multi, and both the content field and every option are still empty — a wrong guess destroys what the user just pasted. It says what it did and offers **Hoàn tác**, which restores the *raw pasted text* rather than the pre-paste state, since "undo" here means "don't split", not "throw away my paste".
- **Paste-import (`PasteImportModal`)** accepts plain text or HTML. Primary parser: `lib/examParser.ts` (question starts `Câu N.` / `Câu N:`, options `A.`…, answer markers `Đáp án:`, `Answer:`, `Chọn X.`). **URL import:** `GET /api/fetch-exam?url=` returns HTML/plain text; if it looks like a loigiaihay/vietjack solution page, `lib/loigiaihayParser.ts` (`parseLoigiaihay`) is used instead of `examParser`. Type is inferred at commit time: ≥2 options + one letter → `mcq`; ≥2 options + multiple letters → `multi`; no options + numeric → `numeric`; else → `short`. Letter answers (`Đáp án: B`) only apply when options exist — otherwise `Đáp án: Cần Thơ` stays `short`.
- **Photo scan, two paths** in `PasteImportModal`: free in-browser OCR (`lib/browserOcr.ts`, Tesseract.js `vie`, worker/core/lang data loaded from jsDelivr on first use) → `lib/ocrText.ts → cleanOcrText` (splits `A.4 B.5 Cc.6` option rows, canonicalizes markers) → text box → normal `examParser` flow; and paid `POST /api/ocr-exam` (Claude vision, only shown when `ANTHROPIC_API_KEY` is set, reads pen-circled answers). Free OCR never detects the correct answer.
- **Tiptap → focused editor singleton**: `lib/focusedEditor.ts` tracks whichever Tiptap instance currently has focus so the LaTeX cheat-sheet buttons in the sidebar can insert into the right field. `onMouseDown` with `preventDefault` is required on those buttons or focus shifts before insertion.
- **Image uploads** go through `POST /api/upload-image` → public Supabase Storage bucket `question-images` (service-role, bypasses RLS). Bucket must exist and be public for the returned URLs to be readable.

### Đọc thành tiếng (TTS)

`lib/speech.ts` wraps the browser's Web Speech API — **no API key, no cost, no network**. `SpeakButton` reads one question + its options; `QuizClient` also has a **"Nghe cả bài"** button that reads every question in order, announcing "Câu N" in Vietnamese before each and scrolling to whichever question is being read (`speakSegments`'s `onSegmentStart` carries the segment's `mark`).

- Language is auto-detected per segment: Vietnamese diacritics → `vi-VN`, otherwise `en-US`. Options with no letters (`"12"`, `"3,5"`) inherit the question's language, or a Vietnamese maths question would read "one, two" in an English voice.
- LaTeX and HTML are stripped before speaking (`stripForSpeech`).
- Rate lives in `localStorage` (`ontap_speech_rate`, default **0.7** — deliberately slow for primary-school kids) and is exposed as Chậm/Vừa/Nhanh in the quiz header. Read through `useSyncExternalStore` + `subscribeSpeechRate`, so no setState-in-effect and no hydration mismatch.
- Buttons hide entirely when the browser has no `speechSynthesis`.
- **Which lessons get read-aloud at all — `lib/readAloud.ts`.** Nghe / Nghe cả bài / the voice settings (quiz) and the per-question Nghe on `/result` show only for **lớp 1–2 (every subject), every Tiếng Anh lesson, or any lesson that already has `audioUrl` files**; Toán/Tiếng Việt from lớp 3 up have none (kids read by then, and device TTS reading "6 - ___ = 5" is worse than the text). Unknown grade → shown, as before. The **"Gắn giọng đọc"** links on the quiz start screen and in the listen hint show **only on Tiếng Anh** lessons — it is an editor tool and parents kept landing in it from maths quizzes. `/import/giong-doc/[id]` itself still works for any lesson by URL. `/huong-dan` and `/huong-dan/soan-de` state this rule; keep them in sync.
- **Three browser bugs are worked around in `speakSegments`** — all three only bite on long reads, which is why one question worked and the whole exam didn't: (1) Chrome/Safari stop the synthesiser after ~15 s, so a `resume()` keep-alive ticks every 5 s while speaking; (2) `onend` sometimes never fires on iOS and stalls the chain, so each utterance also carries a length-based timeout that advances it; (3) iOS only allows `speak()` inside the user-gesture task, so `speakSegments` is **synchronous** — never `await` before the first `speak()` or audio is silently blocked.
- Voice quality is the device's, not ours. `voicesFor()` ranks candidates (prefers `Google`/`Enhanced`/`Premium`/`Neural`, penalises iOS `Compact`, and **drops Apple's novelty/legacy voices entirely** — Boing, Bubbles, Zarvox, Fred… sit in `getVoices()` looking like ordinary en-US voices) and `VoicePicker` lets the user override per language (`ontap_voice_<lang>`), because only the listener can judge.
- **iOS caveat that drives the whole cloud-TTS design below:** Safari does *not* expose the Enhanced/Premium voices a user downloads under Settings → Accessibility → Read & Speak (older iOS: Spoken Content) to web pages — those are reserved for Apple's own apps. Telling a user to download a better voice does nothing for this site. iOS also ships exactly one `vi-VN` voice, so `VoicePicker` hides itself for Vietnamese there.

### Giọng đọc gắn sẵn — không gọi dịch vụ ngoài nào

`questions.explanation` also carries `audioUrl`. Audio is produced **outside the app** (Piper on a laptop, or a real recording) and uploaded; there is no TTS provider, no API key, no quota. A cloud-TTS path (Gemini/OpenAI) existed briefly and was removed — free-tier quotas were far too small for whole exams. `git log -- lib/tts.ts` has it if it's ever wanted back.

- `/import/giong-doc/[id]` (`components/import/AudioMapper.tsx`) maps uploaded files to questions **by the number in the filename** (`wav_3.wav` → question 3), never by pick order — browsers don't guarantee file order. `lib/audioFileName.ts` strips the extension before scanning (`.m4a`/`.mp3` contain digits) and takes the **last** number (real filenames carry date or lesson prefixes).
- Mis-mapping is the silent failure that matters — a child hears the wrong question and nobody notices. So the page names every file it could not place, shows which filename landed on which question, marks each row **đã lưu / chưa lưu** against server data, and gives each row an inline player to check before saving.
- `POST /api/upload-audio` stores the file (named by content hash, so re-uploading the same file overwrites itself). `POST /api/lesson-audio` merges `audioUrl` into the existing `explanation` blob — read-merge-write, so images and solutions survive. It deliberately does **not** go through `/api/update-lesson`; that route wipes and reinserts every question, and now re-attaches `audioUrl` by **question content** so editing a lesson no longer destroys its audio.
- `lib/audioSpeech.ts` plays the files. Three invariants, commented at the top: (1) a ~5 ms silent WAV plays **synchronously** to unlock the audio element inside the tap — no `await` before it, or iOS blocks playback; (2) exactly one `HTMLAudioElement` for the page's lifetime, since the unlock binds to it; (3) a `generation` counter so a stopped read exits quietly. `playOne` also carries a duration-based timeout because iOS does not always fire `ended`, which would otherwise freeze the chain on question 1.
- Speed is applied with `playbackRate` (`mapRateToSpeed`), never by re-rendering audio.
- Questions without a file are skipped and the count is reported — a read that silently jumps over questions is worse than one that says so.

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

`getLeaderboardByGrade` in `lib/db.ts` joins subjects → chapters → lessons → quiz_results in app code. Ranking is by **total points**: each lesson counts once at its best attempt, scaled to 100, then summed. Ties break on average, then lesson count. It deliberately does **not** rank by average: averaging let one lucky single-lesson attempt outrank a child who did many lessons. `quiz_results` is paged in 1000-row pages (Supabase's cap) with lesson ids chunked at 200. Emails are resolved with `auth.admin.getUserById` for the top 10 only, then masked to `abc***yz`; the last two characters are kept so two `ngo…` accounts are distinguishable. Wrapped in `try/catch` returning `[]`. `QuizClient` posts results with `keepalive: true`, because the page navigates to `/result` immediately and the browser otherwise cancels the request. `/api/quiz-result` rejects non-integer, negative, or `score > total` values.

### Offline NXBGD import (`scripts/`)

Node scripts (not part of Next.js runtime) to bulk-load content from NXBGD API into Supabase via service role:

- `scripts/nxbgd-import.mjs` — chapter/lesson skeletons (`source_id`)
- `scripts/nxbgd-import-questions.mjs` — questions into existing lessons (needs `NXBGD_TOKEN`; idempotent skip if lesson already has questions)

Run with `node --env-file=.env.local scripts/...`. See `.claude/ai-context/scripts/nxbgd-import.md`.

### Toán tự sinh (`lib/mathGen/`, `scripts/gen-math-*.ts`)

Bài luyện tập Toán lớp 1, 2, 3, 5 sinh bằng code — **không gọi AI hay API ngoài**; đáp án do máy tính tính (số thập phân dùng kiểu `Dec` nguyên + số chữ số thập phân, không float). `lib/mathGen/lop{1,2,3,5}.ts` chứa các dạng bài, `lib/mathGen/index.ts` có `MATH_LESSONS` (mỗi chủ đề = 1 bài 10 câu) và `toQuestionRow` chuyển câu thô sang dòng `questions`:

- Trắc nghiệm, đúng/sai → `mcq`; sắp xếp → `mcq` "Dãy nào sắp xếp đúng?" (quiz không có kéo-thả).
- Điền số → `numeric` **chỉ khi < 1000**; số có dấu chấm ngăn nghìn (`5.000`) hoặc phân số → `short` với mọi cách viết (`5.000|5000|5 000`), vì `scoreAnswer` numeric đọc `5.000` thành 5.
- Mỗi câu chỉ có **một** chỗ trống (quiz có một ô nhập); kết quả dạng "_ giờ _ phút" là trắc nghiệm, đáp án nhiễu không bao giờ bằng giá trị đáp án đúng.
- Mặt đồng hồ là SVG data URI trong `explanation.images` — không cần Storage.

`npx tsx scripts/gen-math-check.ts` chạy mỗi dạng 3000 lần, tính lại đáp án độc lập và chấm thử bằng chính `scoreAnswer`. **Chạy lại sau mọi lần sửa generator.**

Đưa lên DB bằng **SQL, không cần service key**: `npx tsx scripts/gen-math-sql.ts [--seed v2]` xuất `supabase/toan-tu-sinh.sql` (file này được commit sẵn, seed `v1`) → dán vào Supabase SQL Editor → Run. Mỗi lớp 1, 2, 3, 5 có chương "Luyện tập theo chủ đề" (`source_id` `gen_toan_lop_N`, bài `gen_<id>`); file chạy lại an toàn, bài đã có câu hỏi thì bỏ qua. Gỡ: `DELETE FROM chapters WHERE source_id LIKE 'gen_toan_lop_%';` (cascade, không đụng bài nhập tay/NXBGD). Đổi `id` của một bài trong `MATH_LESSONS` sau khi đã import sẽ tạo bài mới, bài cũ thành mồ côi. **Sửa generator thì sinh lại file SQL rồi commit kèm**, đừng sửa tay file SQL.

## Conventions

- All files use 2-space indent.
- `getSupabaseServer()` calls and `try/catch` returning a safe default (`[] / null`) is the established pattern for SSR data fetches — failures should not crash the page.
- Vietnamese is the source of truth for user-facing strings, including error messages from API routes.
- Existing code uses `(data as any)` in a few places to work around Supabase's generated types not knowing about the `type` column. Don't propagate this further than necessary.
- The schema's `lessons.status` is `'completed' | 'active' | 'locked'` but the app surface only really uses `'active'` (new lessons default to it via `create-lesson`); UI lock states are not currently enforced.
