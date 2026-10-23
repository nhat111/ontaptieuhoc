"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Eye, X } from "lucide-react";
import QuestionCard from "@/components/quiz/QuestionCard";
import { draftProblems, draftToQuestion } from "@/lib/importDraft";
import type { QDraft } from "./QuestionCard";

/**
 * "Xem như học sinh": hiện đề đang soạn bằng đúng thẻ câu hỏi của trang làm bài,
 * cho bấm thử và bấm "Kiểm tra" từng câu — cô giáo thấy ngay câu nào chấm sai
 * trước khi lưu, thay vì lưu rồi mới mở bài ra thử.
 *
 * Không ghi gì cả: đóng lại là mất các lựa chọn bấm thử.
 */
export default function StudentPreview({
  open,
  onClose,
  title,
  questions,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  questions: QDraft[];
}) {
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    // Khoá cuộn trang phía sau để trên điện thoại không cuộn nhầm trang soạn.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-50" role="dialog" aria-modal="true" aria-label="Xem như học sinh">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <Eye className="h-5 w-5 flex-shrink-0 text-primary-600" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-extrabold text-slate-900">{title.trim() || "Bài chưa đặt tên"}</p>
          <p className="text-xs text-slate-500">Bản xem thử — bấm chọn đáp án rồi bấm Kiểm tra. Chưa lưu gì cả.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:border-primary-200 hover:text-primary-700"
        >
          <X className="h-4 w-4" aria-hidden />
          Đóng
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-5">
          {questions.map((q, i) => {
            const problems = draftProblems(q);
            return (
              <div key={q.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
                {problems.length > 0 && (
                  <p className="flex items-start gap-2 border-b border-coral-100 bg-coral-50 px-4 py-2 text-sm text-coral-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
                    Câu này chưa xong: {problems.join(" · ")}
                  </p>
                )}
                <QuestionCard
                  question={draftToQuestion(q, i)}
                  index={i}
                  speak={false}
                  selectedAnswer={answers[q.id] ?? null}
                  onSelect={(a) => setAnswers((s) => ({ ...s, [q.id]: a === "" || a === "[]" ? null : a }))}
                  checked={!!checked[q.id]}
                  onCheck={() => setChecked((s) => ({ ...s, [q.id]: true }))}
                />
                {checked[q.id] && (
                  <div className="px-4 pb-4 sm:px-6">
                    <button
                      type="button"
                      onClick={() => {
                        setChecked((s) => ({ ...s, [q.id]: false }));
                        setAnswers((s) => ({ ...s, [q.id]: null }));
                      }}
                      className="text-sm font-semibold text-primary-700 underline"
                    >
                      Thử lại câu này
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
