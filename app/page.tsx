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
      bg: "bg-rose-50",
      badge: "bg-rose-100",
      text: "text-rose-600",
      border: "border-rose-200",
      hover: "text-rose-500 group-hover:text-rose-700",
      accent: "from-rose-400 to-rose-600",
      ring: "ring-rose-200",
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
      accent: "from-orange-400 to-orange-600",
      ring: "ring-orange-200",
    },
  },
  {
    grade: 3,
    emoji: "🌳",
    subjects: ["Tiếng Việt", "Toán", "Khoa học", "Lịch sử", "Tiếng Anh"],
    totalTopics: 38,
    color: {
      bg: "bg-emerald-50",
      badge: "bg-emerald-100",
      text: "text-emerald-600",
      border: "border-emerald-200",
      hover: "text-emerald-500 group-hover:text-emerald-700",
      accent: "from-emerald-400 to-emerald-600",
      ring: "ring-emerald-200",
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
      accent: "from-blue-400 to-blue-600",
      ring: "ring-blue-200",
    },
  },
  {
    grade: 5,
    emoji: "🏆",
    subjects: ["Tiếng Việt", "Toán", "Khoa học", "Lịch sử & ĐL", "Tiếng Anh"],
    totalTopics: 48,
    color: {
      bg: "bg-violet-50",
      badge: "bg-violet-100",
      text: "text-violet-600",
      border: "border-violet-200",
      hover: "text-violet-500 group-hover:text-violet-700",
      accent: "from-violet-400 to-violet-600",
      ring: "ring-violet-200",
    },
  },
];

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: "Bám sát SGK mới",
    desc: "Nội dung được biên soạn theo chương trình giáo dục phổ thông 2018, sát với sách giáo khoa hiện hành.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Theo dõi tiến độ",
    desc: "Đăng nhập để lưu kết quả, xem lịch sử làm bài và theo dõi điểm số qua từng lần luyện tập.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 010 5.25a3.745 3.745 0 01-5.25 0 3.745 3.745 0 01-3.068-1.593a3.745 3.745 0 010-5.25A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 015.25 0A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    title: "Hoàn toàn miễn phí",
    desc: "Không đăng ký tốn kém, không quảng cáo làm phiền. Mọi học sinh đều có thể ôn tập thoải mái.",
    color: "bg-orange-50 text-orange-600",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-900/20 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Nền tảng ôn tập Tiểu học miễn phí
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-4">
            Ôn tập thông minh<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400">
              cho học sinh Tiểu học
            </span>
          </h1>
          <p className="text-blue-100 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Bộ đề ôn tập bám sát chương trình SGK mới · Lớp 1 đến Lớp 5 · Hoàn toàn miễn phí
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#grades"
              className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-7 py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-yellow-400/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Chọn lớp học
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <Link
              href="/quiz?lessonId=1"
              className="w-full sm:w-auto bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Xem đề mẫu
            </Link>
          </div>

          {/* Stats inline */}
          <div className="mt-12 grid grid-cols-3 gap-2 sm:gap-6 max-w-md sm:max-w-lg mx-auto">
            {[
              { value: "500+", label: "Bộ đề" },
              { value: "5 lớp", label: "Lớp 1 → 5" },
              { value: "0đ", label: "Miễn phí" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl py-3 px-2">
                <div className="text-xl sm:text-2xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs text-blue-200 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 40L60 34C120 28 240 16 360 13.3C480 10.7 600 16 720 19.3C840 22.7 960 24 1080 22.7C1200 21.3 1320 17.3 1380 15.3L1440 13.3V40H1380C1320 40 1200 40 1080 40C960 40 840 40 720 40C600 40 480 40 360 40C240 40 120 40 60 40H0V40Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* ── Grade Cards ── */}
      <section id="grades" className="max-w-6xl mx-auto px-4 pt-14 pb-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2">Chọn lớp của bạn</h2>
          <p className="text-gray-500 text-sm sm:text-base">Chọn lớp để bắt đầu ôn tập ngay hôm nay</p>
        </div>

        {/* 2 cols mobile · 3 cols tablet · 5 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {grades.map((g) => (
            <GradeCard key={g.grade} {...g} />
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-4 py-10 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4 items-start">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="9" fill="#2563EB"/>
              <path d="M8 25V12C8 11.4 8.4 11 9 11H17V26H9C8.4 26 8 25.6 8 25Z" fill="white" fillOpacity="0.85"/>
              <path d="M28 25V12C28 11.4 27.6 11 27 11H19V26H27C27.6 26 28 25.6 28 25Z" fill="white"/>
              <rect x="17" y="11" width="2" height="15" rx="0.5" fill="#BFDBFE"/>
              <path d="M21 19L23.5 22L27 16" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="leading-none">
              <p className="text-sm font-extrabold text-blue-700">Ôn Tập Tiểu Học</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Miễn phí · Dành cho học sinh Việt Nam</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">© 2026 Ôn Tập Tiểu Học. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
