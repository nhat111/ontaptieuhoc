import Header from "@/components/Header";
import SubjectTabs from "@/components/SubjectTabs";
import ChapterItem from "@/components/ChapterItem";
import Sidebar from "@/components/Sidebar";
import { getSubjectsByGrade, getChaptersWithLessons } from "@/lib/db";

export default async function GradePage({
  params,
  searchParams,
}: {
  params: Promise<{ grade: string }>;
  searchParams: Promise<{ subject?: string }>;
}) {
  const { grade } = await params;
  const { subject: subjectParam } = await searchParams;
  const gradeNum = parseInt(grade);

  const subjects = await getSubjectsByGrade(gradeNum);

  // Chọn môn học theo query param, mặc định là môn đầu tiên
  const activeSubject =
    subjects.find((s) => s.name === subjectParam) ?? subjects[0] ?? null;

  const chapters = activeSubject
    ? await getChaptersWithLessons(activeSubject.id)
    : [];

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
          Bài tập {activeSubject?.name ?? "Toán"} lớp {grade}
        </h1>
        <p className="text-gray-500 text-sm mt-1 mb-4">
          Bộ bài tập bám sát sách giáo khoa · Luyện tập từng chương, từng bài
        </p>

        {/* Toggle */}
        <div className="flex gap-2 mb-7">
          <button className="bg-blue-600 text-white text-sm font-bold px-5 py-2 rounded-full shadow-sm">
            Bài tập
          </button>
          <button className="bg-white text-gray-600 border border-gray-200 text-sm font-semibold px-5 py-2 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors">
            Đề kiểm tra
          </button>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Chapter list */}
          <div className="lg:col-span-2 space-y-4">
            {chapters.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                <p className="text-4xl mb-3">📭</p>
                <p>Chưa có nội dung cho môn học này</p>
              </div>
            ) : (
              chapters.map((chapter, i) => (
                <ChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  defaultOpen={i === 0}
                />
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
