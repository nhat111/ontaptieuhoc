---
name: ui-tre-em
description: Quy tắc thiết kế UI bắt mắt cho học sinh tiểu học (lớp 1–5) riêng cho Ôn Tập Tiểu Học. Dùng khi tạo mới, làm đẹp hoặc review bất kỳ trang/component nào bé nhìn thấy (trang chủ, /lop, /quiz, /result, trò chơi). Kết hợp với skill ui-ux-pro-max để tra cứu bảng màu, style, UX guideline. Không dùng cho /import (trang soạn bài của người lớn) hay API.
---

# UI cho bé tiểu học — Ôn Tập Tiểu Học

Skill này là lớp quy tắc riêng của dự án, đặt **trên** `ui-ux-pro-max`. Khi hai bên mâu thuẫn, **skill này và `.claude/ai-context/ui-rules.md` thắng**.

## Quy trình

1. Đọc `.claude/ai-context/ui-rules.md` (màu theo lớp, layout, typography hiện có).
2. Nếu `design-system/on-tap-tieu-hoc/MASTER.md` đã có → đọc và theo nó. Chưa có mà cần hướng thiết kế tổng thể → chạy:
   ```bash
   python3 .claude/skills/ui-ux-pro-max/scripts/search.py "kids education learning playful" --design-system -p "On Tap Tieu Hoc"
   ```
   Chỉ `--persist` khi người dùng đồng ý lưu.
3. Tra cứu chi tiết khi cần (mỗi query một ý):
   ```bash
   python3 .claude/skills/ui-ux-pro-max/scripts/search.py "claymorphism playful" --domain style
   python3 .claude/skills/ui-ux-pro-max/scripts/search.py "touch target spacing" --domain ux
   python3 .claude/skills/ui-ux-pro-max/scripts/search.py "reduced motion animation" --stack nextjs
   ```
4. Áp dụng các quy tắc dưới đây, rồi đi qua checklist cuối trang.

## Phong cách: "đồ chơi mềm" (claymorphism nhẹ)

UI/UX Pro Max gợi ý **Claymorphism** cho app giáo dục trẻ em — dùng bản nhẹ, hợp Tailwind v3 hiện có:

- Bo góc to: thẻ `rounded-2xl`/`rounded-3xl`, nút `rounded-2xl` hoặc `rounded-full`.
- Viền dày có màu thay cho viền xám mảnh ở khu vực của bé: `border-2`/`border-4` + màu lớp (vd `border-orange-200`).
- Bóng "nổi khối": bóng dưới đậm màu hơn nền, vd `shadow-[0_4px_0_0_theme(colors.orange.300)]`; khi bấm `active:translate-y-1 active:shadow-none` (cảm giác nút bấm thật).
- Màu tươi, bão hoà vừa; nền trang có thể là gradient rất nhạt (`from-sky-50 to-amber-50`) thay cho `bg-gray-50` phẳng. Tránh màu xỉn, xám-trên-xám.
- **Giữ màu theo lớp** (Lớp 1 rose · 2 orange · 3 emerald · 4 blue · 5 violet) — bé nhận ra lớp mình bằng màu.

## Chữ tiếng Việt

- **Giữ Be Vietnam Pro** (`font-sans`, nạp ở `app/layout.tsx`). Không đổi sang font mà ui-ux-pro-max gợi ý nếu font đó **không có subset `vietnamese`** — vd *Comic Neue* và *Fredoka* chỉ có latin, dấu sẽ vỡ/rơi về font hệ thống.
- Muốn tiêu đề "vui" hơn: font thêm vào phải có subset `vietnamese` (vd Baloo 2, Nunito, Quicksand, Mali — kiểm tra bằng `--domain google-fonts`), nạp qua `next/font/google` như Be Vietnam Pro, không `@import` Google Fonts.
- Chữ nội dung ≥ 16px (lớp 1–2 nên 18px+), `leading-relaxed`; tiêu đề `font-extrabold`. Không dùng chữ < 12px cho thứ bé phải đọc.

## Tương tác cho ngón tay nhỏ

- Nút/đáp án chính ≥ 48px cao (`min-h-12`), cách nhau ≥ 8px (`gap-3`).
- Mỗi lần chạm đều có phản hồi ngay: đổi màu + `active:scale-95` hoặc nhún xuống.
- Sai thì **lắc nhẹ** (`animate-shake`) và cho làm lại, không đỏ rực/không chữ "SAI" to; đúng thì `animate-pop` + sao/pháo giấy (`Burst`, `Mascot` trong `components/games/Fx.tsx`).
- Không dựa vào hover (bé dùng tablet/điện thoại).

## Chuyển động

- Chỉ CSS, dùng keyframes có sẵn trong `tailwind.config.ts` (`shake`, `pop`, `float`, `jump`, `burst`); thêm keyframe mới vào đó. **Không thêm thư viện animation/3D** (GSAP, framer-motion…) — ui-ux-pro-max có gợi ý GSAP, bỏ qua phần đó.
- Mọi animation bọc `motion-safe:`. Không nhấp nháy nhanh, không chuyển động liên tục cạnh nội dung bé đang đọc.

## Icon và emoji

- Emoji **được dùng cho nội dung** (hình quả táo để đếm, emoji lớp trên `GradeCard`, empty state) — bé thích và dễ hiểu. Đây là ngoại lệ có chủ đích với quy tắc "no emoji" của ui-ux-pro-max.
- Nút điều khiển (đóng, quay lại, loa, menu) dùng **SVG inline** có `aria-label`; chưa có thư viện icon trong `package.json`, hỏi trước khi thêm.

## Không làm

- Không dark mode (dự án chưa hỗ trợ).
- Không đổi copy tiếng Việt sang tiếng Anh; giọng văn thân thiện, khen ngợi ("Giỏi quá!", "Thử lại nhé!").
- Không áp style này lên `/import/*` — đó là trang soạn bài của người lớn, giữ gọn gàng.
- Không đổi luồng quiz/chấm điểm khi chỉ làm đẹp UI.

## Checklist trước khi giao

- [ ] Tương phản chữ ≥ 4.5:1 (chữ trắng trên nền màu nhạt như `amber-300` là **fail**)
- [ ] Nút chính ≥ 48px, có trạng thái bấm, có `focus-visible:ring`
- [ ] Animation đều nằm sau `motion-safe:`
- [ ] Dấu tiếng Việt hiển thị đúng (thử "Ổ Ậ Ữ Ỳ")
- [ ] Hiển thị tốt ở 375px (điện thoại), 768px (tablet), 1024px+
- [ ] `npm run lint` và `npx tsc --noEmit` sạch
