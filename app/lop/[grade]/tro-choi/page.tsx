import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import StarTotal from "@/components/games/StarTotal";

type Game = { href: string; emoji: string; title: string; subject: string; desc: string; color: string };

const DESCRIPTIONS: Record<string, string> = {
  "1": "Vừa học vừa chơi cho bé lớp 1: đếm hình, hái táo làm quen phép cộng trừ, so sánh số, nghe chọn chữ, nhìn hình chọn chữ, chọn dấu thanh. Miễn phí, không cần đăng nhập.",
  "2": "Trò chơi ôn tập lớp 2: xem đồng hồ, cộng trừ có nhớ trong phạm vi 100, bảng nhân chia 2 và 5, tiền Việt Nam, chính tả ch/tr s/x g/gh c/k l/n, từ chỉ sự vật hoạt động đặc điểm. Miễn phí.",
  "3": "Trò chơi lớp 3: đua xe bảng nhân, bắn bóng bay bảng nhân, kéo kim chỉnh đồng hồ đến từng phút, làm tròn số, lật thẻ ghép từ trái nghĩa – cùng nghĩa. Có kỷ lục và huy chương. Miễn phí.",
  "4": "Trò chơi lớp 4: phân số (đọc hình, so sánh, rút gọn), đổi đơn vị đo khối lượng, thời gian, diện tích, phân loại danh từ – động từ – tính từ. Miễn phí, không cần đăng nhập.",
  "5": "Trò chơi lớp 5: số thập phân (so sánh, hàng, viết phân số thập phân), tỉ số phần trăm, chọn kết từ. Miễn phí, không cần đăng nhập.",
};

export async function generateMetadata({ params }: { params: Promise<{ grade: string }> }): Promise<Metadata> {
  const { grade } = await params;
  if (!GAMES_BY_GRADE[grade]) return {};
  const title = `Trò chơi học Toán, Tiếng Việt lớp ${grade}`;
  return { title, description: DESCRIPTIONS[grade], alternates: { canonical: `/lop/${grade}/tro-choi` } };
}

const GAMES_1: Game[] = [
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
    href: "so-sanh",
    emoji: "🐊",
    title: "So sánh số",
    subject: "Toán",
    desc: "Số nào lớn hơn? Chọn dấu >, < hoặc = — phạm vi 10 có hình để đếm.",
    color: "from-teal-400 to-emerald-500",
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

const GAMES_2: Game[] = [
  {
    href: "dong-ho",
    emoji: "🕐",
    title: "Xem đồng hồ",
    subject: "Toán",
    desc: "Giờ đúng, giờ rưỡi, 15 phút — nhìn kim chọn giờ.",
    color: "from-amber-400 to-orange-500",
  },
  {
    href: "hai-tao",
    emoji: "🌳",
    title: "Hái táo lớp 2",
    subject: "Toán",
    desc: "Cộng trừ có nhớ trong phạm vi 100, bảng nhân chia 2 và 5.",
    color: "from-lime-400 to-emerald-500",
  },
  {
    href: "tien",
    emoji: "💵",
    title: "Tiền Việt Nam",
    subject: "Toán",
    desc: "Đếm các tờ 100, 200, 500 đồng; đi chợ tính tiền trả lại.",
    color: "from-emerald-400 to-teal-500",
  },
  {
    href: "chinh-ta",
    emoji: "✍️",
    title: "Điền chữ chính tả",
    subject: "Tiếng Việt",
    desc: "ch hay tr? s hay x? g hay gh? Nhìn hình điền chữ.",
    color: "from-sky-400 to-indigo-500",
  },
  {
    href: "loai-tu",
    emoji: "🗂️",
    title: "Từ chỉ gì?",
    subject: "Tiếng Việt",
    desc: "Sự vật, hoạt động hay đặc điểm? Phân loại từ.",
    color: "from-fuchsia-400 to-pink-500",
  },
];

const GAMES_3: Game[] = [
  {
    href: "dua-xe",
    emoji: "🏎️",
    title: "Đua xe bảng nhân",
    subject: "Toán",
    desc: "Đua với Rùa, Thỏ, Tên lửa. Đúng liền 4 câu được NITRO, thắng nhận huy chương!",
    color: "from-red-400 to-orange-500",
  },
  {
    href: "ban-bong",
    emoji: "🎈",
    title: "Bắn bóng bay",
    subject: "Toán",
    desc: "Bóng bay lên liên tục — chạm đúng kết quả bảng nhân trước khi bóng bay mất.",
    color: "from-sky-400 to-cyan-500",
  },
  {
    href: "chinh-dong-ho",
    emoji: "⏰",
    title: "Chỉnh đồng hồ",
    subject: "Toán",
    desc: "Kéo kim cho đúng giờ: từng phút, giờ kém, sau 25 phút là mấy giờ?",
    color: "from-amber-400 to-yellow-500",
  },
  {
    href: "lam-tron",
    emoji: "🎯",
    title: "Làm tròn số",
    subject: "Toán",
    desc: "Làm tròn đến hàng chục, hàng trăm: từ 5 trở lên thì làm tròn lên.",
    color: "from-violet-400 to-fuchsia-500",
  },
  {
    href: "lat-the",
    emoji: "🃏",
    title: "Lật thẻ từ",
    subject: "Tiếng Việt",
    desc: "Lật thẻ ghép cặp từ trái nghĩa, cùng nghĩa. Ít lượt nhất là kỷ lục!",
    color: "from-indigo-400 to-violet-500",
  },
];

const GAMES_4: Game[] = [
  {
    href: "phan-so",
    emoji: "🍫",
    title: "Phân số",
    subject: "Toán",
    desc: "Nhìn thanh sô-cô-la đọc phân số, so sánh và rút gọn phân số.",
    color: "from-orange-400 to-rose-500",
  },
  {
    href: "doi-don-vi",
    emoji: "⚖️",
    title: "Đổi đơn vị đo",
    subject: "Toán",
    desc: "Yến, tạ, tấn · giây, thế kỉ · mm², cm², dm², m².",
    color: "from-sky-400 to-blue-500",
  },
  {
    href: "tu-loai",
    emoji: "🗂️",
    title: "Danh từ, động từ, tính từ",
    subject: "Tiếng Việt",
    desc: "Đọc từ rồi xếp vào đúng từ loại.",
    color: "from-fuchsia-400 to-pink-500",
  },
];

const GAMES_5: Game[] = [
  {
    href: "thap-phan",
    emoji: "🔢",
    title: "Số thập phân",
    subject: "Toán",
    desc: "2,5 hay 2,45 lớn hơn? Chữ số thuộc hàng nào? 7/100 viết thế nào?",
    color: "from-indigo-400 to-violet-500",
  },
  {
    href: "phan-tram",
    emoji: "📊",
    title: "Tỉ số phần trăm",
    subject: "Toán",
    desc: "25% của 80 là bao nhiêu? Giải bài toán tỉ số phần trăm.",
    color: "from-amber-400 to-orange-500",
  },
  {
    href: "ket-tu",
    emoji: "🔗",
    title: "Kết từ",
    subject: "Tiếng Việt",
    desc: "và, nhưng, vì… nên…, nếu… thì… — chọn kết từ hợp với câu.",
    color: "from-cyan-400 to-blue-500",
  },
];

const GAMES_BY_GRADE: Record<string, Game[]> = { "1": GAMES_1, "2": GAMES_2, "3": GAMES_3, "4": GAMES_4, "5": GAMES_5 };

export default async function GamesPage({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  const GAMES = GAMES_BY_GRADE[grade];
  if (!GAMES) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
          <span>›</span>
          <Link href={`/lop/${grade}`} className="hover:text-blue-600 transition-colors">Lớp {grade}</Link>
          <span>›</span>
          <span className="text-gray-600 font-medium">Trò chơi</span>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-800">Vừa học vừa chơi 🎮</h1>
        {/* Chuyển lớp */}
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.keys(GAMES_BY_GRADE).map((g) => (
            <Link
              key={g}
              href={`/lop/${g}/tro-choi`}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                g === grade ? "bg-blue-600 text-white" : "border border-gray-200 bg-white text-gray-600 hover:border-blue-300"
              }`}
            >
              Lớp {g}
            </Link>
          ))}
        </div>
        <p className="text-gray-500 text-sm mt-1 mb-4">
          {grade === "3"
            ? "Mỗi ván 1–2 phút, có kỷ lục để phá. Bật loa để nghe hiệu ứng nhé."
            : grade === "1" || grade === "2"
              ? "Mỗi lượt chơi 10 câu, khoảng 2–3 phút. Bấm 🔊 Nghe để nghe đọc câu hỏi, hoặc bật “Tự đọc” ở góc phải."
              : "Mỗi lượt chơi 10 câu, khoảng 3 phút. Sai được chọn lại, đúng ngay lần đầu được một ⭐."}
        </p>
        <StarTotal />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {GAMES.map((g) => (
            <Link
              key={g.href}
              href={`/lop/${grade}/tro-choi/${g.href}`}
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
