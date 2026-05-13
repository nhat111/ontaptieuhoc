"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────
type ParsedQuestion = {
  id: string;
  content: string;
  options: [string, string, string, string];
  correct_answer: string;
  explanation: string;
  checked: boolean; // user có muốn import không
};

type ImportMode = "image" | "file" | "url";

// ─── Helpers ─────────────────────────────────────────────────
function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function parseClaudeResponse(text: string): ParsedQuestion[] {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const arr = JSON.parse(clean);
    if (!Array.isArray(arr)) return [];
    return arr.map((q: any) => ({
      id: genId(),
      content: q.question || q.content || "",
      options: (q.options || ["", "", "", ""]).slice(0, 4) as [string, string, string, string],
      correct_answer: q.correct_answer || q.answer || "",
      explanation: q.explanation || "",
      checked: true,
    }));
  } catch {
    return [];
  }
}

const CLAUDE_PROMPT = `Bạn là trợ lý giáo dục Việt Nam. Hãy extract TẤT CẢ câu hỏi trắc nghiệm từ nội dung sau.

YÊU CẦU:
- Giữ nguyên nội dung câu hỏi và đáp án
- Chuyển công thức toán sang LaTeX inline: $...$ (VD: $\\frac{1}{2}$, $\\sqrt{4}$, $x^2$)
- Xác định đáp án đúng nếu có (đánh dấu, in đậm, hoặc có ghi đáp án)
- Nếu không rõ đáp án, để correct_answer = ""
- Bỏ qua header, footer, số thứ tự trang

Trả về ONLY JSON array, không có text khác:
[
  {
    "question": "Nội dung câu hỏi",
    "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "correct_answer": "Đáp án đúng (copy y chang từ options)",
    "explanation": "Lời giải nếu có, để trống nếu không"
  }
]

Nếu không có câu hỏi nào, trả về [].`;

// ─── Call Claude API ──────────────────────────────────────────
async function callClaudeText(content: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: `${CLAUDE_PROMPT}\n\nNỘI DUNG:\n${content.slice(0, 4000)}` }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.[0]?.text || "";
}

async function callClaudeVision(base64: string, mediaType: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: CLAUDE_PROMPT },
        ],
      }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.[0]?.text || "";
}

// ─── Sub: Image Upload Tab ────────────────────────────────────
function ImageTab({ onParsed }: { onParsed: (qs: ParsedQuestion[]) => void }) {
  const [files, setFiles] = useState<{ file: File; preview: string; status: "pending" | "processing" | "done" | "error"; count: number }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const valid = Array.from(newFiles).filter(f => f.type.startsWith("image/"));
    setFiles(prev => [...prev, ...valid.map(f => ({
      file: f, preview: URL.createObjectURL(f),
      status: "pending" as const, count: 0,
    }))]);
  };

  const processAll = async () => {
    setProcessing(true);
    setError("");
    const allParsed: ParsedQuestion[] = [];

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== "pending") continue;
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "processing" } : f));
      try {
        const base64 = await fileToBase64(files[i].file);
        const text = await callClaudeVision(base64, files[i].file.type as any);
        const parsed = parseClaudeResponse(text);
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "done", count: parsed.length } : f));
        allParsed.push(...parsed);
      } catch (e: any) {
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "error" } : f));
        setError("Lỗi xử lý ảnh: " + e.message);
      }
    }

    setProcessing(false);
    if (allParsed.length > 0) onParsed(allParsed);
  };

  const pendingCount = files.filter(f => f.status === "pending").length;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-orange-200 rounded-2xl p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all group"
      >
        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📸</div>
        <p className="font-semibold text-gray-700 text-sm">Kéo thả ảnh đề thi vào đây</p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Nhiều ảnh cùng lúc · Tối đa 5MB/ảnh</p>
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold">
          📂 Chọn ảnh
        </div>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => addFiles(e.target.files)} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden border border-gray-100 group">
              <img src={f.preview} alt="" className="w-full h-20 object-cover" />
              <div className={`absolute inset-0 flex items-center justify-center text-white text-xs font-bold ${
                f.status === "processing" ? "bg-black/50" :
                f.status === "done" ? "bg-green-500/80" :
                f.status === "error" ? "bg-red-500/80" : "bg-black/0"
              }`}>
                {f.status === "processing" && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {f.status === "done" && `✓ ${f.count} câu`}
                {f.status === "error" && "✕ Lỗi"}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

      {pendingCount > 0 && (
        <button onClick={processAll} disabled={processing}
          className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2">
          {processing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang đọc...</> : `🤖 Đọc ${pendingCount} ảnh bằng AI`}
        </button>
      )}
    </div>
  );
}

// ─── Sub: File Upload Tab ─────────────────────────────────────
function FileTab({ onParsed }: { onParsed: (qs: ParsedQuestion[]) => void }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setProcessing(true);
    setError("");
    setFileName(file.name);

    try {
      let text = "";

      if (file.type === "text/plain") {
        text = await file.text();
      } else if (file.type.includes("pdf")) {
        // PDF: convert to base64, send as image (first approach)
        const base64 = await fileToBase64(file);
        const response = await callClaudeVision(base64, "application/pdf");
        const parsed = parseClaudeResponse(response);
        if (parsed.length === 0) throw new Error("Không tìm thấy câu hỏi trong file.");
        onParsed(parsed);
        setProcessing(false);
        return;
      } else {
        // Word/other: read as text fallback
        text = await file.text();
      }

      if (!text.trim()) throw new Error("File trống hoặc không đọc được.");
      const response = await callClaudeText(text);
      const parsed = parseClaudeResponse(response);
      if (parsed.length === 0) throw new Error("Không tìm thấy câu hỏi nào trong file.");
      onParsed(parsed);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-orange-200 rounded-2xl p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all group"
      >
        {processing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Đang đọc {fileName}...</p>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📄</div>
            <p className="font-semibold text-gray-700 text-sm">Kéo thả file đề thi vào đây</p>
            <p className="text-xs text-gray-400 mt-1">PDF · Word (.docx) · Text (.txt)</p>
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold">
              📂 Chọn file
            </div>
          </>
        )}
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">❌ {error}</p>}
    </div>
  );
}

// ─── Sub: URL Tab ─────────────────────────────────────────────
function UrlTab({ onParsed }: { onParsed: (qs: ParsedQuestion[]) => void }) {
  const [url, setUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const processUrl = async () => {
    if (!url.trim()) return;
    setProcessing(true);
    setError("");

    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      const data = await res.json();
      const html = data.contents;

      if (!html) throw new Error("Không lấy được nội dung từ URL này.");

      // Strip HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      ["script", "style", "nav", "footer", "header", "aside", "iframe"].forEach(tag =>
        doc.querySelectorAll(tag).forEach(el => el.remove())
      );
      const rawText = doc.body?.textContent || "";
      if (rawText.length < 50) throw new Error("Trang này không có nội dung hoặc bị chặn CORS.");

      const response = await callClaudeText(rawText);
      const parsed = parseClaudeResponse(response);
      if (parsed.length === 0) throw new Error("Không tìm thấy câu hỏi nào trong trang này.");
      onParsed(parsed);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">URL trang đề thi</label>
        <div className="flex gap-2">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && processUrl()}
            placeholder="https://vndoc.com/de-toan-lop-3..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
        <p className="text-xs text-gray-400">Hỗ trợ: vndoc.com, violet.vn, tailieu.vn và nhiều trang khác</p>
      </div>

      <button onClick={processUrl} disabled={!url.trim() || processing}
        className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2">
        {processing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang đọc trang...</> : "🔗 Import từ URL"}
      </button>

      {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">❌ {error}</p>}
    </div>
  );
}

// ─── Sub: Question Preview & Edit ────────────────────────────
function QuestionPreview({
  q, index, onChange, onToggle,
}: {
  q: ParsedQuestion; index: number;
  onChange: (id: string, field: keyof ParsedQuestion, val: any) => void;
  onToggle: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${q.checked ? "border-orange-200" : "border-gray-100 opacity-50"}`}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
        {/* Checkbox */}
        <button onClick={() => onToggle(q.id)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${q.checked ? "bg-orange-500 border-orange-500 text-white" : "border-gray-300"}`}>
          {q.checked && <span className="text-xs font-bold">✓</span>}
        </button>

        <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-500 text-xs font-bold flex items-center justify-center flex-shrink-0">{index + 1}</span>

        <p className="flex-1 text-sm text-gray-700 truncate">{q.content || "Chưa có nội dung"}</p>

        {!q.correct_answer && (
          <span className="text-xs text-amber-500 font-semibold flex-shrink-0">⚠ Chưa có đáp án</span>
        )}

        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 text-xs flex-shrink-0">
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      {expanded && (
        <div className="p-4 space-y-3">
          {/* Content */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Câu hỏi</label>
            <textarea value={q.content} onChange={e => onChange(q.id, "content", e.target.value)}
              rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
          </div>

          {/* Options */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Lựa chọn (click để chọn đáp án đúng)</label>
            <div className="space-y-1.5">
              {q.options.map((opt, i) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${opt === q.correct_answer ? "border-green-400 bg-green-50" : "border-gray-100"}`}>
                  <button onClick={() => onChange(q.id, "correct_answer", opt)}
                    className={`w-6 h-6 rounded-lg text-xs font-bold flex-shrink-0 transition-all ${opt === q.correct_answer ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {["A","B","C","D"][i]}
                  </button>
                  <input value={opt} onChange={e => {
                    const newOpts = [...q.options] as [string,string,string,string];
                    newOpts[i] = e.target.value;
                    onChange(q.id, "options", newOpts);
                  }} className="flex-1 text-sm bg-transparent focus:outline-none" />
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Lời giải (tuỳ chọn)</label>
            <textarea value={q.explanation} onChange={e => onChange(q.id, "explanation", e.target.value)}
              rows={2} placeholder="Lời giải..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ImportPage() {
  const [mode, setMode] = useState<ImportMode>("image");
  const [parsed, setParsed] = useState<ParsedQuestion[]>([]);
  const [grade, setGrade] = useState(1);
  const [lessonId, setLessonId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleParsed = (qs: ParsedQuestion[]) => {
    setParsed(prev => [...prev, ...qs]);
  };

  const updateQuestion = (id: string, field: keyof ParsedQuestion, val: any) => {
    setParsed(prev => prev.map(q => q.id === id ? { ...q, [field]: val } : q));
  };

  const toggleQuestion = (id: string) => {
    setParsed(prev => prev.map(q => q.id === id ? { ...q, checked: !q.checked } : q));
  };

  const toggleAll = (check: boolean) => {
    setParsed(prev => prev.map(q => ({ ...q, checked: check })));
  };

  const handleSave = async () => {
    const toSave = parsed.filter(q => q.checked && q.content.trim());
    if (toSave.length === 0) { setSaveError("Chưa có câu hỏi nào được chọn."); return; }
    if (!lessonId) { setSaveError("Vui lòng chọn bài học để lưu vào."); return; }

    setSaving(true);
    setSaveError("");

    const rows = toSave.map((q, i) => ({
      lesson_id: Number(lessonId),
      content: q.content.trim(),
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation.trim() || null,
      order_index: i + 1,
    }));

    const { error } = await supabase.from("questions").insert(rows);

    if (error) {
      setSaveError("Lỗi lưu: " + error.message);
    } else {
      setSaved(true);
      setParsed([]);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const checkedCount = parsed.filter(q => q.checked).length;

  const MODES: { id: ImportMode; label: string; icon: string }[] = [
    { id: "image", label: "Ảnh đề",   icon: "📸" },
    { id: "file",  label: "File PDF/Word", icon: "📄" },
    { id: "url",   label: "URL trang web", icon: "🔗" },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <a href="/teacher" className="text-gray-400 hover:text-gray-600 text-lg">←</a>
        <div className="flex-1">
          <p className="font-bold text-gray-800 text-sm">Import đề thi</p>
          <p className="text-xs text-gray-400">AI đọc và tự động parse câu hỏi</p>
        </div>
        {parsed.length > 0 && (
          <button onClick={handleSave} disabled={saving || checkedCount === 0}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${saved ? "bg-green-500 text-white" : "bg-orange-500 text-white disabled:opacity-50"}`}>
            {saved ? "✓ Đã lưu!" : saving ? "Đang lưu..." : `💾 Lưu ${checkedCount} câu`}
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Mode tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`flex-1 py-3 text-xs font-bold transition-all flex flex-col items-center gap-1 ${mode === m.id ? "bg-orange-50 text-orange-500 border-b-2 border-orange-500" : "text-gray-400 hover:text-gray-600"}`}>
                <span className="text-lg">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {mode === "image" && <ImageTab onParsed={handleParsed} />}
            {mode === "file"  && <FileTab  onParsed={handleParsed} />}
            {mode === "url"   && <UrlTab   onParsed={handleParsed} />}
          </div>
        </div>

        {/* Parsed questions */}
        {parsed.length > 0 && (
          <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700">
                  {parsed.length} câu tìm được
                </span>
                <span className="text-xs text-orange-500 font-semibold bg-orange-50 px-2 py-0.5 rounded-full">
                  {checkedCount} được chọn
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleAll(true)} className="text-xs text-gray-500 hover:text-orange-500 font-semibold">Chọn tất</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => toggleAll(false)} className="text-xs text-gray-500 hover:text-orange-500 font-semibold">Bỏ tất</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => setParsed([])} className="text-xs text-red-400 hover:text-red-600 font-semibold">Xóa hết</button>
              </div>
            </div>

            {/* Lesson selector */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                Lưu vào bài học nào?
              </label>
              <div className="flex gap-2 items-center">
                <select value={grade} onChange={e => setGrade(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  {[1,2,3,4,5].map(g => <option key={g} value={g}>Lớp {g}</option>)}
                </select>
                <input value={lessonId} onChange={e => setLessonId(e.target.value)}
                  placeholder="Nhập lesson_id từ Supabase..."
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                💡 Vào Supabase → Table Editor → lessons → copy id của bài học muốn lưu
              </p>
            </div>

            {saveError && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">❌ {saveError}</p>
            )}

            {/* Question list */}
            {parsed.map((q, i) => (
              <QuestionPreview key={q.id} q={q} index={i}
                onChange={updateQuestion} onToggle={toggleQuestion} />
            ))}

            {/* Save button bottom */}
            <button onClick={handleSave} disabled={saving || checkedCount === 0}
              className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl disabled:opacity-50 shadow-lg shadow-orange-100">
              {saving ? "Đang lưu..." : `💾 Lưu ${checkedCount} câu vào Supabase`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
