// Màu riêng của từng lớp (theo .claude/ai-context/ui-rules.md): 1 hồng, 2 cam,
// 3 xanh lá, 4 xanh dương, 5 tím. Giữ nguyên chuỗi class đầy đủ — Tailwind chỉ
// sinh CSS cho class viết nguyên văn trong code, ghép chuỗi động sẽ mất màu.

export type GradeTheme = {
  emoji: string;
  /** Nền đậm: tab đang chọn, số thứ tự bài, thanh tiến độ. */
  solid: string;
  /** Nền nhạt: dải tiêu đề trang, thẻ. */
  soft: string;
  border: string;
  text: string;
  /** Viền khi rê chuột lên thẻ bài. */
  hoverBorder: string;
};

const THEMES: Record<number, GradeTheme> = {
  1: { emoji: "🌱", solid: "bg-rose-500", soft: "bg-rose-50", border: "border-rose-200", text: "text-rose-600", hoverBorder: "hover:border-rose-300" },
  2: { emoji: "🌿", solid: "bg-orange-500", soft: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", hoverBorder: "hover:border-orange-300" },
  3: { emoji: "🌳", solid: "bg-emerald-500", soft: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", hoverBorder: "hover:border-emerald-300" },
  4: { emoji: "🌟", solid: "bg-blue-500", soft: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", hoverBorder: "hover:border-blue-300" },
  5: { emoji: "🏆", solid: "bg-violet-500", soft: "bg-violet-50", border: "border-violet-200", text: "text-violet-600", hoverBorder: "hover:border-violet-300" },
};

export function gradeTheme(grade: number | undefined | null): GradeTheme {
  return THEMES[grade ?? 0] ?? THEMES[4];
}
