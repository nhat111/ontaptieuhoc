import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Clock, FileText, ListChecks, Plus } from "lucide-react";
import Header from "@/components/Header";
import { gradeTheme } from "@/lib/gradeTheme";
import { getAllExams, type ExamListItem } from "@/lib/db";

// Live exam list — read from the DB on each request rather than freezing it
// into a static page at build time (which also needs Supabase env at build).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đề kiểm tra lớp 1-9",
  description:
    "Kho đề kiểm tra tiểu học và THCS lớp 1 đến lớp 9 theo môn và theo chương. Làm bài trực tuyến miễn phí, chấm điểm ngay và xem lời giải từng câu.",
  alternates: { canonical: "/de-thi" },
  openGraph: {
    title: "Đề kiểm tra lớp 1-9",
    description:
      "Kho đề kiểm tra tiểu học và THCS lớp 1 đến lớp 9 theo môn và theo chương. Làm bài trực tuyến miễn phí, chấm điểm ngay.",
    url: "/de-thi",
  },
};

function groupByGrade(exams: ExamListItem[]): Map<number, ExamListItem[]> {
  const m = new Map<number, ExamListItem[]>();
  for (const e of exams) {
    const g = e.grade || 0;
    if (!m.has(g)) m.set(g, []);
    m.get(g)!.push(e);
  }
  return m;
}

export default async function ExamListPage() {
  const exams = await getAllExams();
  const groups = groupByGrade(exams);
  const grades = [...groups.keys()].sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto flex flex-wrap items-end justify-between gap-4 px-4 py-8 sm:py-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Đề kiểm tra</h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Kho đề luyện tập theo lớp · <span className="tabular-nums">{exams.length}</span> đề
            </p>
          </div>
          <Link
            href="/import/exam"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Tạo đề mới
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {exams.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
            <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-400" aria-hidden>
              <FileText className="h-5 w-5" />
            </span>
            <p className="font-medium text-slate-600">Chưa có đề kiểm tra nào</p>
            <p className="text-xs text-slate-400 mt-1">Bấm “Tạo đề mới” ở trên để bắt đầu.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {grades.map((g) => {
              const items = groups.get(g)!;
              const theme = gradeTheme(g);
              return (
                <section key={g}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2.5 text-base font-semibold text-slate-900">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold tabular-nums ${theme.soft} ${theme.text}`} aria-hidden>
                        {g || "?"}
                      </span>
                      Lớp {g || "?"}
                      <span className="text-sm font-normal text-slate-400">{items.length} đề</span>
                    </h2>
                    {g > 0 && (
                      <Link
                        href={`/lop/${g}?view=exam`}
                        className="inline-flex items-center gap-0.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Xem theo môn
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {items.map((exam) => (
                      <Link
                        key={exam.id}
                        href={`/quiz?lessonId=${exam.id}`}
                        className="group rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50/60"
                      >
                        {exam.subjectName && <p className="mb-1 text-xs font-medium text-slate-400">{exam.subjectName}</p>}
                        <h3 className="mb-3 line-clamp-2 text-sm font-semibold text-slate-900">{exam.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <ListChecks className="h-3.5 w-3.5" aria-hidden />
                            {exam.questionCount} câu
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" aria-hidden />
                            {exam.durationMinutes} phút
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
