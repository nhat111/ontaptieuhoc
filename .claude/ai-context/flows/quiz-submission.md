# Quiz Submission Flow

```
User opens /quiz?lessonId=N
↓
Server: getQuestionsFromDB(N) + getLessonMetaFromDB(N)
↓
QuizClient renders — questions and lesson come directly from server props
↓
15-min timer starts
↓
User answers questions (palette shows progress)
↓
User clicks "Nộp bài" OR timer hits 0
↓
submit(answers):
  - JSON.stringify({ questions, answers, lessonId, lessonTitle })
  - sessionStorage.setItem("quizResult", ...)
  - router.push("/result")
↓
/result page:
  - reads sessionStorage on mount; redirects to / if key absent
  - calculates correct / wrong / unanswered
  - renders ResultSummary + ResultItem list
  - "Làm lại" → /quiz?lessonId=N
  - "Quay lại" → /
```

## Notes
- Single data source: Supabase DB via server-side fetch — no localStorage override
- No Supabase write during quiz (quiz_results insert exists in lib/db.ts but is not called)
- No auth — results are not tied to any user
- sessionStorage is tab-scoped and cleared on tab close
