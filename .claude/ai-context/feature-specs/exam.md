# Đề kiểm tra (Exam)

## Khái niệm DB
`lessons.type = 'exam'` (cột có thể thiếu trên DB cũ — `ALTER TABLE lessons ADD COLUMN type TEXT;`)

Bài luyện tập: `type = 'lesson'` hoặc `NULL` (legacy).

## Routes

| Route | Mô tả |
|-------|--------|
| `/de-thi` | List tất cả exam, group theo lớp — `getAllExams()` |
| `/lop/[grade]?view=exam` | Exam trong môn đang chọn |
| `/import/exam` | Tạo đề mới — `ImportClient` `examMode` |
| `/import/edit/[id]` | Sửa đề (cùng editor, `initialData.type`) |
| `/quiz?lessonId=` | Làm đề — cùng quiz flow với bài học |

## Tạo đề
- Draft key: `ontap_exam_draft_v1`
- Payload `create-lesson` / `update-lesson` gửi `type: 'exam'`
- `duration_minutes` set trong form import

## UI list (`/de-thi`)
- `export const dynamic = "force-dynamic"` — luôn đọc DB lúc request
- Grade color badges (rose → violet)
- Link tới `/quiz?lessonId=`

## Header nav
"Mục **Đề kiểm tra**" → `/de-thi`  
"Tạo đề kiểm tra" → `/import/exam`
