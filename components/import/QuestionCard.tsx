"use client";
import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Copy, Trash2 } from "lucide-react";
import TiptapEditor, { hasMath } from "./TiptapEditor";
import MathText from "@/components/MathText";
import { splitOptions } from "@/lib/optionSplitter";
import { NO_ANSWER, draftProblems, isBlankDraft } from "@/lib/importDraft";

export type QType = "mcq" | "multi" | "short" | "numeric";

export type QImage = {
  url: string;
  position: "before" | "after";
};

export type QDraft = {
  id: string;
  type: QType;
  content: string;
  options: string[]; // variable length 2-6 (mcq/multi)
  correctIdx: number; // mcq
  correctIdxs: number[]; // multi
  answer: string; // short/numeric: pipe-delimited accepted answers for short, raw for numeric
  images: QImage[]; // multiple images per question, each positioned before/after question content
  /** @deprecated legacy single-image field; new code uses `images` */
  imageUrl?: string;
  solution?: string; // optional worked solution ("lời giải"), shown on the result page
};

const LABELS = ["A", "B", "C", "D", "E", "F"];

// Tên loại câu dùng chung với nhãn trên trang làm bài (components/quiz/QuestionCard)
// và trang /huong-dan/soan-de — đổi ở đây thì đổi cả hai nơi đó.
export const TYPE_OPTIONS: { value: QType; label: string; hint: string; example: string }[] = [
  { value: "mcq", label: "Trắc nghiệm", hint: "Chọn 1 đáp án đúng", example: "2 + 3 = ?   A. 4   B. 5" },
  { value: "multi", label: "Chọn nhiều đáp án", hint: "Có thể có nhiều đáp án đúng", example: "Số nào là số chẵn?  A. 2  B. 3  C. 4" },
  { value: "short", label: "Điền chữ", hint: "Bé gõ câu trả lời bằng chữ", example: "Thủ đô nước ta là …" },
  { value: "numeric", label: "Điền số", hint: "Bé gõ một con số", example: "25 + 17 = …" },
];

interface Props {
  question: QDraft;
  index: number;
  total: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onChange: (q: QDraft) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  /** Đã bấm Lưu mà còn thiếu: hiện danh sách lỗi ngay trong thẻ. */
  showProblems?: boolean;
}

export default function QuestionCard({
  question,
  index,
  total,
  collapsed,
  onToggleCollapse,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  showProblems,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function patch(partial: Partial<QDraft>) {
    onChange({ ...question, ...partial });
  }

  // ── Dán cả cụm "câu hỏi + A/B/C/D" vào ô nội dung ────────────────────────
  //
  // Chép đề từ Word hay web thì câu hỏi và đáp án dính liền một khối. Tự tách
  // giúp bỏ hẳn việc cắt dán từng đáp án — việc lặp đi lặp lại và dễ sót.
  //
  // Tách xong thì BÁO RA và cho hoàn tác: tự ý sửa nội dung người dùng vừa dán
  // mà im lặng là kiểu "thông minh" khó chịu nhất, nhất là khi đoán sai.
  const [splitNote, setSplitNote] = useState<{ text: string; before: QDraft; raw: string } | null>(null);

  function handlePasteIntoContent(text: string): boolean {
    // Chỉ tách cho loại có lựa chọn, và chỉ khi các ô đáp án còn trống — người
    // dùng đã gõ đáp án rồi thì đừng ghi đè.
    if (question.type !== "mcq" && question.type !== "multi") return false;
    if (question.options.some((o) => o.trim())) return false;
    // Ô nội dung đã có chữ thì đừng tách: phần tách sẽ thay TOÀN BỘ nội dung,
    // tức là xoá mất những gì người dùng đã gõ trước đó.
    if (question.content.trim()) return false;

    const parsed = splitOptions(text);
    if (!parsed) return false;

    const before = question;
    const next: Partial<QDraft> = {
      content: parsed.stem,
      options: parsed.options,
    };
    if (question.type === "mcq" && parsed.correctIdx !== null) {
      next.correctIdx = parsed.correctIdx;
    }
    onChange({ ...question, ...next });

    const found = LABELS[parsed.correctIdx ?? -1];
    setSplitNote({
      before,
      raw: text,
      text:
        `Đã tách ${parsed.options.length} đáp án ra khỏi nội dung` +
        (question.type === "mcq" && found ? ` · chọn sẵn đáp án ${found}` : ""),
    });
    return true; // đã xử lý, đừng chèn text thô vào ô nội dung nữa
  }

  function undoSplit() {
    if (!splitNote) return;
    // Trả lại NGUYÊN VĂN đoạn vừa dán, không quay về trạng thái trước khi dán:
    // người dùng bấm hoàn tác là muốn "đừng tách", chứ không phải "xoá luôn cái
    // tôi vừa dán" — bắt họ dán lại là mất công vô lý.
    onChange({ ...splitNote.before, content: splitNote.raw });
    setSplitNote(null);
  }

  function setOption(i: number, val: string) {
    const opts = [...question.options];
    opts[i] = val;
    patch({ options: opts });
  }

  function addOption() {
    if (question.options.length >= 6) return;
    patch({ options: [...question.options, ""] });
  }

  function removeOption(i: number) {
    if (question.options.length <= 2) return;
    const opts = question.options.filter((_, idx) => idx !== i);
    let correctIdx = question.correctIdx;
    if (correctIdx === i) correctIdx = NO_ANSWER;
    else if (correctIdx > i) correctIdx -= 1;
    const correctIdxs = question.correctIdxs
      .filter((idx) => idx !== i)
      .map((idx) => (idx > i ? idx - 1 : idx));
    patch({ options: opts, correctIdx, correctIdxs });
  }

  function toggleMulti(i: number) {
    const set = new Set(question.correctIdxs);
    if (set.has(i)) set.delete(i);
    else set.add(i);
    patch({ correctIdxs: [...set].sort((a, b) => a - b) });
  }

  function setTfPreset() {
    patch({
      type: "mcq",
      options: ["Đúng", "Sai"],
      correctIdx: NO_ANSWER,
      correctIdxs: [],
    });
  }

  function setType(newType: QType) {
    if (newType === question.type) return;
    if (newType === "short" || newType === "numeric") {
      patch({ type: newType, options: [], correctIdxs: [] });
    } else {
      const opts = question.options.length >= 2 ? question.options : ["", "", "", ""];
      patch({
        type: newType,
        options: opts,
        correctIdx: newType === "mcq" && question.correctIdx < opts.length ? question.correctIdx : NO_ANSWER,
        correctIdxs: newType === "multi" ? question.correctIdxs : [],
      });
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || uploading) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert("Upload ảnh thất bại: " + (data?.error ?? `lỗi ${res.status}`));
        return;
      }
      // Default new images to "after" — same place as legacy single-image was rendered.
      const next: QImage[] = [...(question.images ?? []), { url: data.url, position: "after" }];
      patch({ images: next, imageUrl: undefined });
    } catch {
      alert("Upload ảnh thất bại: không thể kết nối máy chủ.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(i: number) {
    const next = (question.images ?? []).filter((_, idx) => idx !== i);
    patch({ images: next });
  }

  function moveImage(i: number, dir: -1 | 1) {
    const arr = [...(question.images ?? [])];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    patch({ images: arr });
  }

  const problems = draftProblems(question);

  function confirmDelete() {
    // Câu đã gõ nội dung thì hỏi lại: nút thùng rác nằm sát nút nhân đôi, bấm nhầm
    // là mất cả câu (bài mới chỉ có nháp trên máy, không có thùng rác).
    if (!isBlankDraft(question) && !window.confirm(`Xoá câu ${index + 1}?`)) return;
    onDelete();
  }

  return (
    <div id={`cau-${index + 1}`} className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-50 border-b border-slate-200 px-3 py-2 gap-2">
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-2 text-base font-bold text-slate-700 hover:text-slate-900 min-w-0 flex-1 text-left py-1"
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${collapsed ? "-rotate-90" : ""}`} aria-hidden />
          <span className="shrink-0">Câu {index + 1}</span>
          <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full shrink-0">
            {TYPE_OPTIONS.find((t) => t.value === question.type)?.label ?? "?"}
          </span>
          {problems.length === 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-success-700 shrink-0">
              <CheckCircle2 className="h-4 w-4" aria-hidden /> Xong
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-coral-700 shrink-0" title={problems.join(" · ")}>
              <AlertCircle className="h-4 w-4" aria-hidden /> Chưa xong
            </span>
          )}
          {collapsed && question.content.trim() && (
            <span className="text-sm font-normal text-slate-500 truncate min-w-0 hidden sm:inline">
              — <MathText text={question.content.slice(0, 80)} />
            </span>
          )}
        </button>
        <div className="flex items-center gap-0.5 shrink-0">
          <IconBtn title="Chuyển câu lên trên" disabled={index === 0} onClick={onMoveUp} icon={<ChevronUp className="h-4 w-4" />} />
          <IconBtn title="Chuyển câu xuống dưới" disabled={index === total - 1} onClick={onMoveDown} icon={<ChevronDown className="h-4 w-4" />} />
          <IconBtn title="Nhân đôi câu này" onClick={onDuplicate} icon={<Copy className="h-4 w-4" />} />
          <IconBtn title="Xoá câu này" onClick={confirmDelete} danger icon={<Trash2 className="h-4 w-4" />} />
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-4">
          {/* Type selector — mỗi loại kèm một ví dụ, vì tên loại thôi thì khó phân biệt */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Loại câu hỏi</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {TYPE_OPTIONS.map((t) => {
                const on = question.type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    aria-pressed={on}
                    className={`rounded-xl border-2 px-3 py-2 text-left transition-colors ${
                      on ? "border-primary-500 bg-primary-50" : "border-slate-200 bg-white hover:border-primary-200"
                    }`}
                  >
                    <span className={`block text-sm font-bold ${on ? "text-primary-700" : "text-slate-700"}`}>{t.label}</span>
                    <span className="block text-xs text-slate-500">{t.hint}</span>
                    <span className="mt-0.5 block truncate text-xs italic text-slate-400">VD: {t.example}</span>
                  </button>
                );
              })}
            </div>
            {(question.type === "mcq" || question.type === "multi") && (
              <button
                type="button"
                onClick={setTfPreset}
                className="mt-2 text-sm font-semibold text-primary-700 hover:underline"
              >
                Biến thành câu Đúng / Sai
              </button>
            )}
          </div>

          {/* Question content */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Nội dung câu hỏi</label>
            <TiptapEditor
              value={question.content}
              onChange={(v) => patch({ content: v })}
              onPasteText={handlePasteIntoContent}
              placeholder="Gõ hoặc dán câu hỏi… (dán cả câu kèm A. B. C. D. thì máy tự tách đáp án)"
            />
            {splitNote && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-xs text-green-800">
                <span>{splitNote.text}</span>
                <button
                  type="button"
                  onClick={undoSplit}
                  className="font-semibold text-green-700 underline"
                >
                  Hoàn tác
                </button>
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Hình minh hoạ <span className="font-normal text-slate-400">(không bắt buộc)</span>
              </label>
            </div>

            {question.images && question.images.length > 0 && (
              <div className="space-y-2 mb-2">
                {question.images.map((img, ii) => (
                  <div
                    key={ii}
                    className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`Hình ${ii + 1}`}
                      className="h-20 w-20 rounded-lg border border-gray-200 object-contain bg-white flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0 text-sm text-slate-500">Hình {ii + 1}</div>

                    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => moveImage(ii, -1)}
                        disabled={ii === 0}
                        title="Đổi thứ tự lên"
                        className="w-6 h-6 rounded text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(ii, 1)}
                        disabled={ii === (question.images?.length ?? 0) - 1}
                        title="Đổi thứ tự xuống"
                        className="w-6 h-6 rounded text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeImage(ii)}
                      title="Xoá ảnh"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 border-2 border-dashed border-slate-300 rounded-xl px-3 py-2 hover:border-primary-400 hover:text-primary-700 transition-colors disabled:opacity-60 disabled:cursor-wait"
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Đang tải lên…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {question.images && question.images.length > 0 ? "Thêm ảnh khác" : "Thêm ảnh"}
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          {/* Body per type */}
          {(question.type === "mcq" || question.type === "multi") && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700">
                  Các đáp án{" "}
                  <span className="font-normal text-slate-500">
                    — bấm vào {question.type === "mcq" ? "chữ cái của đáp án đúng" : "chữ cái của mọi đáp án đúng"}
                  </span>
                </label>
              </div>
              <div className="space-y-2">
                {question.options.map((opt, oi) => {
                  const selected =
                    question.type === "mcq"
                      ? question.correctIdx === oi
                      : question.correctIdxs.includes(oi);
                  return (
                    <div key={oi} className="flex items-start gap-2">
                      <button
                        onClick={() =>
                          question.type === "mcq" ? patch({ correctIdx: oi }) : toggleMulti(oi)
                        }
                        className={`mt-0.5 w-10 h-10 ${
                          question.type === "multi" ? "rounded-md" : "rounded-full"
                        } border-2 flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                          selected
                            ? "border-green-500 bg-green-500 text-white shadow-sm"
                            : "border-gray-300 text-gray-500 hover:border-green-400"
                        }`}
                        title={`Chọn ${LABELS[oi]} là đáp án đúng`}
                        aria-pressed={selected}
                      >
                        {LABELS[oi]}
                      </button>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => setOption(oi, e.target.value)}
                          placeholder={`Đáp án ${LABELS[oi]}...`}
                          className={`w-full border rounded-lg px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                            selected ? "border-success-300 bg-success-50/40" : "border-gray-200"
                          }`}
                        />
                        {hasMath(opt) && (
                          <div className="mt-1 px-2 py-1 bg-blue-50 rounded text-sm text-gray-700">
                            <span className="text-xs font-semibold text-blue-500 mr-1">Học sinh sẽ thấy</span>
                            <MathText text={opt} />
                          </div>
                        )}
                      </div>

                      {question.options.length > 2 && (
                        <button
                          onClick={() => removeOption(oi)}
                          className="mt-0.5 w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-coral-600 hover:bg-coral-50 shrink-0 transition-colors"
                          title={`Xoá đáp án ${LABELS[oi]}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm">
                  {question.type === "mcq" ? (
                    question.correctIdx >= 0 && question.correctIdx < question.options.length ? (
                      <span className="font-semibold text-success-700">Đáp án đúng: {LABELS[question.correctIdx]}</span>
                    ) : (
                      <span className="font-semibold text-coral-700">Chưa chọn đáp án đúng</span>
                    )
                  ) : question.correctIdxs.length === 0 ? (
                    <span className="font-semibold text-coral-700">Chưa chọn đáp án đúng nào</span>
                  ) : (
                    <span className="font-semibold text-success-700">
                      Đáp án đúng: {question.correctIdxs.map((i) => LABELS[i]).join(", ")}
                    </span>
                  )}
                </p>
                {question.options.length < 6 && (
                  <button onClick={addOption} className="text-sm font-semibold text-primary-700 hover:underline">
                    + Thêm đáp án
                  </button>
                )}
              </div>
            </div>
          )}

          {question.type === "short" && (
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Đáp án đúng
              </label>
              <input
                type="text"
                value={question.answer}
                onChange={(e) => patch({ answer: e.target.value })}
                placeholder="VD: Hà Nội"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <p className="text-sm text-slate-500 mt-1">
                Không phân biệt chữ hoa, chữ thường. Có nhiều cách viết đúng thì ngăn bằng dấu{" "}
                <code className="bg-slate-100 px-1 rounded">|</code>, vd <code className="bg-slate-100 px-1 rounded">Hà Nội | Ha Noi</code>.
              </p>
            </div>
          )}

          {question.type === "numeric" && (
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Đáp án đúng (một số)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={question.answer}
                onChange={(e) => patch({ answer: e.target.value })}
                placeholder="VD: 42 hoặc 3,5"
                className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono"
              />
              <p className="text-sm text-slate-500 mt-1">
                Bé gõ 3,5 hay 3.5 đều được chấm đúng. Số nghìn viết liền: <code className="bg-slate-100 px-1 rounded">1250</code>.
              </p>
            </div>
          )}

          {/* Optional worked solution — shown to the learner on the result page */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Lời giải <span className="font-normal text-slate-400">(không bắt buộc — bé xem sau khi nộp bài)</span>
            </label>
            <textarea
              value={question.solution ?? ""}
              onChange={(e) => patch({ solution: e.target.value })}
              placeholder="Giải thích cách làm…"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y"
            />
            {question.solution && hasMath(question.solution) && (
              <div className="mt-2 px-2 py-1 bg-amber-50 rounded text-sm text-gray-700 whitespace-pre-wrap">
                <span className="text-xs font-semibold text-amber-600 mr-1">Học sinh sẽ thấy</span>
                <MathText text={question.solution} />
              </div>
            )}
          </div>

          {showProblems && problems.length > 0 && (
            <ul className="rounded-xl border border-coral-200 bg-coral-50 px-3 py-2 text-sm text-coral-800 space-y-0.5">
              {problems.map((p) => (
                <li key={p} className="flex items-start gap-1.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden /> {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function IconBtn({
  icon,
  title,
  onClick,
  disabled,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        danger
          ? "text-red-400 hover:bg-red-50 hover:text-red-600"
          : "text-gray-400 hover:bg-gray-200 hover:text-gray-700"
      }`}
    >
      {icon}
    </button>
  );
}
