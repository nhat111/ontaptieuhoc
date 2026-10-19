import Link from "next/link";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { gradeTheme } from "@/lib/gradeTheme";

interface GradeCardProps {
  grade: number;
  subjects: string[];
  /** Số bài / đề đã có câu hỏi (lib/db.ts → getGradeStats). Không có = chưa có bài. */
  stats?: { lessons: number; exams: number };
  /** Lớp có khu trò chơi (/lop/[grade]/tro-choi) — vẫn đáng vào dù chưa có bài. */
  hasGames?: boolean;
}

/**
 * Thẻ chọn lớp ở trang chủ, kiểu "sticker": ô số lớp nổi khối tô màu lớp (lib/gradeTheme.ts,
 * đồng bộ với trang lớp), bo góc lớn, bóng mềm, nhấc lên khi rê chuột.
 * Lớp chưa có bài: mờ đi, gắn nhãn "Sắp ra mắt" và ghi các môn dự kiến.
 */
export default function GradeCard({ grade, subjects, stats, hasGames }: GradeCardProps) {
  const theme = gradeTheme(grade);
  const hasContent = !!stats && stats.lessons + stats.exams > 0;
  const counts = hasContent
    ? [stats!.lessons && `${stats!.lessons} bài`, stats!.exams && `${stats!.exams} đề`].filter(Boolean).join(" · ")
    : null;

  return (
    <Link
      href={`/lop/${grade}`}
      className={`group relative flex items-center gap-4 rounded-2xl border-2 bg-white p-4 shadow-soft transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 lg:flex-col lg:items-stretch lg:gap-4 lg:p-5 ${
        hasContent
          ? `border-slate-100 ${theme.hoverBorder} hover:shadow-pop motion-safe:hover:-translate-y-1`
          : "border-dashed border-slate-200 opacity-60 hover:opacity-90"
      }`}
    >
      {!hasContent && (
        <span className="absolute right-3 top-3 rounded-full bg-star-100 px-2 py-0.5 text-[11px] font-extrabold text-star-800">
          Sắp ra mắt
        </span>
      )}

      <span
        className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border-b-4 ${theme.edge} ${theme.soft} ${theme.text} text-3xl font-black tabular-nums transition-transform motion-safe:group-hover:-rotate-6 lg:h-16 lg:w-16 lg:text-4xl`}
        aria-hidden
      >
        {grade}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-lg font-extrabold text-slate-900">Lớp {grade}</span>
        {hasContent ? (
          <span className="mt-0.5 block text-sm font-semibold text-slate-600">{counts}</span>
        ) : (
          <span className="mt-0.5 block text-xs leading-snug text-slate-500">
            Dự kiến: {subjects.slice(0, 3).join(", ")}
            {subjects.length > 3 ? "…" : ""}
          </span>
        )}
        {hasContent && <span className="mt-1 block truncate text-xs text-slate-500">{subjects.join(" · ")}</span>}
        {!hasContent && hasGames && (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-bold text-success-700">
            <Gamepad2 className="h-3 w-3" aria-hidden />
            Đã có trò chơi
          </span>
        )}
      </span>

      {hasContent && (
        <span className={`inline-flex items-center gap-1 text-sm font-extrabold ${theme.text} lg:mt-auto`}>
          <span className="hidden lg:inline">Vào học</span>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 lg:h-4 lg:w-4" aria-hidden />
        </span>
      )}
    </Link>
  );
}
