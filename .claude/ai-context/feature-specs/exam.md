# Đề kiểm tra (Exam)

## Khái niệm DB
`lessons.type = 'exam'` (cột có thể thiếu trên DB cũ — `ALTER TABLE lessons ADD COLUMN type TEXT;`)

Bài luyện tập: `type = 'lesson'` hoặc `NULL` (legacy).

## Routes

| Route | Mô tả |
|-------|--------|
| `/de-thi` | Kho đề kiểm tra: lọc lớp / môn / tìm tên, group theo lớp — `getAllExams()` + `components/exams/ExamBrowser.tsx` |
| `/lop/[grade]?view=exam` | Exam trong môn đang chọn |
| `/import/exam` | Tạo đề mới — `ImportClient` `examMode` |
| `/import/edit/[id]` | Sửa đề (cùng editor, `initialData.type`) |
| `/quiz?lessonId=` | Làm đề — cùng quiz flow với bài học |

## Tạo đề
- Draft key: `ontap_exam_draft_v1`
- Payload `create-lesson` / `update-lesson` gửi `type: 'exam'`
- `duration_minutes` set trong form import

## UI list (`/de-thi`)
- `export const dynamic = "force-dynamic"` — luôn đọc DB lúc request; ẩn đề chưa có câu hỏi.
- Server lấy hết đề, `ExamBrowser` (client) lọc: nút chọn lớp (chỉ lớp có đề), ô chọn môn (lấy từ chính các đề, xếp theo `lib/subjects.ts`), ô tìm không cần gõ dấu. Bộ lọc nằm trong URL `?lop=&mon=&q=` (`history.replaceState`); server đọc cùng tham số cho lần hiển thị đầu.
- Thẻ đề: nhãn môn có màu, số phút, số câu, nút "Làm bài" → `/quiz?lessonId=`.
- Không có đề phù hợp: nút "Tạo đề {môn} lớp {g}" (khi `hasQuickExam`, tính trên server) hoặc "Tạo đề nhanh", kèm "Xem tất cả đề".
- **Không** đặt nút "Tạo đề mới" / link `/import/exam` ở đây (trang công khai). **Không** hiện số liệu bịa (độ khó, số lượt làm) — DB không có.

## Tải đề để in (Word / PDF)
Nút ở **màn hình đầu** của `/quiz`, có bản kèm đáp án. **Mở cho mọi người, không rào premium** — mục đích của nó là để phụ huynh in cho bé làm trên giấy, dựng rào là chặn đúng người cần dùng. Đừng gắn lại `isPremium` vào đây (xem `feature-specs/access-control.md`).

## Header nav
"Mục **Đề kiểm tra**" → `/de-thi`  
"Tạo đề kiểm tra" (khu soạn đề) → `/import/exam`, chỉ trong menu tài khoản, không ở nav công khai
