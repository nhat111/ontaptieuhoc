# Tạo đề nhanh (`/tao-de`) — trạng thái & lộ trình

Chi tiết kỹ thuật đầy đủ: mục `/tao-de` trong `CLAUDE.md`. File này để phiên sau làm tiếp đúng hướng.

## Đã có (Oct 2026)

| Lớp | Môn | Kiểu đề | Nguồn câu hỏi |
|-----|-----|---------|---------------|
| 1–4 | Toán | Trắc nghiệm + tự luận, chưa theo cấu trúc đề thật, gần như không có hình | `lib/mathGen` qua `MATH_SCOPE` (`lib/quickExam.ts`) |
| 5 | Toán | **Cấu trúc đề thật**, có hình vẽ (PR #82) | `lib/exam5/toan5.ts` + `figures.ts` |
| 5 | Tiếng Việt | **Cấu trúc đề thật**: đọc hiểu + LTVC + tập làm văn (PR #82) | Viết tay: `lib/exam5/tvContent.ts` (8 bài đọc, 42 câu LTVC) |
| 6–9, môn khác | — | Hiện "Sắp có" + link đề soạn sẵn | — |

Sinh đề ~1–2 ms/đề, chạy trên máy, không AI, không DB. Cùng `seed` → cùng đề.

## Kiến trúc dùng lại được

- `lib/exam5/paper.ts` — `ExamPaper`: sections → câu có điểm, `work` (đặt tính / bài giải / dòng kẻ), nhóm a) b) c), `reading`, `writing`, câu `open` chỉ in.
- `lib/exam5/print.ts` — in như tờ đề trường (header, Điểm–Nhận xét, hướng dẫn chấm). Dùng cho mọi lớp.
- `lib/exam5/figures.ts` — hình SVG đen trắng. Thêm hình mới ở đây.
- `QuickExamSpec.paper(seed)` trong `lib/quickExam.ts` — chỗ nối một lớp/môn mới.
- Kiểm tra: `scripts/exam5-check.ts` (tính lại đáp án Toán 5, soát nội dung TV), `scripts/quick-exam-check.ts` (mọi spec: số câu, điểm, tất định, chấm điểm).

## Lộ trình đã thống nhất với chủ dự án

1. **Toán lớp 1–4 lên cấu trúc đề thật** (ít công nhất): viết `BLUEPRINTS` theo kì giống `toan5.ts` từ generator có sẵn trong `lib/mathGen/lop{1..4}.ts`; thêm hình: đồng hồ (đã có `clockSvg`), hình vuông/chữ nhật/chu vi, đếm hình, tiền. Lớp 1–3 theo TT27 chỉ cuối kì là bắt buộc nhưng vẫn giữ đủ 4 loại đề.
2. **Tiếng Việt lớp 4, rồi lớp 3** (vừa): tái dùng `tiengViet5.ts`; viết bài đọc mới (tự soạn, không chép SGK), câu LTVC theo chương trình từng lớp. Lớp 1–2: thêm phần chính tả/vần, dùng lại bộ từ `lib/dailySheet.ts`. **Nội dung viết tay phải có người duyệt.**
3. **THCS (6–9): không tự sinh** — "Tạo đề nhanh" lấy ngẫu nhiên câu từ các đề thầy cô đã nhập (`lessons.type='exam'` theo lớp/môn), thay vì generator.
4. Thêm bài đọc cho TV5 (mỗi kì mới 2 bài → hay lặp).

## Khi thêm một lớp/môn

1. Tạo builder trả `ExamPaper` (tổng điểm 10; TV: phần đọc hiểu 7).
2. Nối vào `getQuickExam` (+ `SUBJECT_SLUG` nếu môn mới; regex trong `quickExamById`).
3. Thêm cặp (lớp, môn) vào `SUBJECTS` của `scripts/quick-exam-check.ts`; nội dung/generator mới có script `*-check.ts` riêng.
4. Cập nhật chữ trên `QuickExamClient` ("Hiện máy tạo được…"), `/huong-dan`, `CLAUDE.md`, file này.
5. `npm run check`, build, chụp thử bản in PDF.
