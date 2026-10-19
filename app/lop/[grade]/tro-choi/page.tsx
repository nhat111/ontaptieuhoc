import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlarmClock, Apple, CarFront, ChartPie, ChevronRight, Clock, Coins, Crosshair, Ear, Hash, Image, Layers, Link2, Mic, PenLine, Percent, Ruler, Scale, Shapes, SpellCheck, Tags, Target, type LucideIcon } from "lucide-react";
import Header from "@/components/Header";
import StarTotal from "@/components/games/StarTotal";

type Game = { href: string; icon: LucideIcon; title: string; subject: string; desc: string };

// Màu ô biểu tượng theo môn — cùng một kiểu cho mọi trò, không gradient.
const SUBJECT_TONE: Record<string, string> = {
  "Toán": "bg-blue-50 text-blue-600",
  "Tiếng Việt": "bg-rose-50 text-rose-600",
};

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
    icon: Shapes,
    title: "Đếm hình",
    subject: "Toán",
    desc: "Đếm hình, cộng trừ trong phạm vi 10 bằng hình ảnh.",
  },
  {
    href: "hai-tao",
    icon: Apple,
    title: "Hái táo",
    subject: "Toán",
    desc: "Tính nhẩm rồi hái quả táo đúng — táo rơi vào giỏ!",
  },
  {
    href: "so-sanh",
    icon: Scale,
    title: "So sánh số",
    subject: "Toán",
    desc: "Số nào lớn hơn? Chọn dấu >, < hoặc = — phạm vi 10 có hình để đếm.",
  },
  {
    href: "nghe-chu",
    icon: Ear,
    title: "Nghe và chọn chữ",
    subject: "Tiếng Việt",
    desc: "Nghe âm “bờ”, “cờ”… rồi chạm vào chữ cái đúng.",
  },
  {
    href: "nhin-hinh",
    icon: Image,
    title: "Nhìn hình chọn chữ",
    subject: "Tiếng Việt",
    desc: "Nhìn hình con cá, con gà… rồi chọn đúng chữ.",
  },
  {
    href: "chon-dau",
    icon: PenLine,
    title: "Chọn dấu thanh",
    subject: "Tiếng Việt",
    desc: "Nghe “cá” hay “cà”? Chọn chữ có dấu đúng.",
  },
];

const GAMES_2: Game[] = [
  {
    href: "dong-ho",
    icon: Clock,
    title: "Xem đồng hồ",
    subject: "Toán",
    desc: "Giờ đúng, giờ rưỡi, 15 phút — nhìn kim chọn giờ.",
  },
  {
    href: "hai-tao",
    icon: Apple,
    title: "Hái táo lớp 2",
    subject: "Toán",
    desc: "Cộng trừ có nhớ trong phạm vi 100, bảng nhân chia 2 và 5.",
  },
  {
    href: "tien",
    icon: Coins,
    title: "Tiền Việt Nam",
    subject: "Toán",
    desc: "Đếm các tờ 100, 200, 500 đồng; đi chợ tính tiền trả lại.",
  },
  {
    href: "chinh-ta",
    icon: SpellCheck,
    title: "Điền chữ chính tả",
    subject: "Tiếng Việt",
    desc: "ch hay tr? s hay x? g hay gh? Nhìn hình điền chữ.",
  },
  {
    href: "loai-tu",
    icon: Tags,
    title: "Từ chỉ gì?",
    subject: "Tiếng Việt",
    desc: "Sự vật, hoạt động hay đặc điểm? Phân loại từ.",
  },
];

const GAMES_3: Game[] = [
  {
    href: "dua-xe",
    icon: CarFront,
    title: "Đua xe bảng nhân",
    subject: "Toán",
    desc: "Đua với Rùa, Thỏ, Tên lửa. Đúng liền 4 câu được NITRO, thắng nhận huy chương!",
  },
  {
    href: "ban-bong",
    icon: Crosshair,
    title: "Bắn bóng bay",
    subject: "Toán",
    desc: "Bóng bay lên liên tục — chạm đúng kết quả bảng nhân trước khi bóng bay mất.",
  },
  {
    href: "chinh-dong-ho",
    icon: AlarmClock,
    title: "Chỉnh đồng hồ",
    subject: "Toán",
    desc: "Kéo kim cho đúng giờ: từng phút, giờ kém, sau 25 phút là mấy giờ?",
  },
  {
    href: "lam-tron",
    icon: Target,
    title: "Làm tròn số",
    subject: "Toán",
    desc: "Làm tròn đến hàng chục, hàng trăm: từ 5 trở lên thì làm tròn lên.",
  },
  {
    href: "lat-the",
    icon: Layers,
    title: "Lật thẻ từ",
    subject: "Tiếng Việt",
    desc: "Lật thẻ ghép cặp từ trái nghĩa, cùng nghĩa. Ít lượt nhất là kỷ lục!",
  },
];

const GAMES_4: Game[] = [
  {
    href: "phan-so",
    icon: ChartPie,
    title: "Phân số",
    subject: "Toán",
    desc: "Nhìn thanh sô-cô-la đọc phân số, so sánh và rút gọn phân số.",
  },
  {
    href: "doi-don-vi",
    icon: Ruler,
    title: "Đổi đơn vị đo",
    subject: "Toán",
    desc: "Yến, tạ, tấn · giây, thế kỉ · mm², cm², dm², m².",
  },
  {
    href: "tu-loai",
    icon: Tags,
    title: "Danh từ, động từ, tính từ",
    subject: "Tiếng Việt",
    desc: "Đọc từ rồi xếp vào đúng từ loại.",
  },
];

const GAMES_5: Game[] = [
  {
    href: "thap-phan",
    icon: Hash,
    title: "Số thập phân",
    subject: "Toán",
    desc: "2,5 hay 2,45 lớn hơn? Chữ số thuộc hàng nào? 7/100 viết thế nào?",
  },
  {
    href: "phan-tram",
    icon: Percent,
    title: "Tỉ số phần trăm",
    subject: "Toán",
    desc: "25% của 80 là bao nhiêu? Giải bài toán tỉ số phần trăm.",
  },
  {
    href: "ket-tu",
    icon: Link2,
    title: "Kết từ",
    subject: "Tiếng Việt",
    desc: "và, nhưng, vì… nên…, nếu… thì… — chọn kết từ hợp với câu.",
  },
];

const GAMES_BY_GRADE: Record<string, Game[]> = { "1": GAMES_1, "2": GAMES_2, "3": GAMES_3, "4": GAMES_4, "5": GAMES_5 };

export default async function GamesPage({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  const GAMES = GAMES_BY_GRADE[grade];
  if (!GAMES) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <nav aria-label="Đường dẫn" className="flex items-center gap-1 text-xs text-slate-400 mb-5">
          <Link href="/" className="hover:text-slate-700 transition-colors">Trang chủ</Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <Link href={`/lop/${grade}`} className="hover:text-slate-700 transition-colors">Lớp {grade}</Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span className="text-slate-600">Trò chơi</span>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Vừa học vừa chơi</h1>
          <StarTotal />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {grade === "3"
            ? "Mỗi ván 1–2 phút, có kỷ lục để phá. Bật loa để nghe hiệu ứng nhé."
            : grade === "1" || grade === "2"
              ? "Mỗi lượt chơi 10 câu, khoảng 2–3 phút. Bấm Nghe để nghe đọc câu hỏi, hoặc bật “Tự đọc” ở góc phải."
              : "Mỗi lượt chơi 10 câu, khoảng 3 phút. Sai được chọn lại, đúng ngay lần đầu được một ngôi sao."}
        </p>

        {/* Chuyển lớp */}
        <div className="mt-5 inline-flex flex-wrap rounded-lg bg-slate-200/70 p-1">
          {Object.keys(GAMES_BY_GRADE).map((g) => (
            <Link
              key={g}
              href={`/lop/${g}/tro-choi`}
              aria-current={g === grade ? "page" : undefined}
              className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                g === grade ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Lớp {g}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          {GAMES.map(({ href, icon: Icon, title, subject, desc }) => (
            <Link
              key={href}
              href={`/lop/${grade}/tro-choi/${href}`}
              className="group flex items-start gap-4 bg-white rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50/60"
            >
              <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${SUBJECT_TONE[subject] ?? "bg-slate-100 text-slate-600"}`} aria-hidden>
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-slate-400">{subject}</span>
                <span className="block text-base font-semibold text-slate-900">{title}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-slate-500">{desc}</span>
              </span>
              <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-slate-300 transition-colors group-hover:text-slate-500" aria-hidden />
            </Link>
          ))}
        </div>

        {/* Lối vào cho người soạn nội dung; trang đích nằm trong /import nên có khoá. */}
        <p className="text-center text-xs text-slate-400 mt-10">
          <Link href="/import/giong-tro-choi" className="inline-flex items-center gap-1 hover:text-slate-700">
            <Mic className="h-3.5 w-3.5" aria-hidden />
            Thu giọng đọc cho trò chơi (dành cho người soạn nội dung)
          </Link>
        </p>
      </div>
    </div>
  );
}
