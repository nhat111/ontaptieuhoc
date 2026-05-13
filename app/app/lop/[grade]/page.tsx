"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getSubjectsByGrade,
  getChaptersBySubject,
  getLessonsByChapter,
  type Subject,
  type Chapter,
  type Lesson,
} from "@/lib/db";

const STATUS_STYLE = {
  completed: { bg: "#dcfce7", text: "#16a34a", icon: "✓", label: "Hoàn thành" },
  active:    { bg: "#fff7ed", text: "#f97316", icon: "▶", label: "Đang học" },
  locked:    { bg: "#f3f4f6", text: "#9ca3af", icon: "🔒", label: "Chưa mở" },
};

export default function GradePage() {
  const params = useParams();
  const router = useRouter();
  const grade = Number(params.grade);

  const [subjects, setSubjects]           = useState<Subject[]>([]);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [chapters, setChapters]           = useState<Chapter[]>([]);
  const [openChapterId, setOpenChapterId] = useState<number | null>(null);
  const [lessonMap, setLessonMap]         = useState<Record<number, Lesson[]>>({});
  const [loading, setLoading]             = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);

  // Load subjects
  useEffect(() => {
    if (!grade || grade < 1 || grade > 5) return;
    setLoading(true);
    getSubjectsByGrade(grade).then((data) => {
      setSubjects(data);
      if (data.length > 0) setActiveSubject(data[0]);
      setLoading(false);
    });
  }, [grade]);

  // Load chapters khi đổi môn
  useEffect(() => {
    if (!activeSubject) return;
    setChapters([]);
    setOpenChapterId(null);
    setLessonMap({});
    getChaptersBySubject(activeSubject.id).then((data) => {
      setChapters(data);
      // Tự mở chương đầu tiên
      if (data.length > 0) handleOpenChapter(data[0].id);
    });
  }, [activeSubject]);

  // Load lessons cho 1 chương
  const handleOpenChapter = async (chapterId: number) => {
    if (openChapterId === chapterId) {
      setOpenChapterId(null);
      return;
    }
    setOpenChapterId(chapterId);
    if (lessonMap[chapterId]) return; // đã load rồi
    setLoadingLessons(true);
    const lessons = await getLessonsByChapter(chapterId);
    setLessonMap((prev) => ({ ...prev, [chapterId]: lessons }));
    setLoadingLessons(false);
  };

  if (isNaN(grade) || grade < 1 || grade > 5) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#faf7f2]">
        <p className="text-gray-500">Lớp không hợp lệ.</p>
        <Link href="/" className="text-orange-500 font-semibold">← Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Breadcrumb header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2 text-sm">
        <Link href="/" className="text-gray-400 hover:text-orange-500 transition-colors">Trang chủ</Link>
        <span className="text-gray-300">›</span>
        <span className="font-semibold text-gray-700">Lớp {grade}</span>
        {activeSubject && (
          <>
            <span className="text-gray-300">›</span>
            <span className="text-orange-500 font-semibold">{activeSubject.name}</span>
          </>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p>Chưa có môn học nào cho lớp {grade}.</p>
        </div>
      ) : (
        <>
          {/* Subject tabs */}
          <div className="bg-white border-b border-gray-100 overflow-x-auto">
            <div className="flex min-w-max px-4">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSubject(s)}
                  className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                    activeSubject?.id === s.id
                      ? "border-orange-500 text-orange-500"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter + Lesson list */}
          <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-3">
            {chapters.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-3xl mb-2">📂</div>
                <p className="text-sm">Chưa có chương học nào.</p>
              </div>
            ) : (
              chapters.map((chapter) => {
                const isOpen = openChapterId === chapter.id;
                const lessons = lessonMap[chapter.id] || [];

                return (
                  <div
                    key={chapter.id}
                    className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all ${
                      isOpen ? "border-orange-200 shadow-orange-50" : "border-gray-100"
                    }`}
                  >
                    {/* Chapter header */}
                    <button
                      onClick={() => handleOpenChapter(chapter.id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 transition-colors ${
                        isOpen ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-500"
                      }`}>
                        {chapter.order_index}
                      </div>
                      <span className="flex-1 text-sm font-semibold text-gray-800">
                        {chapter.title}
                      </span>
                      {lessons.length > 0 && (
                        <span className="text-xs text-gray-400 mr-1">
                          {lessons.length} bài
                        </span>
                      )}
                      <span className={`text-xs transition-transform duration-200 text-gray-400 ${isOpen ? "rotate-180" : ""}`}>
                        ▼
                      </span>
                    </button>

                    {/* Lessons */}
                    {isOpen && (
                      <div className="border-t border-gray-50">
                        {loadingLessons && lessons.length === 0 ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : lessons.length === 0 ? (
                          <p className="text-center py-4 text-xs text-gray-400">Chưa có bài học.</p>
                        ) : (
                          lessons.map((lesson, idx) => {
                            const s = STATUS_STYLE[lesson.status];
                            const isLocked = lesson.status === "locked";
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => !isLocked && router.push(`/quiz?lessonId=${lesson.id}`)}
                                disabled={isLocked}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                                  idx < lessons.length - 1 ? "border-b border-gray-50" : ""
                                } ${
                                  isLocked
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-orange-50 active:bg-orange-100 cursor-pointer"
                                }`}
                              >
                                {/* Index badge */}
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                  style={{ background: s.bg, color: s.text }}
                                >
                                  {lesson.index_label}
                                </div>

                                {/* Title */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-800 truncate">{lesson.title}</p>
                                  <p className="text-xs mt-0.5" style={{ color: s.text }}>{s.label}</p>
                                </div>

                                {/* Status icon */}
                                <span className="text-base flex-shrink-0" style={{ color: s.text }}>
                                  {s.icon}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
