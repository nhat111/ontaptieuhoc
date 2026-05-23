# Grade / Lesson Browse

## URL
`/lop/[grade]?subject=<tên môn>&view=lesson|exam`

- `view` mặc định / `lesson` → bài tập (`lessons.type = 'lesson'` hoặc legacy null)
- `view=exam` → đề kiểm tra trong môn đó

Trang `/de-thi` liệt kê **tất** exam cross-subject; trang lớp lọc theo môn đang chọn.

## Server flow (`app/lop/[grade]/page.tsx`)
1. `await params`, `await searchParams` (Next 16)
2. `getSubjectsByGrade(gradeNum)`
3. Active subject = `?subject=` hoặc môn đầu tiên
4. Parallel: `getChaptersWithLessons(subjectId, typeFilter)` + `getLeaderboardByGrade(gradeNum)`

## Components
| Component | Vai trò |
|-----------|---------|
| `SubjectTabs` | Pill tabs — đổi `?subject=` (full navigation) |
| `ChapterItem` | Accordion chương; chương đầu mở sẵn |
| `LessonItem` | Hàng bài: `index_label`, title, số câu, status |
| `Sidebar` | Bảng xếp hạng + tip |

## Lesson link
- `status === 'active'` (và có câu) → `/quiz?lessonId=id`
- `locked` / `completed` — hiển thị nhưng enforcement UI hạn chế

## Leaderboard (`getLeaderboardByGrade`)
- Join subjects → chapters → lessons → quiz_results
- `auth.admin.listUsers` → mask email `abc***`
- Top 10 theo điểm TB tốt nhất mỗi lesson
- Lỗi → `[]` (try/catch)

## Auth
Không bắt buộc đăng nhập để xem/làm bài.
