"use client";
import { useRef } from "react";
import TiptapEditor from "./TiptapEditor";
import MathText from "@/components/MathText";
import { supabase } from "@/lib/supabase/client";

export type QDraft = {
  id: string;
  content: string;
  options: [string, string, string, string];
  correctIdx: number;
  imageUrl?: string;
};

const LABELS = ["A", "B", "C", "D"];

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
  const uploadingRef = useRef(false);

  function patch(partial: Partial<QDraft>) {
    onChange({ ...question, ...partial });
  }

  function setOption(i: number, val: string) {
    const opts = [...question.options] as [string, string, string, string];
    opts[i] = val;
    patch({ options: opts });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || uploadingRef.current) return;
    uploadingRef.current = true;
    const ext = file.name.split(".").pop();
    const path = `questions/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("question-images").upload(path, file);
    uploadingRef.current = false;
    if (error) { alert("Upload ảnh thất bại: " + error.message); return; }
    const { data } = supabase.storage.from("question-images").getPublicUrl(path);
    patch({ imageUrl: data.publicUrl });
  }

  const isFilled = question.content.trim() && question.options.every((o) => o.trim());

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
          {/* Question content */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Nội dung câu hỏi</label>
            <TiptapEditor
              value={question.content}
              onChange={(v) => patch({ content: v })}
              placeholder="Nhập câu hỏi... (hỗ trợ LaTeX: $x^2$, \frac{1}{2})"
            />
          </div>

          {/* Image */}
          <div className="flex items-center gap-3">
            {question.imageUrl ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={question.imageUrl} alt="question" className="h-24 rounded-lg border border-gray-200 object-contain" />
                <button
                  onClick={() => patch({ imageUrl: undefined })}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                >✕</button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 text-xs text-gray-500 border border-dashed border-gray-300 rounded-xl px-3 py-2 hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Thêm ảnh
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          {/* Options */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Đáp án</label>
            <div className="space-y-2">
              {question.options.map((opt, oi) => (
                <div key={oi} className="flex items-start gap-2">
                  {/* Correct answer radio */}
                  <button
                    onClick={() => patch({ correctIdx: oi })}
                    className={`mt-2 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      question.correctIdx === oi
                        ? "border-green-500 bg-green-500 text-white shadow-sm"
                        : "border-gray-300 text-gray-500 hover:border-green-400"
                    }`}
                    title={`Chọn ${LABELS[oi]} là đáp án đúng`}
                  >
                    {LABELS[oi]}
                  </button>

                  {/* Option input + preview */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => setOption(oi, e.target.value)}
                      placeholder={`Đáp án ${LABELS[oi]}...`}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    {opt.trim() && opt.includes("$") && (
                      <div className="mt-1 px-2 py-1 bg-green-50 rounded text-xs">
                        <MathText text={opt} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Nhấn vào ký tự tròn để chọn đáp án đúng (hiện tại:{" "}
              <span className="font-semibold text-green-600">{LABELS[question.correctIdx]}</span>)
            </p>
          </div>
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
