# Project Overview

## Stack
- Next.js 16.2.4 (App Router)
- React 19
- TypeScript 5
- TailwindCSS 3.4
- Supabase JS 2.x (database only — no auth)
- KaTeX 0.16 (math rendering)
- Tiptap v3 (rich text editor, used in import)

## Purpose
Free exam practice platform for Vietnamese primary school students (Lớp 1–5).
Bám sát chương trình SGK mới. No login required.

## Core Features (implemented)
- Home: grade selector with cards (Lớp 1–5)
- Grade page: subject tabs → chapters → lessons list from Supabase
- Quiz: multiple-choice, 15-min timer, question palette, result page
- Import (`/import`): create a new lesson + questions manually or via paste-import; KaTeX support
- AI Import (`/import/ai`): upload image / PDF / URL → Claude parses questions server-side → review → save
- Teacher (`/teacher`): add questions to an existing lesson; cascade selectors (grade → subject → chapter → lesson)

## NOT implemented
- Authentication / user accounts
- Progress tracking
- Subscriptions
- AI tutor
- Zustand (not in dependencies)

## UI Style
- Clean, minimal, mobile-first
- Blue/indigo primary palette
- Per-grade color theming (red/orange/green/blue/purple for grades 1–5)
- Vietnamese language throughout

## Environment variables
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/publishable key
- `ANTHROPIC_API_KEY` — required for `/import/ai` only; server-side only (no NEXT_PUBLIC_ prefix)
