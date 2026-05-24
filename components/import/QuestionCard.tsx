"use client";
import { useRef, useState } from "react";
import TiptapEditor from "./TiptapEditor";
import MathText from "@/components/MathText";

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
};

const LABELS = ["A", "B", "C", "D", "E", "F"];

const TYPE_OPTIONS: { value: QType; label: string; hint: string }[] = [
  { value: "mcq", label: "Trắc nghiệm", hint: "1 đáp án đúng · 2–6 lựa chọn" },
  { value: "multi", label: "Nhiều đáp án", hint: "Chọn nhiều đáp án đúng" },
  { value: "short", label: "Tự luận ngắn", hint: "Người làm gõ text (nhiều đáp án cách | )" },
  { value: "numeric", label: "Trả lời số", hint: "Người làm nhập số" },
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
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function patch(partial: Partial<QDraft>) {
    onChange({ ...question, ...partial });
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
    if (correctIdx === i) correctIdx = 0;
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
      correctIdx: 0,
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
        correctIdx: newType === "mcq" ? Math.min(question.correctIdx, opts.length - 1) : 0,
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

  function updateImage(i: number, partial: Partial<QImage>) {
    const next = (question.images ?? []).map((img, idx) => (idx === i ? { ...img, ...partial } : img));
    patch({ images: next });
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

  const isFilled = (() => {
    if (!question.content.trim()) return false;
    switch (question.type) {
      case "mcq":
        return (
          question.options.length >= 2 &&
          question.options.every((o) => o.trim()) &&
          question.correctIdx >= 0 &&
          question.correctIdx < question.options.length
        );
      case "multi":
        return (
          question.options.length >= 2 &&
          question.options.every((o) => o.trim()) &&
          question.correctIdxs.length >= 1
        );
      case "short":
        return !!question.answer.trim();
      case "numeric":
        return question.answer.trim() !== "" && !Number.isNaN(parseFloat(question.answer.replace(",", ".")));
    }
  })();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-50 border-b border-gray-100 px-4 py-2.5 gap-2">
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-800 min-w-0 flex-1 text-left"
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          <svg
            className={`w-3.5 h-3.5 shrink-0 transition-transform ${collapsed ? "-rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="shrink-0">Câu {index + 1}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded shrink-0">
            {TYPE_OPTIONS.find((t) => t.value === question.type)?.label ?? "?"}
          </span>
          {isFilled && <span className="text-green-500 text-xs shrink-0" title="Đã điền đủ">●</span>}
          {collapsed && question.content.trim() && (
            <span className="text-xs font-normal text-gray-500 truncate min-w-0">
              — <MathText text={question.content.slice(0, 80)} />
            </span>
          )}
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <IconBtn
            title="Lên"
            disabled={index === 0}
            onClick={onMoveUp}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            }
          />
          <IconBtn
            title="Xuống"
            disabled={index === total - 1}
            onClick={onMoveDown}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            }
          />
          <IconBtn
            title="Nhân đôi"
            onClick={onDuplicate}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
          />
          <IconBtn
            title="Xóa"
            onClick={onDelete}
            danger
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
          />
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-4">
          {/* Type selector */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Dạng câu hỏi</label>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    question.type === t.value
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                  }`}
                  title={t.hint}
                >
                  {t.label}
                </button>
              ))}
              {(question.type === "mcq" || question.type === "multi") && (
                <button
                  type="button"
                  onClick={setTfPreset}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border bg-white border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-colors"
                  title="Tạo nhanh 2 đáp án Đúng/Sai"
                >
                  + Đúng/Sai
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              {TYPE_OPTIONS.find((t) => t.value === question.type)?.hint}
            </p>
          </div>

          {/* Question content */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Nội dung câu hỏi</label>
            <TiptapEditor
              value={question.content}
              onChange={(v) => patch({ content: v })}
              placeholder="Nhập câu hỏi... (hỗ trợ LaTeX: $x^2$, \frac{1}{2})"
            />
          </div>

          {/* Images */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500">
                Hình ảnh minh hoạ{question.images && question.images.length > 0 ? ` (${question.images.length})` : ""}
              </label>
              <p className="text-[10px] text-gray-400">
                Có thể thêm nhiều ảnh · Chọn vị trí <span className="font-medium">Trước</span> hoặc <span className="font-medium">Sau</span> câu hỏi
              </p>
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

                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Position toggle */}
                      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden text-[11px] font-semibold">
                        <button
                          type="button"
                          onClick={() => updateImage(ii, { position: "before" })}
                          className={`px-2.5 py-1 transition-colors ${
                            img.position === "before"
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-500 hover:text-blue-600"
                          }`}
                          title="Hiển thị trước câu hỏi"
                        >
                          ↑ Trước
                        </button>
                        <button
                          type="button"
                          onClick={() => updateImage(ii, { position: "after" })}
                          className={`px-2.5 py-1 border-l border-gray-200 transition-colors ${
                            img.position === "after"
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-500 hover:text-blue-600"
                          }`}
                          title="Hiển thị sau câu hỏi"
                        >
                          ↓ Sau
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate" title={img.url}>{img.url}</p>
                    </div>

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
              className="flex items-center gap-2 text-xs text-gray-500 border border-dashed border-gray-300 rounded-xl px-3 py-2 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-60 disabled:cursor-wait"
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
                <label className="text-xs font-semibold text-gray-500">
                  Đáp án ({question.options.length}/6)
                </label>
                {question.options.length < 6 && (
                  <button
                    onClick={addOption}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    + Thêm đáp án
                  </button>
                )}
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
                        className={`mt-2 w-7 h-7 ${
                          question.type === "multi" ? "rounded-md" : "rounded-full"
                        } border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                          selected
                            ? "border-green-500 bg-green-500 text-white shadow-sm"
                            : "border-gray-300 text-gray-500 hover:border-green-400"
                        }`}
                        title={`Chọn ${LABELS[oi]} là đáp án đúng`}
                      >
                        {LABELS[oi]}
                      </button>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => setOption(oi, e.target.value)}
                          placeholder={`Đáp án ${LABELS[oi]}...`}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        {opt.trim() && (
                          <div className="mt-1 px-2 py-1 bg-blue-50 rounded text-xs text-gray-700">
                            <span className="text-[10px] font-semibold text-blue-400 mr-1">Preview</span>
                            <MathText text={opt} />
                          </div>
                        )}
                      </div>

                      {question.options.length > 2 && (
                        <button
                          onClick={() => removeOption(oi)}
                          className="mt-2 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 shrink-0 transition-colors"
                          title="Xóa đáp án"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {question.type === "mcq" ? (
                  <>
                    Nhấn ô tròn để chọn đáp án đúng (hiện tại:{" "}
                    <span className="font-semibold text-green-600">{LABELS[question.correctIdx]}</span>)
                  </>
                ) : (
                  <>
                    Tick ô vuông để chọn các đáp án đúng (đã chọn:{" "}
                    <span className="font-semibold text-green-600">
                      {question.correctIdxs.length === 0
                        ? "chưa có"
                        : question.correctIdxs.map((i) => LABELS[i]).join(", ")}
                    </span>
                    )
                  </>
                )}
              </p>
            </div>
          )}

          {question.type === "short" && (
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                Đáp án mẫu
              </label>
              <input
                type="text"
                value={question.answer}
                onChange={(e) => patch({ answer: e.target.value })}
                placeholder="VD: Hà Nội | Ha Noi | hà nội"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Phân tách nhiều đáp án chấp nhận bằng dấu <code className="bg-gray-100 px-1 rounded">|</code>. So sánh không phân biệt hoa-thường và khoảng trắng đầu/cuối.
              </p>
              {question.answer.trim() && (
                <div className="mt-2 px-2 py-1 bg-blue-50 rounded text-xs text-gray-700">
                  <span className="text-[10px] font-semibold text-blue-400 mr-1">Preview</span>
                  <MathText text={question.answer} />
                </div>
              )}
            </div>
          )}

          {question.type === "numeric" && (
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                Đáp án (số)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={question.answer}
                onChange={(e) => patch({ answer: e.target.value })}
                placeholder="VD: 42, 3.14, -7.5"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Người làm bài sẽ nhập số (chấp nhận cả dấu phẩy và dấu chấm).
              </p>
            </div>
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
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        danger
          ? "text-red-400 hover:bg-red-50 hover:text-red-600"
          : "text-gray-400 hover:bg-gray-200 hover:text-gray-700"
      }`}
    >
      {icon}
    </button>
  );
}
