import type { Metadata } from "next";
import GuidePage, { type GuideFaq, type GuideStep } from "@/components/guide/GuidePage";

export const metadata: Metadata = {
  title: "Hướng dẫn sử dụng",
  description:
    "Hướng dẫn phụ huynh dùng Ôn Tập Tiểu Học: chọn lớp, cho bé làm bài, nghe đọc đề, xem kết quả và lời giải, tải đề in ra giấy, chơi trò chơi lớp 1–2.",
  alternates: { canonical: "/huong-dan" },
};

// Chỉ mô tả những gì web thật sự có — tên nút viết đúng như trên giao diện
// để phụ huynh nhìn là thấy. Đổi nhãn nút ở đâu thì sửa luôn ở đây.

const STEPS: GuideStep[] = [
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

const FAQ: GuideFaq[] = [
  {
    q: "Thấy câu hỏi sai đáp án, hoặc muốn góp ý?",
    a: "Ở trang kết quả, mỗi câu có nút “🚩 Báo lỗi câu này” — web tự gửi kèm bài và số câu. Góp ý chung thì vào trang Góp ý & liên hệ (link ở cuối trang chủ).",
  },
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

export default function ParentGuidePage() {
  return (
    <GuidePage
      title="Hướng dẫn sử dụng"
      intro="Lần đầu dùng Ôn Tập Tiểu Học? Bạn Cú chỉ cho phụ huynh từng bước — mất khoảng 2 phút đọc."
      steps={STEPS}
      faq={FAQ}
      switchTo={{
        href: "/huong-dan/soan-de",
        label: "✍️ Thầy cô, phụ huynh muốn tự soạn bài / đề?",
        desc: "Xem hướng dẫn soạn đề: gõ câu hỏi, dán cả đề, quét ảnh đề, sửa đề, gắn giọng đọc.",
      }}
      outro={{
        title: "Sẵn sàng rồi! 🎉",
        desc: "Chọn lớp của con để bắt đầu bài đầu tiên.",
        href: "/#grades",
        label: "Chọn lớp của con",
      }}
    />
  );
}
