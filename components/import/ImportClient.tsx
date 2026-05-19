"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { nanoid } from "@/lib/nanoid";
import Header from "@/components/Header";
import QuestionCard, { type QDraft } from "./QuestionCard";
import PasteImportModal from "./PasteImportModal";
import MathText from "@/components/MathText";
import { insertIntoFocused } from "@/lib/focusedEditor";

// ── Types ────────────────────────────────────────────────────────────────────

type Subject = { id: number; name: string };
type Chapter = { id: number; title: string };

export type InitialData = {
  lessonId: number;
  title: string;
  indexLabel: string;
  chapterId: number;
  subjectId: number;
  grade: number;
  questions: QDraft[];
  type?: "exam" | "lesson";
};

const DRAFT_KEY = "ontap_import_draft_v1";
const EXAM_DRAFT_KEY = "ontap_exam_draft_v1";

type Draft = {
  grade: number;
  subjectId: number | null;
  chapterId: number | null;
  lessonTitle: string;
  indexLabel: string;
  questions: QDraft[];
  collapsedIds: string[];
};

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

export default function ImportClient({ initialData, examMode: examModeProp }: { initialData?: InitialData; examMode?: boolean }) {
  const editMode = !!initialData;
  const examMode = initialData?.type === "exam" || examModeProp === true;
  const draftKey = examMode ? EXAM_DRAFT_KEY : DRAFT_KEY;

  // Lesson form — dùng state riêng để useEffect dependency chính xác
  const [grade, setGrade] = useState(initialData?.grade ?? 1);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState(initialData?.title ?? "");
  const [indexLabel, setIndexLabel] = useState(initialData?.indexLabel ?? "01");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // Questions + collapse state
  const [questions, setQuestions] = useState<QDraft[]>(() => initialData?.questions ?? [blankQuestion()]);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // Paste modal
  const [pasteOpen, setPasteOpen] = useState(false);

  // Inline chapter creation
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [creatingChapter, setCreatingChapter] = useState(false);
  const [chapterCreateError, setChapterCreateError] = useState<string | null>(null);

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; lessonId?: number; msg: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Autosave hydration flag
  const hydrated = useRef(false);
  const skipNextSubjectAutoset = useRef(editMode);
  const skipNextChapterAutoset = useRef(editMode);
  // Pending IDs to restore after async subject/chapter fetch (edit mode or draft restore)
  const pendingSubjectId = useRef<number | null>(initialData?.subjectId ?? null);
  const pendingChapterId = useRef<number | null>(initialData?.chapterId ?? null);

  // ── Restore draft from localStorage on mount (skipped in edit mode) ───────
  useEffect(() => {
    if (editMode) { hydrated.current = true; return; }
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw) as Draft;
        if (d.questions?.length) {
          setGrade(d.grade ?? 1);
          setLessonTitle(d.lessonTitle ?? "");
          setIndexLabel(d.indexLabel ?? "01");
          setQuestions(d.questions);
          setCollapsedIds(new Set(d.collapsedIds ?? []));
          if (d.subjectId != null) {
            skipNextSubjectAutoset.current = true;
            pendingSubjectId.current = d.subjectId;
          }
          if (d.chapterId != null) {
            skipNextChapterAutoset.current = true;
            pendingChapterId.current = d.chapterId;
          }
        }
      }
    } catch {/* ignore */}
    hydrated.current = true;
  }, [editMode]);

  // ── Fetch subjects khi grade thay đổi ──────────────────────────────────────
  useEffect(() => {
    setSubjects([]);
    setLoadingSubjects(true);

    fetch(`/api/subjects?grade=${grade}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) { console.error("subjects API error:", data.error); return; }
        const list = data as Subject[];
        setSubjects(list);
        const targetId = pendingSubjectId.current;
        pendingSubjectId.current = null;
        if (skipNextSubjectAutoset.current && targetId != null && list.some((s) => s.id === targetId)) {
          setSubjectId(targetId);
        } else if (list.length) {
          setSubjectId(list[0].id);
        } else {
          setSubjectId(null);
        }
        skipNextSubjectAutoset.current = false;
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
    setChapters([]);
    setLoadingChapters(true);
    setShowNewChapter(false);
    setNewChapterTitle("");
    setChapterCreateError(null);

    fetch(`/api/chapters?subjectId=${subjectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) { console.error("chapters API error:", data.error); return; }
        const list = data as Chapter[];
        setChapters(list);
        const targetId = pendingChapterId.current;
        pendingChapterId.current = null;
        if (skipNextChapterAutoset.current && targetId != null && list.some((c) => c.id === targetId)) {
          setChapterId(targetId);
        } else if (list.length) {
          setChapterId(list[0].id);
        } else {
          setChapterId(null);
        }
        skipNextChapterAutoset.current = false;
      })
      .catch((e) => console.error("chapters fetch error:", e))
      .finally(() => setLoadingChapters(false));
  }, [subjectId]);

  // ── Autosave draft (debounced, skipped in edit mode) ──────────────────────
  useEffect(() => {
    if (!hydrated.current || editMode) return;
    const t = setTimeout(() => {
      try {
        const d: Draft = {
          grade, subjectId, chapterId, lessonTitle, indexLabel,
          questions, collapsedIds: Array.from(collapsedIds),
        };
        localStorage.setItem(draftKey, JSON.stringify(d));
      } catch {/* ignore */}
    }, 500);
    return () => clearTimeout(t);
  }, [grade, subjectId, chapterId, lessonTitle, indexLabel, questions, collapsedIds, editMode]);

  // ── Question operations ──────────────────────────────────────────────────

  const addQuestion = useCallback(() => {
    const q = blankQuestion();
    setQuestions((qs) => [...qs, q]);
  }, []);

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
    setCollapsedIds((s) => { const n = new Set(s); n.delete(id); return n; });
  };

  const toggleCollapse = (id: string) => {
    setCollapsedIds((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const collapseAll = () => setCollapsedIds(new Set(questions.map((q) => q.id)));
  const expandAll = () => setCollapsedIds(new Set());

  // ── Import from paste modal ──────────────────────────────────────────────
  const handlePasteImport = (imported: QDraft[], mode: "replace" | "append") => {
    if (mode === "replace") {
      setQuestions(imported);
      setCollapsedIds(new Set(imported.map((q) => q.id))); // collapse all imported by default
    } else {
      setQuestions((qs) => {
        // Remove blank trailing question if present, then append
        const cleaned = qs.filter((q) => q.content.trim() || q.options.some((o) => o.trim()));
        const combined = [...cleaned, ...imported];
        return combined.length ? combined : imported;
      });
      setCollapsedIds((s) => {
        const n = new Set(s);
        imported.forEach((q) => n.add(q.id));
        return n;
      });
    }
  };

  // ── Create chapter inline ────────────────────────────────────────────────

  const handleCreateChapter = useCallback(async () => {
    if (!subjectId || !newChapterTitle.trim()) return;
    setChapterCreateError(null);
    setCreatingChapter(true);
    try {
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, title: newChapterTitle.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setChapterCreateError(data.error ?? "Không thể tạo chương."); return; }
      setChapters((prev) => [...prev, data as Chapter]);
      setChapterId(data.id);
      setNewChapterTitle("");
      setShowNewChapter(false);
    } catch {
      setChapterCreateError("Không thể kết nối máy chủ.");
    } finally {
      setCreatingChapter(false);
    }
  }, [subjectId, newChapterTitle]);

  // ── Save to Supabase ─────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    setError(null);
    setSaveResult(null);

    if (!chapterId) { setError("Chưa chọn chương."); return; }
    if (!lessonTitle.trim()) { setError("Chưa nhập tên bài học."); return; }
    const qErr = validateQuestions(questions);
    if (qErr) { setError(qErr); return; }

    setSaving(true);
    const payload = {
      chapterId,
      title: lessonTitle,
      indexLabel,
      type: examMode ? "exam" : "lesson",
      questions: questions.map((q) => ({
        content: q.content,
        options: q.options,
        correctAnswer: q.options[q.correctIdx],
        imageUrl: q.imageUrl,
      })),
      ...(editMode ? { lessonId: initialData!.lessonId } : {}),
    };
    try {
      const res = await fetch(editMode ? "/api/update-lesson" : "/api/create-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Lỗi không xác định."); return; }
      setSaveResult({
        ok: true,
        lessonId: data.lessonId,
        msg: editMode ? "Đã cập nhật bài học!" : "Đã lưu bài học thành công!",
      });
      if (!editMode) {
        try { localStorage.removeItem(draftKey); } catch {/* ignore */}
        setLessonTitle("");
        setIndexLabel("01");
        setQuestions([blankQuestion()]);
        setCollapsedIds(new Set());
      }
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setSaving(false);
    }
  }, [chapterId, lessonTitle, indexLabel, questions, editMode, initialData]);

  // ── Keyboard shortcuts: Ctrl+S save, Ctrl+Enter add question ────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Enter") {
        e.preventDefault();
        addQuestion();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSave, addQuestion]);

  // ── Render ───────────────────────────────────────────────────────────────

  const gradeColor: Record<number, string> = {
    1: "text-red-600", 2: "text-orange-600", 3: "text-green-600",
    4: "text-blue-600", 5: "text-purple-600",
  };

  const allCollapsed = questions.length > 0 && questions.every((q) => collapsedIds.has(q.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            {editMode && (
              <a
                href={`/quiz?lessonId=${initialData!.lessonId}`}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
                title="Xem bài học"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </a>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-800">
                  {editMode
                    ? (examMode ? "Chỉnh sửa đề kiểm tra" : "Chỉnh sửa bài học")
                    : (examMode ? "Tạo đề kiểm tra mới" : "Tạo bài học mới")}
                </h1>
                {editMode && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    Đang sửa
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-0.5">
                {editMode
                  ? `${examMode ? "Đề" : "Bài"} #${initialData!.lessonId} · Cập nhật câu hỏi · Lưu vào Supabase`
                  : (examMode ? "Tạo đề kiểm tra · Soạn câu hỏi với KaTeX · Lưu vào Supabase" : "Tạo bài học · Soạn câu hỏi với KaTeX · Lưu vào Supabase")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setPasteOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Dán đề từ văn bản
            </button>
          </div>
        </div>
      </div>

      {/* Edit mode step bar */}
      {editMode && (
        <div className="bg-amber-50 border-b border-amber-100">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2">
            {[
              { n: 1, label: "Thông tin bài" },
              { n: 2, label: "Câu hỏi" },
              { n: 3, label: "Lưu" },
            ].map((step, i) => (
              <div key={step.n} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {step.n}
                  </div>
                  <span className="text-xs font-semibold text-amber-700 hidden sm:block">{step.label}</span>
                </div>
                {i < 2 && <div className="w-6 h-px bg-amber-300 mx-0.5" />}
              </div>
            ))}
            <span className="ml-auto text-xs text-amber-600">
              Sửa xong → bấm <strong>{examMode ? "Cập nhật đề kiểm tra" : "Cập nhật bài học"}</strong>
            </span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
        {/* ── Left: lesson form + question editor ── */}
        <div className="space-y-5">

          {/* Lesson form */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              {editMode && <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">1</span>}
              Thông tin bài học
            </h2>
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
                <div className="flex gap-1.5">
                  <select
                    value={chapterId ?? ""}
                    onChange={(e) => setChapterId(Number(e.target.value))}
                    disabled={loadingChapters || chapters.length === 0}
                    className="flex-1 border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {chapters.length === 0 && !loadingChapters && (
                      <option value="">
                        {subjectId ? "— Chưa có chương —" : "— Chọn môn học trước —"}
                      </option>
                    )}
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  {subjectId && !loadingChapters && (
                    <button
                      type="button"
                      onClick={() => { setShowNewChapter((v) => !v); setChapterCreateError(null); setNewChapterTitle(""); }}
                      title="Tạo chương mới"
                      className={`px-2.5 py-2 rounded-lg border text-sm font-bold transition-colors flex-shrink-0 ${
                        showNewChapter
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600"
                      }`}
                    >
                      +
                    </button>
                  )}
                </div>

                {/* Inline create chapter form */}
                {showNewChapter && subjectId && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                    <p className="text-xs font-semibold text-blue-700">Tạo chương mới</p>
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={newChapterTitle}
                        onChange={(e) => setNewChapterTitle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleCreateChapter(); if (e.key === "Escape") setShowNewChapter(false); }}
                        placeholder="VD: Chương 1: Số tự nhiên"
                        className="flex-1 border border-blue-200 bg-white rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      <button
                        onClick={handleCreateChapter}
                        disabled={!newChapterTitle.trim() || creatingChapter}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex-shrink-0"
                      >
                        {creatingChapter ? "..." : "Tạo"}
                      </button>
                    </div>
                    {chapterCreateError && (
                      <p className="text-xs text-red-500">✗ {chapterCreateError}</p>
                    )}
                  </div>
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
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                {editMode && <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">2</span>}
                Câu hỏi{" "}
                <span className={`${gradeColor[grade] ?? "text-blue-600"}`}>
                  ({questions.length} câu)
                </span>
              </h2>
              {questions.length > 1 && (
                <button
                  onClick={allCollapsed ? expandAll : collapseAll}
                  className="text-xs text-gray-500 hover:text-blue-600 font-medium px-2 py-1 rounded-lg hover:bg-gray-100"
                >
                  {allCollapsed ? "↓ Mở rộng tất cả" : "↑ Thu gọn tất cả"}
                </button>
              )}
            </div>

            {questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={i}
                total={questions.length}
                collapsed={collapsedIds.has(q.id)}
                onToggleCollapse={() => toggleCollapse(q.id)}
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
              Thêm câu hỏi <span className="text-xs text-gray-400 ml-1">(Ctrl+Enter)</span>
            </button>
          </div>
        </div>

        {/* ── Right: save panel ── */}
        <div className="space-y-4 lg:sticky lg:top-6">
          {/* Lesson summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              {editMode && <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">3</span>}
              Tổng quan
            </h3>
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
              <div className="mt-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 space-y-1">
                <p className="font-semibold">✓ {saveResult.msg}</p>
                <a
                  href={`/quiz?lessonId=${saveResult.lessonId}`}
                  className="underline font-semibold block"
                >
                  {editMode
                    ? (examMode ? "Kiểm tra lại đề →" : "Kiểm tra lại bài →")
                    : (examMode ? "Vào làm thử →" : "Vào làm bài →")}
                </a>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !chapterId || !lessonTitle.trim()}
              title="Ctrl+S"
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
                  {editMode
                    ? (examMode ? "Cập nhật đề kiểm tra" : "Cập nhật bài học")
                    : (examMode ? "Lưu đề kiểm tra" : "Lưu bài học")}
                </>
              )}
            </button>
            <p className="mt-1.5 text-[10px] text-gray-400 text-center">Tự lưu nháp vào trình duyệt</p>
          </div>

          {/* KaTeX cheatsheet — clickable */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-blue-600 mb-1">LaTeX nhanh</h3>
            <p className="text-[11px] text-gray-400 mb-3">Click để chèn vào ô câu hỏi đang focus</p>
            <div className="space-y-1 text-xs">
              {([
                ["Phân số", "$\\frac{1}{2}$"],
                ["Căn", "$\\sqrt{x}$"],
                ["Mũ", "$x^{2}$"],
                ["Chỉ số dưới", "$x_{i}$"],
                ["Block math", "$$E=mc^2$$"],
              ] as const).map(([name, src]) => (
                <button
                  key={name}
                  onMouseDown={(e) => {
                    e.preventDefault(); // giữ focus của editor
                    if (!insertIntoFocused(src)) {
                      // Không có editor nào đang focus — feedback nhẹ
                      const el = e.currentTarget;
                      el.classList.add("animate-pulse");
                      setTimeout(() => el.classList.remove("animate-pulse"), 400);
                    }
                  }}
                  className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 group transition-colors text-left"
                  title="Click để chèn"
                >
                  <span className="text-gray-500 w-20 shrink-0 group-hover:text-blue-600">{name}</span>
                  <code className="bg-gray-100 group-hover:bg-blue-100 px-1.5 py-0.5 rounded text-[11px] flex-1 truncate transition-colors">{src}</code>
                  <span className="text-gray-700 shrink-0">
                    <MathText text={src} />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-700 space-y-1">
            <p className="font-semibold">Mẹo</p>
            <p>• <kbd className="bg-amber-100 px-1 rounded">Ctrl+Enter</kbd> thêm câu hỏi mới</p>
            <p>• <kbd className="bg-amber-100 px-1 rounded">Ctrl+S</kbd> lưu vào Supabase</p>
            <p>• Click vào tiêu đề câu để thu gọn / mở rộng</p>
            <p>• Ảnh: bucket <code className="bg-amber-100 px-1 rounded">question-images</code> (public)</p>
          </div>
        </div>
      </div>

      <PasteImportModal open={pasteOpen} onClose={() => setPasteOpen(false)} onImport={handlePasteImport} />
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
