import type { Metadata } from "next";
import GuidePage, { type GuideFaq, type GuideStep } from "@/components/guide/GuidePage";

export const metadata: Metadata = {
  title: "Hướng dẫn soạn bài và đề kiểm tra",
  description:
    "Hướng dẫn thầy cô, phụ huynh soạn bài học và đề kiểm tra trên Ôn Tập Tiểu Học: gõ câu hỏi, dán cả đề, quét ảnh đề, thêm ảnh và công thức, sửa đề, gắn giọng đọc.",
  alternates: { canonical: "/huong-dan/soan-de" },
};

// Hướng dẫn cho người soạn nội dung (khu /import). Tên nút ghi đúng như trong
// components/import/* — đổi nhãn ở đó thì sửa luôn ở đây.

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[13px] text-gray-800">{children}</code>
);

const STEPS: GuideStep[] = [
  {
    id: "vao-khu-soan",
    emoji: "🔑",
    title: "Vào khu soạn đề",
    points: [
      <>Kéo xuống cuối trang chủ, bấm <b>Dành cho người soạn đề</b>. Nếu đã đăng nhập thì mở menu tài khoản, chọn <b>Tạo bài học</b> hoặc <b>Tạo đề kiểm tra</b>.</>,
      <>Nếu web yêu cầu <b>Nhập mật khẩu</b>, hãy hỏi người quản trị web mật khẩu soạn đề. Phần làm bài của các bé vẫn mở bình thường, không cần mật khẩu.</>,
      <><b>Bài học</b> là bài luyện theo chương. <b>Đề kiểm tra</b> hiện ở mục Đề kiểm tra và trong kho đề, có thời gian làm bài.</>,
    ],
    cta: { href: "/import", label: "Mở khu soạn đề" },
  },
  {
    id: "thong-tin",
    emoji: "📋",
    title: "Điền thông tin bài",
    points: [
      <>Chọn <b>Lớp</b> và <b>Môn học</b>.</>,
      <>Chọn <b>Chương</b> có sẵn, hoặc bấm nút <b>+</b> cạnh ô chương để <b>Tạo chương mới</b>. Để <b>— Không phân chương —</b> thì bài vẫn hiện trên web, trong một chương mặc định.</>,
      <>Điền <b>Tên bài học</b>, <b>STT bài</b> (số thứ tự, vd 01) và <b>Thời gian làm bài (phút)</b> — mặc định 15 phút.</>,
    ],
  },
  {
    id: "soan-cau-hoi",
    emoji: "✏️",
    title: "Soạn từng câu hỏi",
    points: [
      <>Bấm <b>Thêm câu hỏi</b> (hoặc <b>Ctrl+Enter</b>), rồi chọn loại câu:</>,
      <><b>Trắc nghiệm</b>: 2–6 lựa chọn, <b>nhấn ô tròn</b> cạnh đáp án đúng. Bấm <b>+ Thêm đáp án</b> khi cần thêm lựa chọn.</>,
      <><b>Nhiều đáp án</b>: <b>tick ô vuông</b> ở mọi đáp án đúng — bé phải chọn đủ các đáp án đúng và không chọn thừa mới được tính đúng.</>,
      <><b>Tự luận ngắn</b>: gõ đáp án mẫu; nhiều cách viết được chấp nhận thì ngăn bằng dấu <Code>|</Code>, vd <Code>Hà Nội|Ha Noi</Code>. Không phân biệt chữ hoa, chữ thường.</>,
      <><b>Trả lời số</b>: gõ số đáp án; bé gõ <Code>3,5</Code> hay <Code>3.5</Code> đều được chấm đúng.</>,
      <><b>Thêm ảnh</b> cho câu hỏi (JPG, PNG, WEBP, GIF, SVG, tối đa 10MB). Ô <b>Lời giải</b> không bắt buộc — có thì hiện ở trang kết quả sau khi bé nộp bài.</>,
    ],
    tip: (
      <>
        Công thức toán: bấm các nút trong cột <b>LaTeX nhanh</b> để chèn vào ô đang gõ, hoặc gõ thẳng giữa hai dấu $, vd{" "}
        <Code>$\frac{"{1}{2}"}$</Code> sẽ hiện thành phân số một phần hai.
      </>
    ),
  },
  {
    id: "dan-ca-de",
    emoji: "📥",
    title: "Nhập nhanh cả đề (không gõ từng câu)",
    points: [
      <>Bấm <b>Dán đề từ văn bản</b> ở đầu trang soạn. Có 3 cách đưa đề vào:</>,
      <><b>Dán chữ</b> từ Word, Google Docs, trang web vào ô <b>Nội dung đề</b>. Mỗi câu mở đầu bằng <Code>Câu 1.</Code>, đáp án <Code>A.</Code> <Code>B.</Code>… và dòng <Code>Đáp án: B</Code>. Nhiều đáp án đúng: <Code>Đáp án: A, C</Code>. Câu tự luận: chỉ ghi <Code>Đáp án: Hà Nội</Code>. Bấm <b>Chèn ví dụ</b> để xem mẫu.</>,
      <><b>Tải nội dung từ URL</b>: dán đường link bài trên loigiaihay.com, vietjack.com… rồi bấm <b>Tải về</b>.</>,
      <><b>Quét ảnh đề — miễn phí</b>: chụp hoặc chọn ảnh đề (chọn nhiều ảnh cho đề nhiều trang). Máy đọc chữ ngay trên điện thoại, không gửi ảnh đi đâu. Nếu có mục <b>Quét ảnh bằng AI</b> thì cách đó đọc được cả đáp án khoanh bằng bút.</>,
      <>Bấm <b>Phân tích đề</b> để xem trước, rồi chọn <b>Thêm vào danh sách</b> (nối vào các câu đang có) hoặc <b>Thay thế toàn bộ</b>.</>,
    ],
    tip: "Quét ảnh miễn phí không nhận ra đáp án khoanh bút, và máy có thể đọc sai vài chữ — luôn xem lại từng câu và tự chọn đáp án đúng trước khi lưu.",
  },
  {
    id: "luu",
    emoji: "💾",
    title: "Lưu bài",
    points: [
      <>Bấm <b>Lưu bài học</b> hoặc <b>Lưu đề kiểm tra</b> (phím tắt <b>Ctrl+S</b>). Bài hiện ngay trên trang lớp để các bé làm.</>,
      <>Khi đang soạn bài mới, web <b>tự lưu nháp vào trình duyệt</b>: lỡ đóng tab thì mở lại vẫn còn. Nháp chỉ nằm trên máy đang dùng, chưa lên web cho tới khi bấm Lưu.</>,
    ],
  },
  {
    id: "sua-de",
    emoji: "🛠️",
    title: "Sửa bài hoặc đề đã có",
    points: [
      <>Mở bài như khi làm bài, ở màn đầu bấm <b>Sửa đề</b>.</>,
      <>Sửa xong bấm <b>Cập nhật bài học</b> / <b>Cập nhật đề kiểm tra</b>. Muốn sửa lần lượt cả chương thì bấm <b>Lưu &amp; sang bài tiếp</b>.</>,
    ],
    tip: "Cập nhật sẽ thay toàn bộ câu hỏi của bài bằng những gì đang có trên màn hình — kiểm tra đủ câu rồi hãy bấm, vì không có nút hoàn tác.",
  },
  {
    id: "giong-doc",
    emoji: "🎙️",
    title: "Gắn giọng đọc (không bắt buộc)",
    points: [
      <>Mặc định bé nghe bằng giọng máy của điện thoại. Muốn bé nghe giọng người thật: ở màn đầu của bài, bấm <b>Gắn giọng đọc</b>.</>,
      <>Thu âm từng câu, đặt tên file có <b>số thứ tự câu</b>, vd <Code>wav_1.wav</Code>, <Code>wav_2.wav</Code> (nhận WAV, MP3, OGG, M4A). Chọn cả loạt file một lần — máy tự ghép theo số trong tên. Nghe thử từng câu rồi bấm <b>Lưu giọng đọc</b>.</>,
      <>Giọng đọc cho <b>trò chơi lớp 1</b> thì thu ngay trên web ở trang <b>Thu giọng đọc cho trò chơi</b> (cuối trang Trò chơi).</>,
    ],
    cta: { href: "/import/giong-tro-choi", label: "Thu giọng cho trò chơi" },
  },
];

const FAQ: GuideFaq[] = [
  {
    q: "Soạn trên điện thoại được không?",
    a: "Được, nhưng gõ nhiều câu thì máy tính tiện hơn. Trên điện thoại, cách nhanh nhất là Quét ảnh đề hoặc Dán đề từ văn bản.",
  },
  {
    q: "Dán đề xong không nhận ra câu nào?",
    a: (
      <>
        Kiểm tra mỗi câu có mở đầu bằng <Code>Câu 1.</Code> hoặc <Code>Câu 1:</Code>, và đáp án bắt đầu bằng <Code>A.</Code>{" "}
        <Code>B.</Code>… Có thể sửa chữ ngay trong ô Nội dung đề rồi bấm Phân tích đề lại.
      </>
    ),
  },
  {
    q: "Lỡ lưu nhầm, có khôi phục bản cũ được không?",
    a: "Không — web không giữ bản cũ. Nên xem lại trước khi bấm Cập nhật, nhất là với đề đã có nhiều câu.",
  },
  {
    q: "Công thức hiện ra toàn ký hiệu $ \\frac…?",
    a: "Kiểm tra công thức đã nằm trọn giữa hai dấu $ và đủ cặp ngoặc nhọn { }. Trong trang soạn, đáp án và lời giải có công thức được hiện thử ngay dưới ô gõ để soát trước khi lưu.",
  },
];

export default function EditorGuidePage() {
  return (
    <GuidePage
      title="Hướng dẫn soạn bài và đề"
      intro="Dành cho thầy cô và phụ huynh muốn tự đưa bài tập, đề kiểm tra lên cho các bé làm."
      steps={STEPS}
      faq={FAQ}
      switchTo={{
        href: "/huong-dan",
        label: "👨‍👩‍👧 Hướng dẫn cho phụ huynh và bé",
        desc: "Chọn lớp, làm bài, nghe đọc, xem kết quả, tải đề in, trò chơi.",
      }}
      outro={{
        title: "Bắt đầu soạn thôi! ✍️",
        desc: "Mở khu soạn đề và thử tạo bài đầu tiên — dán vài câu mẫu là thấy ngay.",
        href: "/import",
        label: "Mở khu soạn đề",
      }}
    />
  );
}
