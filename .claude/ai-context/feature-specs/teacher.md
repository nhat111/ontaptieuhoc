# Teacher Page

## URL
`/teacher`

## Purpose
Add questions to an **existing** lesson in Supabase. Complementary to `/import` which *creates* a new lesson.

## Flow
1. Select grade (1–5 buttons)
2. Select subject → loads from Supabase client
3. Select chapter → loads from Supabase client
4. Select existing lesson OR create a new one inline
5. Add / edit questions
6. Save → `supabase.from("questions").insert(rows)` directly (no API route)

## Components
- `TeacherPage` (`app/teacher/page.tsx`) — full page, client component
- `QuestionEditor` (`components/teacher/QuestionEditor.tsx`) — reusable per-question editor card

## QuestionEditor features
- Math symbol toolbar (quick-insert: fractions, sqrt, powers, ×, ÷, etc.)
- Textarea with plain-text preview
- Option inputs with click-to-set-correct-answer
- Optional explanation field (toggle show/hide)
- Collapse/expand, move up/down, duplicate, delete actions
- Amber border when question is incomplete (no content or no correct answer set)

## Create new lesson inline
- Input + "+ Tạo" button inserts a new `lessons` row directly via Supabase client
- `index_label` auto-generated as padded count (`"01"`, `"02"`, ...)
- New lesson becomes selected immediately after creation

## Save behavior
- Validates all questions have content + correct answer before saving
- Inserts all question rows in one `supabase.from("questions").insert(rows)` call
- On success: resets to one blank question, shows "✓ Đã lưu!" for 3 seconds
- Error message displayed inline in header area

## Navigation
- Back button (←) in header links to `/import`
- Accessible from main `Header` nav ("Teacher" link)
