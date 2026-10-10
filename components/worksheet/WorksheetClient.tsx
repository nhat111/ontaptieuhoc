"use client";

import { useMemo, useState } from "react";
import { MATH_LESSONS, buildWorksheetQuestions, type MathGrade } from "@/lib/mathGen";
import { buildWorksheetHtml, answerText, type AnswerMode, type WorksheetVersion } from "@/lib/worksheetExport";
import { gradeTheme } from "@/lib/gradeTheme";

const GRADES = [...new Set(MATH_LESSONS.map((l) => l.grade))].sort((a, b) => a - b) as MathGrade[];
const COUNTS = [10, 15, 20];
const VERSIONS = [1, 2, 3, 4];
const ANSWER_MODES: { value: AnswerMode; label: string }[] = [
  { value: "solutions", label: "Đáp án + lời giải" },
  { value: "key", label: "Chỉ đáp án" },
  { value: "none", label: "Không kèm" },
];

const topicsOf = (g: MathGrade) => MATH_LESSONS.filter((l) => l.grade === g);
const newSeed = () => Math.random().toString(36).slice(2, 8);

export default function WorksheetClient() {
  const [grade, setGrade] = useState<MathGrade>(GRADES[0]);
  const [topicIds, setTopicIds] = useState<string[]>([topicsOf(GRADES[0])[0].id]);
  const [count, setCount] = useState(10);
  const [versionCount, setVersionCount] = useState(1);
  const [answers, setAnswers] = useState<AnswerMode>("solutions");
  // Câu hỏi chỉ sinh sau khi bấm (sinh lúc render sẽ lệch giữa server và trình duyệt).
  const [seed, setSeed] = useState<string | null>(null);

  const specs = useMemo(() => topicsOf(grade).filter((t) => topicIds.includes(t.id)), [grade, topicIds]);

  const versions: WorksheetVersion[] = useMemo(() => {
    if (!seed || specs.length === 0) return [];
    return Array.from({ length: versionCount }, (_, i) => ({
      label: versionCount > 1 ? `Đề ${i + 1}` : "",
      rows: buildWorksheetQuestions(specs, count, `${seed}|${i}`),
    }));
  }, [seed, specs, count, versionCount]);

  const title = `Phiếu bài tập Toán lớp ${grade}`;
  const theme = gradeTheme(grade);

  function pickGrade(g: MathGrade) {
    setGrade(g);
    setTopicIds([topicsOf(g)[0].id]);
  }

  function toggleTopic(id: string) {
    setTopicIds((cur) => (cur.includes(id) ? (cur.length > 1 ? cur.filter((x) => x !== id) : cur) : [...cur, id]));
  }

  function html(autoPrint: boolean) {
    return buildWorksheetHtml(versions, {
      title, grade, answers, autoPrint, topics: specs.map((s) => s.title),
    });
  }

  function downloadDoc() {
    const blob = new Blob([html(false)], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phieu-toan-lop-${grade}-${seed}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function openPdf() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html(true));
    w.document.close();
  }

  const chip = (active: boolean) =>
    `rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors ${
      active ? `${theme.solid} border-transparent text-white` : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
    }`;

  const first = versions[0]?.rows ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-7 space-y-5">
        <div>
          <p className="text-sm font-bold text-gray-700 mb-2">Lớp</p>
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => (
              <button key={g} onClick={() => pickGrade(g)} className={chip(g === grade)}>Lớp {g}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-gray-700 mb-2">Chủ đề <span className="font-normal text-gray-400">(chọn một hoặc nhiều)</span></p>
          <div className="grid sm:grid-cols-2 gap-2">
            {topicsOf(grade).map((t) => {
              const on = topicIds.includes(t.id);
              return (
                <label key={t.id} className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer ${on ? `${theme.soft} ${theme.border}` : "border-gray-200 hover:bg-gray-50"}`}>
                  <input type="checkbox" checked={on} onChange={() => toggleTopic(t.id)} className="mt-0.5" />
                  <span className="text-gray-700">{t.title}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Số câu mỗi đề</p>
            <div className="flex flex-wrap gap-2">
              {COUNTS.map((c) => <button key={c} onClick={() => setCount(c)} className={chip(c === count)}>{c}</button>)}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Số đề khác nhau</p>
            <div className="flex flex-wrap gap-2">
              {VERSIONS.map((v) => <button key={v} onClick={() => setVersionCount(v)} className={chip(v === versionCount)}>{v}</button>)}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Đáp án ở trang cuối</p>
            <select value={answers} onChange={(e) => setAnswers(e.target.value as AnswerMode)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700">
              {ANSWER_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button onClick={() => setSeed(newSeed())}
            className="rounded-2xl bg-yellow-400 px-5 py-2.5 text-sm font-bold text-gray-900 shadow hover:bg-yellow-300">
            {seed ? "🔄 Đổi bộ câu khác" : "Tạo phiếu"}
          </button>
          {seed && versions.length > 0 && (
            <>
              <button onClick={downloadDoc}
                className="rounded-2xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50">
                Tải Word (.doc)
              </button>
              <button onClick={openPdf}
                className="rounded-2xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50">
                In / lưu PDF
              </button>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400">
          Câu hỏi do máy tính sinh và tính đáp án, mỗi lần bấm ra một bộ mới. Mỗi đề nằm trên một trang riêng, đáp án ở trang cuối.
        </p>
      </div>

      {first.length > 0 && (
        <div className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-7">
          <h2 className="font-extrabold text-gray-800">
            Xem trước{versionCount > 1 ? " – Đề 1" : ""} <span className="text-sm font-normal text-gray-400">({first.length} câu)</span>
          </h2>
          <ol className="mt-3 space-y-3 text-sm text-gray-700">
            {[...first.filter((r) => r.type === "mcq"), ...first.filter((r) => r.type !== "mcq")].map((r, i) => (
              <li key={i} className="border-b border-gray-50 pb-2">
                <span className="font-semibold">{i + 1}.</span> {r.content}
                {r.options.length > 0 && (
                  <span className="ml-4 flex flex-wrap gap-x-6 text-gray-500">
                    {r.options.map((o, k) => <span key={k}>{"ABCDEF"[k]}. {o}</span>)}
                  </span>
                )}
                <span className="block ml-4 text-emerald-600">→ {answerText(r)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
