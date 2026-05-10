"use client";
import { useState, useEffect, useRef } from "react";
import { Question, LABELS } from "@/lib/quizData";
import { saveExam, getAllStoredExams, deleteExam, type StoredExam } from "@/lib/examStorage";
import { parseExamText, type DraftQuestion } from "@/lib/examParser";
import { normalizeMath } from "@/lib/mathNormalizer";
import MathText from "@/components/MathText";
import Header from "@/components/Header";

function validateFinal(questions: Question[]): string | null {
  if (!questions.length) return "Không tìm thấy câu hỏi nào.";
  for (const q of questions) {
    if (!q.question?.trim()) return `Câu ${q.id}: Thiếu câu hỏi.`;
    if (q.options.length < 2) return `Câu ${q.id}: Cần ít nhất 2 đáp án.`;
    if (!q.options.includes(q.correctAnswer)) return `Câu ${q.id}: Đáp án không hợp lệ.`;
  }
  return null;
}

// Extract plain text from pasted HTML, preserving structure for the parser
function htmlToPlainLines(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  // Replace block-level elements with newlines
  doc.querySelectorAll("br").forEach(el => el.replaceWith("\n"));
  doc.querySelectorAll("p, div, li, tr").forEach(el => {
    el.insertAdjacentText("afterend", "\n");
  });
  return doc.body.textContent ?? "";
}

export default function ImportClient() {
  const [lessonId, setLessonId] = useState(5);
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [draft, setDraft] = useState<DraftQuestion[] | null>(null);
  const [draftAnswers, setDraftAnswers] = useState<(string | null)[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  const [savedExams, setSavedExams] = useState<StoredExam[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSavedExams(getAllStoredExams()); }, []);
  const refreshSaved = () => setSavedExams(getAllStoredExams());

  const unanswered = draftAnswers.filter(a => a === null).length;
  const finalQuestions: Question[] | null =
    draft && unanswered === 0
      ? draft.map((q, i) => ({ ...q, correctAnswer: draftAnswers[i]! }))
      : null;

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    let text: string;
    if (html) {
      text = htmlToPlainLines(html);
    } else {
      text = e.clipboardData.getData("text/plain");
    }
    // Insert as plain text at cursor
    const selection = window.getSelection();
    if (selection && selection.rangeCount) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
    } else if (editorRef.current) {
      editorRef.current.textContent += text;
    }
    setRawText(editorRef.current?.textContent ?? "");
  }

  function handleEditorInput() {
    setRawText(editorRef.current?.textContent ?? "");
  }

  async function handleFetchUrl() {
    if (!urlInput.trim()) return;
    setUrlLoading(true);
    setParseError(null);
    try {
      const res = await fetch(`/api/fetch-exam?url=${encodeURIComponent(urlInput.trim())}`);
      const data = await res.json();
      if (!res.ok || data.error) { setParseError(data.error ?? "Lỗi không xác định."); return; }
      const text: string = data.text;
      if (editorRef.current) editorRef.current.textContent = text;
      setRawText(text);
    } catch {
      setParseError("Không thể kết nối. Kiểm tra lại URL.");
    } finally {
      setUrlLoading(false);
    }
  }

  function handleParse() {
    setParseError(null);
    setDraft(null);
    const normalized = normalizeMath(rawText);
    const questions = parseExamText(normalized);
    if (!questions.length) { setParseError("Không tìm thấy câu hỏi nào — kiểm tra lại định dạng."); return; }
    setDraft(questions);
    setDraftAnswers(questions.map(q => q.correctAnswer));
  }

  function setAnswer(qi: number, answer: string) {
    setDraftAnswers(prev => { const next = [...prev]; next[qi] = answer; return next; });
  }

  function handleSave() {
    if (!finalQuestions) return;
    const err = validateFinal(finalQuestions);
    if (err) { setParseError(err); return; }
    saveExam({ lessonId, title: title.trim() || `Đề ${lessonId}`, questions: finalQuestions });
    refreshSaved();
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 3000);
  }

  function handleExport() {
    if (!finalQuestions) return;
    const blob = new Blob([JSON.stringify(finalQuestions, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `exam_${lessonId}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const err = validateFinal(Array.isArray(data) ? data : []);
        if (err) { setParseError(err); return; }
        setDraft(data);
        setDraftAnswers(data.map((q: Question) => q.correctAnswer));
        setParseError(null);
      } catch { setParseError("Không thể đọc file JSON."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <h1 className="text-xl font-bold text-gray-800">Nhập đề thi</h1>
          <p className="text-sm text-gray-400 mt-0.5">Dán văn bản đề thi — hỗ trợ định dạng PDF, Word · Lưu vào trình duyệt để thi ngay</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="space-y-4">
          {/* Lesson info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Thông tin bài thi</h2>
            <div className="flex gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Lesson ID</label>
                <input type="number" min={1} value={lessonId} onChange={e => setLessonId(Number(e.target.value))}
                  className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">Tiêu đề</label>
                <input type="text" placeholder={`Đề ${lessonId}`} value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>
          </div>

          {/* URL import */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Nhập từ URL</h2>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://loigiaihay.com/..."
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleFetchUrl()}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={handleFetchUrl}
                disabled={urlLoading || !urlInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                {urlLoading ? "Đang tải…" : "Tải đề"}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Hỗ trợ loigiaihay.com và các trang đề thi tương tự</p>
          </div>

          {/* Text paste */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-700">Dán nội dung đề thi</h2>
              <button onClick={() => fileRef.current?.click()} className="text-xs text-blue-500 hover:text-blue-700 font-medium">
                Nhập JSON ↑
              </button>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
            </div>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onPaste={handlePaste}
              onInput={handleEditorInput}
              data-placeholder={"Câu 1. Câu hỏi đầu tiên?\nA. Đáp án A\nB. Đáp án B\nC. Đáp án C\nD. Đáp án D\n\nCâu 2. Câu hỏi thứ hai?\nA. text   B. text\nC. text   D. text"}
              className="w-full min-h-[200px] border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 whitespace-pre-wrap overflow-auto empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
            />
            {parseError && <p className="mt-2 text-xs text-red-500">✗ {parseError}</p>}
            <button onClick={handleParse}
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
              Chuyển đổi
            </button>
          </div>

          {/* Answer selection — shown when any question lacks a correct answer */}
          {draft && unanswered > 0 && (
            <div className="bg-white rounded-2xl border-2 border-orange-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-orange-600">Chọn đáp án đúng</h2>
                <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2.5 py-1 rounded-full">
                  Còn {unanswered}/{draft.length} câu
                </span>
              </div>
              <div className="space-y-6">
                {draft.map((q, qi) => (
                  <div key={qi}>
                    <p className="text-sm font-medium text-gray-800 mb-2.5 leading-relaxed">
                      <span className="text-gray-400 mr-1 font-normal">Câu {qi + 1}.</span>
                      <MathText text={q.question} />
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => (
                        <button key={oi} onClick={() => setAnswer(qi, opt)}
                          className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl border text-left transition-all ${
                            draftAnswers[qi] === opt
                              ? "border-orange-500 bg-orange-50 text-orange-700 font-semibold shadow-sm"
                              : "border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50/50"
                          }`}>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                            draftAnswers[qi] === opt ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
                          }`}>
                            {LABELS[oi]}
                          </span>
                          <span className="line-clamp-2 leading-tight"><MathText text={opt} /></span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview + Save — shown once all answers are set */}
          {finalQuestions && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-700">
                  Xem trước — {finalQuestions.length} câu hỏi
                </h2>
                <div className="flex gap-2">
                  <button onClick={handleExport}
                    className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg">
                    Xuất JSON
                  </button>
                  <button onClick={handleSave}
                    className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors">
                    Lưu bài thi
                  </button>
                </div>
              </div>
              {saveStatus === "saved" && (
                <div className="mb-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  ✓ Đã lưu bài thi #{lessonId}.{" "}
                  <a href={`/quiz?lessonId=${lessonId}`} className="underline font-semibold">Vào làm bài →</a>
                </div>
              )}
              <div className="space-y-4 max-h-96 overflow-auto text-xs bg-gray-50 border border-gray-100 rounded-xl p-4">
                {finalQuestions.map((q, qi) => (
                  <div key={qi}>
                    <p className="font-semibold text-gray-800 mb-1.5">
                      <span className="text-gray-400 font-normal mr-1">{qi + 1}.</span>
                      <MathText text={q.question} />
                    </p>
                    <div className="space-y-1 pl-3">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className={`flex items-center gap-1.5 ${opt === q.correctAnswer ? "text-green-700 font-semibold" : "text-gray-600"}`}>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${opt === q.correctAnswer ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                            {LABELS[oi]}
                          </span>
                          <MathText text={opt} />
                          {opt === q.correctAnswer && <span className="ml-1">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-blue-600 mb-3">Định dạng hỗ trợ</h3>
            <pre className="text-xs bg-gray-50 rounded-xl p-3 leading-6 text-gray-600 whitespace-pre-wrap">
{`Câu 1. Câu hỏi?
A. Đáp án A
B. Đáp án B
C. Đáp án C
D. Đáp án D

Câu 2. 2 options/dòng?
A. A text   B. B text
C. C text   D. D text

Đáp án: C  ← tuỳ chọn`}
            </pre>
            <ul className="mt-3 space-y-1.5 text-xs text-gray-500">
              <li>• Dùng <code className="bg-gray-100 px-1 rounded">Câu 1.</code> hoặc <code className="bg-gray-100 px-1 rounded">Câu 1:</code></li>
              <li>• Options 1 dòng hoặc <strong>2 options/dòng</strong></li>
              <li>• Tiêu đề, hướng dẫn phía trên được bỏ qua tự động</li>
              <li>• Nếu thiếu "Đáp án:" — chọn sau khi chuyển đổi</li>
              <li>• Phân số <code className="bg-gray-100 px-1 rounded">1/2</code> → tự động thành LaTeX</li>
              <li>• <code className="bg-gray-100 px-1 rounded">sqrt(x)</code> → <code className="bg-gray-100 px-1 rounded">√x</code></li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Bài thi đã lưu</h3>
            {savedExams.length === 0 ? (
              <p className="text-xs text-gray-400">Chưa có bài thi nào.</p>
            ) : (
              <div className="space-y-2">
                {savedExams.map(exam => (
                  <div key={exam.lessonId} className="flex items-center justify-between text-xs bg-gray-50 rounded-xl px-3 py-2.5">
                    <div className="min-w-0 mr-2">
                      <span className="font-semibold text-gray-700">#{exam.lessonId}</span>
                      <span className="text-gray-500 ml-1.5 truncate">{exam.title}</span>
                      <span className="text-gray-400 ml-1">· {exam.questions.length} câu</span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <a href={`/quiz?lessonId=${exam.lessonId}`} className="text-blue-500 hover:underline">Thi</a>
                      <button onClick={() => { deleteExam(exam.lessonId); refreshSaved(); }}
                        className="text-red-400 hover:text-red-600">Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
