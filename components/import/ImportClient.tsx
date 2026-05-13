"use client";
import { useState, useEffect, useCallback } from "react";
import { nanoid } from "@/lib/nanoid";
import Header from "@/components/Header";
import QuestionCard, { type QDraft } from "./QuestionCard";
import MathText from "@/components/MathText";

// ── Types ────────────────────────────────────────────────────────────────────

type Subject = { id: number; name: string };
type Chapter = { id: number; title: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

function blankQuestion(): QDraft {
  return { id: nanoid(), content: "", options: ["", "", "", ""], correctIdx: 0 };
}

function validateQuestions(qs: QDraft[]): string | null {
  if (!qs.length) return "Chưa có câu hỏi nào.";
  for (let i = 0; i < qs.length; i++) {
    const q = qs[i];
    if (!q.content.trim()) return `Câu ${i + 1}: Thiếu nội dung câu hỏi.`;
    if (q.options.some((o) => !o.trim())) return `Câu ${i + 1}: Cần điền đủ 4 đáp án.`;
  }
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ImportClient() {
  // Lesson form — dùng state riêng để useEffect dependency chính xác
  const [grade, setGrade] = useState(1);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [indexLabel, setIndexLabel] = useState("01");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // Questions
  const [questions, setQuestions] = useState<QDraft[]>([blankQuestion()]);

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; lessonId?: number; msg: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch subjects khi grade thay đổi ──────────────────────────────────────
  useEffect(() => {
    setSubjectId(null);
    setChapterId(null);
    setSubjects([]);
    setChapters([]);
    setLoadingSubjects(true);

    fetch(`/api/subjects?grade=${grade}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) { console.error("subjects API error:", data.error); return; }
        setSubjects(data as Subject[]);
        if ((data as Subject[]).length) setSubjectId((data as Subject[])[0].id);
      })
      .catch((e) => console.error("subjects fetch error:", e))
      .finally(() => setLoadingSubjects(false));
  }, [grade]);

  // ── Fetch chapters khi subjectId thay đổi ─────────────────────────────────
  useEffect(() => {
    if (subjectId === null) {
      setChapters([]);
      setChapterId(null);
      return;
    }
    setChapterId(null);
    setChapters([]);
    setLoadingChapters(true);

    fetch(`/api/chapters?subjectId=${subjectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) { console.error("chapters API error:", data.error); return; }
        setChapters(data as Chapter[]);
        if ((data as Chapter[]).length) setChapterId((data as Chapter[])[0].id);
      })
      .catch((e) => console.error("chapters fetch error:", e))
      .finally(() => setLoadingChapters(false));
  }, [subjectId]);

  // ── Question operations ──────────────────────────────────────────────────

  const addQuestion = () => setQuestions((qs) => [...qs, blankQuestion()]);

  const updateQuestion = useCallback((id: string, q: QDraft) => {
    setQuestions((qs) => qs.map((x) => (x.id === id ? q : x)));
  }, []);

  const moveQuestion = (i: number, dir: -1 | 1) => {
    setQuestions((qs) => {
      const next = [...qs];
      const j = i + dir;
      if (j < 0 || j >= next.length) return qs;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const duplicateQuestion = (i: number) => {
    setQuestions((qs) => {
      const clone: QDraft = { ...qs[i], id: nanoid(), options: [...qs[i].options] as QDraft["options"] };
      const next = [...qs];
      next.splice(i + 1, 0, clone);
      return next;
    });
  };

  const deleteQuestion = (id: string) => {
    setQuestions((qs) => (qs.length > 1 ? qs.filter((q) => q.id !== id) : qs));
  };

  // ── Save to Supabase ─────────────────────────────────────────────────────

  async function handleSave() {
    setError(null);
    setSaveResult(null);

    if (!chapterId) { setError("Chưa chọn chương."); return; }
    if (!lessonTitle.trim()) { setError("Chưa nhập tên bài học."); return; }
    const qErr = validateQuestions(questions);
    if (qErr) { setError(qErr); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/create-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId,
          title: lessonTitle,
          indexLabel,
          questions: questions.map((q) => ({
            content: q.content,
            options: q.options,
            correctAnswer: q.options[q.correctIdx],
            imageUrl: q.imageUrl,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Lỗi không xác định."); return; }
      setSaveResult({ ok: true, lessonId: data.lessonId, msg: "Đã lưu bài học thành công!" });
      setLessonTitle("");
      setIndexLabel("01");
      setQuestions([blankQuestion()]);
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setSaving(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const gradeColor: Record<number, string> = {
    1: "text-red-600", 2: "text-orange-600", 3: "text-green-600",
    4: "text-blue-600", 5: "text-purple-600",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <h1 className="text-xl font-bold text-gray-800">Tạo bài học mới</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Tạo bài học · Soạn câu hỏi với KaTeX · Lưu vào Supabase
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
        {/* ── Left: lesson form + question editor ── */}
        <div className="space-y-5">

          {/* Lesson form */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-4">Thông tin bài học</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              {/* Grade */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Lớp</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {[1, 2, 3, 4, 5].map((g) => (
                    <option key={g} value={g}>Lớp {g}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Môn học {loadingSubjects && <span className="text-blue-400">⟳</span>}
                </label>
                <select
                  value={subjectId ?? ""}
                  onChange={(e) => setSubjectId(Number(e.target.value))}
                  disabled={loadingSubjects || subjects.length === 0}
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subjects.length === 0 && !loadingSubjects && (
                    <option value="">— Chưa có môn —</option>
                  )}
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Chapter */}
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">
                  Chương {loadingChapters && <span className="text-blue-400">⟳</span>}
                </label>
                <select
                  value={chapterId ?? ""}
                  onChange={(e) => setChapterId(Number(e.target.value))}
                  disabled={loadingChapters || chapters.length === 0}
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {chapters.length === 0 && !loadingChapters && (
                    <option value="">
                      {subjectId ? "— Môn này chưa có chương —" : "— Chọn môn học trước —"}
                    </option>
                  )}
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                {chapters.length === 0 && subjectId && !loadingChapters && (
                  <p className="text-xs text-amber-600 mt-1">
                    Môn này chưa có chương trong DB. Hãy thêm chương vào Supabase trước.
                  </p>
                )}
              </div>

              {/* Index label */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">STT bài</label>
                <input
                  type="text"
                  value={indexLabel}
                  onChange={(e) => setIndexLabel(e.target.value)}
                  placeholder="01"
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {/* Lesson title */}
              <div className="col-span-3">
                <label className="text-xs text-gray-500 block mb-1">Tên bài học</label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="VD: Phép cộng trong phạm vi 100"
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
          </section>

          {/* Question list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-700">
                Câu hỏi{" "}
                <span className={`ml-1 ${gradeColor[grade] ?? "text-blue-600"}`}>
                  ({questions.length} câu)
                </span>
              </h2>
            </div>

            {questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={i}
                total={questions.length}
                onChange={(updated) => updateQuestion(q.id, updated)}
                onMoveUp={() => moveQuestion(i, -1)}
                onMoveDown={() => moveQuestion(i, 1)}
                onDuplicate={() => duplicateQuestion(i)}
                onDelete={() => deleteQuestion(q.id)}
              />
            ))}

            <button
              onClick={addQuestion}
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm câu hỏi
            </button>
          </div>
        </div>

        {/* ── Right: save panel ── */}
        <div className="space-y-4 lg:sticky lg:top-6">
          {/* Lesson summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Tổng quan</h3>
            <div className="space-y-1.5 text-xs text-gray-600">
              <Row label="Lớp" value={`Lớp ${grade}`} />
              <Row label="Môn" value={subjects.find((s) => s.id === subjectId)?.name ?? "—"} />
              <Row
                label="Chương"
                value={chapters.find((c) => c.id === chapterId)?.title?.slice(0, 28) ?? "—"}
              />
              <Row label="Bài" value={lessonTitle || "—"} />
              <Row label="Số câu" value={String(questions.length)} />
            </div>

            {error && (
              <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                ✗ {error}
              </div>
            )}

            {saveResult?.ok && (
              <div className="mt-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                ✓ {saveResult.msg}{" "}
                <a href={`/quiz?lessonId=${saveResult.lessonId}`} className="underline font-semibold">
                  Vào làm bài →
                </a>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !chapterId || !lessonTitle.trim()}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Đang lưu...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Lưu vào Supabase
                </>
              )}
            </button>
          </div>

          {/* KaTeX cheatsheet */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-blue-600 mb-3">LaTeX nhanh</h3>
            <div className="space-y-1.5 text-xs">
              {[
                ["Phân số", "$\\frac{1}{2}$", "$\\frac{1}{2}$"],
                ["Căn", "$\\sqrt{x}$", "$\\sqrt{x}$"],
                ["Mũ", "$x^{2}$", "$x^{2}$"],
                ["Chỉ số dưới", "$x_{i}$", "$x_{i}$"],
                ["Block math", "$$E=mc^2$$", "$$E=mc^2$$"],
              ].map(([name, src, preview]) => (
                <div key={name} className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 w-20 shrink-0">{name}</span>
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] flex-1">{src}</code>
                  <span className="text-gray-700 shrink-0">
                    <MathText text={preview} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-700 space-y-1">
            <p className="font-semibold">Lưu ý</p>
            <p>• Nhấn ký tự tròn A/B/C/D để chọn đáp án đúng</p>
            <p>• Ảnh cần bucket <code className="bg-amber-100 px-1 rounded">question-images</code> (public) trong Supabase Storage</p>
            <p>• LaTeX inline: <code className="bg-amber-100 px-1 rounded">$...$</code> · block: <code className="bg-amber-100 px-1 rounded">$$...$$</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-700 text-right truncate max-w-[140px]" title={value}>
        {value}
      </span>
    </div>
  );
}
