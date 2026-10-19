import Link from "next/link";
import { Apple, ArrowRight, Gamepad2, Gift, ListChecks, Printer, Scale, Shapes, Sparkles, Star, Volume2 } from "lucide-react";
import Header from "@/components/Header";
import GradeCard from "@/components/GradeCard";
import Footer from "@/components/Footer";
import QuickExamFab from "@/components/home/QuickExamFab";
import TryQuestion from "@/components/home/TryQuestion";
import HeroArt from "@/components/home/HeroArt";
import { SCHOOL_LEVELS, getSubjects } from "@/lib/subjects";
import { getGradeStats } from "@/lib/db";

// Số bài/đề đếm từ DB; làm mới mỗi 5 phút là đủ, không cần truy vấn mỗi lượt xem.
export const revalidate = 300;

export default async function HomePage() {
  const stats = await getGradeStats();
  const total = Object.values(stats).reduce((n, g) => n + g.lessons + g.exams, 0);

  // Chỉ ghi những gì web thật sự làm được.
  const facts = [
    { icon: Gift, text: "Miễn phí, không cần đăng nhập", tone: "bg-coral-100 text-coral-700" },
    { icon: Volume2, text: "Có giọng đọc cho bé chưa đọc thạo", tone: "bg-primary-100 text-primary-700" },
    { icon: Printer, text: "Tải đề Word / PDF để in", tone: "bg-success-100 text-success-700" },
    total > 0
      ? { icon: ListChecks, text: `${total} bài và đề đã có câu hỏi`, tone: "bg-star-100 text-star-800" }
      : { icon: Gamepad2, text: "Lớp 1–5 có khu trò chơi học chữ, học số", tone: "bg-star-100 text-star-800" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />

      {/* ── Hero ──
          Nền pastel nhẹ + hình minh hoạ; nói rõ web làm gì và cho làm thử một câu ngay. */}
      <section className="relative overflow-hidden border-b border-primary-100 bg-gradient-to-br from-primary-50 via-white to-star-50">
        {/* Chấm bi mờ trang trí */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(#c7d2fe_1.2px,transparent_1.2px)] [background-size:22px_22px]"
          aria-hidden
        />
        {/* Điện thoại: tiêu đề → nút → thẻ làm thử → dòng cam kết, để thẻ làm thử
            lọt vào màn hình đầu. Máy tính: hai cột cân nhau, hình + thẻ làm thử bên phải. */}
        <div className="relative mx-auto grid max-w-6xl items-center gap-x-12 gap-y-8 px-4 py-10 sm:py-14 lg:grid-cols-2 lg:py-16">
          <div className="lg:self-end">
            <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-primary-700 shadow-sm ring-1 ring-primary-100">
              <Star className="h-3.5 w-3.5 fill-star-400 text-star-400" aria-hidden />
              Lớp 1–9 · Theo sách giáo khoa mới
            </p>
            <h1 className="text-balance text-4xl font-black leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-[56px]">
              Ôn bài <span className="whitespace-nowrap text-primary-600">15 phút</span> mỗi ngày,{" "}
              <span className="relative whitespace-nowrap">
                vui như chơi
                <svg viewBox="0 0 200 12" className="absolute -bottom-2 left-0 h-3 w-full text-star-400" preserveAspectRatio="none" aria-hidden>
                  <path d="M2 9 Q50 1 100 7 T198 5" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Bài tập và đề kiểm tra lớp 1 đến lớp 9. Làm trên web, chấm điểm ngay, có lời giải — hoặc
              tải đề về in cho con làm trên giấy.
            </p>
            <div id="hero-cta" className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href="#grades"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-b-4 border-primary-800 bg-primary-600 whitespace-nowrap px-5 py-3 text-base font-extrabold text-white shadow-pop transition-all hover:bg-primary-700 active:translate-y-0.5 active:border-b-2"
              >
                Chọn lớp của con
                <ArrowRight className="h-5 w-5" aria-hidden />
              </a>
              <Link
                href="/de-thi"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white whitespace-nowrap px-5 py-3 text-base font-bold text-slate-700 transition-colors hover:border-primary-300 hover:text-primary-700"
              >
                Kho đề kiểm tra
              </Link>
              <Link
                href="/tao-de"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-star-200 bg-star-50 whitespace-nowrap px-5 py-3 text-base font-bold text-slate-800 transition-colors hover:border-star-300"
              >
                <Sparkles className="h-5 w-5 text-star-500" aria-hidden />
                Tạo đề nhanh
              </Link>
            </div>
            <p className="mt-4 text-center text-sm text-slate-500 sm:text-left">
              Lần đầu dùng?{" "}
              <Link href="/huong-dan" className="font-bold text-primary-700 underline decoration-primary-200 decoration-2 underline-offset-4 hover:decoration-primary-500">
                Xem hướng dẫn 2 phút
              </Link>
            </p>
          </div>

          <div className="relative lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <HeroArt className="mx-auto -mb-10 hidden h-auto w-full max-w-md lg:block" />
            <div id="try-question" className="relative">
              <TryQuestion />
            </div>
          </div>

          <ul className="grid gap-2.5 text-sm text-slate-700 sm:grid-cols-2 lg:self-start">
            {facts.map(({ icon: Icon, text, tone }) => (
              <li key={text} className="flex items-center gap-2.5 rounded-xl bg-white/70 px-3 py-2 ring-1 ring-slate-100">
                <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${tone}`} aria-hidden>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-semibold">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Grade Cards ── */}
      <section id="grades" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-10 pt-14">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Con đang học lớp mấy?</h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">Mỗi lớp có bài tập theo từng chương và đề kiểm tra.</p>
        </div>

        {/* Mỗi cấp một nhóm. Điện thoại: danh sách dọc · màn rộng: một hàng thẻ đứng
            (5 cột tiểu học, 4 cột THCS — viết nguyên class để Tailwind sinh CSS). */}
        <div className="space-y-10">
          {SCHOOL_LEVELS.map((level) => (
            <div key={level.key}>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-slate-500">
                <span className="h-2 w-2 rounded-full bg-primary-400" aria-hidden />
                {level.label} <span className="font-semibold normal-case tracking-normal text-slate-400">· lớp {level.grades[0]}–{level.grades[level.grades.length - 1]}</span>
              </h3>
              <div
                className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
                  level.grades.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-5"
                }`}
              >
                {level.grades.map((g) => (
                  <GradeCard key={g} grade={g} subjects={[...getSubjects(g)]} stats={stats[g]} hasGames={g <= 5} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lớp 1–5: khu trò chơi ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-4">
        <Link
          href="/lop/1/tro-choi"
          className="group relative flex flex-col gap-5 overflow-hidden rounded-3xl border-2 border-star-200 bg-gradient-to-br from-star-50 via-white to-coral-50 p-6 shadow-soft transition-all hover:border-star-300 hover:shadow-pop sm:flex-row sm:items-center sm:p-8"
        >
          <span className="flex flex-shrink-0 -space-x-3" aria-hidden>
            {[
              { Icon: Apple, cls: "bg-coral-500 -rotate-6" },
              { Icon: Scale, cls: "bg-primary-500 rotate-3" },
              { Icon: Shapes, cls: "bg-success-500 -rotate-3" },
            ].map(({ Icon, cls }, k) => (
              <span
                key={k}
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white text-white shadow-md transition-transform motion-safe:group-hover:-translate-y-1 ${cls}`}
              >
                <Icon className="h-7 w-7" />
              </span>
            ))}
          </span>
          <span className="flex-1">
            <span className="block text-xl font-black text-slate-900">Vừa học vừa chơi · Lớp 1–5</span>
            <span className="mt-1 block text-sm leading-relaxed text-slate-600">
              Đếm hình, so sánh số, chính tả, tiền Việt Nam, đua xe bảng nhân… và cho lớp 4, lớp 5: phân số, số thập phân, phần trăm, từ loại, kết từ.
            </span>
          </span>
          <span className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-star-400 px-5 text-sm font-extrabold text-slate-900 shadow-sm transition-colors group-hover:bg-star-300">
            <Gamepad2 className="h-4 w-4" aria-hidden />
            Vào chơi
          </span>
        </Link>
      </section>

      <Footer />
      {/* Chừa chỗ dưới cùng cho nút nổi, để nó không che dòng bản quyền ở chân trang. */}
      <div className="h-20 bg-slate-50 sm:hidden" aria-hidden />
      <QuickExamFab />
    </div>
  );
}
