# UI Rules

## Design
- Minimal, clean, educational — mobile-first
- **Icon: Lucide (`lucide-react`), không dùng emoji làm biểu tượng** ở phần khung (header, trang chủ, trang lớp, trò chơi hub, đề thi, hướng dẫn, kết quả). Icon nét 2px, thường đặt trong ô `rounded-lg` 40–44px nền nhạt. Emoji chỉ còn trong *nội dung* trò chơi của bé (hình để đếm, con vật…).
- Thẻ phẳng: `bg-white border border-slate-200 rounded-xl`, không `shadow-lg`, không gradient, không viền đáy dày kiểu nút 3D (cái đó chỉ còn trong trò chơi). Hover: `hover:border-slate-300`.
- Nút chính `rounded-lg bg-blue-600 hover:bg-blue-700`; nút phụ viền `border-slate-300`; "Đăng nhập" `bg-slate-900`. Chuyển chế độ (Bài tập/Đề kiểm tra, chọn lớp trò chơi) dùng segmented `bg-slate-200/70 p-1`, ô đang chọn `bg-white shadow-sm`.
- Toàn bộ copy user-facing: **tiếng Việt**

## Color system
- Primary: `blue-600` / `indigo-600` (logo, CTA đăng nhập)
- Per-grade accents — chỉ là điểm nhấn (ô số lớp, tab môn đang chọn, thanh tiến độ); không tô cả thẻ/dải theo màu lớp, không emoji cho lớp (hiện chính số lớp):
  - Lớp 1: rose/red
  - Lớp 2: orange
  - Lớp 3: emerald/green
  - Lớp 4: blue
  - Lớp 5: violet/purple
- `/de-thi` dùng `GRADE_COLOR` map tương tự
- Màu theo lớp dùng chung ở `lib/gradeTheme.ts` (`gradeTheme(grade)` → solid/soft/border/text): tab môn, nút Bài tập/Đề kiểm tra, số thứ tự bài, thanh tiến độ, dải tiêu đề trang lớp, màn bắt đầu làm bài. Class phải viết nguyên văn trong file đó — `tailwind.config.ts` có quét `./lib/**` nên Tailwind mới sinh CSS cho chúng.

## Layout
- Page bg: `bg-slate-50`; hero/đầu trang `bg-white border-b border-slate-200`
- Cards: `bg-white border border-slate-200 rounded-xl`
- Content width: `max-w-6xl mx-auto px-4`
- Touch targets ≥ ~44px cho nút chính

## Math
- Luôn dùng `<MathText text={...} />` cho nội dung có thể chứa `$...$`, `$$...$$`, `\(...\)`, `\[...\]`
- KaTeX CSS import **một lần** trong `app/layout.tsx`
- Trong DB giữ LaTeX raw — render ở consumer

## Typography
- Tiêu đề trang: `text-2xl`–`text-3xl font-bold tracking-tight text-slate-900`
- Breadcrumb: `text-xs text-slate-400` + `ChevronRight` (Lucide)
- Badge: `rounded-full px-4 py-1.5 text-sm font-semibold`

## Trang làm bài / kết quả
- Thẻ câu hỏi: hàng nhãn riêng (Câu N · loại câu · nút Nghe) phía TRÊN, câu hỏi `text-lg` trải hết bề ngang — đừng đặt nút cùng hàng với câu hỏi, trên điện thoại câu hỏi bị ép còn ~100px.
- Đáp án (`AnswerOption`) là thẻ to cả khối bấm được, ô chữ A/B/C/D, chọn thì xanh và "lún" (viền đáy 5px → 2px).
- Màn bắt đầu bài: ô số lớp + tiêu đề + hàng "câu hỏi · phút" có icon, không còn bạn Cú. Kết quả: 0–3 sao (Lucide `Star`, ≥50/70/85%), pháo giấy từ 2 sao; bạn Cú (`Mascot`) chỉ còn trong trò chơi.

## Patterns
- **Header** sticky `z-50`, nav desktop + hamburger mobile
- **Loading**: `app/**/loading.tsx` + `Spinner.tsx` ở vài route
- **Empty state**: khung `border-dashed border-slate-300`, icon Lucide trong ô `bg-slate-100`, text xám, căn giữa
- Import editor: sidebar LaTeX — nút insert dùng `onMouseDown` + `preventDefault` để không mất focus Tiptap

## Auth UI
- Chưa login: nút "Đăng nhập" góc phải
- Đã login: avatar initials + dropdown (Tiến độ, Tạo bài, Đăng xuất)

## Không dùng
- Trang Teacher / DM Sans riêng (đã bỏ)
- Dark mode (chưa có)
