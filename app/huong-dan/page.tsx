import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Hướng dẫn sử dụng",
  description:
    "Hướng dẫn phụ huynh dùng Ôn Tập Tiểu Học: chọn lớp, cho bé làm bài, nghe đọc đề, xem kết quả và lời giải, tải đề in ra giấy, chơi trò chơi lớp 1–2.",
  alternates: { canonical: "/huong-dan" },
};

// Chỉ mô tả những gì web thật sự có — tên nút viết đúng như trên giao diện
// để phụ huynh nhìn là thấy. Đổi nhãn nút ở đâu thì sửa luôn ở đây.

type Step = {
  id: string;
  emoji: string;
  title: string;
  points: React.ReactNode[];
  tip?: string;
  cta?: { href: string; label: string };
};

const STEPS: Step[] = [
  {
    id: "chon-lop",
    emoji: "🎒",
    title: "Chọn lớp và môn học",
    points: [
      <>Ở trang chủ, bấm <b>Chọn lớp của con</b> rồi chọn thẻ lớp (Lớp 1 → Lớp 5).</>,
      <>Chọn môn ở hàng tab trên cùng: <b>Toán</b>, <b>Tiếng Việt</b>…</>,
      <>Chọn <b>Bài tập</b> (luyện theo từng chương, từng bài) hoặc <b>Đề kiểm tra</b> (ôn thi cuối kỳ).</>,
      <>Bấm vào một bài để mở. Mỗi bài ghi sẵn số câu hỏi.</>,
    ],
    cta: { href: "/#grades", label: "Chọn lớp ngay" },
  },
  {
    id: "lam-bai",
    emoji: "✏️",
    title: "Cho bé làm bài",
    points: [
      <>Màn đầu tiên cho biết <b>số câu</b> và <b>số phút</b>. Đồng hồ <b>chưa chạy</b> cho tới khi bấm <b>Bắt đầu làm bài</b>.</>,
      <>Bé chạm vào thẻ đáp án để chọn — thẻ chuyển sang màu xanh. Chọn lại đáp án khác lúc nào cũng được.</>,
      <>Ô số câu (bảng bên cạnh, hoặc cuối trang trên điện thoại) cho biết câu nào đã làm; bấm vào số để nhảy tới câu đó.</>,
      <>Làm xong bấm <b>Nộp bài</b>. Hết giờ web tự nộp.</>,
    ],
    tip: "Muốn bé không học vẹt theo vị trí đáp án? Ở màn đầu tích “Trộn thứ tự câu hỏi” và “Trộn thứ tự đáp án”.",
  },
  {
    id: "nghe-doc",
    emoji: "🔊",
    title: "Nghe đọc đề (cho bé chưa đọc thạo)",
    points: [
      <>Mỗi câu có nút <b>Nghe</b> — máy đọc câu hỏi và các đáp án.</>,
      <>Nút <b>Nghe cả bài</b> ở đầu trang đọc lần lượt từng câu và tự cuộn tới câu đang đọc.</>,
      <>Chỉnh tốc độ <b>Chậm / Vừa / Nhanh</b> ngay cạnh nút. Mặc định là <b>Vừa</b> — đã chậm hơn giọng máy bình thường để bé nghe kịp.</>,
    ],
    tip: "Không nghe thấy tiếng? Tăng âm lượng, và trên iPhone hãy gạt tắt chế độ im lặng (công tắc bên hông máy).",
  },
  {
    id: "ket-qua",
    emoji: "⭐",
    title: "Xem kết quả và lời giải",
    points: [
      <>Nộp bài xong web chấm ngay: số câu <b>Đúng</b>, <b>Sai</b>, <b>Bỏ qua</b>, kèm sao thưởng và lời khen của bạn Cú.</>,
      <>Phần <b>Chi tiết từng câu</b> tô xanh đáp án đúng, tô đỏ đáp án bé chọn sai. Câu nào có <b>Lời giải</b> thì hiện ngay bên dưới.</>,
      <>Bấm <b>Làm lại</b> để làm lại bài, hoặc <b>Quay lại danh sách</b> để chọn bài khác.</>,
    ],
    tip: "Đừng tải lại (F5) trang kết quả — kết quả chỉ giữ tạm trên máy, tải lại là mất.",
  },
  {
    id: "in-de",
    emoji: "🖨️",
    title: "Tải đề về in cho con làm trên giấy",
    points: [
      <>Ở màn đầu của mỗi bài, mục <b>Tải đề để in</b>: chọn <b>Word (.doc)</b> hoặc <b>PDF</b>.</>,
      <>Bấm <b>+ Đáp án</b> để tải bản có đáp án cho phụ huynh chấm.</>,
      <>Tải đề miễn phí, không cần đăng nhập.</>,
    ],
  },
  {
    id: "tro-choi",
    emoji: "🎮",
    title: "Trò chơi cho bé lớp 1, lớp 2",
    points: [
      <>Lớp 1: đếm hình, hái táo, nghe âm chọn chữ, nhìn hình chọn chữ, chọn dấu thanh.</>,
      <>Lớp 2: xem đồng hồ, tính nhẩm trong phạm vi 100, điền chữ chính tả, phân loại từ.</>,
      <>Mỗi lượt 10 câu, khoảng 2–3 phút. Chọn sai không bị trừ điểm — bé được chọn lại; đúng ngay lần đầu thì được một ⭐.</>,
    ],
    cta: { href: "/lop/1/tro-choi", label: "Vào khu trò chơi" },
  },
  {
    id: "dang-nhap",
    emoji: "📈",
    title: "Đăng nhập để theo dõi tiến độ (không bắt buộc)",
    points: [
      <>Không đăng nhập vẫn làm bài, nghe đọc, tải đề và chơi trò chơi bình thường.</>,
      <>Đăng nhập thì kết quả mỗi lần làm bài được lưu lại — xem ở mục <b>Tiến độ học tập</b> trong menu tài khoản.</>,
      <>Người đã đăng nhập còn có tên trong <b>Bảng xếp hạng</b> của lớp (tên được che bớt, vd “ngo***”).</>,
    ],
    cta: { href: "/login", label: "Đăng nhập / Đăng ký" },
  },
];

const FAQ: { q: string; a: string }[] = [
  { q: "Web có mất phí không?", a: "Không. Làm bài, nghe đọc, tải đề và trò chơi đều miễn phí." },
  { q: "Có cần tạo tài khoản không?", a: "Không cần. Tài khoản chỉ để lưu lại kết quả và xem tiến độ học tập." },
  {
    q: "Lỡ tải lại trang khi đang làm bài thì sao?",
    a: "Bài quay về màn đầu và đồng hồ đếm lại từ đầu, các đáp án đã chọn không được giữ. Nên để bé làm một mạch.",
  },
  {
    q: "Dùng trên điện thoại được không?",
    a: "Được. Web làm cho điện thoại trước — nút to, chữ to, bé chạm là chọn.",
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Đầu trang */}
      <section className="border-b border-amber-100 bg-[#FFF9EE]">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-10">
          <span className="text-6xl motion-safe:animate-float" aria-hidden>🦉</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Hướng dẫn sử dụng</h1>
            <p className="mt-1 text-gray-600">
              Lần đầu dùng Ôn Tập Tiểu Học? Bạn Cú chỉ cho phụ huynh từng bước — mất khoảng 2 phút đọc.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Mục lục */}
        <nav aria-label="Mục lục" className="mb-8 flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600"
            >
              {i + 1}. {s.title.replace(/ \(.*\)$/, "")}
            </a>
          ))}
          <a
            href="#hoi-dap"
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600"
          >
            ❓ Hỏi đáp
          </a>
        </nav>

        {/* Các bước */}
        <ol className="space-y-5">
          {STEPS.map((s, i) => (
            <li key={s.id} id={s.id} className="scroll-mt-24 rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl" aria-hidden>
                  {s.emoji}
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Bước {i + 1}</p>
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">{s.title}</h2>
                </div>
              </div>
              <ul className="space-y-2 text-[15px] leading-relaxed text-gray-700">
                {s.points.map((p, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="mt-0.5 text-green-600">✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              {s.tip && (
                <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  💡 {s.tip}
                </p>
              )}
              {s.cta && (
                <Link
                  href={s.cta.href}
                  className="mt-4 inline-flex items-center gap-1 rounded-2xl border-b-4 border-blue-800 bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-500 active:translate-y-0.5 active:border-b-2"
                >
                  {s.cta.label} →
                </Link>
              )}
            </li>
          ))}
        </ol>

        {/* Hỏi đáp */}
        <section id="hoi-dap" className="scroll-mt-24 mt-10">
          <h2 className="mb-4 text-xl font-extrabold text-gray-800">❓ Hỏi đáp nhanh</h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-gray-800">
                  {f.q}
                  <span className="text-gray-400 transition-transform group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-2 text-[15px] leading-relaxed text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-10 rounded-3xl border border-amber-200 bg-[#FFF9EE] p-6 text-center">
          <p className="text-lg font-extrabold text-gray-800">Sẵn sàng rồi! 🎉</p>
          <p className="mt-1 text-gray-600">Chọn lớp của con để bắt đầu bài đầu tiên.</p>
          <Link
            href="/#grades"
            className="mt-4 inline-flex rounded-2xl border-b-4 border-blue-800 bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:bg-blue-500 active:translate-y-0.5 active:border-b-2"
          >
            Chọn lớp của con
          </Link>
        </div>
      </div>
    </div>
  );
}
