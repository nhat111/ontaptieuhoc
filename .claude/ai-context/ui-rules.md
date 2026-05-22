# UI Rules

## Design
- Minimal, clean, educational
- Mobile-first responsive layout
- Vietnamese language throughout

## Color system
- Primary: blue-600 / indigo-600
- Per-grade accent colors:
  - Lớp 1: red
  - Lớp 2: orange
  - Lớp 3: green
  - Lớp 4: blue
  - Lớp 5: purple

## Component conventions
- Rounded corners: `rounded-xl` or `rounded-2xl`
- Card backgrounds: `bg-white` with `border border-gray-100 shadow-sm`
- Page background: `bg-gray-50`
- Large touch targets (min 44px height for interactive elements)
- Consistent spacing: `px-4 py-6` for page containers, `max-w-6xl mx-auto` for content width

## Math rendering
- Use `<MathText text={...} />` for any content that may contain KaTeX (`$...$` or `$$...$$`)
- Import KaTeX CSS in root layout only (already done in `app/layout.tsx`)

## Typography
- Headings: `font-extrabold` or `font-bold`
- Body: default (no font override at root level)
- Teacher page uses DM Sans via Google Fonts (scoped to that page)

## Patterns to reuse
- Breadcrumb nav: `text-xs text-gray-400` with `›` separators
- Section headers: `text-3xl font-extrabold text-gray-800`
- Status badge/pill: `bg-X-100 text-X-600 font-semibold px-4 py-1.5 rounded-full`
- Loading state: show spinner or `text-gray-400` placeholder text
- Empty state: centered card with large emoji + message text
