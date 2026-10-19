import Link from "next/link";
import { ArrowRight, Gamepad2, Gift, Printer, Volume2, ListChecks } from "lucide-react";
import Header from "@/components/Header";
import GradeCard from "@/components/GradeCard";
import Footer from "@/components/Footer";
import TryQuestion from "@/components/home/TryQuestion";
import { SCHOOL_LEVELS, getSubjects } from "@/lib/subjects";
import { getGradeStats } from "@/lib/db";

// Số bài/đề đếm từ DB; làm mới mỗi 5 phút là đủ, không cần truy vấn mỗi lượt xem.
export const revalidate = 300;

export default async function HomePage() {
  const stats = await getGradeStats();
  const total = Object.values(stats).reduce((n, g) => n + g.lessons + g.exams, 0);

  // Chỉ ghi những gì web thật sự làm được.
  const facts = [
    { icon: Gift, text: "Miễn phí, không cần đăng nhập" },
    { icon: Volume2, text: "Có giọng đọc cho bé chưa đọc thạo" },
    { icon: Printer, text: "Tải đề Word / PDF để in" },
    total > 0
      ? { icon: ListChecks, text: `${total} bài và đề đã có câu hỏi` }
      : { icon: Gamepad2, text: "Lớp 1–5 có khu trò chơi học chữ, học số" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />

      {/* ── Hero ──
          Không gradient, không số liệu trang trí: nói rõ web làm gì, và cho
          làm thử một câu ngay tại chỗ. */}
      <section className="border-b border-slate-200 bg-white">
        {/* Điện thoại: tiêu đề → nút → thẻ làm thử → dòng cam kết, để thẻ làm thử
            lọt vào màn hình đầu. Máy tính: thẻ làm thử sang cột phải. */}
        <div className="mx-auto grid max-w-6xl items-center gap-x-12 gap-y-8 px-4 py-10 sm:py-16 lg:grid-cols-[1.1fr_1fr]">
          <div className="lg:self-end">
            <p className="mb-4 inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
              Lớp 1–9 · Theo sách giáo khoa mới
            </p>
            <h1 className="text-balance text-3xl font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl">
              Ôn bài <span className="whitespace-nowrap text-blue-600">15 phút</span> mỗi ngày
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Bài tập và đề kiểm tra lớp 1 đến lớp 9. Làm trên web, chấm điểm ngay, có lời giải — hoặc
              tải đề về in cho con làm trên giấy.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#grades"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Chọn lớp của con
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <Link
                href="/de-thi"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
              >
                Kho đề kiểm tra
              </Link>
            </div>
            <p className="mt-4 text-center text-sm text-slate-500 sm:text-left">
              Lần đầu dùng?{" "}
              <Link href="/huong-dan" className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900">
                Xem hướng dẫn 2 phút
              </Link>
            </p>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <TryQuestion />
          </div>

          <ul className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:self-start">
            {facts.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Grade Cards ── */}
      <section id="grades" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-10 pt-14">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Con đang học lớp mấy?</h2>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">Mỗi lớp có bài tập theo từng chương và đề kiểm tra.</p>
        </div>

        {/* Mỗi cấp một nhóm. Điện thoại: danh sách dọc · màn rộng: một hàng thẻ đứng
            (5 cột tiểu học, 4 cột THCS — viết nguyên class để Tailwind sinh CSS). */}
        <div className="space-y-8">
          {SCHOOL_LEVELS.map((level) => (
            <div key={level.key}>
              <h3 className="mb-3 text-sm font-medium text-slate-500">
                {level.label} <span className="text-slate-400">· lớp {level.grades[0]}–{level.grades[level.grades.length - 1]}</span>
              </h3>
              <div
                className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${
                  level.grades.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-5"
                }`}
              >
                {level.grades.map((g) => (
                  <GradeCard key={g} grade={g} subjects={[...getSubjects(g)]} stats={stats[g]} />
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
          className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 sm:flex-row sm:items-center sm:p-6"
        >
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600" aria-hidden>
            <Gamepad2 className="h-6 w-6" />
          </span>
          <span className="flex-1">
            <span className="block text-lg font-semibold text-slate-900">Vừa học vừa chơi · Lớp 1–5</span>
            <span className="mt-1 block text-sm leading-relaxed text-slate-600">
              Đếm hình, so sánh số, chính tả, tiền Việt Nam, đua xe bảng nhân… và cho lớp 4, lớp 5: phân số, số thập phân, phần trăm, từ loại, kết từ.
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
            Vào chơi
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      </section>

      <Footer />
    </div>
  );
}
