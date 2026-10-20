# Tạo đề nhanh (`/tao-de`) — trạng thái & lộ trình

Chi tiết kỹ thuật đầy đủ: mục `/tao-de` trong `CLAUDE.md`. File này để phiên sau làm tiếp đúng hướng.

## Đã có (Oct 2026)

| Lớp | Môn | Kiểu đề | Nguồn câu hỏi |
|-----|-----|---------|---------------|
| 1–4 | Toán | **Cấu trúc đề thật**, có hình vẽ (đếm hình, đồng hồ, thước, tiền, gấp khúc, chu vi – diện tích, góc, hình thoi – bình hành, biểu đồ cột, phân số) | `lib/exam5/toan1to4.ts` (dùng lại `lib/mathGen/lop1..4`) + `figures.ts` |
| 5 | Toán | **Cấu trúc đề thật**, có hình vẽ (PR #82) | `lib/exam5/toan5.ts` + `figures.ts` |
| 5 | Tiếng Việt | **Cấu trúc đề thật**: đọc hiểu + LTVC + tập làm văn (PR #82) | Viết tay: `lib/exam5/tvContent.ts` (8 bài đọc, 42 câu LTVC) |
| 6–9, môn khác | — | Hiện "Sắp có" + link đề soạn sẵn | — |

Trang liên quan: `/de-thi` (Kho đề kiểm tra, PR #84) có thẻ **Tạo đề nhanh** ở đầu trang, và khi lọc ra lớp/môn chưa có đề soạn sẵn thì có nút "Tạo đề {môn} lớp {g}" — dựa vào `hasQuickExam`, nên môn nào mới có đề tự sinh sẽ tự hiện nút này, không cần sửa `/de-thi`.

Sinh đề ~1–2 ms/đề, chạy trên máy, không AI, không DB. Cùng `seed` → cùng đề.

## Kiến trúc dùng lại được

- `lib/exam5/paper.ts` — `ExamPaper`: sections → câu có điểm, `work` (đặt tính / bài giải / dòng kẻ), nhóm a) b) c), `reading`, `writing`, câu `open` chỉ in.
- `lib/exam5/print.ts` — in như tờ đề trường (header, Điểm–Nhận xét, hướng dẫn chấm). Dùng cho mọi lớp.
- `lib/exam5/figures.ts` — hình SVG đen trắng. Thêm hình mới ở đây.
- `QuickExamSpec.paper(seed)` trong `lib/quickExam.ts` — chỗ nối một lớp/môn mới.
- Kiểm tra: `scripts/exam5-check.ts` (tính lại đáp án Toán 5, soát nội dung TV), `scripts/exam14-check.ts` (tính lại đáp án Toán 1–4 từ chữ và từ hình), `scripts/quick-exam-check.ts` (mọi spec: số câu, điểm, tất định, chấm điểm).

## Lộ trình đã thống nhất với chủ dự án

1. ~~**Toán lớp 1–4 lên cấu trúc đề thật**~~ — **xong.** Lớp 1–2: 6 câu trắc nghiệm + tính 4 ý + "Số?"/tính 4 ý + bài toán 2đ + bài 4 1đ (35 phút); lớp 3–4: 8 + đặt tính 4 ý + 2 ý + bài toán 2đ + bài 4 1đ (40 phút). Mỗi kì một blueprint trong `BLUEPRINTS[lớp][kì]`. Còn có thể làm thêm: đề lớp 1 có tranh minh hoạ cho "viết phép tính thích hợp" (hiện là chữ); hình khối (lập phương, hộp, trụ, cầu) lớp 1–2; bảng số liệu lớp 3.
2. **Tiếng Việt lớp 4, rồi lớp 3** (vừa) — **làm tiếp từ đây**, xem mục "Bước tiếp theo" bên dưới. Lớp 1–2: thêm phần chính tả/vần, dùng lại bộ từ `lib/dailySheet.ts`. **Nội dung viết tay phải có người duyệt.**
3. **THCS (6–9): không tự sinh** — "Tạo đề nhanh" lấy ngẫu nhiên câu từ các đề thầy cô đã nhập (`lessons.type='exam'` theo lớp/môn), thay vì generator.
4. Thêm bài đọc cho TV5 (mỗi kì mới 2 bài → hay lặp).

## Bước tiếp theo: Tiếng Việt lớp 4

Đề xuất cách làm (chưa bắt đầu, chưa có code):

1. **Tách nội dung khỏi khung đề.** `tiengViet5.ts` đang import thẳng `./tvContent`. Đổi thành `buildTiengViet(grade, content, kind, kindLabel, seed)` nhận một bộ nội dung cùng kiểu (`TvPassage[]`, `LTVC_BANK`, `LTVC_BY_KIND`, `WRITING_PROMPTS`); lớp 5 truyền `tvContent.ts` cũ — **đề lớp 5 với cùng seed phải ra y hệt** (so `buildQuickExamRows` trước/sau khi tách).
2. **Nội dung lớp 4 ở file riêng** `lib/exam5/tvContent4.ts`, cùng kiểu dữ liệu. Tối thiểu mỗi kì 2 bài đọc tự soạn (tốt hơn 3–4, TV5 đang hay lặp vì chỉ có 2), mỗi bài 6 câu đọc hiểu + 1 câu LTVC gắn với bài + 1 câu mở; ngân hàng LTVC ≥ 4 câu mỗi chủ đề; đề tập làm văn theo kì.
3. **Chủ đề LTVC lớp 4 (GDPT 2018) — dự kiến, phải đối chiếu SGK trước khi viết:** danh từ (chung/riêng), động từ, tính từ, câu và hai thành phần chính (chủ ngữ, vị ngữ), trạng ngữ, biện pháp nhân hoá, dấu ngoặc kép / dấu gạch ngang / dấu ngoặc đơn, quy tắc viết hoa. Kiểu bài viết (dự kiến): kể lại câu chuyện, đoạn văn nêu ý kiến / tình cảm, miêu tả cây cối, miêu tả con vật, thư, thuật lại sự việc. Gán chủ đề theo kì (`LTVC_BY_KIND`) theo thứ tự trong SGK.
4. **Độ dài bài đọc:** `exam5-check.ts` đang ép 150–330 tiếng cho lớp 5; lớp 4 nên ngắn hơn (đề xuất ~130–260). Đưa giới hạn thành tham số theo lớp khi tách check.
5. **Kiểm tra:** mở rộng `exam5-check.ts` (hoặc tách `scripts/tv-check.ts`) chạy cho cả hai bộ nội dung: 4 lựa chọn khác nhau, đáp án nằm trong lựa chọn, đoạn trích “…” có nguyên văn trong bài, không dùng ngoặc kép thẳng, độ dài bài theo lớp. `quick-exam-check.ts`: thêm `[4, "Tiếng Việt"]` vào `SUBJECTS`, bỏ dòng khẳng định lớp 4 TV trả null nếu có.
6. **Nối vào app:** nhánh `subject === "Tiếng Việt"` trong `getQuickExam` (hiện chỉ nhận lớp 5), chữ "Hiện máy tạo được…" trong `QuickExamClient`, `/huong-dan`, `CLAUDE.md`, file này. `hasQuickExam` tự lo `/de-thi` và banner trang lớp.
7. **Giao cho chủ dự án duyệt nội dung** trước khi merge: gửi kèm bản in PDF một đề mỗi kì.

Mẹo môi trường (rút từ phiên trước):

- Container cloud không có biến Supabase: muốn xem trang có dữ liệu thì dựng tạm một route xem thử với dữ liệu giả, chạy `next dev` với biến giả (`NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:9` …), chụp bằng Playwright cài toàn cục (script `.cjs` gọi `require(process.env.PW)` với `PW=$(npm root -g)/playwright`; Chromium có sẵn). Xoá route xong thì `rm -rf .next` trước `npm run check`, không thì typecheck báo thiếu file của route đã xoá.
- `next dev` tự sinh `AGENTS.md` ở root — xoá đi, đừng commit lẫn vào PR.
- Đừng `pkill -f "next dev …"` trong cùng lệnh shell: mẫu khớp luôn chính lệnh đó và giết shell. Dùng `fuser -k <port>/tcp`.
- Bản in đề: `buildPaperHtml(paper, { answers: "solutions", schoolYear })` ra HTML, mở bằng Chromium để chụp — cách nhanh nhất để soát hình vẽ và bố cục.

## Khi thêm một lớp/môn

1. Tạo builder trả `ExamPaper` (tổng điểm 10; TV: phần đọc hiểu 7).
2. Nối vào `getQuickExam` (+ `SUBJECT_SLUG` nếu môn mới; regex trong `quickExamById`).
3. Thêm cặp (lớp, môn) vào `SUBJECTS` của `scripts/quick-exam-check.ts`; nội dung/generator mới có script `*-check.ts` riêng.
4. Cập nhật chữ trên `QuickExamClient` ("Hiện máy tạo được…"), `/huong-dan`, `CLAUDE.md`, file này.
5. `npm run check`, build, chụp thử bản in PDF.
