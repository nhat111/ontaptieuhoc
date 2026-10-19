import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { gradeTheme } from "@/lib/gradeTheme";

interface GradeCardProps {
  grade: number;
  subjects: string[];
  /** Số bài / đề đã có câu hỏi (lib/db.ts → getGradeStats). Không có = chưa có bài. */
  stats?: { lessons: number; exams: number };
}

/**
 * Thẻ chọn lớp ở trang chủ: ô số lớp tô màu nhẹ theo lib/gradeTheme.ts (đồng bộ
 * với trang lớp), còn lại trung tính. Điện thoại: một hàng ngang; màn rộng: thẻ đứng.
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
      className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 lg:flex-col lg:items-stretch lg:gap-4 lg:p-5"
    >
      <span
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${theme.soft} ${theme.text} text-2xl font-bold tabular-nums`}
        aria-hidden
      >
        {grade}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-slate-900">Lớp {grade}</span>
        <span className={`mt-0.5 block text-sm ${hasContent ? "text-slate-600" : "text-slate-400"}`}>{counts}</span>
        <span className="mt-1 block truncate text-xs text-slate-400">{subjects.join(" · ")}</span>
      </span>

      <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-300 transition-colors group-hover:text-slate-500 lg:hidden" aria-hidden />
      <span className="hidden items-center gap-1 text-sm font-medium text-blue-600 lg:inline-flex">
        Vào học
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
