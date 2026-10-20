"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Download, ListChecks, MonitorPlay, Printer, RefreshCw, Sparkles } from "lucide-react";
import { SCHOOL_LEVELS, getSubjects } from "@/lib/subjects";
import { EXAM_KINDS, getQuickExam, hasQuickExam, quickExamHref, type ExamKind } from "@/lib/quickExam";
import { answerText, type AnswerMode } from "@/lib/worksheetExport";
import { paperRows } from "@/lib/exam5/paper";
import { buildPaperHtml, schoolYearOf } from "@/lib/exam5/print";
import { gradeTheme } from "@/lib/gradeTheme";
import { track } from "@/lib/usage";
import MathText from "@/components/MathText";

const ANSWER_MODES: { value: AnswerMode; label: string }[] = [
  { value: "solutions", label: "Đáp án + lời giải" },
  { value: "key", label: "Chỉ đáp án" },
  { value: "none", label: "Không kèm" },
];

const newSeed = () => Math.random().toString(36).slice(2, 8);

interface Props {
  initialGrade: number;
  initialKind: ExamKind;
  initialSubject: string;
}

export default function QuickExamClient({ initialGrade, initialKind, initialSubject }: Props) {
  const [grade, setGrade] = useState(initialGrade);
  const [kind, setKind] = useState<ExamKind>(initialKind);
  const [subject, setSubject] = useState(initialSubject);
  const [answers, setAnswers] = useState<AnswerMode>("solutions");
  // Câu hỏi chỉ sinh sau khi bấm "Tạo đề" (sinh lúc render sẽ lệch giữa server và trình duyệt).
  const [seed, setSeed] = useState<string | null>(null);

  const spec = useMemo(() => getQuickExam(grade, subject, kind), [grade, subject, kind]);
  const paper = useMemo(() => (spec && seed ? spec.paper(seed) : null), [spec, seed]);
  const rows = useMemo(() => (paper ? paperRows(paper) : []), [paper]);
  const theme = gradeTheme(grade);

  // Đổi lựa chọn nào cũng bỏ đề cũ — tránh in nhầm đề lớp khác với tiêu đề lớp mới.
  function pickGrade(g: number) {
    setGrade(g);
    if (!getSubjects(g).includes(subject)) setSubject(getSubjects(g)[0]);
    setSeed(null);
  }
  function pickKind(k: ExamKind) { setKind(k); setSeed(null); }
  function pickSubject(s: string) { setSubject(s); setSeed(null); }

  function html(o: { autoPrint?: boolean; forWord?: boolean; imageFor?: (url: string) => string }) {
    return buildPaperHtml(paper!, { answers, schoolYear: schoolYearOf(new Date()), ...o });
  }

  async function downloadDoc() {
    track("quick_exam_word", { grade, detail: `${subject} · ${kind}` });
    // Word không hiện ảnh SVG nhúng — đổi hình vẽ sang PNG trước khi ghi file.
    const svgs = [...new Set(paper!.sections.flatMap((s) => s.items).flatMap((it) => ("parts" in it ? it.parts : [it]))
      .flatMap((q) => { try { return (JSON.parse(q.row.explanation).images ?? []).map((i: { url: string }) => i.url); } catch { return []; } })
      .filter((u: string) => u.startsWith("data:image/svg")))];
    const png = new Map<string, string>();
    await Promise.all(svgs.map(async (u) => png.set(u, await svgToPng(u))));
    const blob = new Blob([html({ forWord: true, imageFor: (u) => png.get(u) ?? u })], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${spec!.id}-${seed}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function openPdf() {
    track("quick_exam_print", { grade, detail: `${subject} · ${kind}` });
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html({ autoPrint: true }));
    w.document.close();
  }

  const chip = (active: boolean) =>
    `min-h-10 rounded-xl border-2 px-4 py-1.5 text-sm font-bold transition-colors ${
      active ? "border-primary-500 bg-primary-50 text-primary-700" : "border-slate-200 bg-white text-slate-600 hover:border-primary-200"
    }`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
        <Step n={1} title="Chọn lớp">
          <div className="space-y-2">
            {SCHOOL_LEVELS.map((lv) => (
              <div key={lv.key} className="flex flex-wrap items-center gap-2">
                <span className="w-16 text-xs font-bold text-slate-400">{lv.label === "Trung học cơ sở" ? "THCS" : lv.label}</span>
                {lv.grades.map((g) => (
                  <button key={g} onClick={() => pickGrade(g)} aria-pressed={g === grade} className={chip(g === grade)}>Lớp {g}</button>
                ))}
              </div>
            ))}
          </div>
        </Step>

        <Step n={2} title="Chọn loại đề">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {EXAM_KINDS.map((k) => (
              <button key={k.key} onClick={() => pickKind(k.key)} aria-pressed={k.key === kind} className={`${chip(k.key === kind)} py-2.5`}>
                {k.label}
              </button>
            ))}
          </div>
        </Step>

        <Step n={3} title="Chọn môn">
          <div className="flex flex-wrap gap-2">
            {getSubjects(grade).map((s) => {
              const ready = hasQuickExam(grade, s);
              return (
                <button key={s} onClick={() => pickSubject(s)} aria-pressed={s === subject} className={chip(s === subject)}>
                  {s}
                  {!ready && <span className="ml-1.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">Sắp có</span>}
                </button>
              );
            })}
          </div>
        </Step>

        {spec ? (
          <>
            <div className={`rounded-2xl border ${theme.border} ${theme.soft} p-4`}>
              <p className="font-extrabold text-slate-900">{spec.title}</p>
              <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1"><ListChecks className="h-4 w-4" aria-hidden />{spec.count} câu</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" aria-hidden />{spec.minutes} phút</span>
              </p>
              <p className="mt-2 text-xs font-bold text-slate-500">Nội dung kiểm tra</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-700">
                {spec.scope.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
              <button onClick={() => { setSeed(newSeed()); track("quick_exam_create", { grade, detail: `${subject} · ${kind}` }); }}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-base font-extrabold transition-all active:translate-y-0.5 ${
                  seed
                    ? "border-2 border-slate-200 bg-white text-slate-700 hover:border-primary-300"
                    : "border-b-4 border-primary-800 bg-primary-600 text-white shadow-pop hover:bg-primary-700 active:border-b-2"
                }`}>
                {seed ? <RefreshCw className="h-5 w-5" aria-hidden /> : <Sparkles className="h-5 w-5" aria-hidden />}
                {seed ? "Đổi đề khác" : "Tạo đề"}
              </button>
            </div>

            {seed && rows.length > 0 && (
              <div className="space-y-4 border-t border-slate-100 pt-5">
                <p className="text-sm font-bold text-success-700">Đã tạo xong đề {rows.length} câu. Bé muốn làm thế nào?</p>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  <Link href={quickExamHref(spec, seed)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-b-4 border-primary-800 bg-primary-600 px-5 text-sm font-extrabold text-white shadow-pop transition-all hover:bg-primary-700 active:translate-y-0.5 active:border-b-2">
                    <MonitorPlay className="h-4 w-4" aria-hidden />
                    Làm bài trên máy
                  </Link>
                  <button onClick={openPdf}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-primary-200 bg-white px-5 text-sm font-bold text-primary-700 hover:bg-primary-50">
                    <Printer className="h-4 w-4" aria-hidden />
                    In / lưu PDF
                  </button>
                  <button onClick={downloadDoc}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-primary-200 bg-white px-5 text-sm font-bold text-primary-700 hover:bg-primary-50">
                    <Download className="h-4 w-4" aria-hidden />
                    Tải Word (.doc)
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor="qe-answers" className="text-xs font-bold text-slate-500">Bản in kèm ở trang cuối:</label>
                  <select id="qe-answers" value={answers} onChange={(e) => setAnswers(e.target.value as AnswerMode)}
                    className="min-h-9 rounded-xl border-2 border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 focus:border-primary-500 focus:outline-none">
                    {ANSWER_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>

                {/* Đáp án gập lại: phụ huynh thường mở trang này ngay cạnh bé. */}
                <details className="rounded-2xl border border-slate-200 p-4">
                  <summary className="cursor-pointer text-sm font-extrabold text-slate-700">Xem đề và đáp án (dành cho phụ huynh)</summary>
                  <ol className="mt-3 space-y-3 text-sm text-slate-700">
                    {rows.map((r, i) => (
                      <li key={i} className="border-b border-slate-100 pb-2">
                        <span className="font-bold">{i + 1}.</span> <MathText text={r.content} />
                        {r.options.length > 0 && (
                          <span className="ml-4 flex flex-wrap gap-x-6 text-slate-500">
                            {r.options.map((o, k) => <span key={k}>{"ABCDEF"[k]}. <MathText text={o} /></span>)}
                          </span>
                        )}
                        <span className="ml-4 block font-semibold text-success-700">→ {answerText(r)}</span>
                      </li>
                    ))}
                  </ol>
                </details>
              </div>
            )}

            <p className="text-xs leading-relaxed text-slate-500">
              {spec.subject === "Tiếng Việt"
                ? "Bài đọc và câu hỏi do Ôn Tập Phổ Thông tự soạn theo chủ điểm sách giáo khoa; mỗi lần bấm chọn bài đọc, câu hỏi và đề văn khác. Câu viết và bài tập làm văn chấm trên giấy."
                : "Câu hỏi do máy tính sinh và tính đáp án, mỗi lần bấm ra một đề mới. Đề theo cấu trúc đề giấy (trắc nghiệm, tự luận, có hình vẽ) và thứ tự các chủ đề thường gặp trong sách giáo khoa; đề của trường có thể khác đôi chút."}
            </p>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
            <BookOpen className="mx-auto mb-2 h-6 w-6 text-slate-400" aria-hidden />
            <p className="font-bold text-slate-700">Môn {subject} lớp {grade} chưa có đề tạo tự động</p>
            <p className="mt-1 text-sm text-slate-500">
              Hiện máy tạo được đề Toán lớp 1–5 và Tiếng Việt lớp 5. Bạn có thể xem các đề {subject} lớp {grade} đã soạn sẵn.
            </p>
            <Link
              href={`/lop/${grade}?subject=${encodeURIComponent(subject)}&view=exam`}
              className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border-2 border-primary-200 bg-white px-4 text-sm font-bold text-primary-700 hover:bg-primary-50"
            >
              Xem đề {subject} lớp {grade}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-slate-900">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-black text-primary-700" aria-hidden>{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Vẽ ảnh SVG (data URI) lên canvas, trả về PNG data URI; lỗi thì trả lại SVG. */
function svgToPng(url: string): Promise<string> {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => {
      const k = 2;
      const c = document.createElement("canvas");
      c.width = im.naturalWidth * k;
      c.height = im.naturalHeight * k;
      const ctx = c.getContext("2d");
      if (!ctx) return resolve(url);
      ctx.scale(k, k);
      ctx.drawImage(im, 0, 0);
      resolve(c.toDataURL("image/png"));
    };
    im.onerror = () => resolve(url);
    im.src = url;
  });
}
