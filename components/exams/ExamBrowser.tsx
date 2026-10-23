"use client";

// Kho đề kiểm tra (/de-thi): lọc theo lớp (nút chọn), môn (danh sách lấy từ chính các đề
// đang có) và tên đề. Lọc ngay trên trình duyệt — server đã gửi đủ danh sách — và ghi
// bộ lọc vào URL (?lop=&mon=&q=) để gửi link cho người khác vẫn mở đúng chỗ. Server đọc
// cùng tham số đó cho lần hiển thị đầu, nên không lệch khi hydrate.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, ListChecks, Search, SearchX, Sparkles, X } from "lucide-react";
import type { ExamListItem } from "@/lib/db";
import { gradeTheme } from "@/lib/gradeTheme";
import { GRADES, getSubjects } from "@/lib/subjects";

interface Props {
  exams: ExamListItem[];
  /** Lớp → các môn "Tạo đề nhanh" tạo được ngay. */
  quickSubjects: Record<number, string[]>;
  initial: { grade: number; subject: string; query: string };
}

/** Nhãn môn: nền nhạt + chữ đậm màu. Môn không có trong bảng dùng màu xám. */
const SUBJECT_STYLE: Record<string, string> = {
  "Toán": "bg-blue-50 text-blue-700",
  "Tiếng Việt": "bg-coral-50 text-coral-700",
  "Ngữ văn": "bg-coral-50 text-coral-700",
  "Tiếng Anh": "bg-violet-50 text-violet-700",
  "Khoa học tự nhiên": "bg-emerald-50 text-emerald-700",
  "Khoa học": "bg-emerald-50 text-emerald-700",
  "Lịch sử và Địa lí": "bg-amber-50 text-amber-700",
  "Tin học": "bg-cyan-50 text-cyan-700",
};
const subjectStyle = (s: string) => SUBJECT_STYLE[s] ?? "bg-slate-100 text-slate-600";

/** Thứ tự môn như trong chương trình (lib/subjects.ts), không theo bảng chữ cái. */
const SUBJECT_ORDER = [...new Set(GRADES.flatMap((g) => getSubjects(g)))];
const bySubjectOrder = (a: string, b: string) => {
  const ia = SUBJECT_ORDER.indexOf(a), ib = SUBJECT_ORDER.indexOf(b);
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b, "vi");
};

/** Bỏ dấu, chữ thường: gõ "de toan" vẫn ra "Đề Toán". */
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().trim();

export default function ExamBrowser({ exams, quickSubjects, initial }: Props) {
  const [grade, setGrade] = useState(initial.grade);
  const [subject, setSubject] = useState(initial.subject);
  const [query, setQuery] = useState(initial.query);
  const pills = useRef<HTMLDivElement>(null);

  // Trên điện thoại hàng nút lớp cuộn ngang: đưa nút đang chọn vào tầm nhìn (mở từ link ?lop=8).
  // Chỉnh scrollLeft của chính hàng nút, không dùng scrollIntoView vì nó cuộn cả trang.
  useEffect(() => {
    const row = pills.current;
    const on = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !on) return;
    if (on.offsetLeft + on.offsetWidth > row.scrollLeft + row.clientWidth || on.offsetLeft < row.scrollLeft) {
      row.scrollLeft = on.offsetLeft - row.clientWidth / 2 + on.offsetWidth / 2;
    }
  }, [grade]);

  const grades = useMemo(() => {
    const set = new Set(exams.map((e) => e.grade).filter((g) => g > 0));
    if (grade) set.add(grade); // lớp lấy từ link nhưng chưa có đề: vẫn hiện nút đang chọn
    return [...set].sort((a, b) => a - b);
  }, [exams, grade]);

  const subjects = useMemo(
    () => [...new Set(exams.filter((e) => !grade || e.grade === grade).map((e) => e.subjectName).filter(Boolean))].sort(bySubjectOrder),
    [exams, grade],
  );
  // Môn đang chọn không có ở lớp mới chọn thì coi như "Tất cả môn".
  const activeSubject = subjects.includes(subject) ? subject : "";

  const shown = useMemo(() => {
    const q = fold(query);
    return exams.filter((e) =>
      (!grade || e.grade === grade) &&
      (!activeSubject || e.subjectName === activeSubject) &&
      (!q || fold(`${e.title} ${e.subjectName} lớp ${e.grade}`).includes(q)));
  }, [exams, grade, activeSubject, query]);

  const groups = useMemo(() => {
    const m = new Map<number, ExamListItem[]>();
    for (const e of shown) m.set(e.grade, [...(m.get(e.grade) ?? []), e]);
    return [...m.entries()].sort((a, b) => (a[0] || 99) - (b[0] || 99));
  }, [shown]);

  const sync = (next: { grade?: number; subject?: string; query?: string }) => {
    const g = next.grade ?? grade, s = next.subject ?? activeSubject, q = next.query ?? query;
    const p = new URLSearchParams();
    if (g) p.set("lop", String(g));
    if (s) p.set("mon", s);
    if (q.trim()) p.set("q", q.trim());
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `/de-thi?${qs}` : "/de-thi");
  };
  const pickGrade = (g: number) => { setGrade(g); sync({ grade: g }); };
  const pickSubject = (s: string) => { setSubject(s); sync({ subject: s }); };
  const typeQuery = (q: string) => { setQuery(q); sync({ query: q }); };
  const reset = () => { setGrade(0); setSubject(""); setQuery(""); sync({ grade: 0, subject: "", query: "" }); };

  const filtered = !!grade || !!activeSubject || !!query.trim();

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-br from-primary-50 via-white to-amber-50/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:py-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Kho đề kiểm tra</h1>
            <p className="mt-2 leading-relaxed text-slate-600">
              Đề soạn sẵn theo lớp và môn. Bé làm bài ngay trên máy, có điểm liền và xem lại đáp án từng câu.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Đang có <b className="tabular-nums text-slate-700">{exams.length}</b> đề · miễn phí, không cần đăng nhập
            </p>
          </div>
          <Link
            href="/tao-de"
            className="group flex items-center gap-3 rounded-2xl border-2 border-primary-200 bg-white p-4 shadow-soft transition-all hover:border-primary-300 hover:shadow-pop motion-safe:hover:-translate-y-0.5 lg:max-w-sm"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700" aria-hidden>
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-extrabold text-slate-900">Tạo đề nhanh</span>
              <span className="block text-sm text-slate-500">Đề giữa kì, cuối kì Toán, Tiếng Việt lớp 1–5, Tiếng Anh lớp 3–5 — in hoặc làm trên máy</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-primary-600 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {/* Bộ lọc */}
        <div className="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-soft sm:p-4">
          <div ref={pills} className="relative -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Chọn lớp">
            {[0, ...grades].map((g) => {
              const on = g === grade;
              return (
                <button
                  key={g}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pickGrade(g)}
                  className={`min-h-10 shrink-0 rounded-full border-2 px-4 text-sm font-bold transition-colors ${
                    on ? "border-primary-500 bg-primary-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-primary-200 hover:text-primary-700"
                  }`}
                >
                  {g ? `Lớp ${g}` : "Tất cả"}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="exam-subject">Môn học</label>
            <select
              id="exam-subject"
              value={activeSubject}
              onChange={(e) => pickSubject(e.target.value)}
              className="min-h-11 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 focus:border-primary-400 focus:outline-none sm:w-56"
            >
              <option value="">Tất cả môn</option>
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <label className="sr-only" htmlFor="exam-search">Tìm theo tên đề</label>
              <input
                id="exam-search"
                type="search"
                value={query}
                onChange={(e) => typeQuery(e.target.value)}
                placeholder="Tìm theo tên đề, ví dụ: cuối kì 1"
                className="min-h-11 w-full rounded-xl border-2 border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none"
              />
            </div>
          </div>
          {filtered && (
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-slate-500"><b className="tabular-nums text-slate-700">{shown.length}</b> đề phù hợp</span>
              <button type="button" onClick={reset} className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:text-primary-800">
                <X className="h-4 w-4" aria-hidden />
                Bỏ lọc
              </button>
            </div>
          )}
        </div>

        {shown.length === 0 ? (
          <EmptyState
            grade={grade}
            subject={activeSubject || subject}
            query={query.trim()}
            quick={grade ? quickSubjects[grade] ?? [] : []}
            hasAny={exams.length > 0}
            onReset={reset}
          />
        ) : (
          <div className="space-y-10">
            {groups.map(([g, items]) => {
              const theme = gradeTheme(g);
              return (
                <section key={g} aria-labelledby={`lop-${g}`}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 id={`lop-${g}`} className="flex items-center gap-2.5 text-lg font-extrabold text-slate-900">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black tabular-nums ${theme.soft} ${theme.text}`} aria-hidden>
                        {g || "?"}
                      </span>
                      {g ? `Lớp ${g}` : "Chưa rõ lớp"}
                      <span className="text-sm font-semibold text-slate-400">{items.length} đề</span>
                    </h2>
                    {g > 0 && (
                      <Link href={`/lop/${g}?view=exam`} className="text-sm font-semibold text-primary-700 hover:text-primary-800">
                        Xem theo chương
                      </Link>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((e) => <ExamCard key={e.id} exam={e} />)}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function ExamCard({ exam }: { exam: ExamListItem }) {
  return (
    <Link
      href={`/quiz?lessonId=${exam.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition-all hover:border-primary-200 hover:shadow-pop motion-safe:hover:-translate-y-1"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {exam.subjectName && (
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${subjectStyle(exam.subjectName)}`}>{exam.subjectName}</span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {exam.durationMinutes} phút
        </span>
      </div>
      <h3 className="mb-3 line-clamp-2 text-lg font-bold leading-snug text-slate-800">{exam.title}</h3>
      <p className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500">
        <ListChecks className="h-4 w-4" aria-hidden />
        {exam.questionCount} câu hỏi
      </p>
      <span className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-b-4 border-primary-800 bg-primary-600 px-4 text-sm font-extrabold text-white transition-colors group-hover:bg-primary-700">
        Làm bài
        <ArrowRight className="h-4 w-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
      </span>
    </Link>
  );
}

function EmptyState({ grade, subject, query, quick, hasAny, onReset }: {
  grade: number; subject: string; query: string; quick: string[]; hasAny: boolean; onReset: () => void;
}) {
  // Có thể tạo đề ngay cho đúng môn đang lọc (hoặc môn đầu tiên tạo được của lớp đó).
  const quickSubject = subject ? (quick.includes(subject) ? subject : null) : quick[0] ?? null;
  const where = [subject, grade ? `lớp ${grade}` : ""].filter(Boolean).join(" ");
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400" aria-hidden>
        {query ? <SearchX className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
      </span>
      <p className="font-bold text-slate-700">
        {query ? `Không tìm thấy đề nào khớp “${query}”${where ? ` trong ${where}` : ""}.`
          : hasAny ? `Kho chưa có đề ${where} soạn sẵn.` : "Kho chưa có đề soạn sẵn."}
      </p>
      {quickSubject && grade > 0 && (
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
          Máy tạo được đề {quickSubject} lớp {grade} ngay bây giờ — chọn giữa kì hay cuối kì, làm trên máy hoặc in ra giấy.
        </p>
      )}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {quickSubject && grade > 0 ? (
          <Link
            href={`/tao-de?lop=${grade}&mon=${encodeURIComponent(quickSubject)}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border-b-4 border-primary-800 bg-primary-600 px-5 text-sm font-extrabold text-white hover:bg-primary-700"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Tạo đề {quickSubject} lớp {grade}
          </Link>
        ) : (
          <Link
            href="/tao-de"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border-b-4 border-primary-800 bg-primary-600 px-5 text-sm font-extrabold text-white hover:bg-primary-700"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Tạo đề nhanh
          </Link>
        )}
        {hasAny && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-11 items-center rounded-xl border-2 border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:border-primary-200 hover:text-primary-700"
          >
            Xem tất cả đề
          </button>
        )}
      </div>
    </div>
  );
}
