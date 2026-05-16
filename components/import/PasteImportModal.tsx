"use client";
import { useState } from "react";
import { parseExamText } from "@/lib/examParser";
import { normalizeMath } from "@/lib/mathNormalizer";
import { nanoid } from "@/lib/nanoid";
import MathText from "@/components/MathText";
import type { QDraft } from "./QuestionCard";

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (questions: QDraft[], mode: "replace" | "append") => void;
}

const SAMPLE = `Câu 1. 2 + 3 = ?
A. 4
B. 5
C. 6
D. 7
Đáp án: B

Câu 2. Tính $\\frac{1}{2} + \\frac{1}{4}$
A. $\\frac{1}{6}$   B. $\\frac{3}{4}$
C. $\\frac{1}{3}$   D. $\\frac{2}{6}$`;

export default function PasteImportModal({ open, onClose, onImport }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<QDraft[] | null>(null);

  if (!open) return null;

  function handleParse() {
    setError(null);
    setPreview(null);
    const normalized = normalizeMath(text);
    const parsed = parseExamText(normalized);
    if (!parsed.length) {
      setError("Không tìm thấy câu hỏi nào. Kiểm tra lại định dạng (Câu 1. / A. / B. ...)");
      return;
    }
    const drafts: QDraft[] = parsed.map((q) => {
      const opts = [...q.options];
      while (opts.length < 4) opts.push("");
      const four = opts.slice(0, 4) as [string, string, string, string];
      const correctIdx = q.correctAnswer ? Math.max(0, q.options.indexOf(q.correctAnswer)) : 0;
      return { id: nanoid(), content: q.question, options: four, correctIdx };
    });
    setPreview(drafts);
  }

  function handleImport(mode: "replace" | "append") {
    if (!preview) return;
    onImport(preview, mode);
    setText("");
    setPreview(null);
    setError(null);
    onClose();
  }

  function handleClose() {
    setText("");
    setPreview(null);
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-800">Dán đề thi từ văn bản</h2>
            <p className="text-xs text-gray-400 mt-0.5">Hỗ trợ Word/PDF — tự động tách câu hỏi và đáp án</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Nội dung đề</label>
              <button
                onClick={() => setText(SAMPLE)}
                className="text-xs text-blue-500 hover:text-blue-700 font-medium"
              >
                Chèn ví dụ ↓
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Câu 1. Câu hỏi đầu tiên?\nA. Đáp án A\nB. Đáp án B\nC. Đáp án C\nD. Đáp án D\nĐáp án: B\n\nCâu 2. ..."}
              className="w-full min-h-[220px] border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y"
            />
            {error && <p className="mt-2 text-xs text-red-500">✗ {error}</p>}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 space-y-1">
            <p className="font-semibold">Quy tắc định dạng</p>
            <p>• Mỗi câu bắt đầu bằng <code className="bg-amber-100 px-1 rounded">Câu 1.</code> hoặc <code className="bg-amber-100 px-1 rounded">Câu 1:</code></p>
            <p>• Đáp án: <code className="bg-amber-100 px-1 rounded">A. text</code> mỗi dòng — hoặc 2 đáp án/dòng (cách 2+ space)</p>
            <p>• Dòng <code className="bg-amber-100 px-1 rounded">Đáp án: B</code> để chỉ đáp án đúng (tùy chọn)</p>
            <p>• LaTeX: <code className="bg-amber-100 px-1 rounded">$\\frac{"{1}{2}"}$</code>, <code className="bg-amber-100 px-1 rounded">$x^2$</code></p>
          </div>

          {preview && (
            <div className="border border-green-200 bg-green-50/40 rounded-xl p-4">
              <p className="text-sm font-bold text-green-700 mb-3">
                ✓ Đã nhận diện {preview.length} câu hỏi
              </p>
              <div className="space-y-3 max-h-72 overflow-auto text-xs">
                {preview.map((q, qi) => (
                  <div key={q.id} className="bg-white rounded-lg p-2.5 border border-gray-100">
                    <p className="font-semibold text-gray-800 mb-1">
                      <span className="text-gray-400 mr-1 font-normal">Câu {qi + 1}.</span>
                      <MathText text={q.content} />
                    </p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pl-3">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className={oi === q.correctIdx ? "text-green-700 font-semibold" : "text-gray-600"}>
                          <span className="font-bold mr-1">{"ABCD"[oi]}.</span>
                          {opt ? <MathText text={opt} /> : <span className="text-gray-300 italic">(trống)</span>}
                          {oi === q.correctIdx && <span className="ml-1">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2 bg-gray-50">
          <button
            onClick={handleClose}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
          >
            Hủy
          </button>
          <div className="flex items-center gap-2">
            {!preview ? (
              <button
                onClick={handleParse}
                disabled={!text.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
              >
                Phân tích đề
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setPreview(null); }}
                  className="text-sm text-gray-600 hover:text-gray-800 border border-gray-200 bg-white px-3 py-2 rounded-xl"
                >
                  Sửa lại
                </button>
                <button
                  onClick={() => handleImport("append")}
                  className="bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  Thêm vào danh sách
                </button>
                <button
                  onClick={() => handleImport("replace")}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  Thay thế toàn bộ
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
