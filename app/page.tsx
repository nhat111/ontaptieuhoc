import Link from "next/link";
import Header from "@/components/Header";
import GradeCard from "@/components/GradeCard";
const grades = [
  {
    grade: 1,
    emoji: "🌱",
    subjects: ["Tiếng Việt", "Toán", "Tự nhiên XH"],
    totalTopics: 24,
    color: {
      bg: "bg-red-50",
      badge: "bg-red-100",
      text: "text-red-600",
      border: "border-red-200",
      hover: "text-red-500 group-hover:text-red-700",
    },
  },
  {
    grade: 2,
    emoji: "🌿",
    subjects: ["Tiếng Việt", "Toán", "Tự nhiên XH", "Đạo đức"],
    totalTopics: 30,
    color: {
      bg: "bg-orange-50",
      badge: "bg-orange-100",
      text: "text-orange-600",
      border: "border-orange-200",
      hover: "text-orange-500 group-hover:text-orange-700",
    },
  },
  {
    grade: 3,
    emoji: "🌳",
    subjects: ["Tiếng Việt", "Toán", "Khoa học", "Lịch sử", "Tiếng Anh"],
    totalTopics: 38,
    color: {
      bg: "bg-green-50",
      badge: "bg-green-100",
      text: "text-green-600",
      border: "border-green-200",
      hover: "text-green-500 group-hover:text-green-700",
    },
  },
  {
    grade: 4,
    emoji: "🌟",
    subjects: ["Tiếng Việt", "Toán", "Khoa học", "Địa lý", "Tiếng Anh"],
    totalTopics: 42,
    color: {
      bg: "bg-blue-50",
      badge: "bg-blue-100",
      text: "text-blue-600",
      border: "border-blue-200",
      hover: "text-blue-500 group-hover:text-blue-700",
    },
  },
  {
    grade: 5,
    emoji: "🏆",
    subjects: ["Tiếng Việt", "Toán", "Khoa học", "Lịch sử & ĐL", "Tiếng Anh"],
    totalTopics: 48,
    color: {
      bg: "bg-purple-50",
      badge: "bg-purple-100",
      text: "text-purple-600",
      border: "border-purple-200",
      hover: "text-purple-500 group-hover:text-purple-700",
    },
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
            <svg width="18" height="18" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="9" fill="white" fillOpacity="0.25"/>
              <path d="M8 25V12C8 11.4 8.4 11 9 11H17V26H9C8.4 26 8 25.6 8 25Z" fill="white" fillOpacity="0.85"/>
              <path d="M28 25V12C28 11.4 27.6 11 27 11H19V26H27C27.6 26 28 25.6 28 25Z" fill="white"/>
              <rect x="17" y="11" width="2" height="15" rx="0.5" fill="#BFDBFE"/>
              <path d="M21 19L23.5 22L27 16" stroke="#FB923C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Nền tảng ôn tập Tiểu học miễn phí
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Ôn tập thông minh <br />
            <span className="text-yellow-300">cho học sinh Tiểu học</span>
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Bộ đề ôn tập bám sát chương trình SGK mới — Lớp 1 đến Lớp 5
          </p>
          <div className="flex justify-center gap-3">
            <a
              href="#grades"
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-6 py-3 rounded-xl transition-colors shadow-lg"
            >
              Chọn lớp học →
            </a>
            <Link
              href="/quiz?lessonId=1"
              className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Xem đề mẫu
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-3 gap-4 text-center">
          {[
            { value: "500+", label: "Bộ đề ôn tập" },
            { value: "5 Lớp", label: "Từ Lớp 1 đến Lớp 5" },
            { value: "Miễn phí", label: "Không mất phí" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-extrabold text-blue-600">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Grade cards */}
      <section id="grades" className="max-w-6xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Chọn lớp của bạn</h2>
          <p className="text-gray-500">Chọn lớp để bắt đầu ôn tập ngay hôm nay</p>
        </div>

        {/* 3 top + 2 bottom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          {grades.slice(0, 3).map((g) => (
            <GradeCard key={g.grade} {...g} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {grades.slice(3).map((g) => (
            <GradeCard key={g.grade} {...g} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © 2026 Ôn Tập Tiểu Học · Miễn phí · Dành cho học sinh Việt Nam
      </footer>
    </div>
  );
}
