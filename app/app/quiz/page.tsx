"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getQuestionsByLesson,
  getLessonById,
  saveQuizResult,
  type Question,
  type Lesson,
} from "@/lib/db";

const OPT_LABELS = ["A", "B", "C", "D"];

const OPT_COLORS = [
  { normal: "#eff6ff", active: "#2563eb", correct: "#dcfce7", wrong: "#fee2e2", text: "#2563eb" },
  { normal: "#f0fdf4", active: "#16a34a", correct: "#dcfce7", wrong: "#fee2e2", text: "#16a34a" },
  { normal: "#fff7ed", active: "#f97316", correct: "#dcfce7", wrong: "#fee2e2", text: "#f97316" },
  { normal: "#fdf4ff", active: "#9333ea", correct: "#dcfce7", wrong: "#fee2e2", text: "#9333ea" },
];

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lessonId = Number(searchParams.get("lessonId"));

  const [lesson, setLesson]       = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent]     = useState(0);
  const [selected, setSelected]   = useState<string | null>(null);
  const [answered, setAnswered]   = useState(false);
  const [score, setScore]         = useState(0);
  const [finished, setFinished]   = useState(false);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    if (!lessonId) { setError("Không tìm thấy bài học."); setLoading(false); return; }
    Promise.all([getLessonById(lessonId), getQuestionsByLesson(lessonId)])
      .then(([lessonData, questionsData]) => {
        if (!lessonData) { setError("Bài học không tồn tại."); return; }
        if (questionsData.length === 0) { setError("Bài học này chưa có câu hỏi."); return; }
        setLesson(lessonData);
        setQuestions(questionsData);
      })
      .catch(() => setError("Lỗi tải dữ liệu. Thử lại nhé!"))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const q = questions[current];

  const handleSelect = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === q.correct_answer) setScore((s) => s + 1);
  };

  const handleNext = async () => {
    const isLast = current + 1 >= questions.length;
    if (isLast) {
      const finalScore = score + (selected === q.correct_answer ? 0 : 0);
      try { await saveQuizResult(lessonId, score, questions.length); } catch {}
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const restart = () => {
    setCurrent(0); setSelected(null);
    setAnswered(false); setScore(0); setFinished(false);
  };

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── Error ──
  if (error) return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center px-4 gap-4">
      <div className="text-4xl">😕</div>
      <p className="text-gray-600 font-semibold text-center">{error}</p>
      <button onClick={() => router.back()} className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-bold">
        ← Quay lại
      </button>
    </div>
  );

  // ── Result ──
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const stars = pct >= 80 ? 3 : pct >= 60 ? 2 : 1;
    const msg = pct >= 80 ? "Xuất sắc! 🎉" : pct >= 60 ? "Tốt lắm! 👍" : "Cố gắng hơn nhé! 💪";

    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col">
        <div className="bg-orange-500 px-4 py-3 text-center">
          <p className="text-white font-bold text-sm">Kết quả bài làm</p>
          <p className="text-orange-100 text-xs">{lesson?.title}</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
          {/* Score ring */}
          <div
            className="w-36 h-36 rounded-full flex flex-col items-center justify-center border-4"
            style={{ borderColor: pct >= 70 ? "#16a34a" : "#f97316" }}
          >
            <span className="text-4xl font-black" style={{ color: pct >= 70 ? "#16a34a" : "#f97316" }}>
              {score}/{questions.length}
            </span>
            <span className="text-sm text-gray-400">{pct}%</span>
          </div>

          {/* Stars */}
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <span key={i} className="text-3xl" style={{ opacity: i <= stars ? 1 : 0.2 }}>⭐</span>
            ))}
          </div>

          <p className="text-xl font-black text-gray-800">{msg}</p>

          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={restart}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm bg-white"
            >
              🔄 Làm lại
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-2xl bg-orange-500 text-white font-bold text-sm"
            >
              ← Về lớp
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz ──
  const pct = ((current + 1) / questions.length) * 100;

  const getOptStyle = (opt: string) => {
    const c = OPT_COLORS[q.options.indexOf(opt) % 4];
    if (!answered) return { bg: c.normal, border: "#e5e7eb", text: "#374151" };
    if (opt === q.correct_answer) return { bg: "#dcfce7", border: "#16a34a", text: "#16a34a" };
    if (opt === selected) return { bg: "#fee2e2", border: "#f97316", text: "#dc2626" };
    return { bg: "#f9fafb", border: "#e5e7eb", text: "#9ca3af" };
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-700 truncate">{lesson?.title}</p>
          <p className="text-xs text-gray-400">Câu {current + 1}/{questions.length}</p>
        </div>
        <div className="flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-full">
          <span className="text-xs">⭐</span>
          <span className="text-xs font-bold text-orange-600">{score} điểm</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100">
        <div
          className="h-full bg-orange-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col px-4 py-5 max-w-2xl mx-auto w-full gap-4">
        {/* Question */}
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5 shadow-sm">
          <div className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-2">
            Câu {current + 1}
          </div>
          <p className="text-gray-800 font-semibold text-base leading-relaxed">
            {q.content}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {q.options.map((opt, idx) => {
            const style = getOptStyle(opt);
            return (
              <button
                key={idx}
                onClick={() => handleSelect(opt)}
                disabled={answered}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all active:scale-[0.98]"
                style={{
                  background: style.bg,
                  borderColor: style.border,
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: style.border + "33", color: style.text }}
                >
                  {OPT_LABELS[idx]}
                </div>
                <span className="text-sm font-medium flex-1" style={{ color: style.text }}>
                  {opt}
                </span>
                {answered && opt === q.correct_answer && (
                  <span className="text-green-500 text-lg">✓</span>
                )}
                {answered && opt === selected && opt !== q.correct_answer && (
                  <span className="text-red-400 text-lg">✗</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation + Next */}
        {answered && (
          <div className="flex flex-col gap-3">
            {q.explanation && (
              <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-amber-600 mb-1">💡 Lời giải</p>
                <p className="text-sm text-amber-800 leading-relaxed">{q.explanation}</p>
              </div>
            )}
            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-md shadow-orange-200 active:scale-[0.98]"
            >
              {current + 1 >= questions.length ? "🏁 Xem kết quả" : "Câu tiếp theo →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
