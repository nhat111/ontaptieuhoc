"use client";

import { useState } from "react";

type NewQuestion = {
  id: string;
  content: string;
  options: [string, string, string, string];
  correct_answer: string;
  explanation: string;
};

const LABELS = ["A", "B", "C", "D"];
const OPTION_COLORS = [
  { active: "border-blue-400 bg-blue-50", label: "bg-blue-500", ring: "ring-blue-400" },
  { active: "border-emerald-400 bg-emerald-50", label: "bg-emerald-500", ring: "ring-emerald-400" },
  { active: "border-amber-400 bg-amber-50", label: "bg-amber-500", ring: "ring-amber-400" },
  { active: "border-rose-400 bg-rose-50", label: "bg-rose-500", ring: "ring-rose-400" },
];

// Math symbols toolbar
const MATH_SYMBOLS = [
  { label: "$x$", insert: "$$" },
  { label: "½", insert: "\\frac{}{}" },
  { label: "√", insert: "\\sqrt{}" },
  { label: "x²", insert: "^{2}" },
  { label: "×", insert: "\\times" },
  { label: "÷", insert: "\\div" },
  { label: "≤", insert: "\\leq" },
  { label: "≥", insert: "\\geq" },
  { label: "≠", insert: "\\neq" },
  { label: "π", insert: "\\pi" },
];

type Props = {
  question: NewQuestion;
  index: number;
  total: number;
  onUpdate: (field: keyof NewQuestion, value: string) => void;
  onUpdateOption: (idx: number, value: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

export default function QuestionEditor({
  question, index, total,
  onUpdate, onUpdateOption,
  onDelete, onDuplicate, onMoveUp, onMoveDown,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [showExplanation, setShowExplanation] = useState(!!question.explanation);

  const isComplete = question.content.trim() && question.correct_answer;

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all shadow-sm ${
      isComplete ? "border-gray-100" : "border-amber-200"
    }`}>
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50">
        {/* Number */}
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          isComplete ? "bg-indigo-600 text-white" : "bg-amber-100 text-amber-700"
        }`}>
          {index + 1}
        </div>

        {/* Status */}
        {!isComplete && (
          <span className="text-xs text-amber-600 font-medium">⚠ Chưa hoàn chỉnh</span>
        )}

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <ActionBtn onClick={onMoveUp} disabled={index === 0} title="Lên">↑</ActionBtn>
          <ActionBtn onClick={onMoveDown} disabled={index === total - 1} title="Xuống">↓</ActionBtn>
          <ActionBtn onClick={onDuplicate} title="Nhân bản">⧉</ActionBtn>
          <ActionBtn onClick={onDelete} title="Xóa" danger>✕</ActionBtn>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 text-xs transition-colors ml-1"
          >
            {collapsed ? "▼" : "▲"}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      {!collapsed && (
        <div className="p-4 space-y-4">
          {/* Content */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
              Nội dung câu hỏi *
            </label>
            {/* Math toolbar */}
            <div className="flex flex-wrap gap-1 mb-2">
              {MATH_SYMBOLS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    const val = question.content + s.insert;
                    onUpdate("content", val);
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg text-xs font-mono transition-colors border border-gray-200"
                >
                  {s.label}
                </button>
              ))}
            </div>
            <textarea
              value={question.content}
              onChange={(e) => onUpdate("content", e.target.value)}
              placeholder="VD: 5 + 3 = ? hoặc $\frac{1}{2} + \frac{1}{4} = ?$"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-none transition-all font-mono"
            />
            {/* Preview */}
            {question.content && (
              <div className="mt-1.5 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100">
                <span className="text-xs text-gray-400 mr-1">Preview:</span>
                {question.content}
              </div>
            )}
          </div>

          {/* Options */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
              Các lựa chọn *{" "}
              <span className="normal-case font-normal text-gray-400">(tap để chọn đáp án đúng)</span>
            </label>
            <div className="space-y-2">
              {question.options.map((opt, idx) => {
                const isCorrect = opt !== "" && opt === question.correct_answer;
                const c = OPTION_COLORS[idx];
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all ${
                      isCorrect ? `${c.active} ring-2 ${c.ring}` : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    {/* Label */}
                    <button
                      type="button"
                      onClick={() => opt && onUpdate("correct_answer", opt)}
                      title="Đặt làm đáp án đúng"
                      className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all ${
                        isCorrect
                          ? `${c.label} text-white scale-110 shadow-sm`
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {isCorrect ? "✓" : LABELS[idx]}
                    </button>

                    {/* Input */}
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => onUpdateOption(idx, e.target.value)}
                      placeholder={`Đáp án ${LABELS[idx]}...`}
                      className="flex-1 text-sm text-gray-800 placeholder:text-gray-300 bg-transparent focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>

            {/* Correct answer hint */}
            {question.correct_answer ? (
              <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                ✓ Đáp án đúng: <span className="font-bold">{question.correct_answer}</span>
              </p>
            ) : (
              <p className="text-xs text-amber-500 mt-2">⚠ Tap vào nhãn A/B/C/D để chọn đáp án đúng</p>
            )}
          </div>

          {/* Explanation */}
          <div>
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs font-semibold text-gray-400 hover:text-indigo-500 transition-colors flex items-center gap-1"
            >
              <span>{showExplanation ? "▼" : "▶"}</span>
              💡 Lời giải {showExplanation ? "(ẩn)" : "(thêm — tuỳ chọn)"}
            </button>
            {showExplanation && (
              <textarea
                value={question.explanation}
                onChange={(e) => onUpdate("explanation", e.target.value)}
                placeholder="VD: Vì 5 + 3 = 8 nên đáp án là 8."
                rows={2}
                className="mt-2 w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none transition-all"
              />
            )}
          </div>
        </div>
      )}

      {/* Collapsed preview */}
      {collapsed && question.content && (
        <p className="px-4 py-2.5 text-sm text-gray-500 bg-gray-50 rounded-b-2xl truncate border-t border-gray-50">
          {question.content.slice(0, 80)}{question.content.length > 80 ? "..." : ""}
        </p>
      )}
    </div>
  );
}

function ActionBtn({
  children, onClick, disabled, danger, title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors disabled:opacity-25 disabled:cursor-not-allowed ${
        danger
          ? "text-gray-400 hover:bg-red-50 hover:text-red-500"
          : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}
