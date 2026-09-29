import Link from "next/link";
import { gradeTheme } from "@/lib/gradeTheme";

interface GradeCardProps {
  grade: number;
  subjects: string[];
  /** Số bài / đề đã có câu hỏi (lib/db.ts → getGradeStats). Không có = chưa có bài. */
  stats?: { lessons: number; exams: number };
}

/**
 * Thẻ chọn lớp ở trang chủ. Màu, biểu tượng lấy từ lib/gradeTheme.ts để đồng
 * bộ với trang lớp. Điện thoại: một hàng ngang (5 thẻ xếp dọc gọn gàng, không
 * lệch cột); màn rộng: thẻ đứng, 5 cột.
 */
export default function GradeCard({ grade, subjects, stats }: GradeCardProps) {
  const theme = gradeTheme(grade);
  const hasContent = !!stats && stats.lessons + stats.exams > 0;
  const counts = hasContent
    ? [stats!.lessons && `${stats!.lessons} bài`, stats!.exams && `${stats!.exams} đề`].filter(Boolean).join(" · ")
    : "Đang cập nhật";

  return (
    <Link
      href={`/lop/${grade}`}
      className={`group flex items-center gap-4 rounded-3xl border-2 border-b-[6px] ${theme.border} ${theme.edge} bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 active:border-b-2 lg:flex-col lg:items-stretch lg:gap-3 lg:p-5`}
    >
      <span
        className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${theme.soft} text-3xl transition-transform group-hover:scale-110 lg:h-16 lg:w-16 lg:text-4xl`}
        aria-hidden
      >
        {theme.emoji}
      </span>

      <span className="min-w-0 flex-1">
        <span className={`block text-2xl font-extrabold leading-tight ${theme.text}`}>Lớp {grade}</span>
        <span className={`mt-0.5 block text-sm font-semibold ${hasContent ? "text-slate-700" : "text-slate-400"}`}>
          {counts}
        </span>
        <span className="mt-0.5 block truncate text-xs text-slate-400">{subjects.join(" · ")}</span>
      </span>

      {/* Mũi tên ở hàng ngang (điện thoại), nút "Vào học" ở thẻ đứng (màn rộng) */}
      <span className={`text-2xl font-bold ${theme.text} lg:hidden`} aria-hidden>›</span>
      <span className={`hidden rounded-xl ${theme.solid} py-2 text-center text-sm font-bold text-white lg:block`}>
        Vào học →
      </span>
    </Link>
  );
}
