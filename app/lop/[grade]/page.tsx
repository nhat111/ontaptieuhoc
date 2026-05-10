import Header from "@/components/Header";
import SubjectTabs from "@/components/SubjectTabs";
import ChapterItem, { Chapter } from "@/components/ChapterItem";
import Sidebar from "@/components/Sidebar";

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "Chương 1: Số tự nhiên",
    questionCount: 45,
    lessons: [
      { id: 1, index: "01", title: "Các số từ 0 đến 100", questionCount: 12, status: "completed" },
      { id: 2, index: "02", title: "So sánh và sắp xếp số", questionCount: 10, status: "completed" },
      { id: 3, index: "03", title: "Phép cộng có nhớ", questionCount: 15, status: "active" },
      { id: 4, index: "04", title: "Phép trừ có nhớ", questionCount: 8, status: "locked" },
    ],
  },
  {
    id: 2,
    title: "Chương 2: Hình học cơ bản",
    questionCount: 32,
    lessons: [
      { id: 5, index: "01", title: "Nhận biết hình vuông, hình chữ nhật", questionCount: 10, status: "locked" },
      { id: 6, index: "02", title: "Đo độ dài và chu vi", questionCount: 12, status: "locked" },
      { id: 7, index: "03", title: "Diện tích đơn giản", questionCount: 10, status: "locked" },
    ],
  },
  {
    id: 3,
    title: "Chương 3: Đo lường và bài toán có lời văn",
    questionCount: 28,
    lessons: [
      { id: 8, index: "01", title: "Đơn vị đo khối lượng (kg, g)", questionCount: 10, status: "locked" },
      { id: 9, index: "02", title: "Đơn vị đo thời gian", questionCount: 10, status: "locked" },
      { id: 10, index: "03", title: "Bài toán có lời văn tổng hợp", questionCount: 8, status: "locked" },
    ],
  },
];

export default async function GradePage({
  params,
}: {
  params: Promise<{ grade: string }>;
}) {
  const { grade } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Subject tabs bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <SubjectTabs />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <a href="/" className="hover:text-blue-600 transition-colors">Trang chủ</a>
          <span>›</span>
          <a href={`/lop/${grade}`} className="hover:text-blue-600 transition-colors">Lớp {grade}</a>
          <span>›</span>
          <span className="text-gray-600 font-medium">Toán</span>
        </div>

        {/* Page title */}
        <h1 className="text-2xl font-extrabold text-gray-800">
          Bài tập Toán lớp {grade}
        </h1>
        <p className="text-gray-500 text-sm mt-1 mb-4">
          Bộ bài tập bám sát sách giáo khoa · Luyện tập từng chương, từng bài
        </p>

        {/* Toggle: Bài tập / Đề kiểm tra */}
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
            {CHAPTERS.map((chapter, i) => (
              <ChapterItem
                key={chapter.id}
                chapter={chapter}
                defaultOpen={i === 0}
              />
            ))}
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
