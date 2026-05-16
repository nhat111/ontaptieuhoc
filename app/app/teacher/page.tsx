"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, type Subject, type Chapter, type Lesson } from "@/lib/db";
import QuestionEditor from "@/app/components/teacher/QuestionEditor";

// ─── Types ────────────────────────────────────────────────────
type NewQuestion = {
  id: string; // client-side temp id
  content: string;
  options: [string, string, string, string];
  correct_answer: string;
  explanation: string;
};

function genId() {
  return Math.random().toString(36).slice(2);
}

function emptyQuestion(): NewQuestion {
  return {
    id: genId(),
    content: "",
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
  };
}

// ─── Sub-components ───────────────────────────────────────────
function Select({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {children}
      </select>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function TeacherPage() {
  // Meta selectors
  const [grade, setGrade] = useState<number>(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState<number | "">("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterId, setChapterId] = useState<number | "">("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonId, setLessonId] = useState<number | "">("");

  // New lesson form
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [creatingLesson, setCreatingLesson] = useState(false);

  // Questions
  const [questions, setQuestions] = useState<NewQuestion[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Load subjects when grade changes
  useEffect(() => {
    setSubjectId("");
    setChapterId("");
    setLessonId("");
    supabase
      .from("subjects")
      .select("*")
      .eq("grade", grade)
      .order("order_index")
      .then(({ data }) => setSubjects(data || []));
  }, [grade]);

  // Load chapters when subject changes
  useEffect(() => {
    setChapterId("");
    setLessonId("");
    if (!subjectId) { setChapters([]); return; }
    supabase
      .from("chapters")
      .select("*")
      .eq("subject_id", subjectId)
      .order("order_index")
      .then(({ data }) => setChapters(data || []));
  }, [subjectId]);

  // Load lessons when chapter changes
  useEffect(() => {
    setLessonId("");
    if (!chapterId) { setLessons([]); return; }
    supabase
      .from("lessons")
      .select("*")
      .eq("chapter_id", chapterId)
      .order("order_index")
      .then(({ data }) => setLessons(data || []));
  }, [chapterId]);

  // Create new lesson
  const handleCreateLesson = async () => {
    if (!newLessonTitle.trim() || !chapterId) return;
    setCreatingLesson(true);
    const nextIndex = lessons.length + 1;
    const { data, error } = await supabase
      .from("lessons")
      .insert({
        title: newLessonTitle.trim(),
        index_label: String(nextIndex).padStart(2, "0"),
        chapter_id: chapterId,
        status: "active",
        order_index: nextIndex,
      })
      .select()
      .single();

    if (!error && data) {
      setLessons((prev) => [...prev, data]);
      setLessonId(data.id);
      setNewLessonTitle("");
    }
    setCreatingLesson(false);
  };

  // Question handlers
  const updateQuestion = useCallback((id: string, field: keyof NewQuestion, value: string | string[]) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  }, []);

  const updateOption = useCallback((qId: string, idx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const opts = [...q.options] as [string, string, string, string];
        opts[idx] = value;
        return { ...q, options: opts };
      })
    );
  }, []);

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);

  const deleteQuestion = (id: string) =>
    setQuestions((prev) => prev.filter((q) => q.id !== id));

  const duplicateQuestion = (id: string) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      if (idx === -1) return prev;
      const clone = { ...prev[idx], id: genId() };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
  };

  const moveQuestion = (id: string, dir: "up" | "down") => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      const newIdx = dir === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  // Save all questions to Supabase
  const handleSave = async () => {
    if (!lessonId) { setError("Vui lòng chọn hoặc tạo bài học trước!"); return; }
    const invalid = questions.find((q) => !q.content.trim() || !q.correct_answer);
    if (invalid) { setError("Vui lòng điền đầy đủ nội dung và đáp án cho tất cả câu hỏi!"); return; }

    setSaving(true);
    setError("");

    const rows = questions.map((q, i) => ({
      lesson_id: lessonId,
      content: q.content.trim(),
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation.trim() || null,
      order_index: i + 1,
    }));

    const { error: err } = await supabase.from("questions").insert(rows);

    if (err) {
      setError("Lỗi lưu: " + err.message);
    } else {
      setSaved(true);
      setQuestions([emptyQuestion()]);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const readyToSave = !!lessonId && questions.length > 0;

  return (
    <div className="min-h-screen bg-[#f5f4f0]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 h-14 flex items-center px-4 gap-3 shadow-sm">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">T</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">Teacher Editor</p>
          <p className="text-xs text-gray-400">
            {lessonId ? `Bài: ${lessons.find(l => l.id === lessonId)?.title}` : "Chưa chọn bài học"}
          </p>
        </div>
        <span className="text-xs text-gray-400 hidden sm:block">{questions.length} câu</span>
        <button
          onClick={handleSave}
          disabled={!readyToSave || saving}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
            saved
              ? "bg-emerald-500 text-white"
              : !readyToSave || saving
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:-translate-y-0.5"
          }`}
        >
          {saved ? "✓ Đã lưu!" : saving ? "Đang lưu..." : "💾 Lưu câu hỏi"}
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* ── Selector Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3">
            <h2 className="text-white font-bold text-sm">📚 Chọn bài học</h2>
            <p className="text-white/60 text-xs mt-0.5">Lớp → Môn → Chương → Bài</p>
          </div>

          <div className="p-5 space-y-3">
            {/* Grade */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lớp</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                      grade === g
                        ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                        : "border-gray-100 text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <Select label="Môn học" value={subjectId} onChange={(v) => setSubjectId(Number(v))} disabled={!subjects.length}>
              <option value="">-- Chọn môn --</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>

            {/* Chapter */}
            <Select label="Chương" value={chapterId} onChange={(v) => setChapterId(Number(v))} disabled={!subjectId || !chapters.length}>
              <option value="">-- Chọn chương --</option>
              {chapters.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </Select>

            {/* Lesson */}
            <Select label="Bài học" value={lessonId} onChange={(v) => setLessonId(Number(v))} disabled={!chapterId}>
              <option value="">-- Chọn bài học --</option>
              {lessons.map((l) => <option key={l.id} value={l.id}>{l.index_label}. {l.title}</option>)}
            </Select>

            {/* Create new lesson */}
            {chapterId && (
              <div className="pt-1 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">Hoặc tạo bài học mới:</p>
                <div className="flex gap-2">
                  <input
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateLesson()}
                    placeholder="Tên bài học mới..."
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    onClick={handleCreateLesson}
                    disabled={!newLessonTitle.trim() || creatingLesson}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                  >
                    {creatingLesson ? "..." : "+ Tạo"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
            <span>❌</span> {error}
            <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* ── Questions ── */}
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <QuestionEditor
              key={q.id}
              question={q}
              index={idx}
              total={questions.length}
              onUpdate={(field, value) => updateQuestion(q.id, field, value)}
              onUpdateOption={(i, v) => updateOption(q.id, i, v)}
              onDelete={() => deleteQuestion(q.id)}
              onDuplicate={() => duplicateQuestion(q.id)}
              onMoveUp={() => moveQuestion(q.id, "up")}
              onMoveDown={() => moveQuestion(q.id, "down")}
            />
          ))}
        </div>

        {/* ── Add Question ── */}
        <button
          onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all font-semibold text-sm flex items-center justify-center gap-2 group"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">+</span>
          Thêm câu hỏi
        </button>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
