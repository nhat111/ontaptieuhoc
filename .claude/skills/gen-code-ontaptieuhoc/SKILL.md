---
name: gen-code-ontaptieuhoc
description: >-
  Code generation conventions for Ôn Tập Tiểu Học (Next.js 16 quiz app).
  Use when implementing or editing features in this repo — quiz, import,
  grade browse, auth, Supabase API routes, KaTeX/Tiptap, or NXBGD scripts.
---

# Ôn Tập Tiểu Học — Code Skill

Vietnamese primary-school quiz platform. **All user-facing strings in Vietnamese.**

**Deep reference:** `CLAUDE.md` (root) · **Feature index:** `.claude/ai-context/README.md`

## Stack (strict)

- Next.js 16 App Router · React 19 · TypeScript (strict) · Tailwind v3
- Supabase: Postgres + Auth + Storage
- KaTeX (`MathText`) · Tiptap v3 (import editor only)
- Path alias `@/*` → repo root
- **No** Zustand, **no** new libs without user approval

## Commands

```bash
npm run dev    # :3000
npm run build
npm run lint
# tsc --noEmit  (no npm script)
```

## Supabase — pick the right client

| Client | File | Use for |
|--------|------|---------|
| `getSupabaseServer()` | `lib/supabase/server.ts` | API routes + SSR **data** (bypasses RLS) |
| `createSessionClient()` / `getUser()` | `lib/supabase/server-client.ts` | Current user only (`quiz_results.user_id`, `/progress`) |
| `createClient()` | `lib/supabase/client.ts` | Browser **auth only** (login/logout) |

Image uploads: `POST /api/upload-image` (service role), not direct Storage from browser.

## Data model (short)

`subjects → chapters → lessons (type: lesson \| exam) → questions`

- `lessons.id` = `lessonId` in URLs
- `questions.type`: `mcq` \| `multi` \| `short` \| `numeric`
- `correct_answer` encoding **must match type** — wrong encoding breaks scoring silently
- `explanation` may store JSON `{ "imageUrl": "..." }`
- Scoring: `lib/quizData.ts → scoreAnswer`

## Key routes

| Route | Notes |
|-------|--------|
| `/`, `/lop/[grade]`, `/de-thi` | Browse; `await params` / `searchParams` (Promises) |
| `/quiz?lessonId=` | Start screen → timer → submit |
| `/result` | `sessionStorage.quizResult` only |
| `/progress` | Auth required |
| `/import`, `/import/exam`, `/import/edit/[id]` | `ImportClient` |
| `/login`, `/auth/callback` | Supabase Auth |

**Removed — do not recreate:** `/teacher`, `/import/ai`

## Architecture rules

- Server components fetch via `lib/db.ts` + `getSupabaseServer()`; wrap in `try/catch` → `[]` / `null`
- Client components only when needed (quiz, import, header auth)
- **No** `/modules` or `/services` folders — follow existing `app/`, `components/`, `lib/`
- `proxy.ts` (repo root): refreshes auth cookies on `/import/*` — **no auth gate**
- SSR pattern: minimal diff; 2-space indent; preserve `pendingSubjectId` / `pendingChapterId` in `ImportClient` draft hydration

## UI rules

- Mobile-first, `bg-gray-50`, white cards `rounded-xl border shadow-sm`
- Primary blue-600; per-grade accents (rose → violet)
- Math: `<MathText text={...} />`; KaTeX CSS only in `app/layout.tsx`
- Import LaTeX buttons: `onMouseDown` + `preventDefault` (keep Tiptap focus)

## Code rules

- Strong typing; avoid propagating `(data as any)` further than necessary
- Do not refactor unrelated code or rename files without reason
- Vietnamese error messages in API routes
- Question-only tasks: smallest correct diff

## Workflow (before coding)

1. Read task → identify files (grep / `ai-context`)
2. Reuse existing components (`ImportClient`, `QuizClient`, `QuestionCard`, …)
3. Implement minimal change; match surrounding style

## Roles (optional mental model)

Use implicitly — no need to announce role.

| Role | Focus |
|------|--------|
| UI_DESIGNER | Tailwind layout, Vietnamese copy, grade colors |
| COMPONENT_ENGINEER | Small focused components, clean props |
| STATE_MANAGER | Quiz/import hooks, timer gated on `started`, `sessionStorage` handoff |
| DATA_ENGINEER | Supabase rows / parsers (`examParser`, scripts), correct_answer encoding |
| REFACTOR_ENGINEER | Readability only — same behavior |

Role prompts: `PROMPTS/*.txt` in this skill folder.

## Never

- Add auth gates to `/import` unless explicitly requested
- Store quiz state in localStorage during play (DB props + sessionStorage on submit only)
- Call Anthropic from client or add `/import/ai` without user request
- Commit `.env.local` or service role keys

## Output style

- Production-ready code, minimal commentary unless asked
- Cite existing patterns over inventing new abstractions
