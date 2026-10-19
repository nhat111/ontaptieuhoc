import Link from "next/link";
import { ArrowRight, CheckCircle2, Lock, Pencil, Play, RotateCcw } from "lucide-react";
import { gradeTheme } from "@/lib/gradeTheme";
import { lessonState, type LessonRecord, type LessonState } from "@/lib/lessonProgress";

export type Lesson = {
  id: number;
  index: string;
  title: string;
  questionCount: number;
  status: "completed" | "active" | "locked";
};

/**
 * Một bài trong chương. Nút bên phải theo tiến độ trên máy này (lib/lessonProgress.ts):
 * chưa làm → "Học ngay", đã làm nhưng chưa tới mức Giỏi → "Tiếp tục" kèm % điểm tốt
 * nhất, đã xong → tích xanh + "Làm lại". Bài khoá (status 'locked' trong DB) giữ ổ khoá.
 */
export default function LessonItem({
  lesson,
  isLast,
  viewType = "lesson",
  grade,
  record,
}: {
  lesson: Lesson;
  isLast: boolean;
  viewType?: "lesson" | "exam";
  /** Tô số thứ tự theo màu của lớp (lib/gradeTheme.ts). */
  grade?: number;
  record?: LessonRecord;
}) {
  const theme = gradeTheme(grade);
  const locked = lesson.status === "locked";
  const state = locked ? "new" : lessonState(record);

  // Tách số ra khỏi index_label ("Bài 6" → "6", "Đề 3" → "3")
  const indexNum = lesson.index?.match(/\d+/)?.[0] ?? lesson.index;
  // Tên hiển thị đầy đủ: "Bài 6 · Luyện tập"
  const fullTitle = lesson.index ? `${lesson.index} · ${lesson.title}` : lesson.title;

  const tile = locked
    ? "bg-slate-100 text-slate-400"
    : state === "done"
      ? "bg-success-500 text-white"
      : `${theme.soft} ${theme.text}`;

  return (
    <div className="flex gap-3">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className={`z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-extrabold tabular-nums ${tile}`}>
          {locked ? (
            <Lock className="h-4 w-4" aria-label="Chưa mở" />
          ) : state === "done" ? (
            <CheckCircle2 className="h-5 w-5" aria-label="Đã xong" />
          ) : (
            indexNum
          )}
        </div>
        {!isLast && <div className={`mt-1 min-h-4 w-0.5 flex-1 rounded-full ${state === "done" ? "bg-success-200" : "bg-slate-200"}`} />}
      </div>

      {/* Card */}
      <div className="group/lesson relative mb-3 flex-1">
        <Link
          href={`/quiz?lessonId=${lesson.id}`}
          className={`group flex flex-col gap-3 rounded-2xl border px-4 py-3 transition-all sm:pr-11 sm:flex-row sm:items-center sm:justify-between ${
            locked
              ? "border-slate-100 bg-slate-50 hover:border-slate-200"
              : state === "done"
                ? "border-success-200 bg-success-50/40 hover:border-success-300"
                : "border-slate-200 bg-white hover:border-primary-200 hover:shadow-soft motion-safe:hover:-translate-y-0.5"
          }`}
        >
          <div className="min-w-0 pr-8 sm:pr-0">
            <p className={`text-[15px] font-bold ${locked ? "text-slate-400" : "text-slate-800 group-hover:text-slate-900"}`}>
              {fullTitle}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {lesson.questionCount} câu hỏi
              {record && record.attempts > 0 && (
                <>
                  {" · "}điểm tốt nhất <span className="font-bold tabular-nums text-slate-700">{record.best}%</span>
                </>
              )}
            </p>
          </div>
          <LessonCta state={state} locked={locked} best={record?.best ?? 0} exam={viewType === "exam"} />
        </Link>

        {/* Nút sửa bài — hiện khi rê chuột, dành cho người soạn đề */}
        <a
          href={`/import/edit/${lesson.id}`}
          title="Chỉnh sửa bài học"
          aria-label="Chỉnh sửa bài học"
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-400 opacity-0 transition-all hover:bg-slate-200 hover:text-slate-700 focus-visible:opacity-100 group-hover/lesson:opacity-100 sm:top-1/2 sm:-translate-y-1/2"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </div>
  );
}

/** Nút hành động theo trạng thái (chỉ là hình — cả thẻ là một liên kết). */
function LessonCta({ state, locked, best, exam }: { state: LessonState; locked: boolean; best: number; exam: boolean }) {
  const base =
    "inline-flex flex-shrink-0 items-center justify-center gap-1.5 self-start whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-bold transition-colors sm:self-auto";
  if (locked) {
    return <span className={`${base} bg-slate-100 text-slate-500`}>Ôn tập</span>;
  }
  if (state === "done") {
    return (
      <span className="flex items-center gap-3 self-start sm:self-auto">
        <span className="inline-flex items-center gap-1 text-sm font-bold text-success-700">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Hoàn thành
        </span>
        <span className={`${base} border border-slate-200 bg-white text-slate-700 group-hover:border-slate-300`}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Làm lại
        </span>
      </span>
    );
  }
  if (state === "doing") {
    return (
      <span className={`${base} bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-200 group-hover:bg-primary-100`}>
        <span className="relative h-1.5 w-10 overflow-hidden rounded-full bg-primary-200" aria-hidden>
          <span className="absolute inset-y-0 left-0 rounded-full bg-primary-600" style={{ width: `${best}%` }} />
        </span>
        Tiếp tục · <span className="tabular-nums">{best}%</span>
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </span>
    );
  }
  return (
    <span className={`${base} bg-primary-600 text-white shadow-sm group-hover:bg-primary-700`}>
      <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
      {exam ? "Làm đề" : "Học ngay"}
    </span>
  );
}
