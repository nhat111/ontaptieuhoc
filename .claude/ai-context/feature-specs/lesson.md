# Grade / Lesson Browse

## URL
`/lop/[grade]?subject=<name>`

## Page flow
1. Server fetches `subjects` for grade from Supabase
2. Active subject determined from `?subject=` query param (defaults to first)
3. Server fetches chapters + lessons for active subject (with question count)
4. Renders: subject tabs bar → chapter accordion → lesson list

## Components
- `SubjectTabs` — horizontal pill tabs, updates URL on click
- `ChapterItem` — collapsible accordion; first chapter open by default
- `LessonItem` — single lesson row with index_label, title, question count, status
- `Sidebar` — right column on desktop (tip/promo content)

## Lesson status
- `active` — clickable, links to `/quiz?lessonId=N`
- `completed` — done indicator
- `locked` — greyed out (no nav)

## Rules
- No auth required
- Questions count shown per lesson (fetched with `questions(count)` join)
- Subject tab change is a full page navigation (URL-driven, server-rendered)
