import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { getAllExams, type ExamListItem } from "@/lib/db";

// Live exam list — read from the DB on each request rather than freezing it
// into a static page at build time (which also needs Supabase env at build).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đề kiểm tra tiểu học lớp 1-5",
  description:
    "Kho đề kiểm tra tiểu học lớp 1 đến lớp 5 theo môn và theo chương. Làm bài trực tuyến miễn phí, chấm điểm ngay và xem lời giải từng câu.",
  alternates: { canonical: "/de-thi" },
  openGraph: {
    title: "Đề kiểm tra tiểu học lớp 1-5",
    description:
      "Kho đề kiểm tra tiểu học lớp 1 đến lớp 5 theo môn và theo chương. Làm bài trực tuyến miễn phí, chấm điểm ngay.",
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

const GRADE_COLOR: Record<number, { badge: string; ring: string }> = {
  1: { badge: "bg-rose-100 text-rose-700", ring: "ring-rose-100" },
  2: { badge: "bg-orange-100 text-orange-700", ring: "ring-orange-100" },
  3: { badge: "bg-emerald-100 text-emerald-700", ring: "ring-emerald-100" },
  4: { badge: "bg-blue-100 text-blue-700", ring: "ring-blue-100" },
  5: { badge: "bg-violet-100 text-violet-700", ring: "ring-violet-100" },
};

const GRADE_SURFACE: Record<number, string> = {
  1: "from-blue-50 to-orange-50/40",
  2: "from-blue-50 to-orange-50/50",
  3: "from-blue-50 to-orange-50/30",
  4: "from-blue-50 to-orange-50/40",
  5: "from-blue-50 to-orange-50/50",
};

export default async function ExamListPage() {
  const exams = await getAllExams();
  const groups = groupByGrade(exams);
  const grades = [...groups.keys()].sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-900/30" />
        <div className="relative max-w-5xl mx-auto px-4 py-10 sm:py-14 text-center">
          <span className="mb-3 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50">
            Kho đề luyện tập theo lớp
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight">Đề kiểm tra</h1>
          <p className="mb-5 text-sm text-blue-100 sm:text-base">
            Chọn đề để xem chi tiết · {exams.length} đề
          </p>
          <Link
            href="/import/exam"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-yellow-400 px-6 py-3 text-sm font-bold text-gray-900 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-yellow-400/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tạo đề mới
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {exams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            <p className="text-4xl mb-3">📝</p>
            <p className="font-medium text-gray-500">Chưa có đề kiểm tra nào</p>
            <p className="text-xs text-gray-400 mt-1">Bấm “Tạo đề mới” ở trên để bắt đầu.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {grades.map((g) => {
              const items = groups.get(g)!;
              const color = GRADE_COLOR[g] ?? GRADE_COLOR[1];
              const surface = GRADE_SURFACE[g] ?? GRADE_SURFACE[1];
              return (
                <section key={g} className={`rounded-3xl border border-blue-100/80 bg-gradient-to-br ${surface} p-4 sm:p-5`}>
                  <div className="mb-4 flex items-baseline justify-between">
                    <h2 className="text-base font-bold text-slate-700">
                      Lớp {g || "?"}
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        ({items.length} đề)
                      </span>
                    </h2>
                    {g > 0 && (
                      <Link
                        href={`/lop/${g}?view=exam`}
                        className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-orange-50 hover:text-orange-700"
                      >
                        Xem theo môn
                        <span>→</span>
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {items.map((exam) => (
                      <Link
                        key={exam.id}
                        href={`/quiz?lessonId=${exam.id}`}
                        className={`group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md ring-2 ring-transparent hover:${color.ring}`}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${color.badge}`}>
                            Lớp {g}
                          </span>
                          {exam.subjectName && (
                            <span className="text-[11px] rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">{exam.subjectName}</span>
                          )}
                        </div>
                        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-blue-700">
                          {exam.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {exam.questionCount} câu
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="9" />
                              <path strokeLinecap="round" d="M12 7v5l3 2" />
                            </svg>
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
