"use client";

import { useMemo, useState } from "react";
import { MATH_LESSONS, buildWorksheetQuestions, type MathGrade, type MathLessonSpec } from "@/lib/mathGen";
import { TV_SHEET_LESSONS } from "@/lib/tvSheet";
import { buildWorksheetHtml, answerText, type AnswerMode, type WorksheetVersion } from "@/lib/worksheetExport";
import { buildWordDoc } from "@/lib/wordDoc";
import { latexToPlain } from "@/lib/exportLesson";
import type { GenQuestionRow } from "@/lib/mathGen";
import {
  BookOpen, Calculator, Check, Clock, Download, Eye, Hash, Library, MessageSquare, PieChart, Plus, Printer, Quote,
  RefreshCw, Ruler, Scale, Shapes, SpellCheck, Type, X,
  type LucideIcon,
} from "lucide-react";
import { gradeTheme } from "@/lib/gradeTheme";
import { track } from "@/lib/usage";

export type WorksheetSubject = "toan" | "tieng-viet";

const SUBJECTS: Record<WorksheetSubject, { name: string; slug: string; lessons: MathLessonSpec[]; note: string }> = {
  toan: {
    name: "Toán", slug: "toan", lessons: MATH_LESSONS,
    note: "Câu hỏi do máy tính sinh và tính đáp án, mỗi lần bấm ra một bộ mới.",
  },
  "tieng-viet": {
    name: "Tiếng Việt", slug: "tieng-viet", lessons: TV_SHEET_LESSONS,
    note: "Câu hỏi lấy từ kho từ ngữ, câu văn soạn sẵn theo chương trình lớp 2, lớp 3; máy trộn ngẫu nhiên nên mỗi lần bấm ra một bộ mới. Toàn bộ là câu trắc nghiệm.",
  },
};

const gradesOf = (lessons: MathLessonSpec[]) => [...new Set(lessons.map((l) => l.grade))].sort((a, b) => a - b) as MathGrade[];
const COUNTS = [10, 15, 20];
const VERSIONS = [1, 2, 3, 4];
const ANSWER_MODES: { value: AnswerMode; label: string }[] = [
  { value: "solutions", label: "Đáp án + lời giải" },
  { value: "key", label: "Chỉ đáp án" },
  { value: "none", label: "Không kèm" },
];

const newSeed = () => Math.random().toString(36).slice(2, 8);

export default function WorksheetClient({ subject = "toan" }: { subject?: WorksheetSubject }) {
  const S = SUBJECTS[subject];
  const GRADES = gradesOf(S.lessons);
  const topicsOf = (g: MathGrade) => S.lessons.filter((l) => l.grade === g);
  const [grade, setGrade] = useState<MathGrade>(GRADES[0]);
  const [topicIds, setTopicIds] = useState<string[]>([topicsOf(GRADES[0])[0].id]);
  const [count, setCount] = useState(10);
  const [versionCount, setVersionCount] = useState(1);
  const [answers, setAnswers] = useState<AnswerMode>("solutions");
  // Câu hỏi chỉ sinh sau khi bấm (sinh lúc render sẽ lệch giữa server và trình duyệt).
  const [seed, setSeed] = useState<string | null>(null);

  const specs = useMemo(() => S.lessons.filter((t) => t.grade === grade && topicIds.includes(t.id)), [S, grade, topicIds]);

  const versions: WorksheetVersion[] = useMemo(() => {
    if (!seed || specs.length === 0) return [];
    return Array.from({ length: versionCount }, (_, i) => ({
      label: versionCount > 1 ? `Đề ${i + 1}` : "",
      rows: buildWorksheetQuestions(specs, count, `${seed}|${i}`),
    }));
  }, [seed, specs, count, versionCount]);

  const title = `Phiếu bài tập ${S.name} lớp ${grade}`;
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

  async function downloadDoc() {
    track("worksheet_word", { grade, detail: topicIds.join(",") });
    // Mặt đồng hồ là SVG — Word chỉ hiện khi đã vẽ lại thành PNG và nhúng vào file.
    const blob = await buildWordDoc(html(false));
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phieu-${S.slug}-lop-${grade}-${seed}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function openPdf() {
    track("worksheet_print", { grade, detail: topicIds.join(",") });
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html(true));
    w.document.close();
  }

  const chip = (active: boolean) =>
    `min-h-10 rounded-xl border-2 px-4 py-1.5 text-sm font-bold transition-colors ${
      active ? "border-primary-500 bg-primary-50 text-primary-700" : "border-slate-200 bg-white text-slate-600 hover:border-primary-200"
    }`;

  const first = versions[0]?.rows ?? [];
  // Trước khi bấm "Tạo phiếu": xem trước một mẫu cố định (cùng seed ở server và trình
  // duyệt nên không lệch hydration). Sau khi tạo: xem trước đúng Đề 1 sẽ tải về.
  const sample = useMemo(() => (seed ? [] : buildWorksheetQuestions(specs, count, "xem-truoc")), [seed, specs, count]);
  const previewRows = first.length > 0 ? first : sample;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
          <Step n={1} title="Chọn lớp">
            <div className="flex flex-wrap gap-2">
              {GRADES.map((g) => (
                <button key={g} onClick={() => pickGrade(g)} aria-pressed={g === grade} className={chip(g === grade)}>Lớp {g}</button>
              ))}
            </div>
          </Step>

          <Step n={2} title="Chọn chủ đề" hint="chọn một hoặc nhiều">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {topicsOf(grade).map((t) => {
                const on = topicIds.includes(t.id);
                const Icon = subject === "tieng-viet" ? tvTopicIcon(t.title) : topicIcon(t.title);
                return (
                  <label
                    key={t.id}
                    className={`relative flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-3 text-sm transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-400 ${
                      on ? "border-primary-500 bg-primary-50/60 shadow-sm" : "border-slate-200 bg-white hover:border-primary-200"
                    }`}
                  >
                    <input type="checkbox" checked={on} onChange={() => toggleTopic(t.id)} className="sr-only" />
                    <span
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${
                        on ? "bg-primary-600 text-white" : `${theme.soft} ${theme.text}`
                      }`}
                      aria-hidden
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className={`flex-1 pr-5 font-semibold leading-snug ${on ? "text-slate-900" : "text-slate-700"}`}>{t.title}</span>
                    <span
                      className={`absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        on ? "border-primary-600 bg-primary-600 text-white" : "border-slate-300 bg-white"
                      }`}
                      aria-hidden
                    >
                      {on && <Check className="h-3 w-3" strokeWidth={3.5} />}
                    </span>
                  </label>
                );
              })}
            </div>
          </Step>

          <Step n={3} title="Tuỳ chọn phiếu">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="mb-2 text-xs font-bold text-slate-500">Số câu mỗi đề</p>
                <div className="flex flex-wrap gap-2">
                  {COUNTS.map((c) => <button key={c} onClick={() => setCount(c)} aria-pressed={c === count} className={chip(c === count)}>{c}</button>)}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold text-slate-500">Số đề khác nhau</p>
                <div className="flex flex-wrap gap-2">
                  {VERSIONS.map((v) => <button key={v} onClick={() => setVersionCount(v)} aria-pressed={v === versionCount} className={chip(v === versionCount)}>{v}</button>)}
                </div>
              </div>
              <div>
                <label htmlFor="ws-answers" className="mb-2 block text-xs font-bold text-slate-500">Đáp án ở trang cuối</label>
                <select id="ws-answers" value={answers} onChange={(e) => setAnswers(e.target.value as AnswerMode)}
                  className="min-h-10 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 focus:border-primary-500 focus:outline-none">
                  {ANSWER_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>
          </Step>

          <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-5 sm:flex-row sm:flex-wrap sm:items-center">
            <button onClick={() => setSeed(newSeed())}
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-base font-extrabold transition-all active:translate-y-0.5 ${
                seed
                  ? "border-2 border-slate-200 bg-white text-slate-700 hover:border-primary-300"
                  : "border-b-4 border-primary-800 bg-primary-600 text-white shadow-pop hover:bg-primary-700 active:border-b-2"
              }`}>
              {seed ? <RefreshCw className="h-5 w-5" aria-hidden /> : <Printer className="h-5 w-5" aria-hidden />}
              {seed ? "Đổi bộ câu khác" : "Tạo phiếu"}
            </button>
            {seed && versions.length > 0 && (
              <>
                <button onClick={openPdf}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-b-4 border-primary-800 bg-primary-600 px-5 text-sm font-extrabold text-white shadow-pop transition-all hover:bg-primary-700 active:translate-y-0.5 active:border-b-2">
                  <Printer className="h-4 w-4" aria-hidden />
                  In / lưu PDF
                </button>
                <button onClick={downloadDoc}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-primary-200 bg-white px-5 text-sm font-bold text-primary-700 hover:bg-primary-50">
                  <Download className="h-4 w-4" aria-hidden />
                  Tải Word (.doc)
                </button>
              </>
            )}
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            {S.note} Mỗi đề nằm trên một trang riêng, đáp án ở trang cuối.
          </p>
        </div>

        <MiniPreview
          rows={previewRows}
          title={title}
          topics={specs.map((s) => s.title)}
          label={seed ? `Đề 1 sẽ tải về${versionCount > 1 ? ` (trong ${versionCount} đề)` : ""}` : "Mẫu phiếu — bấm Tạo phiếu để ra bộ câu mới"}
        />
      </div>

      {first.length > 0 && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
          <h2 className="font-extrabold text-slate-900">
            Danh sách câu và đáp án{versionCount > 1 ? " – Đề 1" : ""} <span className="text-sm font-normal text-slate-500">({first.length} câu)</span>
          </h2>
          <ol className="mt-3 space-y-3 text-sm text-slate-700">
            {[...first.filter((r) => r.type === "mcq"), ...first.filter((r) => r.type !== "mcq")].map((r, i) => (
              <li key={i} className="border-b border-slate-100 pb-2">
                <span className="font-bold">{i + 1}.</span> {r.content}
                {r.options.length > 0 && (
                  <span className="ml-4 flex flex-wrap gap-x-6 text-slate-500">
                    {r.options.map((o, k) => <span key={k}>{"ABCDEF"[k]}. {o}</span>)}
                  </span>
                )}
                <span className="ml-4 block font-semibold text-success-700">→ {answerText(r)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-slate-900">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-black text-primary-700" aria-hidden>{n}</span>
        {title}
        {hint && <span className="text-sm font-normal text-slate-400">({hint})</span>}
      </h2>
      {children}
    </section>
  );
}

/** Biểu tượng cho thẻ chủ đề, đoán theo tên chủ đề. */
function topicIcon(title: string): LucideIcon {
  const t = title.toLowerCase();
  if (/giờ|đồng hồ|thời gian|ngày|tháng|năm|chuyển động/.test(t)) return Clock;
  if (/phân số|hỗn số|phần trăm/.test(t)) return PieChart;
  if (/thập phân/.test(t)) return Hash;
  if (/hình|chu vi|diện tích|thể tích/.test(t)) return Shapes;
  if (/độ dài|đơn vị|ki-lô-gam|mét|yến|tạ|tấn|lít|gam/.test(t)) return Ruler;
  if (/lời văn|tổng và hiệu|trung bình/.test(t)) return BookOpen;
  if (/nhân|chia|gấp/.test(t)) return X;
  if (/cộng|trừ/.test(t)) return Plus;
  return Calculator;
}

/** Biểu tượng cho thẻ chủ đề Tiếng Việt. */
function tvTopicIcon(title: string): LucideIcon {
  const t = title.toLowerCase();
  if (/chính tả/.test(t)) return SpellCheck;
  if (/dấu/.test(t)) return Quote;
  if (/viết hoa|chữ cái/.test(t)) return Type;
  if (/so sánh|giống nhau|trái ngược/.test(t)) return Scale;
  if (/khi nào/.test(t)) return Clock;
  if (/câu/.test(t)) return MessageSquare;
  if (/vốn từ/.test(t)) return Library;
  return BookOpen;
}

/**
 * Góc trên của tờ A4 thu nhỏ: dòng họ tên, tiêu đề, vài câu Phần 1 / Phần 2 — để phụ
 * huynh hình dung tờ phiếu trước khi tải. Chỉ minh hoạ; bản in thật do worksheetExport dựng.
 */
function MiniPreview({ rows, title, topics, label }: { rows: GenQuestionRow[]; title: string; topics: string[]; label: string }) {
  const mcq = rows.filter((r) => r.type === "mcq").slice(0, 3);
  const open = rows.filter((r) => r.type !== "mcq").slice(0, 2);
  return (
    <aside className="lg:sticky lg:top-20">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-slate-700">
        <Eye className="h-4 w-4 text-primary-500" aria-hidden />
        Xem trước mẫu phiếu
      </p>
      <div className="relative rotate-[0.6deg] rounded-sm bg-white p-1 shadow-[0_2px_4px_rgba(15,23,42,0.06),0_18px_40px_-18px_rgba(15,23,42,0.35)] ring-1 ring-slate-200">
        {/* Tỉ lệ A4 (210 × 297), chỉ hiện nửa trên rồi mờ dần */}
        <div className="relative aspect-[210/180] overflow-hidden px-4 pt-4 font-serif text-[9px] leading-[1.5] text-slate-800 sm:text-[10px]">
          <div className="flex justify-between gap-2 text-slate-600">
            <span>Họ và tên: ……………………</span>
            <span>Lớp: ……</span>
          </div>
          <p className="mt-2 text-center text-[11px] font-bold uppercase tracking-wide sm:text-xs">{title}</p>
          {topics.length > 0 && <p className="text-center italic text-slate-500 line-clamp-1">{topics.join("; ")}</p>}
          {mcq.length > 0 && (
            <>
              <p className="mt-2 font-bold">Phần 1. Trắc nghiệm</p>
              {mcq.map((r, i) => (
                <div key={i} className="mt-0.5">
                  <p className="line-clamp-2"><b>Câu {i + 1}.</b> {latexToPlain(r.content)}</p>
                  <p className="flex flex-wrap gap-x-3 pl-3 text-slate-600">
                    {r.options.slice(0, 4).map((o, k) => <span key={k}>{"ABCD"[k]}. {latexToPlain(o)}</span>)}
                  </p>
                </div>
              ))}
            </>
          )}
          {open.length > 0 && (
            <>
              <p className="mt-2 font-bold">Phần 2. Tự luận</p>
              {open.map((r, i) => (
                <div key={i} className="mt-0.5">
                  <p className="line-clamp-2"><b>Câu {mcq.length + i + 1}.</b> {latexToPlain(r.content).replace(/___/g, "……")}</p>
                  <p className="pl-3 text-slate-400">Trả lời: ……………………………</p>
                </div>
              ))}
            </>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" aria-hidden />
        </div>
        {/* Góc giấy gập */}
        <span className="absolute right-0 top-0 h-5 w-5 bg-gradient-to-bl from-slate-200 to-white shadow-sm [clip-path:polygon(0_0,100%_100%,0_100%)]" aria-hidden />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">{label}</p>
    </aside>
  );
}
