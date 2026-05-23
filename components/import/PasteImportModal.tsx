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

const SAMPLE_TEXT = `Câu 1. 2 + 3 = ?
A. 4
B. 5
C. 6
D. 7
Đáp án: B

Câu 2. Chọn các số chẵn trong các số sau
A. 1
B. 2
C. 3
D. 4
Đáp án: B, D

Câu 3. Thủ đô của Việt Nam là gì?
Đáp án: Hà Nội

Câu 4. Tính $\\frac{1}{2} + \\frac{1}{4}$
Đáp án: 0.75`;

const SAMPLE_HTML = `<p><strong>Câu 1.</strong> 2 + 3 = ?</p>
<p>A. 4</p>
<p>B. 5</p>
<p>C. 6</p>
<p>D. 7</p>
<p>Đáp án: B</p>
<br/>
<p><strong>Câu 2.</strong> 4 × 5 = ?</p>
<p>A. 18&nbsp;&nbsp;B. 20</p>
<p>C. 22&nbsp;&nbsp;D. 25</p>
<p>Đáp án: B</p>`;

// Extract LaTeX from MathJax blocks (preview span + rendered span + source script → $LaTeX$)
function preprocessHtmlMath(html: string): string {
  return html.replace(
    /<span[^>]*class="MathJax_Preview"[^>]*>[\s\S]*?<\/script>/gi,
    (match) => {
      const m = match.match(/<script[^>]+type="math\/tex[^"]*"[^>]*>([\s\S]*?)<\/script>\s*$/i);
      return m ? ` $${m[1].trim()}$ ` : '';
    }
  );
}

// Extract Câu N → answer letter from the "Lời giải chi tiết" section
function extractHtmlAnswers(html: string): Map<number, string> {
  const answers = new Map<number, string>();
  const stripped = stripHtmlRaw(html);
  const solutionIdx = stripped.search(/lời giải chi tiết/i);
  if (solutionIdx < 0) return answers;

  let currentQ = -1;
  for (const line of stripped.slice(solutionIdx).split('\n')) {
    const t = line.trim();
    const qMatch = t.match(/^câu\s*(\d+)[.:]/i);
    if (qMatch) { currentQ = parseInt(qMatch[1]); continue; }
    const chosenMatch = t.match(/\bchọn\s+([A-D])[.)]/i);
    if (chosenMatch && currentQ > 0) {
      if (!answers.has(currentQ)) answers.set(currentQ, chosenMatch[1].toUpperCase());
    }
  }
  return answers;
}

// Shared strip logic (used internally)
function stripHtmlRaw(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li|tr|h[1-6]|blockquote|pre)>/gi, "\n")
    .replace(/<td[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#160;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/[ \t]+/g, " ").replace(/\n[ \t]+/g, "\n").replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripHtml(html: string): string {
  return stripHtmlRaw(html);
}

export default function PasteImportModal({ open, onClose, onImport }: Props) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"text" | "html">("text");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<QDraft[] | null>(null);
  const [url, setUrl] = useState("");
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  if (!open) return null;

  async function handleFetchUrl() {
    setUrlError(null);
    setError(null);
    setPreview(null);
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      setUrlError("URL phải bắt đầu bằng http:// hoặc https://");
      return;
    }
    setFetchingUrl(true);
    try {
      const res = await fetch(`/api/fetch-exam?url=${encodeURIComponent(trimmed)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUrlError(data?.error ?? `Tải thất bại (HTTP ${res.status})`);
        return;
      }
      const fetched = data.text ?? "";
      setText(fetched);
      setMode("text");
      // Auto-parse so the user sees the preview immediately. Passing the
      // freshly-fetched text avoids the setState async gotcha.
      handleParse(fetched, "text");
    } catch {
      setUrlError("Không thể kết nối máy chủ.");
    } finally {
      setFetchingUrl(false);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    if (mode === "html") return; // HTML mode — keep raw HTML as-is
    const html = e.clipboardData.getData("text/html");
    if (!html) return; // plain text paste — let browser handle normally
    e.preventDefault();
    const plain = stripHtml(html);
    setText((prev) => {
      const el = e.currentTarget;
      const start = el.selectionStart ?? prev.length;
      const end = el.selectionEnd ?? prev.length;
      return prev.slice(0, start) + plain + prev.slice(end);
    });
  }

  function handleParse(overrideText?: string, overrideMode?: "text" | "html") {
    setError(null);
    setPreview(null);

    const sourceText = overrideText ?? text;
    const sourceMode = overrideMode ?? mode;
    let source: string;
    let answerMap: Map<number, string> = new Map();

    if (sourceMode === "html") {
      answerMap = extractHtmlAnswers(sourceText);
      const preprocessed = preprocessHtmlMath(sourceText);
      source = stripHtml(preprocessed);
    } else {
      source = sourceText;
    }

    const normalized = normalizeMath(source);
    const parsed = parseExamText(normalized);
    if (!parsed.length) {
      setError("Không tìm thấy câu hỏi nào. Kiểm tra lại định dạng (Câu 1. / A. / B. ...)");
      return;
    }
    const drafts: QDraft[] = parsed.map((q, i) => {
      const base = { id: nanoid(), content: q.question, imageUrl: undefined as string | undefined };

      if (q.type === "mcq") {
        const opts = [...q.options];
        while (opts.length < 2) opts.push("");
        let correctIdx = 0;
        if (q.correctAnswer) {
          const idx = opts.indexOf(q.correctAnswer);
          if (idx >= 0) correctIdx = idx;
        } else if (answerMap.has(i + 1)) {
          // Lời giải chi tiết → "Chọn X."
          const letter = answerMap.get(i + 1)!;
          const idx = "ABCDEF".indexOf(letter);
          if (idx >= 0 && idx < opts.length) correctIdx = idx;
        }
        return { ...base, type: "mcq", options: opts, correctIdx, correctIdxs: [], answer: "" };
      }

      if (q.type === "multi") {
        const opts = [...q.options];
        let correctIdxs: number[] = [];
        if (q.correctAnswer) {
          try {
            const picks = JSON.parse(q.correctAnswer) as string[];
            correctIdxs = picks
              .map((p) => opts.indexOf(p))
              .filter((idx) => idx >= 0)
              .sort((a, b) => a - b);
          } catch {}
        }
        return { ...base, type: "multi", options: opts, correctIdx: 0, correctIdxs, answer: "" };
      }

      // short / numeric
      return {
        ...base,
        type: q.type,
        options: [],
        correctIdx: 0,
        correctIdxs: [],
        answer: q.correctAnswer ?? "",
      };
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
    setMode("text");
    setUrl("");
    setUrlError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-800">Dán đề thi từ văn bản</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {mode === "html"
                ? "Dán mã HTML thô — tự động trích xuất văn bản khi phân tích"
                : "Dán từ Word, Google Docs, trang web — tự động bỏ định dạng HTML"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Mode toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => { setMode("text"); setText(""); setPreview(null); setError(null); }}
                className={`px-3 py-1 rounded-md transition-colors ${mode === "text" ? "bg-white shadow text-gray-700" : "text-gray-400 hover:text-gray-600"}`}
              >
                Văn bản
              </button>
              <button
                onClick={() => { setMode("html"); setText(""); setPreview(null); setError(null); }}
                className={`px-3 py-1 rounded-md transition-colors ${mode === "html" ? "bg-white shadow text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                HTML
              </button>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors">×</button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5 space-y-4">
          {/* Fetch from URL */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Tải nội dung từ URL <span className="font-normal text-gray-400">(vd: loigiaihay.com, vietjack.com)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !fetchingUrl) { e.preventDefault(); handleFetchUrl(); } }}
                placeholder="https://loigiaihay.com/..."
                className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={handleFetchUrl}
                disabled={fetchingUrl || !url.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                {fetchingUrl ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Đang tải…
                  </>
                ) : "Tải về"}
              </button>
            </div>
            {urlError && <p className="mt-2 text-xs text-red-500">✗ {urlError}</p>}
            <p className="mt-1.5 text-[11px] text-gray-400">
              Tải xong sẽ tự fill vào ô bên dưới ở chế độ "Văn bản". Có thể sửa trước khi bấm "Phân tích đề".
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Nội dung đề</label>
              <button
                onClick={() => setText(mode === "html" ? SAMPLE_HTML : SAMPLE_TEXT)}
                className="text-xs text-blue-500 hover:text-blue-700 font-medium"
              >
                Chèn ví dụ ↓
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onPaste={handlePaste}
              placeholder={
                mode === "html"
                  ? "<p>Câu 1. Câu hỏi đầu tiên?</p>\n<p>A. Đáp án A</p>\n<p>B. Đáp án B</p>\n..."
                  : "Câu 1. Câu hỏi đầu tiên?\nA. Đáp án A\nB. Đáp án B\nC. Đáp án C\nD. Đáp án D\nĐáp án: B\n\nCâu 2. ..."
              }
              className={`w-full min-h-[220px] border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 resize-y ${
                mode === "html"
                  ? "border-blue-200 bg-blue-50/30 focus:ring-blue-300"
                  : "border-gray-200 focus:ring-blue-300"
              }`}
            />
            {error && <p className="mt-2 text-xs text-red-500">✗ {error}</p>}
          </div>

          {mode === "html" ? (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 space-y-1">
              <p className="font-semibold">Chế độ HTML</p>
              <p>• Dán mã HTML thô từ trang web, Google Classroom, phần mềm soạn thảo</p>
              <p>• Khi bấm <strong>Phân tích đề</strong>, hệ thống tự trích xuất văn bản từ HTML</p>
              <p>• Nội dung sau khi trích xuất vẫn cần đúng định dạng <code className="bg-blue-100 px-1 rounded">Câu 1.</code> / <code className="bg-blue-100 px-1 rounded">A.</code></p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 space-y-1">
              <p className="font-semibold">Quy tắc định dạng</p>
              <p>• Mỗi câu bắt đầu bằng <code className="bg-amber-100 px-1 rounded">Câu 1.</code> hoặc <code className="bg-amber-100 px-1 rounded">Câu 1:</code></p>
              <p>• <strong>Trắc nghiệm:</strong> <code className="bg-amber-100 px-1 rounded">A. text</code> mỗi dòng + <code className="bg-amber-100 px-1 rounded">Đáp án: B</code></p>
              <p>• <strong>Nhiều đáp án:</strong> <code className="bg-amber-100 px-1 rounded">Đáp án: A, C</code> (≥2 chữ cái)</p>
              <p>• <strong>Tự luận / Trả lời số:</strong> không có A./B./C./D. — chỉ có <code className="bg-amber-100 px-1 rounded">Đáp án: Hà Nội</code> hoặc <code className="bg-amber-100 px-1 rounded">Đáp án: 42</code></p>
              <p>• LaTeX: <code className="bg-amber-100 px-1 rounded">$\\frac{"{1}{2}"}$</code>, <code className="bg-amber-100 px-1 rounded">$x^2$</code></p>
            </div>
          )}

          {preview && (
            <div className="border border-green-200 bg-green-50/40 rounded-xl p-4">
              <p className="text-sm font-bold text-green-700 mb-3">
                ✓ Đã nhận diện {preview.length} câu hỏi
              </p>
              <div className="space-y-3 max-h-72 overflow-auto text-xs">
                {preview.map((q, qi) => {
                  const typeLabel =
                    q.type === "mcq" ? "Trắc nghiệm"
                    : q.type === "multi" ? "Nhiều đáp án"
                    : q.type === "short" ? "Tự luận"
                    : "Trả lời số";
                  return (
                    <div key={q.id} className="bg-white rounded-lg p-2.5 border border-gray-100">
                      <p className="font-semibold text-gray-800 mb-1 flex flex-wrap items-baseline gap-1.5">
                        <span className="text-gray-400 font-normal">Câu {qi + 1}.</span>
                        <span className="text-[9px] font-bold uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                          {typeLabel}
                        </span>
                        <MathText text={q.content} />
                      </p>
                      {(q.type === "mcq" || q.type === "multi") && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5 pl-3">
                          {q.options.map((opt, oi) => {
                            const isRight =
                              q.type === "mcq"
                                ? oi === q.correctIdx
                                : q.correctIdxs.includes(oi);
                            return (
                              <div key={oi} className={isRight ? "text-green-700 font-semibold" : "text-gray-600"}>
                                <span className="font-bold mr-1">{"ABCDEF"[oi]}.</span>
                                {opt ? <MathText text={opt} /> : <span className="text-gray-300 italic">(trống)</span>}
                                {isRight && <span className="ml-1">✓</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {(q.type === "short" || q.type === "numeric") && (
                        <div className="pl-3 text-gray-600">
                          <span className="text-gray-400">Đáp án: </span>
                          {q.answer ? (
                            <span className="text-green-700 font-semibold">
                              <MathText text={q.answer} />
                            </span>
                          ) : (
                            <span className="text-gray-300 italic">(chưa nhận diện)</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 bg-gray-50">
          <button
            onClick={handleClose}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
          >
            Hủy
          </button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!preview ? (
              <button
                onClick={() => handleParse()}
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
