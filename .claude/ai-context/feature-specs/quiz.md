# Quiz System

## URL
`/quiz?lessonId=<id>`

## Data source
Server (`app/quiz/page.tsx`) gọi `lib/db.ts` → truyền `initialQuestions` + `initialLesson` vào `QuizClient`. Không có fallback localStorage.

## Components
| File | Vai trò |
|------|---------|
| `QuizClient.tsx` | Start screen, timer, answers state, submit |
| `QuestionCard.tsx` | Render theo `QType` |
| `AnswerOption.tsx` | Nút chọn (mcq/multi) |
| `QuestionPalette.tsx` | Sidebar: đã/chưa trả lời, nút nộp |

## Lifecycle

1. **Start screen** (`started=false`): hiện title, số câu, `durationMinutes` (từ DB, default 15). Nút **Bắt đầu làm bài**.
2. User bấm Start → `started=true` → countdown từ `durationMinutes * 60`.
3. Timer hiển thị `MM:SS` (`formatTime`); đỏ + pulse khi `< 60s`.
4. Hết giờ hoặc **Nộp bài** → `submit()`.

## Question types (`lib/quizData.ts`)

| type | UI | `answers[i]` | `correctAnswer` (DB) |
|------|-----|--------------|----------------------|
| `mcq` | Chọn 1 option | Text option đã chọn | Text option đúng |
| `multi` | Chọn nhiều | `JSON.stringify(string[])` | `JSON.stringify` mảng đúng |
| `short` | Input text | Raw input | `đáp1\|đáp2` (so khớp không phân biệt hoa thường, trim) |
| `numeric` | Input số | Raw input | Số dạng string; `,` và `.` đều chấp nhận; so sánh `abs(a-b) < 1e-9` |

`QuizClient` chuẩn hóa `""` và `"[]"` → `null` (chưa trả lời).

## Submit flow

```ts
submit(finalAnswers):
  score = count scoreAnswer(q, a)
  fetch POST /api/quiz-result { lessonId, score, total }  // .catch swallow
  sessionStorage.quizResult = { questions, answers, lessonId, lessonTitle }
  router.push("/result")
```

## Result (`/result`)
- Đọc `sessionStorage` key `quizResult`; không có → redirect `/`
- `ResultSummary` + `ResultItem` per question
- **Làm lại** → `/quiz?lessonId=N`
- **Quay lại** → `/` hoặc danh sách tùy UI

## Timer rules
- Chỉ chạy sau Start; refresh trang → lại Start (timer không lưu).
