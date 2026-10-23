"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { nanoid } from "@/lib/nanoid";
import { GRADES, getSubjects } from "@/lib/subjects";
import Header from "@/components/Header";
import QuestionCard, { type QDraft } from "./QuestionCard";
import PasteImportModal, { type PasteFocus } from "./PasteImportModal";
import StudentPreview from "./StudentPreview";
import { DeleteLessonButton } from "./DeleteButtons";
import { ACTION_DANGER, ACTION_MD, ACTION_PRIMARY, ACTION_SECONDARY } from "./actionStyles";
import MathText from "@/components/MathText";
import { insertIntoFocused } from "@/lib/focusedEditor";
import { NO_ANSWER, draftProblems, encodeCorrectAnswer, isBlankDraft, lessonProblems, type LessonProblem } from "@/lib/importDraft";
import {
  AlertCircle, BarChart3, Camera, CheckCircle2, ChevronDown, ClipboardPaste, Eye, HelpCircle, Inbox, Loader2, PencilLine, Plus, Save,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type Chapter = { id: number; title: string };

export type InitialData = {
  lessonId: number;
  title: string;
  indexLabel: string;
  chapterId: number;
  subject: string;
  grade: number;
  durationMinutes?: number;
  questions: QDraft[];
  type?: "exam" | "lesson";
  /** Đã đặt IMPORT_PASSWORD — chưa đặt thì API xoá từ chối, nên ẩn nút. */
  canDelete?: boolean;
};

const DRAFT_KEY = "ontap_import_draft_v1";
const EXAM_DRAFT_KEY = "ontap_exam_draft_v1";

type Draft = {
  grade: number;
  // Môn lưu theo TÊN (khoá trong lib/subjects.ts). Draft cũ lưu `subjectId`
  // dạng số thì bỏ qua, form rơi về môn đầu tiên của lớp.
  subject: string | null;
  chapterId: number | null;
  lessonTitle: string;
  indexLabel: string;
  durationMinutes: number;
  questions: QDraft[];
  collapsedIds: string[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function blankQuestion(): QDraft {
  return {
    id: nanoid(),
    type: "mcq",
    content: "",
    options: ["", "", "", ""],
    // Không chọn sẵn đáp án: chọn sẵn A thì quên bấm vẫn lưu được, và đề chấm sai.
    correctIdx: NO_ANSWER,
    correctIdxs: [],
    answer: "",
    images: [],
  };
}

// Backfill defaults for drafts saved before QDraft gained type/correctIdxs/answer.
// Also normalizes legacy single `imageUrl` to the new `images` array.
function migrateDraftQuestion(q: any): QDraft {
  let images: QDraft["images"] = [];
  if (Array.isArray(q.images)) {
    images = q.images
      .filter((img: any) => img && typeof img.url === "string")
      .map((img: any) => ({
        url: img.url,
        position: img.position === "before" ? "before" : "after",
      }));
  } else if (typeof q.imageUrl === "string" && q.imageUrl) {
    images = [{ url: q.imageUrl, position: "after" }];
  }
  return {
    id: q.id ?? nanoid(),
    type: q.type ?? "mcq",
    content: q.content ?? "",
    options: Array.isArray(q.options) ? [...q.options] : ["", "", "", ""],
    correctIdx: typeof q.correctIdx === "number" ? q.correctIdx : 0,
    correctIdxs: Array.isArray(q.correctIdxs) ? q.correctIdxs : [],
    answer: q.answer ?? "",
    images,
    solution: typeof q.solution === "string" ? q.solution : undefined,
  };
}

// Encode QDraft → API payload per type.
function encodeQuestion(q: QDraft) {
  const images = (q.images ?? []).filter((img) => img && img.url);
  const base = {
    type: q.type,
    content: q.content,
    images,
    // Mirror the first image into legacy `imageUrl` so any old reader still works.
    imageUrl: images[0]?.url,
    solution: q.solution?.trim() || undefined,
  };
  const choice = q.type === "mcq" || q.type === "multi";
  return { ...base, options: choice ? q.options : [], correctAnswer: encodeCorrectAnswer(q) };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ImportClient({ initialData, examMode: examModeProp }: { initialData?: InitialData; examMode?: boolean }) {
  const editMode = !!initialData;
  const examMode = initialData?.type === "exam" || examModeProp === true;
  const draftKey = examMode ? EXAM_DRAFT_KEY : DRAFT_KEY;

  // Lesson form — dùng state riêng để useEffect dependency chính xác
  const [grade, setGrade] = useState(initialData?.grade ?? 1);
  const [subjectChoice, setSubjectChoice] = useState<string | null>(initialData?.subject ?? null);
  const [chapterId, setChapterId] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState(initialData?.title ?? "");
  const [indexLabel, setIndexLabel] = useState(initialData?.indexLabel ?? "01");
  const [durationMinutes, setDurationMinutes] = useState<number>(initialData?.durationMinutes ?? 15);

  // Môn học lấy thẳng từ lib/subjects.ts — không fetch API nữa, nên không cần
  // state/loading và cũng không còn race khi khôi phục draft.
  const subjects = useMemo(() => {
    const catalog = getSubjects(grade);
    // Bài đang sửa có thể thuộc môn không còn trong danh mục; vẫn giữ trong
    // dropdown để lưu lại không âm thầm đổi môn của bài.
    const current = initialData?.subject;
    return current && initialData?.grade === grade && !catalog.includes(current)
      ? [...catalog, current]
      : [...catalog];
  }, [grade, initialData?.subject, initialData?.grade]);

  // Môn đang chọn suy ra từ state + danh mục: đổi lớp mà môn cũ không còn thì
  // tự rơi về môn đầu tiên, khỏi cần effect setState.
  const subject =
    subjectChoice && subjects.includes(subjectChoice) ? subjectChoice : subjects[0] ?? null;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // Questions + collapse state
  const [questions, setQuestions] = useState<QDraft[]>(() => initialData?.questions ?? [blankQuestion()]);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // Paste modal
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteFocus, setPasteFocus] = useState<PasteFocus>("paste");
  const openPaste = (focus: PasteFocus) => { setPasteFocus(focus); setPasteOpen(true); };

  // "Xem như học sinh"
  const [previewOpen, setPreviewOpen] = useState(false);
  // Đã bấm Lưu mà còn thiếu → từng thẻ câu hiện danh sách lỗi của nó.
  const [showProblems, setShowProblems] = useState(false);
  // Thẻ "Bạn muốn bắt đầu thế nào?" — bấm "Soạn từng câu" thì ẩn.
  const [startDismissed, setStartDismissed] = useState(false);

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
  const skipNextChapterAutoset = useRef(editMode);
  // Chương vẫn fetch async nên vẫn cần ref này để khôi phục đúng lựa chọn sau
  // khi danh sách về (edit mode hoặc khôi phục draft).
  const pendingChapterId = useRef<number | null>(initialData?.chapterId ?? null);

  // ── Restore draft from localStorage on mount (skipped in edit mode) ───────
  useEffect(() => {
    if (editMode) { hydrated.current = true; return; }
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw) as Draft;
        if (d.questions?.length) {
          // Bản nháp nằm trong localStorage (chỉ có ở trình duyệt) nên phải khôi phục sau khi mount.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setGrade(d.grade ?? 1);
          setLessonTitle(d.lessonTitle ?? "");
          setIndexLabel(d.indexLabel ?? "01");
          if (typeof d.durationMinutes === "number" && d.durationMinutes > 0) {
            setDurationMinutes(d.durationMinutes);
          }
          setQuestions(d.questions.map(migrateDraftQuestion));
          setCollapsedIds(new Set(d.collapsedIds ?? []));
          if (typeof d.subject === "string") setSubjectChoice(d.subject);
          if (d.chapterId != null) {
            skipNextChapterAutoset.current = true;
            pendingChapterId.current = d.chapterId;
          }
        }
      }
    } catch {/* ignore */}
    hydrated.current = true;
  }, [editMode, draftKey]);

  // ── Fetch chapters khi lớp/môn thay đổi ───────────────────────────────────
  useEffect(() => {
    if (subject === null) {
      // Xoá danh sách chương cũ ngay khi đổi lớp/môn, trước khi fetch danh sách mới.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChapters([]);
      setChapterId(null);
      return;
    }
    setChapters([]);
    setLoadingChapters(true);
    setShowNewChapter(false);
    setNewChapterTitle("");
    setChapterCreateError(null);

    fetch(`/api/chapters?grade=${grade}&subject=${encodeURIComponent(subject)}`)
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
  }, [grade, subject]);

  // ── Autosave draft (debounced, skipped in edit mode) ──────────────────────
  useEffect(() => {
    if (!hydrated.current || editMode) return;
    const t = setTimeout(() => {
      try {
        const d: Draft = {
          grade, subject, chapterId, lessonTitle, indexLabel, durationMinutes,
          questions, collapsedIds: Array.from(collapsedIds),
        };
        localStorage.setItem(draftKey, JSON.stringify(d));
      } catch {/* ignore */}
    }, 500);
    return () => clearTimeout(t);
  }, [grade, subject, chapterId, lessonTitle, indexLabel, durationMinutes, questions, collapsedIds, editMode, draftKey]);

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
      const src = qs[i];
      const clone: QDraft = {
        ...src,
        id: nanoid(),
        options: [...src.options],
        correctIdxs: [...src.correctIdxs],
      };
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
    // Gập các câu đã đủ cho gọn; câu còn thiếu (thường là chưa có đáp án đúng)
    // để mở, người soạn thấy ngay chỗ cần bấm.
    const done = imported.filter((q) => draftProblems(q).length === 0).map((q) => q.id);
    if (mode === "replace") {
      setQuestions(imported);
      setCollapsedIds(new Set(done));
    } else {
      setQuestions((qs) => {
        // Remove blank trailing question if present, then append
        const cleaned = qs.filter((q) => q.content.trim() || q.options.some((o) => o.trim()));
        const combined = [...cleaned, ...imported];
        return combined.length ? combined : imported;
      });
      setCollapsedIds((s) => {
        const n = new Set(s);
        done.forEach((id) => n.add(id));
        return n;
      });
    }
  };

  // ── Create chapter inline ────────────────────────────────────────────────

  const handleCreateChapter = useCallback(async () => {
    if (!subject || !newChapterTitle.trim()) return;
    setChapterCreateError(null);
    setCreatingChapter(true);
    try {
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, subject, title: newChapterTitle.trim() }),
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
  }, [grade, subject, newChapterTitle]);

  // ── Còn thiếu gì trước khi lưu ───────────────────────────────────────────
  // Chương là tuỳ chọn — không chọn thì máy chủ gom vào chương mặc định của
  // môn (xem ensureDefaultChapterId). Bắt buộc chỉ còn môn + tên + câu hỏi đủ.
  const problems = useMemo(
    () => lessonProblems({ subject, title: lessonTitle, questions }),
    [subject, lessonTitle, questions],
  );

  const titleRef = useRef<HTMLInputElement>(null);

  /** Cuộn tới chỗ đang thiếu: mở thẻ câu nếu đang thu gọn. */
  const jumpTo = useCallback((p: LessonProblem) => {
    if (!p.id) {
      document.getElementById("thong-tin-bai")?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (p.text.includes("tên")) titleRef.current?.focus({ preventScroll: true });
      return;
    }
    const id = p.id;
    setCollapsedIds((cur) => { if (!cur.has(id)) return cur; const n = new Set(cur); n.delete(id); return n; });
    // Neo theo số câu (id ngẫu nhiên của câu mới khác nhau giữa máy chủ và trình duyệt).
    // Đợi thẻ mở ra rồi mới cuộn, không thì cuộn tới vị trí của thẻ đang gập.
    setTimeout(() => document.getElementById(`cau-${(p.index ?? 0) + 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }, []);

  // ── Sửa bài có sẵn: nhắc khi rời trang mà chưa lưu ───────────────────────
  // Bài mới có nháp tự lưu trên máy; bài đang sửa thì không, đóng tab là mất.
  // Chương không nằm trong chuỗi so sánh: danh sách chương về sau lần render
  // đầu, chapterId đi từ null → chương của bài, không phải người dùng sửa.
  const snapshot = JSON.stringify({ lessonTitle, indexLabel, durationMinutes, questions });
  const [saved, setSaved] = useState(() => ({
    snapshot: JSON.stringify({
      lessonTitle: initialData?.title ?? "",
      indexLabel: initialData?.indexLabel ?? "01",
      durationMinutes: initialData?.durationMinutes ?? 15,
      questions: initialData?.questions ?? [],
    }),
    chapterId: initialData?.chapterId ?? null,
  }));
  const dirty = editMode && (saved.snapshot !== snapshot || (chapterId !== null && chapterId !== saved.chapterId));
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // ── Save to Supabase ─────────────────────────────────────────────────────

  const handleSave = useCallback(async (gotoNext = false) => {
    setError(null);
    setSaveResult(null);

    if (problems.length) {
      // Danh sách "Còn … chỗ cần sửa" đã hiện sẵn; chỉ cần mở lỗi trong từng
      // thẻ câu và đưa người soạn tới chỗ đầu tiên.
      setShowProblems(true);
      jumpTo(problems[0]);
      return;
    }

    setSaving(true);
    const payload = {
      // chapterId có thể null; khi đó máy chủ dùng grade+subject để tìm/tạo
      // chương mặc định.
      chapterId,
      grade,
      subject,
      title: lessonTitle,
      indexLabel,
      durationMinutes,
      type: examMode ? "exam" : "lesson",
      questions: questions.map(encodeQuestion),
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
      if (editMode) setSaved({ snapshot, chapterId });
      setShowProblems(false);

      if (gotoNext && editMode && data.nextLessonId) {
        // Tải lại hẳn trang: router.push sang [id] khác có thể giữ nguyên state
        // của ImportClient (khởi tạo từ initialData của bài cũ).
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `/import/edit/${data.nextLessonId}`;
        return;
      }

      setSaveResult({
        ok: true,
        lessonId: data.lessonId,
        msg: editMode
          ? (gotoNext ? "Đã lưu — đây là bài cuối trong chương." : "Đã cập nhật bài học!")
          : "Đã lưu bài học thành công!",
      });
      if (!editMode) {
        try { localStorage.removeItem(draftKey); } catch {/* ignore */}
        setLessonTitle("");
        setIndexLabel("01");
        setDurationMinutes(15);
        setQuestions([blankQuestion()]);
        setCollapsedIds(new Set());
      }
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setSaving(false);
    }
  }, [chapterId, grade, subject, lessonTitle, indexLabel, durationMinutes, questions, editMode, examMode, draftKey, initialData, problems, jumpTo, snapshot]);

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

  const allCollapsed = questions.length > 0 && questions.every((q) => collapsedIds.has(q.id));
  const noun = examMode ? "đề" : "bài";
  const saveLabel = editMode ? `Lưu thay đổi` : `Lưu ${noun}`;
  // Trang vừa mở, chưa gõ gì: hỏi cách bắt đầu thay vì thả người dùng vào form trống.
  const fresh = !editMode && !startDismissed && questions.length === 1 && isBlankDraft(questions[0]);
  const hasContent = questions.some((q) => !isBlankDraft(q));
  const chapterTitle = chapters.find((c) => c.id === chapterId)?.title;

  const label = "text-sm font-semibold text-slate-700 block mb-1";
  const field =
    "w-full border border-slate-300 rounded-xl px-3 py-2.5 text-base sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:opacity-50";

  const saveButton = (big: boolean) => (
    <button
      onClick={() => handleSave(false)}
      disabled={saving}
      title="Ctrl+S"
      className={`${ACTION_PRIMARY} inline-flex items-center justify-center gap-2 rounded-xl border-2 font-extrabold transition-colors disabled:opacity-60 ${
        big ? "w-full h-12 text-base" : "h-11 px-4 text-base flex-1"
      }`}
    >
      {saving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Save className="h-5 w-5" aria-hidden />}
      {saving ? "Đang lưu…" : saveLabel}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-28 lg:pb-0">
      <Header />

      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900">
                {editMode ? (examMode ? "Sửa đề kiểm tra" : "Sửa bài học") : (examMode ? "Soạn đề kiểm tra mới" : "Soạn bài học mới")}
              </h1>
              {dirty && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Có thay đổi chưa lưu</span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {editMode
                ? "Sửa xong bấm Lưu thay đổi — học sinh thấy bản mới ngay."
                : "Soạn xong bấm Lưu — bài hiện ngay trên trang lớp cho các bé làm."}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/huong-dan/soan-de" target="_blank" className={`${ACTION_MD} ${ACTION_SECONDARY}`}>
              <HelpCircle className="h-4 w-4" aria-hidden /> Hướng dẫn
            </Link>
            {/* Việc của người quản lý trang — gom vào một menu cho khỏi lẫn với công cụ soạn đề. */}
            <details className="relative">
              <summary className={`${ACTION_MD} ${ACTION_SECONDARY} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
                Quản lý <ChevronDown className="h-4 w-4" aria-hidden />
              </summary>
              <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-pop">
                <Link href="/import/gop-y" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  <Inbox className="h-4 w-4" aria-hidden /> Góp ý đã nhận
                </Link>
                <Link href="/import/thong-ke" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  <BarChart3 className="h-4 w-4" aria-hidden /> Thống kê lượt dùng
                </Link>
              </div>
            </details>
            {!fresh && (
              <button onClick={() => openPaste("paste")} className={`${ACTION_MD} ${ACTION_SECONDARY}`}>
                <ClipboardPaste className="h-4 w-4" aria-hidden /> Dán / chụp đề có sẵn
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* ── Left: lesson form + question editor ── */}
        <div className="space-y-5 min-w-0">

          {/* Cách bắt đầu — chỉ khi trang vừa mở */}
          {fresh && (
            <section className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5">
              <h2 className="text-lg font-extrabold text-slate-900">Bạn muốn bắt đầu thế nào?</h2>
              <p className="mt-0.5 text-sm text-slate-600">Đã có đề sẵn thì đưa vào một lần, máy tự tách câu hỏi và đáp án.</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([
                  { icon: ClipboardPaste, title: "Dán đề có sẵn", desc: "Chép từ Word, Zalo, trang web rồi dán vào", onClick: () => openPaste("paste") },
                  { icon: Camera, title: "Chụp ảnh đề giấy", desc: "Chụp đề in, máy đọc chữ giúp", onClick: () => openPaste("scan") },
                  { icon: PencilLine, title: "Soạn từng câu", desc: "Gõ từng câu hỏi và đáp án", onClick: () => setStartDismissed(true) },
                ] as const).map(({ icon: Icon, title, desc, onClick }) => (
                  <button
                    key={title}
                    type="button"
                    onClick={onClick}
                    className="flex items-start gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 text-left shadow-soft transition hover:border-primary-300 hover:shadow-pop"
                  >
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-base font-bold text-slate-900">{title}</span>
                      <span className="block text-sm text-slate-500">{desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Lesson form */}
          <section id="thong-tin-bai" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-soft p-5">
            <h2 className="text-base font-bold text-slate-800 mb-4">Thông tin {noun}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label htmlFor="f-lop" className={label}>Lớp</label>
                <select id="f-lop" value={grade} onChange={(e) => setGrade(Number(e.target.value))} className={field}>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>Lớp {g}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="f-mon" className={label}>Môn học</label>
                <select
                  id="f-mon"
                  value={subject ?? ""}
                  onChange={(e) => setSubjectChoice(e.target.value)}
                  disabled={subjects.length === 0}
                  className={field}
                >
                  {subjects.length === 0 && <option value="">— Chưa có môn —</option>}
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="f-phut" className={label}>Thời gian (phút)</label>
                <input
                  id="f-phut"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={300}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Math.max(1, Math.min(300, Number(e.target.value) || 1)))}
                  className={field}
                />
              </div>

              <div className="col-span-2 sm:col-span-4">
                <label htmlFor="f-ten" className={label}>
                  Tên {noun} <span className="text-coral-600">*</span>
                </label>
                <input
                  id="f-ten"
                  ref={titleRef}
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder={examMode ? "VD: Đề kiểm tra giữa học kì I" : "VD: Phép cộng trong phạm vi 100"}
                  className={field}
                />
              </div>
            </div>

            {/* Ít dùng: chương và số thứ tự. Đang sửa bài thì mở sẵn để thấy bài nằm ở chương nào. */}
            <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" open={editMode || undefined}>
              <summary className="cursor-pointer py-1 text-sm font-semibold text-slate-600">
                Tuỳ chọn thêm: chương, số thứ tự{" "}
                <span className="font-normal text-slate-500">
                  ({chapterTitle ? `chương “${chapterTitle}”` : "chưa xếp chương"} · số {indexLabel || "—"})
                </span>
              </summary>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3 pb-1">
                <div>
                  <label htmlFor="f-chuong" className={label}>
                    Chương {loadingChapters && <Loader2 className="inline h-3.5 w-3.5 animate-spin text-primary-500" aria-hidden />}
                  </label>
                  <select
                    id="f-chuong"
                    value={chapterId ?? ""}
                    onChange={(e) => setChapterId(e.target.value ? Number(e.target.value) : null)}
                    className={field}
                  >
                    {/* Bỏ trống được — máy chủ sẽ gom vào chương mặc định của môn. */}
                    <option value="">— Không xếp chương —</option>
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  {subject && !loadingChapters && !showNewChapter && (
                    <button
                      type="button"
                      onClick={() => { setShowNewChapter(true); setChapterCreateError(null); setNewChapterTitle(""); }}
                      className="mt-1.5 text-sm font-semibold text-primary-700 hover:underline"
                    >
                      + Tạo chương mới
                    </button>
                  )}
                  {showNewChapter && subject && (
                    <div className="mt-2 rounded-xl border border-primary-200 bg-white p-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={newChapterTitle}
                          onChange={(e) => setNewChapterTitle(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleCreateChapter(); if (e.key === "Escape") setShowNewChapter(false); }}
                          placeholder="Tên chương mới, VD: Chương 1: Số tự nhiên"
                          className={`${field} flex-1 min-w-[180px]`}
                        />
                        <button
                          onClick={handleCreateChapter}
                          disabled={!newChapterTitle.trim() || creatingChapter}
                          className={`${ACTION_MD} ${ACTION_PRIMARY}`}
                        >
                          {creatingChapter ? "Đang tạo…" : "Tạo"}
                        </button>
                        <button onClick={() => setShowNewChapter(false)} className={`${ACTION_MD} ${ACTION_SECONDARY}`}>
                          Huỷ
                        </button>
                      </div>
                      {chapterCreateError && <p className="text-sm text-coral-700">{chapterCreateError}</p>}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="f-stt" className={label}>Số thứ tự</label>
                  <input
                    id="f-stt"
                    type="text"
                    value={indexLabel}
                    onChange={(e) => setIndexLabel(e.target.value)}
                    placeholder="01"
                    className={field}
                  />
                </div>
              </div>
            </details>
          </section>

          {/* Question list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-bold text-slate-800">
                Câu hỏi <span className="text-primary-700">({questions.length} câu)</span>
              </h2>
              {questions.length > 1 && (
                <button
                  onClick={allCollapsed ? expandAll : collapseAll}
                  className="text-sm text-slate-600 hover:text-primary-700 font-semibold px-2 py-1.5 rounded-lg hover:bg-slate-100"
                >
                  {allCollapsed ? "Mở rộng tất cả" : "Thu gọn tất cả"}
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
                showProblems={showProblems}
              />
            ))}

            <button
              onClick={addQuestion}
              className="w-full border-2 border-dashed border-slate-300 rounded-2xl py-4 text-base font-semibold text-slate-600 hover:border-primary-400 hover:text-primary-700 hover:bg-primary-50/40 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" aria-hidden /> Thêm câu hỏi
            </button>
          </div>
        </div>

        {/* ── Right: kiểm tra + lưu (máy tính). Điện thoại dùng thanh dưới đáy. ── */}
        <div className="space-y-4 lg:sticky lg:top-20">
          <div id="kiem-tra" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-soft p-5">
            <h3 className="text-base font-bold text-slate-800 mb-1">Kiểm tra trước khi lưu</h3>
            <p className="text-sm text-slate-500 mb-3">
              Lớp {grade} · {subject ?? "—"} · {questions.length} câu · {durationMinutes} phút
            </p>

            {problems.length === 0 ? (
              <p className="flex items-center gap-2 rounded-xl bg-success-50 px-3 py-2 text-sm font-semibold text-success-700">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden /> Đủ cả rồi, lưu được.
              </p>
            ) : (
              <div className="rounded-xl border border-coral-200 bg-coral-50 p-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-coral-800">
                  <AlertCircle className="h-4 w-4" aria-hidden /> Còn {problems.length} chỗ cần sửa
                </p>
                <ul className="space-y-0.5">
                  {problems.slice(0, 8).map((p, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => jumpTo(p)}
                        className="w-full rounded-lg px-1.5 py-1 text-left text-sm text-coral-900 hover:bg-coral-100"
                      >
                        {p.index !== null && <b>Câu {p.index + 1}: </b>}
                        {p.text}
                      </button>
                    </li>
                  ))}
                </ul>
                {problems.length > 8 && <p className="mt-1 px-1.5 text-sm text-coral-800">… và {problems.length - 8} chỗ khác</p>}
              </div>
            )}

            {error && (
              <div className="mt-3 text-sm text-coral-800 bg-coral-50 border border-coral-200 rounded-xl px-3 py-2">{error}</div>
            )}

            {saveResult?.ok && (
              <div className="mt-3 text-sm text-success-800 bg-success-50 border border-success-200 rounded-xl px-3 py-2 space-y-1">
                <p className="font-semibold">✓ {saveResult.msg}</p>
                <a href={`/quiz?lessonId=${saveResult.lessonId}`} className="underline font-semibold block">
                  Mở {noun} như học sinh →
                </a>
                {chapterId && (
                  <Link href={`/import/chapter/${chapterId}`} className="underline font-semibold block">
                    Xem tất cả bài trong chương →
                  </Link>
                )}
              </div>
            )}

            <div className="mt-4 space-y-2">
              <button
                onClick={() => setPreviewOpen(true)}
                disabled={!hasContent}
                className={`${ACTION_SECONDARY} w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl border-2 text-base font-bold disabled:opacity-40`}
              >
                <Eye className="h-5 w-5" aria-hidden /> Xem như học sinh
              </button>
              {saveButton(true)}
              {editMode && (
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  title="Lưu rồi chuyển sang bài kế tiếp trong cùng chương"
                  className={`${ACTION_MD} ${ACTION_SECONDARY} w-full`}
                >
                  Lưu &amp; sang bài tiếp theo
                </button>
              )}
              {editMode && initialData?.canDelete && (
                <DeleteLessonButton
                  lessonId={initialData!.lessonId}
                  title={initialData!.title}
                  questionCount={questions.length}
                  isExam={examMode}
                  redirectTo={initialData!.chapterId ? `/import/chapter/${initialData!.chapterId}` : "/import"}
                  className={`w-full ${ACTION_MD} ${ACTION_DANGER}`}
                />
              )}
            </div>

            {editMode && initialData?.chapterId && (
              <Link href={`/import/chapter/${initialData.chapterId}`} className="mt-3 block text-center text-sm text-primary-700 hover:underline">
                ← Tất cả bài trong chương
              </Link>
            )}
            {!editMode && (
              <p className="mt-2 text-xs text-slate-500 text-center">Bản nháp tự lưu trên máy này — tắt trang vẫn còn.</p>
            )}
          </div>

          {/* Công thức LaTeX — cho người đã quen, mặc định gập lại */}
          <details className="bg-white rounded-2xl border border-slate-200 shadow-soft p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-600">Công thức nâng cao (LaTeX)</summary>
            <p className="mt-2 mb-2 text-xs text-slate-500">Bấm vào ô đang soạn trước, rồi bấm mẫu để chèn.</p>
            <div className="space-y-1 text-xs">
              {([
                ["Phân số", "$\\frac{1}{2}$"],
                ["Căn", "$\\sqrt{x}$"],
                ["Mũ", "$x^{2}$"],
                ["Chỉ số dưới", "$x_{i}$"],
                ["Công thức riêng dòng", "$$E=mc^2$$"],
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
                  title="Bấm để chèn"
                >
                  <span className="text-gray-500 w-24 shrink-0 group-hover:text-blue-600">{name}</span>
                  <code className="bg-gray-100 group-hover:bg-blue-100 px-1.5 py-0.5 rounded text-[11px] flex-1 truncate transition-colors">{src}</code>
                  <span className="text-gray-700 shrink-0">
                    <MathText text={src} />
                  </span>
                </button>
              ))}
            </div>
          </details>

          {/* Tips */}
          <div className="hidden lg:block bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-800 space-y-1">
            <p className="font-semibold">Mẹo</p>
            <p>• Dán cả câu kèm A. B. C. D. vào ô câu hỏi, máy tự tách đáp án.</p>
            <p>• Bấm vào tên câu để thu gọn cho dễ nhìn.</p>
            <p>• Phím tắt: <kbd className="bg-amber-100 px-1 rounded">Ctrl+S</kbd> lưu, <kbd className="bg-amber-100 px-1 rounded">Ctrl+Enter</kbd> thêm câu.</p>
          </div>
        </div>
      </div>

      {/* Thanh lưu ghim dưới đáy — điện thoại, máy tính bảng */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <button
            type="button"
            onClick={() => (problems.length ? jumpTo(problems[0]) : document.getElementById("kiem-tra")?.scrollIntoView({ behavior: "smooth" }))}
            className={`flex h-11 min-w-0 items-center gap-1.5 rounded-xl px-2 text-sm font-semibold ${problems.length ? "text-coral-700" : "text-success-700"}`}
          >
            {problems.length ? <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden /> : <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden />}
            <span className="truncate">{problems.length ? `Còn ${problems.length} chỗ` : "Đủ rồi"}</span>
          </button>
          <button
            onClick={() => setPreviewOpen(true)}
            disabled={!hasContent}
            aria-label="Xem như học sinh"
            className={`${ACTION_SECONDARY} inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border-2 disabled:opacity-40`}
          >
            <Eye className="h-5 w-5" aria-hidden />
          </button>
          {saveButton(false)}
        </div>
      </div>

      <PasteImportModal
        open={pasteOpen}
        onClose={() => setPasteOpen(false)}
        onImport={handlePasteImport}
        focus={pasteFocus}
        hasExisting={hasContent}
      />
      <StudentPreview open={previewOpen} onClose={() => setPreviewOpen(false)} title={lessonTitle} questions={questions} />
    </div>
  );
}
