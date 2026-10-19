import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlarmClock, Apple, CarFront, ChartPie, ChevronRight, Clock, Play, Timer, Coins, Crosshair, Ear, Hash, Image, Layers, Link2, Mic, PenLine, Percent, Ruler, Scale, Shapes, SpellCheck, Tags, Target, type LucideIcon } from "lucide-react";
import { cookies } from "next/headers";
import Header from "@/components/Header";
import StarTotal from "@/components/games/StarTotal";
import GameArt from "@/components/games/GameArt";
import { IMPORT_COOKIE, hasImportAccess, isImportProtected } from "@/lib/importAuth";

type Game = {
  href: string;
  icon: LucideIcon;
  title: string;
  subject: string;
  desc: string;
  /** Hình riêng trong components/games/GameArt.tsx; không có thì vẽ `icon`. */
  art?: string;
  /** Độ dài một lượt — đúng với code của trò (GameShell: 10 câu). */
  meta: string;
};

const ROUND = "10 câu • 3 phút";

// Nền ảnh bìa của thẻ trò chơi, xoay vòng theo thứ tự để hub rực rỡ mà không trùng màu kề nhau.
const COVERS = [
  { bg: "from-sky-200 to-sky-100", icon: "text-sky-600" },
  { bg: "from-coral-200 to-coral-100", icon: "text-coral-600" },
  { bg: "from-emerald-200 to-emerald-100", icon: "text-emerald-600" },
  { bg: "from-violet-200 to-violet-100", icon: "text-violet-600" },
  { bg: "from-amber-200 to-amber-100", icon: "text-amber-600" },
  { bg: "from-pink-200 to-pink-100", icon: "text-pink-600" },
];

const SUBJECT_TAG: Record<string, string> = {
  "Toán": "bg-primary-50 text-primary-700",
  "Tiếng Việt": "bg-coral-50 text-coral-700",
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
    art: "shapes",
    meta: ROUND,
    icon: Shapes,
    title: "Đếm hình",
    subject: "Toán",
    desc: "Đếm hình, cộng trừ trong phạm vi 10 bằng hình ảnh.",
  },
  {
    href: "hai-tao",
    art: "apple",
    meta: ROUND,
    icon: Apple,
    title: "Hái táo",
    subject: "Toán",
    desc: "Tính nhẩm rồi hái quả táo đúng — táo rơi vào giỏ!",
  },
  {
    href: "so-sanh",
    art: "scale",
    meta: ROUND,
    icon: Scale,
    title: "So sánh số",
    subject: "Toán",
    desc: "Số nào lớn hơn? Chọn dấu >, < hoặc = — phạm vi 10 có hình để đếm.",
  },
  {
    href: "nghe-chu",
    meta: ROUND,
    icon: Ear,
    title: "Nghe và chọn chữ",
    subject: "Tiếng Việt",
    desc: "Nghe âm “bờ”, “cờ”… rồi chạm vào chữ cái đúng.",
  },
  {
    href: "nhin-hinh",
    meta: ROUND,
    icon: Image,
    title: "Nhìn hình chọn chữ",
    subject: "Tiếng Việt",
    desc: "Nhìn hình con cá, con gà… rồi chọn đúng chữ.",
  },
  {
    href: "chon-dau",
    meta: ROUND,
    icon: PenLine,
    title: "Chọn dấu thanh",
    subject: "Tiếng Việt",
    desc: "Nghe “cá” hay “cà”? Chọn chữ có dấu đúng.",
  },
];

const GAMES_2: Game[] = [
  {
    href: "dong-ho",
    art: "clock",
    meta: ROUND,
    icon: Clock,
    title: "Xem đồng hồ",
    subject: "Toán",
    desc: "Giờ đúng, giờ rưỡi, 15 phút — nhìn kim chọn giờ.",
  },
  {
    href: "hai-tao",
    art: "apple",
    meta: ROUND,
    icon: Apple,
    title: "Hái táo lớp 2",
    subject: "Toán",
    desc: "Cộng trừ có nhớ trong phạm vi 100, bảng nhân chia 2 và 5.",
  },
  {
    href: "tien",
    art: "coins",
    meta: ROUND,
    icon: Coins,
    title: "Tiền Việt Nam",
    subject: "Toán",
    desc: "Đếm các tờ 100, 200, 500 đồng; đi chợ tính tiền trả lại.",
  },
  {
    href: "chinh-ta",
    meta: ROUND,
    icon: SpellCheck,
    title: "Điền chữ chính tả",
    subject: "Tiếng Việt",
    desc: "ch hay tr? s hay x? g hay gh? Nhìn hình điền chữ.",
  },
  {
    href: "loai-tu",
    meta: ROUND,
    icon: Tags,
    title: "Từ chỉ gì?",
    subject: "Tiếng Việt",
    desc: "Sự vật, hoạt động hay đặc điểm? Phân loại từ.",
  },
];

const GAMES_3: Game[] = [
  {
    href: "dua-xe",
    art: "car",
    meta: "12 chặng • 1–2 phút",
    icon: CarFront,
    title: "Đua xe bảng nhân",
    subject: "Toán",
    desc: "Đua với Rùa, Thỏ, Tên lửa. Đúng liền 4 câu được NITRO, thắng nhận huy chương!",
  },
  {
    href: "ban-bong",
    art: "balloon",
    meta: "45 giây • 3 trái tim",
    icon: Crosshair,
    title: "Bắn bóng bay",
    subject: "Toán",
    desc: "Bóng bay lên liên tục — chạm đúng kết quả bảng nhân trước khi bóng bay mất.",
  },
  {
    href: "chinh-dong-ho",
    art: "clock",
    meta: ROUND,
    icon: AlarmClock,
    title: "Chỉnh đồng hồ",
    subject: "Toán",
    desc: "Kéo kim cho đúng giờ: từng phút, giờ kém, sau 25 phút là mấy giờ?",
  },
  {
    href: "lam-tron",
    meta: ROUND,
    icon: Target,
    title: "Làm tròn số",
    subject: "Toán",
    desc: "Làm tròn đến hàng chục, hàng trăm: từ 5 trở lên thì làm tròn lên.",
  },
  {
    href: "lat-the",
    art: "cards",
    meta: "8–16 thẻ • 2 phút",
    icon: Layers,
    title: "Lật thẻ từ",
    subject: "Tiếng Việt",
    desc: "Lật thẻ ghép cặp từ trái nghĩa, cùng nghĩa. Ít lượt nhất là kỷ lục!",
  },
];

const GAMES_4: Game[] = [
  {
    href: "phan-so",
    meta: ROUND,
    icon: ChartPie,
    title: "Phân số",
    subject: "Toán",
    desc: "Nhìn thanh sô-cô-la đọc phân số, so sánh và rút gọn phân số.",
  },
  {
    href: "doi-don-vi",
    meta: ROUND,
    icon: Ruler,
    title: "Đổi đơn vị đo",
    subject: "Toán",
    desc: "Yến, tạ, tấn · giây, thế kỉ · mm², cm², dm², m².",
  },
  {
    href: "tu-loai",
    meta: ROUND,
    icon: Tags,
    title: "Danh từ, động từ, tính từ",
    subject: "Tiếng Việt",
    desc: "Đọc từ rồi xếp vào đúng từ loại.",
  },
];

const GAMES_5: Game[] = [
  {
    href: "thap-phan",
    meta: ROUND,
    icon: Hash,
    title: "Số thập phân",
    subject: "Toán",
    desc: "2,5 hay 2,45 lớn hơn? Chữ số thuộc hàng nào? 7/100 viết thế nào?",
  },
  {
    href: "phan-tram",
    meta: ROUND,
    icon: Percent,
    title: "Tỉ số phần trăm",
    subject: "Toán",
    desc: "25% của 80 là bao nhiêu? Giải bài toán tỉ số phần trăm.",
  },
  {
    href: "ket-tu",
    meta: ROUND,
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
  const canRecord = isImportProtected() && (await hasImportAccess((await cookies()).get(IMPORT_COOKIE)?.value));

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <nav aria-label="Đường dẫn" className="flex items-center gap-1 text-xs text-slate-400 mb-5">
          <Link href="/" className="hover:text-slate-700 transition-colors">Trang chủ</Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <Link href={`/lop/${grade}`} className="hover:text-slate-700 transition-colors">Lớp {grade}</Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span className="text-slate-600">Trò chơi</span>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Vừa học vừa chơi</h1>
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
        <div className="mt-5 inline-flex flex-wrap rounded-2xl bg-white p-1.5 shadow-soft ring-1 ring-slate-200">
          {Object.keys(GAMES_BY_GRADE).map((g) => (
            <Link
              key={g}
              href={`/lop/${g}/tro-choi`}
              aria-current={g === grade ? "page" : undefined}
              className={`rounded-xl px-4 py-2 text-sm font-extrabold transition-colors ${
                g === grade ? "bg-primary-600 text-white shadow-sm" : "text-slate-600 hover:bg-primary-50 hover:text-primary-700"
              }`}
            >
              Lớp {g}
            </Link>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {GAMES.map(({ href, icon, title, subject, desc, art, meta }, i) => {
            const cover = COVERS[i % COVERS.length];
            return (
              <Link
                key={href}
                href={`/lop/${grade}/tro-choi/${href}`}
                className="group flex flex-col overflow-hidden rounded-3xl border-2 border-white bg-white shadow-soft transition-all duration-200 hover:shadow-pop focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 motion-safe:hover:-translate-y-1"
              >
                <span className={`relative block h-28 bg-gradient-to-br sm:h-36 ${cover.bg}`}>
                  <span className="absolute inset-0 opacity-40 [background-image:radial-gradient(white_1.5px,transparent_1.5px)] [background-size:16px_16px]" aria-hidden />
                  <span className="relative block h-full p-2 transition-transform duration-300 motion-safe:group-hover:scale-110">
                    <GameArt art={art} icon={icon} iconClass={cover.icon} />
                  </span>
                  <span className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[11px] font-extrabold ${SUBJECT_TAG[subject] ?? "bg-white text-slate-600"}`}>
                    {subject}
                  </span>
                </span>
                <span className="flex flex-1 flex-col p-3 sm:p-4">
                  <span className="block text-base font-black leading-tight text-slate-900 sm:text-lg">{title}</span>
                  <span className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-500 sm:text-sm">{desc}</span>
                  <span className="mt-auto flex items-center justify-between gap-2 pt-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600 sm:text-xs">
                      <Timer className="h-3.5 w-3.5" aria-hidden />
                      {meta}
                    </span>
                    <span className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm transition-transform group-hover:scale-110 sm:flex" aria-hidden>
                      <Play className="h-4 w-4 fill-current" />
                    </span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        {/* Lối vào thu giọng chỉ cho người soạn nội dung (đã nhập mật khẩu khu soạn đề) —
            phụ huynh và bé không thấy. Không đặt mật khẩu thì ẩn luôn; trang vẫn vào được từ
            /huong-dan/soan-de. */}
        {canRecord && (
          <p className="text-center text-xs text-slate-400 mt-10">
            <Link href="/import/giong-tro-choi" className="inline-flex items-center gap-1 hover:text-slate-700">
              <Mic className="h-3.5 w-3.5" aria-hidden />
              Thu giọng đọc cho trò chơi (dành cho người soạn nội dung)
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
