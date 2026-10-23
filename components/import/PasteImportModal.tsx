"use client";
import { useEffect, useState } from "react";
import { parseExamText } from "@/lib/examParser";
import { parseLoigiaihay, looksLikeLoigiaihay } from "@/lib/loigiaihayParser";
import { normalizeMath } from "@/lib/mathNormalizer";
import { cleanOcrText } from "@/lib/ocrText";
import type { OcrProgress } from "@/lib/browserOcr";
import { nanoid } from "@/lib/nanoid";
import MathText from "@/components/MathText";
import { NO_ANSWER, draftProblems } from "@/lib/importDraft";
import { TYPE_OPTIONS, type QDraft } from "./QuestionCard";

/** Mở hộp ở phần nào trước: dán chữ (mặc định) hay chụp ảnh. */
export type PasteFocus = "paste" | "scan";

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (questions: QDraft[], mode: "replace" | "append") => void;
  focus?: PasteFocus;
  /** Bài đang có câu đã soạn — khi đó mới cần hỏi "thay thế" hay "thêm vào". */
  hasExisting?: boolean;
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

export default function PasteImportModal({ open, onClose, onImport, focus = "paste", hasExisting = false }: Props) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"text" | "html">("text");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<QDraft[] | null>(null);
  const [url, setUrl] = useState("");
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanNote, setScanNote] = useState<string | null>(null);
  const [ocrAvailable, setOcrAvailable] = useState(false);
  const [freeScan, setFreeScan] = useState<OcrProgress | null>(null);
  const [freeScanError, setFreeScanError] = useState<string | null>(null);

  // Quét ảnh cần ANTHROPIC_API_KEY phía máy chủ. Hỏi trước khi mở modal để ẩn
  // hẳn nút khi chưa cấu hình, thay vì để người dùng bấm vào rồi nhận lỗi 503.
  // Đặt trước `if (!open)` để thứ tự hook không đổi giữa các lần render.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/ocr-exam")
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setOcrAvailable(!!d?.available); })
      .catch(() => { if (!cancelled) setOcrAvailable(false); });
    return () => { cancelled = true; };
  }, [open]);

  if (!open) return null;

  // ── Quét ảnh đề ───────────────────────────────────────────────────────────
  // Khác luồng dán/URL: không đi qua examParser mà nhận thẳng câu hỏi có cấu
  // trúc từ /api/ocr-exam rồi đổ vào preview.
  async function handleScanImage(file: File) {
    setScanError(null);
    setScanNote(null);
    setError(null);
    setPreview(null);
    setScanning(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/ocr-exam", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setScanError(data?.error ?? `Quét thất bại (HTTP ${res.status})`);
        return;
      }

      const scanned = (data.questions ?? []) as {
        content: string;
        options: string[];
        correctIndex: number;
      }[];

      const drafts: QDraft[] = scanned.map((q) => {
        const base = { id: nanoid(), content: normalizeMath(q.content), images: [] as QDraft["images"] };
        if (q.options.length >= 2) {
          return {
            ...base,
            type: "mcq" as const,
            options: q.options.map(normalizeMath),
            // -1 nghĩa là không nhìn thấy dấu khoanh nào: để trống, KHÔNG chọn
            // tạm A — chọn tạm thì lưu được mà chấm sai, không ai biết.
            correctIdx: q.correctIndex >= 0 ? q.correctIndex : NO_ANSWER,
            correctIdxs: [],
            answer: "",
          };
        }
        return { ...base, type: "short" as const, options: [], correctIdx: NO_ANSWER, correctIdxs: [], answer: "" };
      });

      const missing = scanned.filter((q) => q.options.length >= 2 && q.correctIndex < 0).length;
      setPreview(drafts);
      setScanNote(
        missing > 0
          ? `Đọc được ${drafts.length} câu. ${missing} câu không thấy dấu khoanh đáp án — nhớ tự chọn đáp án đúng sau khi chèn.`
          : `Đọc được ${drafts.length} câu, có đủ đáp án đúng.`
      );
    } catch {
      setScanError("Không thể kết nối máy chủ.");
    } finally {
      setScanning(false);
    }
  }

  // ── Quét ảnh miễn phí (Tesseract trên trình duyệt) ─────────────────────────
  // Khác quét bằng AI: chỉ ra chữ thô, nên đổ vào ô văn bản để người dùng sửa
  // lỗi đọc sai rồi mới đi qua examParser như luồng dán thường.
  async function handleFreeScan(files: File[]) {
    setFreeScanError(null);
    setError(null);
    setPreview(null);
    setFreeScan({ index: 1, total: files.length, phase: "loading", progress: 0 });
    try {
      const { recognizeImages } = await import("@/lib/browserOcr");
      const raw = await recognizeImages(files, setFreeScan);
      const cleaned = cleanOcrText(raw);
      if (!cleaned) {
        setFreeScanError("Không đọc được chữ nào. Thử ảnh rõ hơn, chụp thẳng và đủ sáng.");
        return;
      }
      setText(cleaned);
      setMode("text");
      handleParse(cleaned, "text");
    } catch (err) {
      console.error("[PasteImportModal] OCR lỗi:", err);
      setFreeScanError("Không đọc được ảnh. Kiểm tra kết nối mạng (lần đầu cần tải bộ đọc chữ) rồi thử lại.");
    } finally {
      setFreeScan(null);
    }
  }

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
    let parsed = parseExamText(normalized);
    // Fallback: loigiaihay/vietjack "Giải Bài N" solution pages don't use the
    // "Câu N. + A./B." format, so try the dedicated parser when the standard
    // one finds nothing and the text looks like a solution page.
    if (!parsed.length && looksLikeLoigiaihay(normalized)) {
      parsed = parseLoigiaihay(normalized);
    }
    if (!parsed.length) {
      setError("Không tìm thấy câu hỏi nào. Kiểm tra lại định dạng (Câu 1. / A. / B. ...)");
      return;
    }
    const drafts: QDraft[] = parsed.map((q, i) => {
      const base = { id: nanoid(), content: q.question, images: [] as QDraft["images"], solution: q.solution };

      if (q.type === "mcq") {
        const opts = [...q.options];
        while (opts.length < 2) opts.push("");
        // Không có dòng "Đáp án:" thì để trống — người soạn tự chọn sau khi chèn.
        let correctIdx = NO_ANSWER;
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
        return { ...base, type: "multi", options: opts, correctIdx: NO_ANSWER, correctIdxs, answer: "" };
      }

      // short / numeric
      return {
        ...base,
        type: q.type,
        options: [],
        correctIdx: NO_ANSWER,
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
    setScanNote(null);
    onClose();
  }

  function handleClose() {
    setText("");
    setPreview(null);
    setError(null);
    setScanNote(null);
    setScanError(null);
    setMode("text");
    setUrl("");
    setUrlError(null);
    setFreeScanError(null);
    onClose();
  }

  const spinner = (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
  const cameraIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h1.5l1-2h7l1 2H18a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <circle cx="11.5" cy="13" r="3.5" />
    </svg>
  );

  // ── Dán chữ ───────────────────────────────────────────────────────────────
  const pasteSection = (
    <section key="paste" className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-slate-800">Dán đề đã có (từ Word, Zalo, trang web…)</h3>
        <button
          onClick={() => setText(mode === "html" ? SAMPLE_HTML : SAMPLE_TEXT)}
          className="text-sm font-semibold text-primary-700 hover:underline shrink-0"
        >
          Xem mẫu
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={handlePaste}
        placeholder={
          mode === "html"
            ? "<p>Câu 1. Câu hỏi đầu tiên?</p>\n<p>A. Đáp án A</p>\n<p>B. Đáp án B</p>\n..."
            : "Câu 1. 2 + 3 = ?\nA. 4\nB. 5\nC. 6\nD. 7\nĐáp án: B\n\nCâu 2. ..."
        }
        className={`w-full min-h-[200px] border rounded-xl px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 resize-y ${
          mode === "html" ? "border-blue-200 bg-blue-50/30 font-mono focus:ring-blue-300" : "border-slate-300 focus:ring-primary-300"
        }`}
      />
      {error && <p className="text-sm text-coral-700">{error}</p>}
      {mode === "html" ? (
        <p className="text-sm text-blue-700">Đang ở chế độ mã HTML — máy tự lấy chữ ra khi bấm Đọc đề.</p>
      ) : (
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800 space-y-1">
          <p className="font-semibold">Máy đọc được đề khi:</p>
          <p>• Mỗi câu bắt đầu bằng <b>Câu 1.</b> hoặc <b>Câu 1:</b></p>
          <p>• Mỗi đáp án một dòng: <b>A.</b> … <b>B.</b> …</p>
          <p>• Đáp án đúng ghi ở dòng <b>Đáp án: B</b> (nhiều đáp án đúng: <b>Đáp án: A, C</b>). Không có dòng này thì chèn xong tự bấm chọn.</p>
          <p>• Câu điền: không có A. B. — chỉ ghi <b>Đáp án: Hà Nội</b> hoặc <b>Đáp án: 42</b></p>
        </div>
      )}
    </section>
  );

  // ── Chụp ảnh ──────────────────────────────────────────────────────────────
  const scanSection = (
    <section key="scan" className="space-y-3">
      <h3 className="text-base font-bold text-slate-800">Chụp ảnh đề giấy</h3>

      {/* Quét bằng AI đọc được cả đáp án khoanh bút — ưu tiên khi có */}
      {ocrAvailable && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
          <label
            className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-bold transition-colors ${
              scanning ? "bg-orange-300 text-white cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
            }`}
          >
            {scanning ? <>{spinner} Đang đọc ảnh…</> : <>{cameraIcon} Chụp / chọn ảnh (đọc cả đáp án khoanh)</>}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={scanning}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                // Reset để chọn lại đúng file vừa rồi vẫn kích hoạt onChange.
                e.target.value = "";
                if (f) handleScanImage(f);
              }}
            />
          </label>
          <p className="mt-2 text-sm text-slate-600">Một trang mỗi lần. Đọc được cả đáp án đã khoanh bằng bút.</p>
          {scanError && <p className="mt-2 text-sm text-coral-700">{scanError}</p>}
          {scanNote && <p className="mt-2 text-sm text-orange-800">{scanNote}</p>}
        </div>
      )}

      {/* Đọc chữ miễn phí ngay trên máy — luôn có */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-3">
        <label
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-bold transition-colors ${
            freeScan ? "bg-green-300 text-white cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
          }`}
        >
          {freeScan ? (
            <>
              {spinner}
              {freeScan.phase === "loading"
                ? "Đang chuẩn bị…"
                : `Đang đọc${freeScan.total > 1 ? ` ảnh ${freeScan.index}/${freeScan.total}` : ""}… ${Math.round(freeScan.progress * 100)}%`}
            </>
          ) : (
            <>{cameraIcon} {ocrAvailable ? "Đọc chữ miễn phí" : "Chụp / chọn ảnh"}</>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={!!freeScan}
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              // Reset để chọn lại đúng file vừa rồi vẫn kích hoạt onChange.
              e.target.value = "";
              if (files.length) handleFreeScan(files);
            }}
          />
        </label>
        <p className="mt-2 text-sm text-slate-600">
          Chọn được nhiều ảnh cho đề nhiều trang. Chữ đọc được hiện vào ô dán để sửa lỗi. Không nhận ra đáp án khoanh bút — chèn xong tự chọn đáp án đúng.
        </p>
        {freeScanError && <p className="mt-2 text-sm text-coral-700">{freeScanError}</p>}
      </div>
      <p className="text-sm text-slate-500">Chụp thẳng, đủ sáng, rõ chữ thì đọc chính xác hơn.</p>
    </section>
  );

  // ── Ít dùng: tải từ trang web, dán mã HTML ────────────────────────────────
  const advancedSection = (
    <details key="adv" className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <summary className="cursor-pointer text-sm font-semibold text-slate-600">Cách khác: lấy đề từ một trang web, dán mã HTML</summary>
      <div className="mt-3 space-y-3">
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">
            Địa chỉ trang web
          </label>
          <p className="mb-1.5 text-sm text-slate-500">
            Chỉ lấy đề bạn có quyền sử dụng (đề tự soạn, đề của trường mình). Đề và lời giải trên các trang web khác thuộc bản quyền của họ.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !fetchingUrl) { e.preventDefault(); handleFetchUrl(); } }}
              placeholder="https://..."
              className="flex-1 min-w-[200px] border border-slate-300 rounded-lg px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            <button
              onClick={handleFetchUrl}
              disabled={fetchingUrl || !url.trim()}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {fetchingUrl ? <>{spinner} Đang tải…</> : "Lấy đề"}
            </button>
          </div>
          {urlError && <p className="mt-2 text-sm text-coral-700">{urlError}</p>}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={mode === "html"}
            onChange={(e) => { setMode(e.target.checked ? "html" : "text"); setText(""); setPreview(null); setError(null); }}
            className="h-4 w-4"
          />
          Ô dán nhận mã HTML thô (chỉ dùng khi dán mã nguồn trang web)
        </label>
      </div>
    </details>
  );

  const missing = preview ? preview.filter((q) => draftProblems(q).length > 0).length : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-stretch sm:items-center justify-center sm:p-4" onClick={handleClose}>
      <div
        className="bg-white sm:rounded-2xl shadow-xl w-full max-w-3xl max-h-[100dvh] sm:max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Đưa đề có sẵn vào"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-slate-900">Đưa đề có sẵn vào</h2>
            <p className="text-sm text-slate-500">Máy tự tách câu hỏi và đáp án — xem lại trước khi chèn.</p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Đóng"
            className="text-slate-400 hover:text-slate-600 text-3xl leading-none w-11 h-11 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5 space-y-5">
          {!preview ? (
            <>
              {(focus === "scan" ? [scanSection, pasteSection] : [pasteSection, scanSection])}
              {advancedSection}
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-base font-bold text-success-700">Máy đọc được {preview.length} câu hỏi</p>
              {missing > 0 && (
                <p className="rounded-xl border border-coral-200 bg-coral-50 px-3 py-2 text-sm text-coral-800">
                  {missing} câu chưa đủ (thường là chưa có đáp án đúng). Chèn vào bài rồi bấm chọn đáp án đúng cho những câu có chữ <b>Chưa xong</b>.
                </p>
              )}
              {scanNote && <p className="text-sm text-orange-800">{scanNote}</p>}
              <div className="space-y-3">
                {preview.map((q, qi) => {
                  const typeLabel = TYPE_OPTIONS.find((t) => t.value === q.type)?.label ?? "";
                  const problems = draftProblems(q);
                  return (
                    <div key={q.id} className={`rounded-xl p-3 border text-sm ${problems.length ? "border-coral-200 bg-coral-50/40" : "border-slate-200 bg-white"}`}>
                      <p className="font-semibold text-slate-800 mb-1 flex flex-wrap items-baseline gap-1.5">
                        <span className="text-slate-400 font-normal">Câu {qi + 1}.</span>
                        <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{typeLabel}</span>
                        <MathText text={q.content} />
                      </p>
                      {(q.type === "mcq" || q.type === "multi") && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5 pl-3">
                          {q.options.map((opt, oi) => {
                            const isRight = q.type === "mcq" ? oi === q.correctIdx : q.correctIdxs.includes(oi);
                            return (
                              <div key={oi} className={isRight ? "text-success-700 font-semibold" : "text-slate-600"}>
                                <span className="font-bold mr-1">{"ABCDEF"[oi]}.</span>
                                {opt ? <MathText text={opt} /> : <span className="text-slate-300 italic">(trống)</span>}
                                {isRight && <span className="ml-1">✓</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {(q.type === "short" || q.type === "numeric") && q.answer && (
                        <div className="pl-3 text-slate-600">
                          Đáp án: <span className="text-success-700 font-semibold"><MathText text={q.answer} /></span>
                        </div>
                      )}
                      {problems.length > 0 && <p className="mt-1 pl-3 text-coral-700">{problems.join(" · ")}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50">
          <button onClick={preview ? () => setPreview(null) : handleClose} className="min-h-11 text-base text-slate-600 hover:text-slate-800 px-3">
            {preview ? "← Quay lại sửa" : "Huỷ"}
          </button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!preview ? (
              <button
                onClick={() => handleParse()}
                disabled={!text.trim()}
                className="min-h-11 rounded-xl bg-primary-600 px-5 text-base font-bold text-white hover:bg-primary-700 disabled:opacity-40"
              >
                Đọc đề
              </button>
            ) : hasExisting ? (
              <>
                <button
                  onClick={() => handleImport("replace")}
                  className="min-h-11 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-bold text-slate-700 hover:border-coral-300 hover:text-coral-700"
                >
                  Thay toàn bộ câu đang có
                </button>
                <button
                  onClick={() => handleImport("append")}
                  className="min-h-11 rounded-xl bg-primary-600 px-5 text-base font-bold text-white hover:bg-primary-700"
                >
                  Thêm vào sau các câu đang có
                </button>
              </>
            ) : (
              <button
                onClick={() => handleImport("replace")}
                className="min-h-11 rounded-xl bg-primary-600 px-5 text-base font-bold text-white hover:bg-primary-700"
              >
                Đưa {preview.length} câu vào bài
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
