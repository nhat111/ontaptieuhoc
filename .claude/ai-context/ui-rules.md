# UI Rules

## Design
- Tươi sáng, thân thiện, gamified nhẹ (kiểu Duolingo / Khan Academy Kids) — đối tượng chính là bé lớp 1–5 và phụ huynh. Mobile-first.
- **Icon: Lucide (`lucide-react`), không dùng emoji làm biểu tượng** ở phần khung. Hình minh hoạ là SVG nội tuyến (`HeroArt`, `GameArt`, `CuteAvatar`), không tải ảnh, không thư viện 3D.
- Thẻ: `bg-white rounded-2xl shadow-soft` (viền `border-slate-200` hoặc trắng), hover `shadow-pop` + nhấc nhẹ `motion-safe:hover:-translate-y-1`. Gradient chỉ dạng pastel nhạt (hero, banner phiếu, đầu bảng xếp hạng) — không khối màu đậm gắt.
- Nút chính: `rounded-2xl bg-primary-600 border-b-4 border-primary-800 font-extrabold`, bấm thì lún (`active:border-b-2`); nút phụ `border-2 border-slate-200` hoặc `border-primary-200`. Ô chọn (chip): `border-2`, đang chọn `border-primary-500 bg-primary-50 text-primary-700`. Thẻ checkbox (chủ đề phiếu): cả thẻ bấm được, có icon, chọn thì viền primary + dấu tích.
- Phản hồi đúng/sai: đúng `success-*` + `animate-boing`/`Burst`; sai rung nhẹ `animate-shake` + tông `coral` dịu, không đỏ gắt.
- Toàn bộ copy user-facing: **tiếng Việt**

## Color system (tailwind.config.ts)
- `primary` = indigo (nút chính, liên kết, ô đang chọn) · `star` = amber #F59E0B (sao, điểm, huy chương) · `success` = emerald #10B981 (đúng, hoàn thành) · `coral` (đỏ dịu, thay rose cho lớp 1 / nhấn ấm).
- Per-grade accents — chỉ là điểm nhấn (ô số lớp, tab môn đang chọn dạng nền nhạt + chữ màu lớp, số thứ tự bài); không tô cả thẻ theo màu lớp:
  - Lớp 1: coral · Lớp 2: orange · Lớp 3: emerald · Lớp 4: blue · Lớp 5: violet
- Màu theo lớp dùng chung ở `lib/gradeTheme.ts` (`gradeTheme(grade)` → solid/soft/border/text/edge). Class phải viết nguyên văn trong file đó — `tailwind.config.ts` có quét `./lib/**`.
- Thanh tiến độ chương: `bg-success-500`, hiện số "x/y bài".

## Layout
- Page bg: `bg-slate-50`; hero/đầu trang `bg-white border-b border-slate-200`
- Cards: `bg-white border border-slate-200 rounded-2xl shadow-soft`
- Content width: `max-w-6xl mx-auto px-4`
- Touch targets ≥ ~44px cho nút chính

## Math
- Luôn dùng `<MathText text={...} />` cho nội dung có thể chứa `$...$`, `$$...$$`, `\(...\)`, `\[...\]`
- KaTeX CSS import **một lần** trong `app/layout.tsx`
- Trong DB giữ LaTeX raw — render ở consumer

## Typography
- Font Nunito (bo tròn), body `leading-relaxed`. Tiêu đề trang: `text-3xl`–`text-4xl font-black tracking-tight text-slate-900`
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
