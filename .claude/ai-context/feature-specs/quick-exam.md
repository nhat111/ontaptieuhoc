# Tạo đề nhanh (`/tao-de`) — trạng thái & lộ trình

Chi tiết kỹ thuật đầy đủ: mục `/tao-de` trong `CLAUDE.md`. File này để phiên sau làm tiếp đúng hướng.

## Đã có (Oct 2026)

| Lớp | Môn | Kiểu đề | Nguồn câu hỏi |
|-----|-----|---------|---------------|
| 1–4 | Toán | **Cấu trúc đề thật**, có hình vẽ (đếm hình, đồng hồ, thước, tiền, gấp khúc, chu vi – diện tích, góc, hình thoi – bình hành, biểu đồ cột, phân số) | `lib/exam5/toan1to4.ts` (dùng lại `lib/mathGen/lop1..4`) + `figures.ts` |
| 5 | Toán | **Cấu trúc đề thật**, có hình vẽ (PR #82) | `lib/exam5/toan5.ts` + `figures.ts` |
| 4 | Tiếng Việt | **Cấu trúc đề thật**, cùng khung lớp 5 | Viết tay: `lib/exam5/tvContent4.ts` (8 bài đọc, 36 câu LTVC) — **chờ người duyệt nội dung** |
| 5 | Tiếng Việt | **Cấu trúc đề thật**: đọc hiểu + LTVC + tập làm văn (PR #82) | Viết tay: `lib/exam5/tvContent.ts` (8 bài đọc, 42 câu LTVC) |
| 6–9, môn khác | — | Hiện "Sắp có" + link đề soạn sẵn | — |

Sinh đề ~1–2 ms/đề, chạy trên máy, không AI, không DB. Cùng `seed` → cùng đề.

## Kiến trúc dùng lại được

- `lib/exam5/paper.ts` — `ExamPaper`: sections → câu có điểm, `work` (đặt tính / bài giải / dòng kẻ), nhóm a) b) c), `reading`, `writing`, câu `open` chỉ in.
- `lib/exam5/tiengViet.ts` — khung đề Tiếng Việt dùng chung; mỗi lớp là một `TvContent` (bài đọc, ngân hàng LTVC, chủ đề theo kì, đề tập làm văn, độ dài bài đọc).
- `lib/exam5/print.ts` — in như tờ đề trường (header, Điểm–Nhận xét, hướng dẫn chấm). Dùng cho mọi lớp.
- `lib/exam5/figures.ts` — hình SVG đen trắng. Thêm hình mới ở đây.
- `QuickExamSpec.paper(seed)` trong `lib/quickExam.ts` — chỗ nối một lớp/môn mới.
- Kiểm tra: `scripts/exam5-check.ts` (tính lại đáp án Toán 5, soát nội dung TV mọi lớp trong `TV_CONTENT`), `scripts/exam14-check.ts` (tính lại đáp án Toán 1–4 từ chữ và từ hình), `scripts/quick-exam-check.ts` (mọi spec: số câu, điểm, tất định, chấm điểm).

## Lộ trình đã thống nhất với chủ dự án

1. ~~**Toán lớp 1–4 lên cấu trúc đề thật**~~ — **xong.** Lớp 1–2: 6 câu trắc nghiệm + tính 4 ý + "Số?"/tính 4 ý + bài toán 2đ + bài 4 1đ (35 phút); lớp 3–4: 8 + đặt tính 4 ý + 2 ý + bài toán 2đ + bài 4 1đ (40 phút). Mỗi kì một blueprint trong `BLUEPRINTS[lớp][kì]`. Còn có thể làm thêm: đề lớp 1 có tranh minh hoạ cho "viết phép tính thích hợp" (hiện là chữ); hình khối (lập phương, hộp, trụ, cầu) lớp 1–2; bảng số liệu lớp 3.
2. **Tiếng Việt lớp 4, rồi lớp 3** — **xong** (`tvContent4.ts`, `tvContent3.ts`; cần người duyệt). Lớp 3 dùng chung khuôn đề lớp 4–5 (đọc thành tiếng 3đ + đọc hiểu 7đ, viết một đoạn văn 5–7 câu); đề lớp 3 ngoài đời thường có thêm chính tả nghe – viết trong phần Viết, chưa làm. Lớp 1–2: thêm phần chính tả/vần, dùng lại bộ từ `lib/dailySheet.ts`. **Nội dung viết tay phải có người duyệt.**
2b. **Tiếng Việt lớp 1–2** — **xong** (`lib/exam5/tv12.ts`, `tvContent1.ts`, `tvContent2.ts`; cần người duyệt). Lớp 1: đọc thành tiếng 7đ + đọc hiểu 3 câu; nghe – viết 7đ + bài tập chính tả 3 câu. Lớp 2: đọc thành tiếng 4đ + đọc hiểu, luyện từ và câu 6đ; nghe – viết 3đ + chính tả 1đ + viết đoạn 4–5 câu 6đ. Bài đọc lớp 1 học kì I chỉ dùng âm, vần đã học (`scripts/tv12-check.ts` soát). Còn có thể làm thêm: tranh cho đề lớp 1 (nối tranh với từ), thêm bài đọc (mỗi kì mới 2 bài).
2c. **Tiếng Anh lớp 3–5** — đã thống nhất làm sau Tiếng Việt 1–2. Đợt 1: Reading & Writing (trắc nghiệm, chọn từ khác loại, True/False, sắp xếp câu) + Speaking cho giáo viên chấm; đợt 2: Listening bằng mp3 làm sẵn. Cần hỏi chủ dự án bộ sách trước khi soạn từ vựng theo Unit.
3. **THCS (6–9): không tự sinh** — "Tạo đề nhanh" lấy ngẫu nhiên câu từ các đề thầy cô đã nhập (`lessons.type='exam'` theo lớp/môn), thay vì generator.
4. Thêm bài đọc cho TV5 (mỗi kì mới 2 bài → hay lặp).

## Khi thêm một lớp/môn

1. Tạo builder trả `ExamPaper` (tổng điểm 10; TV: phần đọc hiểu 7).
2. Nối vào `getQuickExam` (+ `SUBJECT_SLUG` nếu môn mới; regex trong `quickExamById`).
3. Thêm cặp (lớp, môn) vào `SUBJECTS` của `scripts/quick-exam-check.ts`; nội dung/generator mới có script `*-check.ts` riêng.
4. Cập nhật chữ trên `QuickExamClient` ("Hiện máy tạo được…"), `/huong-dan`, `CLAUDE.md`, file này.
5. `npm run check`, build, chụp thử bản in PDF.
