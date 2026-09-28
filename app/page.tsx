import Link from "next/link";
import Header from "@/components/Header";
import GradeCard from "@/components/GradeCard";
import { getSubjects } from "@/lib/subjects";
import { getGradeStats } from "@/lib/db";

// Số bài/đề đếm từ DB; làm mới mỗi 5 phút là đủ, không cần truy vấn mỗi lượt xem.
export const revalidate = 300;

const grades = [
  {
    grade: 1,
    emoji: "🌱",
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
    short: "Chuẩn chương trình",
    color: "bg-blue-50 text-blue-600",
    surface: "bg-blue-50/70 border-blue-100",
    chip: "bg-blue-100 text-blue-700",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Theo dõi tiến độ",
    short: "Lưu kết quả",
    color: "bg-emerald-50 text-emerald-600",
    surface: "bg-emerald-50/70 border-emerald-100",
    chip: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 010 5.25a3.745 3.745 0 01-5.25 0 3.745 3.745 0 01-3.068-1.593a3.745 3.745 0 010-5.25A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 015.25 0A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    title: "Hoàn toàn miễn phí",
    short: "Không thu phí",
    color: "bg-orange-50 text-orange-600",
    surface: "bg-orange-50/70 border-orange-100",
    chip: "bg-orange-100 text-orange-700",
  },
];

export default async function HomePage() {
  const stats = await getGradeStats();
  const total = Object.values(stats).reduce((n, g) => n + g.lessons + g.exams, 0);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800">
      <Header />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-900/20 pointer-events-none" />

        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Nền tảng ôn tập Tiểu học miễn phí
          </div>

          {/* Heading */}
          <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Ôn tập thông minh<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400">
              cho học sinh Tiểu học
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-blue-100 sm:text-lg">
            Bộ đề ôn tập bám sát chương trình SGK mới · Lớp 1 đến Lớp 5 · Hoàn toàn miễn phí
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#grades"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-7 py-3.5 font-bold text-gray-900 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-yellow-400/30 sm:w-auto"
            >
              Chọn lớp học
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <Link
              href="/de-thi"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/15 px-7 py-3.5 font-semibold text-white transition-all hover:bg-white/25 sm:w-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Xem đề mẫu
            </Link>
          </div>

          {/* Stats inline */}
          <div className="mx-auto mt-12 flex max-w-md justify-center gap-2 sm:max-w-lg sm:gap-6">
            {[
              // Số thật; chưa đếm được (DB lỗi / chưa có bài) thì bỏ ô này đi.
              ...(total > 0 ? [{ value: String(total), label: "Bài & đề" }] : []),
              { value: "5 lớp", label: "Lớp 1 → 5" },
              { value: "0đ", label: "Miễn phí" },
            ].map((s) => (
              <div
                key={s.label}
                className="group w-1/3 rounded-2xl border border-white/15 bg-white/10 px-2 py-3 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15 hover:shadow-lg hover:shadow-indigo-900/20"
              >
                <div className="text-xl sm:text-2xl font-extrabold text-white transition-transform duration-200 group-hover:scale-105">
                  {s.value}
                </div>
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
      <section id="grades" className="mx-auto max-w-6xl px-4 pb-10 pt-14">
        <div className="mb-10 text-center">
          <span className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
            Bắt đầu từ lớp hiện tại của con
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2">Chọn lớp của bạn</h2>
          <p className="text-gray-500 text-sm sm:text-base">Chọn lớp để bắt đầu ôn tập ngay hôm nay</p>
        </div>

        {/* 2 cols mobile · 3 cols tablet · 5 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {grades.map((g) => (
            <GradeCard key={g.grade} {...g} subjects={[...getSubjects(g.grade)]} stats={stats[g.grade]} />
          ))}
        </div>
      </section>

      {/* ── Features (ultra-compact) ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className={`group flex items-center gap-3 rounded-2xl border p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-4 ${f.surface}`}>
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${f.color}`}>
                {f.icon}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-gray-800">{f.title}</h3>
                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${f.chip}`}>
                  {f.short}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-extrabold text-blue-700">Ôn Tập Tiểu Học</p>
            <p className="text-sm text-slate-500">Luyện tập miễn phí, bám sát chương trình lớp 1 đến lớp 5.</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
            <Link href="/de-thi" className="hover:text-blue-700">Kho đề</Link>
            <Link href="/lop/1/tro-choi" className="hover:text-blue-700">Trò chơi lớp 1</Link>
            <Link href="/progress" className="hover:text-blue-700">Tiến độ học tập</Link>
            <Link href="/import" className="hover:text-blue-700">Dành cho người soạn đề</Link>
          </nav>
        </div>
        <p className="pb-6 text-center text-xs text-slate-400">© 2026 Ôn Tập Tiểu Học</p>
      </footer>
    </div>
  );
}
