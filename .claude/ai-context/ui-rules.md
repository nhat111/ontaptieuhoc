# UI Rules

## Design
- Minimal, clean, educational — mobile-first
- Toàn bộ copy user-facing: **tiếng Việt**

## Color system
- Primary: `blue-600` / `indigo-600` (logo, CTA đăng nhập)
- Per-grade accents (cards, badges):
  - Lớp 1: rose/red
  - Lớp 2: orange
  - Lớp 3: emerald/green
  - Lớp 4: blue
  - Lớp 5: violet/purple
- `/de-thi` dùng `GRADE_COLOR` map tương tự
- Màu theo lớp dùng chung ở `lib/gradeTheme.ts` (`gradeTheme(grade)` → solid/soft/border/text/emoji): tab môn, nút Bài tập/Đề kiểm tra, số thứ tự bài, thanh tiến độ, dải tiêu đề trang lớp, màn bắt đầu làm bài. Class phải viết nguyên văn trong file đó — `tailwind.config.ts` có quét `./lib/**` nên Tailwind mới sinh CSS cho chúng.

## Layout
- Page bg: `bg-gray-50`
- Cards: `bg-white border border-gray-100 shadow-sm rounded-xl|2xl`
- Content width: `max-w-6xl mx-auto px-4`
- Touch targets ≥ ~44px cho nút chính

## Math
- Luôn dùng `<MathText text={...} />` cho nội dung có thể chứa `$...$`, `$$...$$`, `\(...\)`, `\[...\]`
- KaTeX CSS import **một lần** trong `app/layout.tsx`
- Trong DB giữ LaTeX raw — render ở consumer

## Typography
- Tiêu đề trang: `text-2xl`–`text-3xl font-extrabold text-gray-800`
- Breadcrumb: `text-xs text-gray-400` + `›`
- Badge: `rounded-full px-4 py-1.5 text-sm font-semibold`

## Trang làm bài / kết quả
- Thẻ câu hỏi: hàng nhãn riêng (Câu N · loại câu · nút Nghe) phía TRÊN, câu hỏi `text-lg` trải hết bề ngang — đừng đặt nút cùng hàng với câu hỏi, trên điện thoại câu hỏi bị ép còn ~100px.
- Đáp án (`AnswerOption`) là thẻ to cả khối bấm được, ô chữ A/B/C/D, chọn thì xanh và "lún" (viền đáy 5px → 2px).
- Bạn Cú (`Mascot` trong `components/games/Fx.tsx`) xuất hiện ở màn bắt đầu bài và trang kết quả; kết quả có 0–3 sao (≥50/70/85%) và pháo giấy từ 2 sao.

## Patterns
- **Header** sticky `z-50`, nav desktop + hamburger mobile
- **Loading**: `app/**/loading.tsx` + `Spinner.tsx` ở vài route
- **Empty state**: emoji + text xám, căn giữa
- Import editor: sidebar LaTeX — nút insert dùng `onMouseDown` + `preventDefault` để không mất focus Tiptap

## Auth UI
- Chưa login: nút "Đăng nhập" góc phải
- Đã login: avatar initials + dropdown (Tiến độ, Tạo bài, Đăng xuất)

## Không dùng
- Trang Teacher / DM Sans riêng (đã bỏ)
- Dark mode (chưa có)
