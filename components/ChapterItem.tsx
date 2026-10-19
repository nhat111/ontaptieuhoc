"use client";
import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import LessonItem, { Lesson } from "./LessonItem";
import { gradeTheme } from "@/lib/gradeTheme";

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
  const theme = gradeTheme(grade);
  const [open, setOpen] = useState(defaultOpen);

  const { completed, progress } = useMemo(() => {
    const completed = chapter.lessons.filter((l) => l.status === "completed").length;
    return { completed, progress: Math.round((completed / chapter.lessons.length) * 100) };
  }, [chapter.lessons]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left gap-4"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 truncate">{chapter.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {chapter.lessons.length} {viewType === "exam" ? "đề" : "bài học"} · {chapter.questionCount} câu hỏi
          </p>
          <div className="mt-2.5 h-1 bg-slate-100 rounded-full w-48 max-w-full">
            <div
              className={`h-1 ${theme.solid} rounded-full transition-all`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-slate-400 font-medium tabular-nums">{completed}/{chapter.lessons.length}</span>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden />
        </div>
      </button>

      {/* Lessons */}
      {open && (
        <div className="px-4 pt-3 pb-2 border-t border-slate-100">
          {chapter.lessons.map((lesson, i) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              isLast={i === chapter.lessons.length - 1}
              viewType={viewType}
              grade={grade}
            />
          ))}
        </div>
      )}
    </div>
  );
}
