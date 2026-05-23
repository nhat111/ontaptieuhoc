import Link from "next/link";
import Header from "@/components/Header";
import { getAllExams, type ExamListItem } from "@/lib/db";

// Live exam list — read from the DB on each request rather than freezing it
// into a static page at build time (which also needs Supabase env at build).
export const dynamic = "force-dynamic";

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

export default async function ExamListPage() {
  const exams = await getAllExams();
  const groups = groupByGrade(exams);
  const grades = [...groups.keys()].sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Đề kiểm tra</h1>
          <p className="text-blue-100 text-sm sm:text-base mb-5">
            Chọn đề để xem chi tiết · {exams.length} đề
          </p>
          <Link
            href="/import/exam"
            className="inline-flex items-center gap-1.5 bg-white text-blue-700 hover:bg-blue-50 font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors"
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
              return (
                <section key={g}>
                  <div className="flex items-baseline justify-between mb-3">
                    <h2 className="text-base font-bold text-gray-700">
                      Lớp {g || "?"}{" "}
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        ({items.length} đề)
                      </span>
                    </h2>
                    {g > 0 && (
                      <Link
                        href={`/lop/${g}?view=exam`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Xem theo môn →
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map((exam) => (
                      <Link
                        key={exam.id}
                        href={`/quiz?lessonId=${exam.id}`}
                        className={`group bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all p-4 ring-2 ring-transparent hover:${color.ring}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${color.badge}`}>
                            Lớp {g}
                          </span>
                          {exam.subjectName && (
                            <span className="text-[11px] text-gray-400">{exam.subjectName}</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm text-gray-800 group-hover:text-blue-700 mb-2 line-clamp-2">
                          {exam.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[11px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {exam.questionCount} câu
                          </span>
                          <span className="flex items-center gap-1">
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
