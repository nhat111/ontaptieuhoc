import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import StarTotal from "@/components/games/StarTotal";

export const metadata: Metadata = {
  title: "Trò chơi học Toán, Tiếng Việt lớp 1",
  description:
    "Vừa học vừa chơi cho bé lớp 1: đếm hình, hái táo làm quen phép cộng trừ, nghe chọn chữ, nhìn hình chọn chữ, chọn dấu thanh. Miễn phí, không cần đăng nhập.",
  alternates: { canonical: "/lop/1/tro-choi" },
};

const GAMES = [
  {
    href: "dem-hinh",
    emoji: "🍎",
    title: "Đếm hình",
    subject: "Toán",
    desc: "Đếm hình, cộng trừ trong phạm vi 10 bằng hình ảnh.",
    color: "from-rose-400 to-orange-400",
  },
  {
    href: "hai-tao",
    emoji: "🌳",
    title: "Hái táo",
    subject: "Toán",
    desc: "Tính nhẩm rồi hái quả táo đúng — táo rơi vào giỏ!",
    color: "from-lime-400 to-emerald-500",
  },
  {
    href: "nghe-chu",
    emoji: "👂",
    title: "Nghe và chọn chữ",
    subject: "Tiếng Việt",
    desc: "Nghe âm “bờ”, “cờ”… rồi chạm vào chữ cái đúng.",
    color: "from-sky-400 to-violet-400",
  },
  {
    href: "nhin-hinh",
    emoji: "🐟",
    title: "Nhìn hình chọn chữ",
    subject: "Tiếng Việt",
    desc: "Nhìn hình con cá, con gà… rồi chọn đúng chữ.",
    color: "from-cyan-400 to-blue-500",
  },
  {
    href: "chon-dau",
    emoji: "✏️",
    title: "Chọn dấu thanh",
    subject: "Tiếng Việt",
    desc: "Nghe “cá” hay “cà”? Chọn chữ có dấu đúng.",
    color: "from-fuchsia-400 to-pink-500",
  },
];

// Hiện chỉ có trò cho lớp 1.
export default async function GamesPage({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "1") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
          <span>›</span>
          <Link href="/lop/1" className="hover:text-blue-600 transition-colors">Lớp 1</Link>
          <span>›</span>
          <span className="text-gray-600 font-medium">Trò chơi</span>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-800">Vừa học vừa chơi 🎮</h1>
        <p className="text-gray-500 text-sm mt-1 mb-4">Mỗi lượt chơi 10 câu, khoảng 2–3 phút. Bật loa để nghe đọc nhé.</p>
        <StarTotal />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {GAMES.map((g) => (
            <Link
              key={g.href}
              href={`/lop/1/tro-choi/${g.href}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className={`bg-gradient-to-r ${g.color} h-28 flex items-center justify-center text-6xl`}>
                <span className="group-hover:scale-110 transition-transform">{g.emoji}</span>
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase">{g.subject}</p>
                <p className="text-lg font-bold text-gray-800">{g.title}</p>
                <p className="text-sm text-gray-500 mt-1">{g.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Lối vào cho người soạn nội dung; trang đích nằm trong /import nên có khoá. */}
        <p className="text-center text-xs text-gray-400 mt-8">
          <Link href="/import/giong-tro-choi" className="hover:text-blue-600">
            🎙 Thu giọng đọc cho trò chơi (dành cho người soạn nội dung)
          </Link>
        </p>
      </div>
    </div>
  );
}
