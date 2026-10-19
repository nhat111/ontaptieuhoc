import Link from "next/link";
import { Lock, Pencil } from "lucide-react";
import { gradeTheme } from "@/lib/gradeTheme";

export type Lesson = {
  id: number;
  index: string;
  title: string;
  questionCount: number;
  status: "completed" | "active" | "locked";
};

const circleStyle: Record<Lesson["status"], string> = {
  completed: "bg-emerald-500 text-white",
  active: "bg-blue-500 text-white",
  locked: "bg-slate-100 text-slate-400",
};

const lessonBadge: Record<Lesson["status"], { label: string; cls: string }> = {
  completed: { label: "Đã xong", cls: "bg-emerald-50 text-emerald-700" },
  active: { label: "Đang học", cls: "bg-blue-50 text-blue-700" },
  locked: { label: "Ôn tập", cls: "bg-slate-100 text-slate-500" },
};

const examBadge: Record<Lesson["status"], { label: string; cls: string }> = {
  completed: { label: "Đã làm", cls: "bg-emerald-50 text-emerald-700" },
  active: { label: "Thi thử", cls: "bg-amber-50 text-amber-700" },
  locked: { label: "Chưa mở", cls: "bg-slate-100 text-slate-500" },
};

export default function LessonItem({
  lesson,
  isLast,
  viewType = "lesson",
  grade,
}: {
  lesson: Lesson;
  isLast: boolean;
  viewType?: "lesson" | "exam";
  /** Tô số thứ tự và viền theo màu của lớp (lib/gradeTheme.ts). */
  grade?: number;
}) {
  const badge = (viewType === "exam" ? examBadge : lessonBadge)[lesson.status];
  const theme = gradeTheme(grade);
  // Số thứ tự: ô vuông bo góc tô nhạt màu lớp (bài đang mở), không dùng hình tròn đậm.
  const circle = lesson.status === "active" ? `${theme.soft} ${theme.text}` : circleStyle[lesson.status];

  // Tách số ra khỏi index_label ("Bài 6" → "6", "Đề 3" → "3")
  const indexNum = lesson.index?.match(/\d+/)?.[0] ?? lesson.index;
  // Tên hiển thị đầy đủ: "Bài 6 · Luyện tập"
  const fullTitle = lesson.index ? `${lesson.index} · ${lesson.title}` : lesson.title;

  return (
    <div className="flex gap-3">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold tabular-nums flex-shrink-0 z-10 ${circle}`}
        >
          {lesson.status === "locked" ? <Lock className="h-3.5 w-3.5" aria-label="Chưa mở" /> : indexNum}
        </div>
        {!isLast && <div className="w-px bg-slate-200 flex-1 mt-1 min-h-4" />}
      </div>

      {/* Card */}
      <div className="flex-1 mb-3 relative group/lesson">
        <Link href={`/quiz?lessonId=${lesson.id}`} className="block">
          <div
            className={`flex items-center justify-between rounded-lg border px-4 py-3 pr-10 transition-colors group ${
              lesson.status === "locked"
                ? "bg-slate-50 border-slate-100 hover:border-slate-200"
                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
            }`}
          >
            <div>
              <p
                className={`text-sm font-semibold transition-colors ${
                  lesson.status === "locked"
                    ? "text-slate-400 group-hover:text-slate-600"
                    : "text-slate-800 group-hover:text-slate-900"
                }`}
              >
                {fullTitle}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{lesson.questionCount} câu hỏi</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-md font-medium ml-3 whitespace-nowrap ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
        </Link>

        {/* Edit button — hiện khi hover */}
        <a
          href={`/import/edit/${lesson.id}`}
          title="Chỉnh sửa bài học"
          className="absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all opacity-0 group-hover/lesson:opacity-100 focus-visible:opacity-100 z-10"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </div>
  );
}
