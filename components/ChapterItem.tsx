"use client";
import { useState, useSyncExternalStore } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import LessonItem, { Lesson } from "./LessonItem";
import { getProgress, getServerProgress, lessonState, subscribeProgress } from "@/lib/lessonProgress";

export type Chapter = {
  id: number;
  title: string;
  questionCount: number;
  lessons: Lesson[];
};

export default function ChapterItem({
  chapter,
  defaultOpen = false,
  viewType = "lesson",
  grade,
}: {
  chapter: Chapter;
  defaultOpen?: boolean;
  viewType?: "lesson" | "exam";
  grade?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  // Tiến độ đọc từ máy này; lúc render ở server là rỗng nên không lệch hydration.
  const progress = useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);

  const total = chapter.lessons.length;
  const done = chapter.lessons.filter((l) => lessonState(progress[l.id]) === "done").length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const complete = total > 0 && done === total;
  const unit = viewType === "exam" ? "đề" : "bài";

  return (
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-soft ${complete ? "border-success-200" : "border-slate-200"}`}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50/70"
      >
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 text-base font-extrabold text-slate-900">
            {complete && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success-500" aria-label="Đã xong cả chương" />}
            <span className="truncate">{chapter.title}</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {total} {viewType === "exam" ? "đề" : "bài học"} · {chapter.questionCount} câu hỏi
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div
              className="h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={done}
              aria-label={`Đã xong ${done} trên ${total} ${unit}`}
            >
              <div className="h-full rounded-full bg-success-500 transition-all duration-500" style={{ width: `${percent}%` }} />
            </div>
            <span className={`flex-shrink-0 text-xs font-bold tabular-nums ${complete ? "text-success-700" : "text-slate-500"}`}>
              {done}/{total} {unit}
            </span>
          </div>
        </div>

        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden />
        </span>
      </button>

      {/* Lessons */}
      {open && (
        <div className="border-t border-slate-100 px-4 pb-2 pt-3">
          {chapter.lessons.map((lesson, i) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              isLast={i === chapter.lessons.length - 1}
              viewType={viewType}
              grade={grade}
              record={progress[lesson.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
