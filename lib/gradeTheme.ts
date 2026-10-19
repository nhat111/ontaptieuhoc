// Màu riêng của từng lớp (theo .claude/ai-context/ui-rules.md): 1 coral (dịu, không đỏ gắt), 2 cam,
// 3 xanh lá, 4 xanh dương, 5 tím; THCS: 6 xanh ngọc, 7 vàng hổ phách, 8 hồng tím, 9 chàm.
// Màu lớp chỉ là điểm nhấn (ô số lớp, tab đang chọn, thanh tiến độ) — nền và thẻ
// vẫn trung tính. Không dùng emoji làm biểu tượng lớp: hiện chính con số của lớp.
// Giữ nguyên chuỗi class đầy đủ — Tailwind chỉ
// sinh CSS cho class viết nguyên văn trong code, ghép chuỗi động sẽ mất màu.

export type GradeTheme = {
  /** Nền đậm: tab đang chọn, số thứ tự bài, thanh tiến độ. */
  solid: string;
  /** Nền nhạt: dải tiêu đề trang, thẻ. */
  soft: string;
  border: string;
  text: string;
  /** Viền khi rê chuột lên thẻ bài. */
  hoverBorder: string;
  /** Viền đáy đậm hơn cho thẻ "nổi khối" (thẻ chọn lớp ở trang chủ). */
  edge: string;
};

const THEMES: Record<number, GradeTheme> = {
  1: { solid: "bg-coral-500", soft: "bg-coral-50", border: "border-coral-200", text: "text-coral-700", hoverBorder: "hover:border-coral-300", edge: "border-coral-300" },
  2: { solid: "bg-orange-500", soft: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", hoverBorder: "hover:border-orange-300", edge: "border-orange-300" },
  3: { solid: "bg-emerald-500", soft: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", hoverBorder: "hover:border-emerald-300", edge: "border-emerald-300" },
  4: { solid: "bg-blue-500", soft: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", hoverBorder: "hover:border-blue-300", edge: "border-blue-300" },
  5: { solid: "bg-violet-500", soft: "bg-violet-50", border: "border-violet-200", text: "text-violet-600", hoverBorder: "hover:border-violet-300", edge: "border-violet-300" },
  6: { solid: "bg-cyan-600", soft: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", hoverBorder: "hover:border-cyan-300", edge: "border-cyan-300" },
  7: { solid: "bg-amber-600", soft: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", hoverBorder: "hover:border-amber-300", edge: "border-amber-300" },
  8: { solid: "bg-fuchsia-600", soft: "bg-fuchsia-50", border: "border-fuchsia-200", text: "text-fuchsia-700", hoverBorder: "hover:border-fuchsia-300", edge: "border-fuchsia-300" },
  9: { solid: "bg-indigo-600", soft: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", hoverBorder: "hover:border-indigo-300", edge: "border-indigo-300" },
};

export function gradeTheme(grade: number | undefined | null): GradeTheme {
  return THEMES[grade ?? 0] ?? THEMES[4];
}
