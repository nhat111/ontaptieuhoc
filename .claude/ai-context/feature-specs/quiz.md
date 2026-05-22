# Quiz System

## URL
`/quiz?lessonId=<N>`

## Data source
Single source: Supabase DB. The server fetches questions and lesson meta, passes them as props to `QuizClient`. There is no localStorage fallback or priority override.

## Components
- `QuizClient` — main client component; manages all state
- `QuestionCard` — renders question + 4 answer options (A/B/C/D labels)
- `AnswerOption` — single answer button with selected/unselected state
- `QuestionPalette` — right sidebar; shows answered/unanswered status per question; submit button

## Timer
- 15 minutes countdown (`15 * 60` seconds)
- Displays `MM:SS` in green; turns red + pulsing when < 60s
- Auto-submits when timer hits 0

## Answer state
- `answers: (string | null)[]` — null = unanswered
- Selecting an answer updates state + scrolls palette indicator
- No deselect — once selected, an option stays until another is picked

## Submit
- Stores `QuizResult` in `sessionStorage` key `"quizResult"`
- Navigates to `/result`
- No Supabase write at submit time

## Result page (`/result`)
- Reads `quizResult` from sessionStorage on mount; redirects home if absent
- Calculates correct / wrong / unanswered counts
- Shows per-question breakdown with correct answer highlighted
- Buttons: "Làm lại" (back to `/quiz?lessonId=N`) + "Quay lại danh sách" (home)
