import Header from "@/components/Header";
import SubjectTabs from "@/components/SubjectTabs";
import ChapterItem from "@/components/ChapterItem";
import Sidebar from "@/components/Sidebar";
import { getSubjectsByGrade, getChaptersWithLessons, getLeaderboardByGrade } from "@/lib/db";

export default async function GradePage({
  params,
  searchParams,
}: {
  params: Promise<{ grade: string }>;
  searchParams: Promise<{ subject?: string; view?: string }>;
}) {
  const { grade } = await params;
  const { subject: subjectParam, view } = await searchParams;
  const activeView = view === "exam" ? "exam" : "baitap";
  const gradeNum = parseInt(grade);

  const subjects = await getSubjectsByGrade(gradeNum);

  // Chọn môn học theo query param, mặc định là môn đầu tiên
  const activeSubject =
    subjects.find((s) => s.name === subjectParam) ?? subjects[0] ?? null;

  const [chapters, leaderboard] = await Promise.all([
    activeSubject
      ? getChaptersWithLessons(activeSubject.id, activeView === "exam" ? "exam" : "lesson")
      : Promise.resolve([]),
    getLeaderboardByGrade(gradeNum),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Subject tabs bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <SubjectTabs
            subjects={subjects.map((s) => s.name)}
            activeSubject={activeSubject?.name}
            grade={grade}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <a href="/" className="hover:text-blue-600 transition-colors">Trang chủ</a>
          <span>›</span>
          <a href={`/lop/${grade}`} className="hover:text-blue-600 transition-colors">Lớp {grade}</a>
          <span>›</span>
          <span className="text-gray-600 font-medium">{activeSubject?.name ?? "Toán"}</span>
        </div>

        {/* Page title */}
        <h1 className="text-2xl font-extrabold text-gray-800">
          {activeView === "exam" ? "Đề kiểm tra" : "Bài tập"} {activeSubject?.name ?? "Toán"} lớp {grade}
        </h1>
        <p className="text-gray-500 text-sm mt-1 mb-4">
          {activeView === "exam"
            ? "Đề kiểm tra theo chương · Luyện thi cuối kỳ"
            : "Bộ bài tập bám sát sách giáo khoa · Luyện tập từng chương, từng bài"}
        </p>

        {/* Toggle */}
        <div className="flex gap-2 mb-7">
          <a
            href={`/lop/${grade}${subjectParam ? `?subject=${encodeURIComponent(subjectParam)}` : ""}`}
            className={`text-sm font-bold px-5 py-2 rounded-full shadow-sm transition-colors ${
              activeView === "baitap"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            Bài tập
          </a>
          <a
            href={`/lop/${grade}?${subjectParam ? `subject=${encodeURIComponent(subjectParam)}&` : ""}view=exam`}
            className={`text-sm font-semibold px-5 py-2 rounded-full transition-colors ${
              activeView === "exam"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            Đề kiểm tra
          </a>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Chapter / Exam list */}
          <div className="lg:col-span-2 space-y-4">
            {chapters.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                <p className="text-4xl mb-3">{activeView === "exam" ? "📝" : "📭"}</p>
                <p className="font-medium text-gray-500">
                  {activeView === "exam"
                    ? `Chưa có đề kiểm tra ${activeSubject?.name ?? ""} lớp ${grade}`
                    : "Chưa có nội dung cho môn học này"}
                </p>
                {activeView === "exam" && (
                  <a
                    href={`/import`}
                    className="mt-4 inline-block text-sm text-blue-600 hover:underline font-medium"
                  >
                    + Tạo đề kiểm tra mới
                  </a>
                )}
              </div>
            ) : (
              chapters.map((chapter, i) => (
                <ChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  defaultOpen={i === 0}
                  viewType={activeView === "exam" ? "exam" : "lesson"}
                />
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar leaderboard={leaderboard} grade={gradeNum} />
          </div>
        </div>
      </div>
    </div>
  );
}
