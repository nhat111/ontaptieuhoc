import type { Metadata } from "next";
import GuidePage, { type GuideFaq, type GuideStep } from "@/components/guide/GuidePage";

export const metadata: Metadata = {
  title: "Hướng dẫn soạn bài và đề kiểm tra",
  description:
    "Hướng dẫn thầy cô, phụ huynh soạn bài học và đề kiểm tra trên Ôn Tập Phổ Thông: dán đề có sẵn, chụp ảnh đề, soạn từng câu, xem như học sinh, sửa đề, gắn giọng đọc.",
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
    title: "Vào khu soạn đề",
    points: [
      <>Bấm nút <b>Mở khu soạn đề</b> ngay dưới đây (hoặc gõ địa chỉ <Code>/import</Code>, nên lưu lại làm dấu trang). Nếu đã đăng nhập thì mở menu tài khoản, chọn <b>Tạo bài học</b> hoặc <b>Tạo đề kiểm tra</b>.</>,
      <>Nếu web yêu cầu <b>Nhập mật khẩu</b>, hãy hỏi người quản trị web mật khẩu soạn đề. Phần làm bài của các bé vẫn mở bình thường, không cần mật khẩu.</>,
      <><b>Bài học</b> là bài luyện theo chương. <b>Đề kiểm tra</b> hiện ở mục Đề kiểm tra và trong kho đề, có thời gian làm bài.</>,
    ],
    cta: { href: "/import", label: "Mở khu soạn đề" },
  },
  {
    id: "bat-dau",
    title: "Chọn cách bắt đầu",
    points: [
      <>Mở trang soạn, web hỏi <b>Bạn muốn bắt đầu thế nào?</b> với 3 lựa chọn:</>,
      <><b>Dán đề có sẵn</b> — đề đã có trong Word, Zalo, trang web: chép rồi dán vào, máy tự tách câu hỏi và đáp án.</>,
      <><b>Chụp ảnh đề giấy</b> — chụp đề in, máy đọc chữ giúp.</>,
      <><b>Soạn từng câu</b> — gõ từng câu hỏi và đáp án.</>,
      <>Đang soạn dở vẫn đưa thêm đề vào được bằng nút <b>Dán / chụp đề có sẵn</b> ở đầu trang.</>,
    ],
  },
  {
    id: "thong-tin",
    title: "Điền thông tin bài",
    points: [
      <>Chọn <b>Lớp</b>, <b>Môn học</b>, <b>Thời gian (phút)</b> (mặc định 15 phút) và gõ <b>Tên bài</b>.</>,
      <>Muốn xếp bài vào một chương hay đổi số thứ tự, mở <b>Tuỳ chọn thêm: chương, số thứ tự</b>. Bấm <b>+ Tạo chương mới</b> nếu chưa có chương. Không chọn chương thì bài vẫn hiện trên web, trong một chương mặc định.</>,
    ],
  },
  {
    id: "soan-cau-hoi",
    title: "Soạn từng câu hỏi",
    points: [
      <>Bấm <b>Thêm câu hỏi</b> (hoặc <b>Ctrl+Enter</b>), rồi chọn <b>Loại câu hỏi</b> — mỗi loại có ví dụ ngay dưới tên:</>,
      <><b>Trắc nghiệm</b>: 2–6 đáp án, <b>bấm vào chữ cái</b> (A, B, C…) của đáp án đúng. Câu mới chưa chọn sẵn đáp án nào — chưa chọn thì không lưu được. Bấm <b>+ Thêm đáp án</b> khi cần thêm lựa chọn, hoặc <b>Biến thành câu Đúng / Sai</b>.</>,
      <><b>Chọn nhiều đáp án</b>: bấm vào chữ cái của <b>mọi</b> đáp án đúng — bé phải chọn đủ các đáp án đúng và không chọn thừa mới được tính đúng.</>,
      <><b>Điền chữ</b>: gõ đáp án đúng; nhiều cách viết được chấp nhận thì ngăn bằng dấu <Code>|</Code>, vd <Code>Hà Nội | Ha Noi</Code>. Không phân biệt chữ hoa, chữ thường.</>,
      <><b>Điền số</b>: gõ một số; bé gõ <Code>3,5</Code> hay <Code>3.5</Code> đều được chấm đúng. Số nghìn viết liền (<Code>1250</Code>) — viết <Code>1.250</Code> máy sẽ hiểu là 1,25 nên web không cho lưu.</>,
      <><b>Thêm ảnh</b> cho câu hỏi (JPG, PNG, WEBP, GIF, SVG, tối đa 10MB). Ô <b>Lời giải</b> không bắt buộc — có thì bé xem được sau khi nộp bài.</>,
      <>Dán cả câu kèm <Code>A.</Code> <Code>B.</Code> <Code>C.</Code> <Code>D.</Code> vào ô <b>Nội dung câu hỏi</b> thì máy tự tách đáp án ra từng ô (có nút <b>Hoàn tác</b> nếu tách sai).</>,
    ],
    tip: (
      <>
        Phân số, số mũ, căn: bấm nút <b>Phân số</b>, <b>Số mũ</b> hoặc <b>Căn</b> trên ô câu hỏi, điền số vào các ô nhỏ rồi bấm <b>Chèn</b>. Dấu ×, :, ≤, ≥ có sẵn nút. Ô nào có công thức thì ngay dưới có dòng <b>Học sinh sẽ thấy</b> để soát.
      </>
    ),
  },
  {
    id: "dan-ca-de",
    title: "Đưa cả đề vào một lần",
    points: [
      <>Bấm <b>Dán đề có sẵn</b> hoặc <b>Chụp ảnh đề giấy</b> (hoặc nút <b>Dán / chụp đề có sẵn</b> khi đang soạn). Hộp <b>Đưa đề có sẵn vào</b> mở ra:</>,
      <><b>Dán đề đã có</b>: dán chữ từ Word, Zalo, trang web. Mỗi câu mở đầu bằng <Code>Câu 1.</Code>, đáp án <Code>A.</Code> <Code>B.</Code>… và dòng <Code>Đáp án: B</Code>. Nhiều đáp án đúng: <Code>Đáp án: A, C</Code>. Câu điền: chỉ ghi <Code>Đáp án: Hà Nội</Code>. Bấm <b>Xem mẫu</b> để xem đề mẫu.</>,
      <><b>Chụp ảnh đề giấy</b>: chụp hoặc chọn ảnh (chọn nhiều ảnh cho đề nhiều trang). Máy đọc chữ ngay trên điện thoại, chữ đọc được hiện vào ô dán để sửa. Nếu có nút <b>Chụp / chọn ảnh (đọc cả đáp án khoanh)</b> thì cách đó đọc được cả đáp án khoanh bằng bút.</>,
      <>Bấm <b>Đọc đề</b> để xem trước. Câu thiếu đáp án đúng được tô đỏ. Bấm <b>Đưa … câu vào bài</b>; nếu bài đang có câu thì chọn <b>Thêm vào sau các câu đang có</b> hoặc <b>Thay toàn bộ câu đang có</b>.</>,
      <>Lấy đề từ trang web (loigiaihay.com, vietjack.com…): mở <b>Cách khác</b> ở cuối hộp, dán địa chỉ trang rồi bấm <b>Lấy đề</b>.</>,
    ],
    tip: "Đề không có dòng “Đáp án:” hoặc ảnh không có dấu khoanh thì các câu đó chưa có đáp án đúng — sau khi đưa vào, bấm chọn đáp án ở những câu có chữ “Chưa xong”.",
  },
  {
    id: "luu",
    title: "Kiểm tra và lưu",
    points: [
      <>Khung <b>Kiểm tra trước khi lưu</b> (trên điện thoại là thanh dưới đáy màn hình) liệt kê chỗ còn thiếu, vd <i>Câu 3: Chưa chọn đáp án đúng</i>. Bấm vào dòng đó để nhảy tới câu cần sửa.</>,
      <>Bấm <b>Xem như học sinh</b> để làm thử đúng như các bé: chọn đáp án, bấm <b>Kiểm tra</b> xem máy chấm đúng chưa. Bản xem thử không lưu gì.</>,
      <>Bấm <b>Lưu bài</b> (phím tắt <b>Ctrl+S</b>). Bài hiện ngay trên trang lớp để các bé làm.</>,
      <>Khi đang soạn bài mới, web <b>tự lưu nháp trên máy</b>: lỡ đóng tab thì mở lại vẫn còn. Nháp chỉ nằm trên máy đang dùng, chưa lên web cho tới khi bấm Lưu.</>,
    ],
  },
  {
    id: "sua-de",
    title: "Sửa bài hoặc đề đã có",
    points: [
      <>Mở bài như khi làm bài, ở màn đầu bấm <b>Sửa đề</b>.</>,
      <>Sửa xong bấm <b>Lưu thay đổi</b>. Muốn sửa lần lượt cả chương thì bấm <b>Lưu &amp; sang bài tiếp theo</b>. Còn thay đổi chưa lưu thì đầu trang có nhãn <b>Có thay đổi chưa lưu</b>, và web hỏi lại nếu lỡ đóng trang.</>,
    ],
    tip: "Lưu thay đổi sẽ thay toàn bộ câu hỏi của bài bằng những gì đang có trên màn hình — kiểm tra đủ câu rồi hãy bấm, vì không có nút hoàn tác.",
  },
  {
    id: "giong-doc",
    title: "Gắn giọng đọc (không bắt buộc)",
    points: [
      <>Mặc định bé nghe bằng giọng máy của điện thoại. Muốn bé nghe giọng người thật: ở màn đầu của bài <b>Tiếng Anh</b>, bấm <b>Gắn giọng đọc</b>.</>,
      <>Nút nghe chỉ hiện ở bài lớp 1, lớp 2 và bài Tiếng Anh. Bài môn khác từ lớp 3 trở lên không có nút nghe — trừ khi đã gắn giọng đọc cho bài đó.</>,
      <>Thu âm từng câu, đặt tên file có <b>số thứ tự câu</b>, vd <Code>wav_1.wav</Code>, <Code>wav_2.wav</Code> (nhận WAV, MP3, OGG, M4A). Chọn cả loạt file một lần — máy tự ghép theo số trong tên. Nghe thử từng câu rồi bấm <b>Lưu giọng đọc</b>.</>,
      <>Giọng đọc cho <b>trò chơi lớp 1</b> thì thu ngay trên web ở trang <b>Thu giọng đọc cho trò chơi</b> (nút ngay dưới đây, hoặc cuối trang Trò chơi sau khi đã nhập mật khẩu khu soạn đề).</>,
    ],
    cta: { href: "/import/giong-tro-choi", label: "Thu giọng cho trò chơi" },
  },
];

const FAQ: GuideFaq[] = [
  {
    q: "Soạn trên điện thoại được không?",
    a: "Được. Trên điện thoại cách nhanh nhất là Chụp ảnh đề giấy hoặc Dán đề có sẵn; nút Lưu bài luôn nằm ở thanh dưới đáy màn hình.",
  },
  {
    q: "Dán đề xong không nhận ra câu nào?",
    a: (
      <>
        Kiểm tra mỗi câu có mở đầu bằng <Code>Câu 1.</Code> hoặc <Code>Câu 1:</Code>, và đáp án bắt đầu bằng <Code>A.</Code>{" "}
        <Code>B.</Code>… Có thể sửa chữ ngay trong ô dán rồi bấm Đọc đề lại.
      </>
    ),
  },
  {
    q: "Lỡ lưu nhầm, có khôi phục bản cũ được không?",
    a: "Không — web không giữ bản cũ. Nên bấm Xem như học sinh để soát trước khi bấm Lưu thay đổi, nhất là với đề đã có nhiều câu.",
  },
  {
    q: "Công thức hiện ra toàn ký hiệu $ \\frac…?",
    a: "Dùng nút Phân số / Số mũ / Căn để máy viết công thức giúp. Nếu tự gõ thì công thức phải nằm trọn giữa hai dấu $ và đủ cặp ngoặc nhọn { }. Ô nào có công thức thì dòng Học sinh sẽ thấy ngay dưới ô cho biết nó hiện ra thế nào.",
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
        label: "Hướng dẫn cho phụ huynh và bé",
        desc: "Chọn lớp, làm bài, nghe đọc, xem kết quả, tải đề in, trò chơi.",
      }}
      outro={{
        title: "Bắt đầu soạn thôi!",
        desc: "Mở khu soạn đề và thử tạo bài đầu tiên — dán vài câu mẫu là thấy ngay.",
        href: "/import",
        label: "Mở khu soạn đề",
      }}
    />
  );
}
