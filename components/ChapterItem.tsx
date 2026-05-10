"use client";
import { useState, useMemo } from "react";
import LessonItem, { Lesson } from "./LessonItem";

export type Chapter = {
  id: number;
  title: string;
  questionCount: number;
  lessons: Lesson[];
};

export default function ChapterItem({
  chapter,
  defaultOpen = false,
}: {
  chapter: Chapter;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const { completed, progress } = useMemo(() => {
    const completed = chapter.lessons.filter((l) => l.status === "completed").length;
    return { completed, progress: Math.round((completed / chapter.lessons.length) * 100) };
  }, [chapter.lessons]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left gap-4"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-800 truncate">{chapter.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {chapter.lessons.length} bài học · {chapter.questionCount} câu hỏi
          </p>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full w-48 max-w-full">
            <div
              className="h-1.5 bg-blue-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-gray-400 font-medium">{completed}/{chapter.lessons.length}</span>
          <span className={`text-gray-400 transition-transform duration-200 text-lg ${open ? "rotate-180" : ""}`}>
            ▾
          </span>
        </div>
      </button>

      {/* Lessons */}
      {open && (
        <div className="px-4 pt-3 pb-2 border-t border-gray-50">
          {chapter.lessons.map((lesson, i) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              isLast={i === chapter.lessons.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
