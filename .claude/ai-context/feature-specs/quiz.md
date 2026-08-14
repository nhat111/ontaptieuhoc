# Quiz System

## URL
`/quiz?lessonId=<id>`

## Data source
Server (`app/quiz/page.tsx`) gọi `lib/db.ts` → truyền `initialQuestions` + `initialLesson` vào `QuizClient`. Không có fallback localStorage.

`generateMetadata` cũng gọi hai hàm đó → chúng bọc React `cache()` để không query hai lần mỗi request. Bài 0 câu → `robots: noindex`.

## Components
| File | Vai trò |
|------|---------|
| `QuizClient.tsx` | Start screen, trộn, timer, answers state, đọc thành tiếng, tải đề, submit |
| `QuestionCard.tsx` | Render theo `QType` + nút 🔊 câu đó |
| `AnswerOption.tsx` | Nút chọn (mcq/multi) |
| `QuestionPalette.tsx` | Sidebar: đã/chưa trả lời, nút nộp |
| `VoicePicker.tsx` | Chọn giọng máy theo ngôn ngữ (ẩn khi máy chỉ có 1 giọng) |

## Lifecycle

1. **Start screen** (`started=false`): title, số câu, `durationMinutes` (từ DB, default 15), tuỳ chọn trộn, chọn tốc độ đọc, **Nghe cả bài**, **Tải đề để in**.
2. User bấm Start → **trộn một lần** (nếu bật) → `started=true` → countdown từ `durationMinutes * 60`.
3. Timer hiển thị `MM:SS` (`formatTime`); đỏ + pulse khi `< 60s`.
4. Hết giờ hoặc **Nộp bài** → `submit()`.

## Trộn thứ tự (`lib/quizPrefs.ts`, `shuffleQuiz`)

- Hai công tắc riêng: trộn câu hỏi / trộn đáp án. Lưu localStorage (`ontap_shuffle_questions`, `ontap_shuffle_options`), đọc qua `useSyncExternalStore`.
- Trộn **đúng một lần, lúc bấm Bắt đầu** — không bao giờ giữa chừng, nếu không câu hỏi nhảy dưới tay đứa nhỏ.
- Trộn đáp án an toàn vì `correct_answer` lưu **text** của đáp án, không phải chỉ số.

## Đọc thành tiếng

Chi tiết ở `tts-audio.md`. Tóm tắt trong quiz:

- `hasAudioFiles = questions.some(q => q.audioUrl)` → có file gắn sẵn thì `speakAudioFiles`, không thì `readWithDeviceVoice` (Web Speech).
- Câu bị bỏ qua (không có file) được **đếm và báo ra** (`audioNote`) — đọc nhảy câu mà im lặng thì tệ hơn.
- Tốc độ Chậm/Vừa/Nhanh dùng chung với `SpeakButton`, lưu `ontap_speech_rate` (mặc định 0.7).
- Nút ẩn hẳn khi trình duyệt không có `speechSynthesis` **và** đề không có file nào.

## Tải đề để in (`lib/exportLesson.ts`)

- `buildExamHtml(lesson, questions, { withAnswers, autoPrint })`.
- Word: Blob `application/msword` → tải `.doc`. PDF: mở tab mới, script `autoPrint` **chờ ảnh load xong** mới bật hộp thoại in, nếu không hình trong PDF bị trắng.
- `latexToPlain` đổi LaTeX sang chữ đọc được (phân số, căn, ×, ≤…) — Word không có KaTeX.
- **Mở cho mọi người.** Nút này sinh ra để phụ huynh in cho bé làm giấy; dựng rào premium là chặn đúng người cần dùng. Không có chỗ nào trong app đọc `isPremium` nữa.

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
  sessionStorage.quizResult = { questions, answers, lessonId, lessonTitle, grade, subjectName }
  router.push("/result")
```

`grade` / `subjectName` chép từ `LessonMeta` **chỉ để** `/result` dựng đúng breadcrumb và nút "Quay lại danh sách" — trang đó không có server props để tra cứu. Payload lưu từ trước khi có hai field này thì chỉ hiện ít crumb hơn.

## Result (`/result`)
- Đọc `sessionStorage` key `quizResult`; không có → redirect `/`
- `ResultSummary` + `ResultItem` per question (kèm "lời giải" nếu `explanation.solution` có)
- **Làm lại** → `/quiz?lessonId=N`
- **Quay lại danh sách** → `/lop/[grade]?subject=`

## Timer rules
- Chỉ chạy sau Start; refresh trang → lại Start (timer không lưu).
