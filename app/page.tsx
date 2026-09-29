import Link from "next/link";
import Header from "@/components/Header";
import GradeCard from "@/components/GradeCard";
import TryQuestion from "@/components/home/TryQuestion";
import { GRADES, getSubjects } from "@/lib/subjects";
import { getGradeStats } from "@/lib/db";

// Số bài/đề đếm từ DB; làm mới mỗi 5 phút là đủ, không cần truy vấn mỗi lượt xem.
export const revalidate = 300;

export default async function HomePage() {
  const stats = await getGradeStats();
  const total = Object.values(stats).reduce((n, g) => n + g.lessons + g.exams, 0);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800">
      <Header />

      {/* ── Hero ──
          Không gradient, không số liệu trang trí: nói rõ web làm gì, và cho
          làm thử một câu ngay tại chỗ. */}
      <section className="border-b border-amber-100 bg-[#FFF9EE]">
        {/* Điện thoại: tiêu đề → nút → thẻ làm thử → dòng cam kết, để thẻ làm thử
            lọt vào màn hình đầu. Máy tính: thẻ làm thử sang cột phải. */}
        <div className="mx-auto grid max-w-6xl items-center gap-x-10 gap-y-7 px-4 py-10 sm:py-16 lg:grid-cols-[1.1fr_1fr]">
          <div className="lg:self-end">
            <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Bé ôn bài <span className="whitespace-nowrap text-blue-600">15 phút</span> mỗi ngày
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Bài tập và đề kiểm tra lớp 1 đến lớp 5 theo sách giáo khoa mới. Làm trên web, chấm điểm
              ngay, có lời giải — hoặc tải đề về in cho con làm trên giấy.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#grades"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-b-4 border-blue-800 bg-blue-600 px-7 py-3.5 font-bold text-white transition-all hover:bg-blue-500 active:translate-y-0.5 active:border-b-2"
              >
                Chọn lớp của con
              </a>
              <Link href="/de-thi" className="px-2 py-2 text-center font-semibold text-blue-700 hover:underline">
                Xem kho đề kiểm tra →
              </Link>
            </div>
            <p className="mt-3 text-center text-sm text-slate-500 sm:text-left">
              Lần đầu dùng?{" "}
              <Link href="/huong-dan" className="font-semibold text-blue-700 hover:underline">
                Xem hướng dẫn 2 phút
              </Link>
            </p>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <TryQuestion />
          </div>

          <div className="lg:self-start">
            {/* Chỉ ghi những gì web thật sự làm được. */}
            <ul className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              {[
                "Miễn phí, không cần đăng nhập",
                "Có giọng đọc cho bé chưa đọc thạo",
                "Tải đề Word / PDF để in",
                total > 0 ? `${total} bài và đề đã có câu hỏi` : "Lớp 1, lớp 2 có khu trò chơi học chữ, học số",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="mt-0.5 text-green-600">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Grade Cards ── */}
      <section id="grades" className="mx-auto max-w-6xl px-4 pb-10 pt-14">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">Con đang học lớp mấy?</h2>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">Mỗi lớp có bài tập theo từng chương và đề kiểm tra.</p>
        </div>

        {/* Điện thoại: danh sách dọc · màn rộng: 5 thẻ đứng */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {GRADES.map((g) => (
            <GradeCard key={g} grade={g} subjects={[...getSubjects(g)]} stats={stats[g]} />
          ))}
        </div>
      </section>

      {/* ── Lớp 1: khu trò chơi ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-4">
        <Link
          href="/lop/1/tro-choi"
          className="group flex flex-col gap-4 rounded-3xl border border-amber-200 bg-[#FFF9EE] p-6 transition-shadow hover:shadow-md sm:flex-row sm:items-center"
        >
          <span className="text-6xl motion-safe:group-hover:animate-jump" aria-hidden>🦉</span>
          <span className="flex-1">
            <span className="block text-xl font-extrabold text-slate-800">Lớp 1, lớp 2: học mà chơi cùng bạn Cú</span>
            <span className="mt-1 block text-slate-600">
              Đếm hình, nghe âm chọn chữ, chọn dấu thanh, xem đồng hồ, chính tả ch/tr, s/x… — chạm là chơi.
            </span>
          </span>
          <span className="font-bold text-blue-600 group-hover:underline">Vào chơi →</span>
        </Link>
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
            <Link href="/lop/1/tro-choi" className="hover:text-blue-700">Trò chơi</Link>
            <Link href="/huong-dan" className="hover:text-blue-700">Hướng dẫn</Link>
            <Link href="/gop-y" className="hover:text-blue-700">Góp ý &amp; liên hệ</Link>
            <Link href="/progress" className="hover:text-blue-700">Tiến độ học tập</Link>
            <Link href="/import" className="hover:text-blue-700">Dành cho người soạn đề</Link>
          </nav>
        </div>
        <p className="pb-6 text-center text-xs text-slate-400">© 2026 Ôn Tập Tiểu Học</p>
      </footer>
    </div>
  );
}
