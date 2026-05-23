# Quiz Submission Flow

```
User → /quiz?lessonId=N
↓
Server (page.tsx): getQuestionsFromDB + getLessonMetaFromDB
↓
QuizClient — Start screen (started=false)
↓
User clicks "Bắt đầu làm bài" → started=true
↓
Timer: durationMinutes * 60 (from lessons.duration_minutes)
↓
User answers (mcq | multi | short | numeric)
  palette tracks null vs answered
↓
"Cộp bài" OR timer → 0
↓
submit(finalAnswers):
  1. scoreAnswer() per question
  2. POST /api/quiz-result { lessonId, score, total }  [errors swallowed]
  3. sessionStorage.quizResult = JSON
  4. router.push("/result")
↓
/result:
  read sessionStorage; missing → redirect /
  ResultSummary + per-question ResultItem
  "Làm lại" → /quiz?lessonId=N
```

## Data persistence

| Layer | Content |
|-------|---------|
| `quiz_results` row | `lesson_id`, `score`, `total`, `user_id?`, `created_at` |
| `sessionStorage` | Full `questions`, `answers`, `lessonId`, `lessonTitle` for UI review |

Refresh `/result` → mất sessionStorage → về home.

## Scoring

- Logic: `lib/quizData.ts → scoreAnswer(q, answer)`
- Multi: so sánh set (length + membership)
- Short: split `|` accepted list
- Numeric: float tolerance 1e-9

## Notes

- Không lưu timer progress
- API failure không chặn xem kết quả (sessionStorage vẫn set)
- Leaderboard trên `/lop/[grade]` dùng aggregate `quiz_results` — không đọc sessionStorage
