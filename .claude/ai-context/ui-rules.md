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
