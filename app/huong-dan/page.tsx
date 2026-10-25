import type { Metadata } from "next";
import GuidePage, { type GuideFaq, type GuideStep } from "@/components/guide/GuidePage";

export const metadata: Metadata = {
  title: "Hướng dẫn sử dụng",
  description:
    "Hướng dẫn phụ huynh dùng Ôn Tập Cùng Con: chọn lớp, cho bé làm bài, nghe đọc đề, xem kết quả và lời giải, tải đề in ra giấy, chơi trò chơi lớp 1–5.",
  alternates: { canonical: "/huong-dan" },
};

// Chỉ mô tả những gì web thật sự có — tên nút viết đúng như trên giao diện
// để phụ huynh nhìn là thấy. Đổi nhãn nút ở đâu thì sửa luôn ở đây.

const STEPS: GuideStep[] = [
  {
    id: "chon-lop",
    title: "Chọn lớp và môn học",
    points: [
      <>Ở trang chủ, bấm <b>Chọn lớp của con</b> rồi chọn thẻ lớp: Tiểu học (Lớp 1 → Lớp 5) hoặc Trung học cơ sở (Lớp 6 → Lớp 9).</>,
      <>Chọn môn ở hàng tab trên cùng: <b>Toán</b>, <b>Tiếng Việt</b>… (THCS: <b>Ngữ văn</b>, <b>Khoa học tự nhiên</b>, <b>Lịch sử và Địa lí</b>…)</>,
      <>Chọn <b>Bài tập</b> (luyện theo từng chương, từng bài) hoặc <b>Đề kiểm tra</b> (ôn thi cuối kỳ).</>,
      <>Bấm vào một bài để mở. Mỗi bài ghi sẵn số câu hỏi.</>,
      <>Lớp 1 đến lớp 5, phần <b>Bài tập</b> của tab Toán là <b>Toán … theo từng bài sách</b>: các bài xếp đúng thứ tự sách Kết nối tri thức, mỗi bài 10 câu do máy sinh, mỗi lần vào là một bộ câu mới. Bài nào chưa có câu luyện ghi <b>Đang soạn</b>; bài vẽ, đo ghi <b>Thực hành</b> (làm trên giấy).</>,
      <>Lớp 1, lớp 2, tab Tiếng Việt có thêm thẻ <b>Tiếng Việt … theo từng bài sách</b>: mỗi bài 10 câu trắc nghiệm đúng nội dung bài đó. Lớp 1 tập một luyện nhận chữ, tìm tiếng có âm / vần vừa học, ghép tiếng, dấu thanh (chỉ dùng tiếng bé đã học tới bài đó); lớp 1 tập hai và lớp 2 luyện chính tả, từ ngữ, câu, dấu câu, viết hoa.</>,
    ],
    cta: { href: "/#grades", label: "Chọn lớp ngay" },
  },
  {
    id: "lam-bai",
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
    title: "Nghe đọc đề (cho bé chưa đọc thạo)",
    points: [
      <>Có ở các bài <b>lớp 1, lớp 2</b> và mọi bài <b>Tiếng Anh</b>. Từ lớp 3 trở lên, bài các môn khác (kể cả lớp 6–9) không có nút nghe vì các em đã tự đọc được.</>,
      <>Mỗi câu có nút <b>Nghe</b> — máy đọc câu hỏi và các đáp án.</>,
      <>Nút <b>Nghe cả bài</b> ở đầu trang đọc lần lượt từng câu và tự cuộn tới câu đang đọc.</>,
      <>Chỉnh tốc độ <b>Chậm / Vừa / Nhanh</b> ngay cạnh nút. Mặc định là <b>Vừa</b> — đã chậm hơn giọng máy bình thường để bé nghe kịp.</>,
      <>Web dùng giọng đọc có sẵn trong máy. Nếu máy <b>chưa có giọng tiếng Việt</b> (hay gặp ở máy tính Windows dùng Chrome), web sẽ không đọc phần tiếng Việt — giọng nước ngoài đọc sẽ sai dấu — và hiện hướng dẫn cài thêm giọng. Cách nhanh nhất trên máy tính là mở web bằng <b>Microsoft Edge</b>.</>,
    ],
    tip: "Không nghe thấy tiếng? Tăng âm lượng, và trên iPhone hãy gạt tắt chế độ im lặng (công tắc bên hông máy).",
  },
  {
    id: "ket-qua",
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
    title: "Tải đề về in cho con làm trên giấy",
    points: [
      <>Ở màn đầu của mỗi bài, mục <b>Tải đề để in</b>: chọn <b>Word (.doc)</b> hoặc <b>PDF</b>.</>,
      <>Bấm <b>PDF</b>: máy tạo file PDF, tự tải về và hiện từng trang để xem ngay. Trong khung xem có <b>Tải file PDF</b> (tải lại nếu không thấy file) và <b>In</b>.</>,
      <>Bấm <b>+ Đáp án</b> để tải bản có đáp án cho phụ huynh chấm.</>,
      <>Tải đề miễn phí, không cần đăng nhập.</>,
    ],
  },
  {
    id: "tao-de",
    title: "Tạo đề giữa kì, cuối kì",
    points: [
      <>Vào <b>Tạo đề nhanh</b>, chọn lớp, loại đề (<b>Giữa học kì I</b>, <b>Cuối học kì I</b>, <b>Giữa học kì II</b>, <b>Cuối học kì II</b>) và môn, rồi bấm <b>Tạo đề</b>.</>,
      <>Hiện máy tạo được đề <b>Toán lớp 1–5</b>, <b>Tiếng Việt lớp 1–5</b> và <b>Tiếng Anh lớp 3–5</b> (sách Global Success); môn khác ghi <b>Sắp có</b> và có nút xem các đề đã soạn sẵn của môn đó.</>,
      <>Mọi đề theo cấu trúc đề giấy: Phần I trắc nghiệm, Phần II tự luận, tổng 10 điểm. Toán có câu hình vẽ (lớp 1: đếm hình, thước đo, đồng hồ; lớp 2–3: đồng hồ, tiền, đường gấp khúc, chu vi – diện tích; lớp 4: góc, hình bình hành – hình thoi, biểu đồ cột, phân số; lớp 5: hình tam giác, hình thang, hình tròn, hình hộp, biểu đồ quạt), đặt tính và bài toán có lời văn (lớp 1 viết phép tính thích hợp); Tiếng Việt lớp 3–5 có bài đọc hiểu, luyện từ và câu và đề tập làm văn; lớp 1–2 có bài đọc hiểu, bài tập chính tả, đoạn nghe – viết để người lớn đọc cho bé viết (in ở trang hướng dẫn chấm) và lớp 2 thêm viết đoạn văn 4–5 câu; Tiếng Anh lớp 3–5 theo các Unit đã học trong kì, có Listening (làm trên máy thì bấm Nghe hội thoại ở mỗi câu nghe; làm trên giấy thì người lớn đọc lời in kèm), Reading, Writing và Speaking (người lớn hỏi bé 4 câu). Bản in có ô Điểm – Nhận xét, điểm từng câu và hướng dẫn chấm ở trang cuối. Đọc thành tiếng, nghe – viết, Speaking, câu viết câu, viết đoạn và bài tập làm văn chấm trên giấy, không chấm trên máy.</>,
      <>Có đề rồi: bấm <b>Làm bài trên máy</b> để bé làm và được chấm ngay, hoặc <b>Xem & tải PDF</b> (tải file PDF về và xem từng trang ngay trên trang, có nút <b>In</b>), <b>Tải Word (.doc)</b> để làm trên giấy. Bấm <b>Đổi đề khác</b> để ra đề mới.</>,
      <>Bấm <b>Xem đề và đáp án (dành cho phụ huynh)</b> để xem đáp án ngay trên trang. Đề tạo nhanh không được lưu vào tiến độ học tập.</>,
      <>Bé lớp 5 chưa biết viết phần tập làm văn thế nào? Trang <b>Hướng dẫn làm văn lớp 5</b> có cách làm từng dạng bài trong phần Viết của sách Tiếng Việt 5 Kết nối tri thức (kể chuyện sáng tạo, báo cáo công việc, tả phong cảnh, giới thiệu nhân vật, cảm xúc về câu chuyện, bài thơ, sự việc, tả người, chương trình hoạt động, nêu ý kiến tán thành – phản đối): dàn ý, mở bài – kết bài mẫu, bài tham khảo và bảng tự kiểm tra. Hướng dẫn chấm của đề Tiếng Việt lớp 5 in kèm dàn ý gợi ý của đúng dạng bài trong đề.</>,
    ],
    cta: { href: "/tao-de", label: "Tạo đề nhanh" },
  },
  {
    id: "phieu-bai-tap",
    title: "Tạo phiếu bài tập Toán theo chủ đề",
    points: [
      <>Vào <b>Phiếu bài tập</b>, chọn lớp (từ lớp 1 đến lớp 5), một hoặc nhiều chủ đề, số câu và số đề khác nhau.</>,
      <>Bấm <b>Tạo phiếu</b> để xem trước, rồi <b>Tải Word (.doc)</b> hoặc <b>In / lưu PDF</b>. Bấm <b>Đổi bộ câu khác</b> để ra bộ câu mới.</>,
      <>Mỗi đề in trên một trang riêng, có chỗ ghi họ tên; đáp án (kèm lời giải nếu chọn) nằm ở trang cuối.</>,
    ],
    cta: { href: "/phieu-bai-tap", label: "Tạo phiếu bài tập" },
  },
  {
    id: "phieu-tieng-viet",
    title: "Phiếu bài tập Tiếng Việt lớp 2, lớp 3",
    points: [
      <>Ở trang <b>Phiếu bài tập</b>, chọn thẻ <b>Tiếng Việt</b>, rồi chọn <b>Lớp 2</b> hoặc <b>Lớp 3</b>.</>,
      <><b>Lớp 2</b>: chính tả (c/k, g/gh, ng/ngh, ch/tr, s/x, l/n, r/d/gi, vần dễ lẫn, dấu hỏi / dấu ngã), từ chỉ sự vật – hoạt động – đặc điểm, câu giới thiệu – câu nêu hoạt động – câu nêu đặc điểm, dấu câu, viết hoa và bảng chữ cái, mở rộng vốn từ.</>,
      <><b>Lớp 3</b>: chính tả, từ chỉ sự vật – hoạt động – đặc điểm, từ có nghĩa giống nhau – trái ngược nhau, biện pháp so sánh, câu kể – câu hỏi – câu cảm – câu khiến, Khi nào? Ở đâu? Bằng gì? Để làm gì?, dấu câu, mở rộng vốn từ.</>,
      <>Mọi câu là trắc nghiệm, bé khoanh vào chữ đặt trước câu trả lời đúng. Chọn số câu, số đề rồi bấm <b>Tạo phiếu</b>, <b>Tải Word (.doc)</b> hoặc <b>In / lưu PDF</b>; đáp án (kèm giải thích nếu chọn) ở trang cuối.</>,
    ],
    cta: { href: "/phieu-bai-tap?loai=tieng-viet", label: "Tạo phiếu Tiếng Việt" },
  },
  {
    id: "phieu-hang-ngay",
    title: "Phiếu luyện hằng ngày lớp 1, lớp 2 (Toán, Tiếng Việt)",
    points: [
      <>Ở trang <b>Phiếu bài tập</b>, chọn thẻ <b>Phiếu luyện hằng ngày</b>, rồi chọn <b>Lớp 1</b> hoặc <b>Lớp 2</b>.</>,
      <><b>Toán lớp 1</b>: chọn phạm vi 5, 10 hoặc 100 rồi chọn các bài — sơ đồ tách – gộp số, điền dấu &gt; &lt; =, tính, điền số còn thiếu, viết số theo thứ tự, dãy số.</>,
      <><b>Toán lớp 2</b>: tính nhẩm qua 10, cộng trừ có nhớ trong phạm vi 100, tìm số còn thiếu, bảng nhân chia 2 và 5, so sánh số có ba chữ số, viết số thành tổng trăm – chục – đơn vị, đếm thêm 2, 5, 10, 100, đổi m – dm – cm.</>,
      <><b>Tiếng Việt</b>: lớp 1 điền c/k, ch/tr, s/x, l/n, g/gh, ng/ngh, h/th/kh, v/d/gi vào chỗ chấm; lớp 2 điền r/d/gi và vần ao/au, ai/ay, an/ang.</>,
      <>Chọn số phiếu (1, 5 hoặc 10 — mỗi phiếu khác nhau, một trang A4), bấm <b>Tạo phiếu</b> rồi <b>Tải Word (.doc)</b> hoặc <b>In / lưu PDF</b>. Đáp án điền sẵn ở các trang cuối.</>,
    ],
    cta: { href: "/phieu-bai-tap?loai=hang-ngay", label: "Tạo phiếu luyện hằng ngày" },
  },
  {
    id: "hoat-dong-ai",
    title: "Phiếu hoạt động AI cho thầy cô (lớp 1–5)",
    points: [
      <>Ở trang <b>Phiếu bài tập</b>, chọn thẻ <b>Hoạt động AI</b> rồi chọn lớp: mỗi lớp 12 phiếu cho 12 tiết AI cốt lõi, theo Quyết định 2422/QĐ-BGDĐT.</>,
      <>Mỗi phiếu là một tiết, làm trên giấy, không cần máy tính. Chọn tiết cần in (hoặc cả 12 tiết), tick <b>Kèm trang dành cho thầy cô</b> nếu cần mục tiêu, tiến trình 35 phút và đáp án.</>,
      <>Bấm <b>In / lưu PDF</b>. Có đủ lớp 1 đến lớp 5. Phiếu lớp 1 viết câu ngắn để thầy cô đọc to cho các em làm theo. Riêng tiết 10 lớp 5 (công cụ học máy trực quan) cần ít nhất một máy tính để thầy cô làm mẫu.</>,
    ],
    cta: { href: "/phieu-bai-tap?loai=ai", label: "Xem phiếu hoạt động AI" },
  },
  {
    id: "tro-choi",
    title: "Trò chơi cho bé lớp 1 đến lớp 5",
    points: [
      <>Lớp 1: đếm hình, hái táo, so sánh số, nghe âm chọn chữ, nhìn hình chọn chữ, chọn dấu thanh.</>,
      <>Lớp 2: xem đồng hồ, tính nhẩm trong phạm vi 100, tiền Việt Nam, điền chữ chính tả, phân loại từ.</>,
      <>Lớp 3: đua xe bảng nhân, bắn bóng bay, chỉnh đồng hồ (kéo kim), làm tròn số, lật thẻ từ trái nghĩa – cùng nghĩa. Đua xe, bắn bóng, lật thẻ lưu kỷ lục trên máy để bé phá; đua xe thắng thì được huy chương cho từng bảng nhân.</>,
      <>Lớp 4: phân số, đổi đơn vị đo, danh từ – động từ – tính từ. Lớp 5: số thập phân, tỉ số phần trăm, kết từ.</>,
      <>Trò chơi không tự đọc to: bấm <b>🔊 Nghe</b> để nghe câu hỏi, hoặc bấm <b>🔈 Không đọc</b> ở góc phải để chuyển sang <b>🔊 Tự đọc</b> — web sẽ tự đọc câu hỏi và lời khen. Lựa chọn được nhớ trên máy.</>,
      <>Lớp 1, 2, 4, 5, trò chỉnh đồng hồ và làm tròn số: mỗi lượt 10 câu. Chọn sai không bị trừ điểm — bé được chọn lại; đúng ngay lần đầu thì được một ⭐. Nút <b>🔊 Đang bật / 🔇 Đang tắt</b> ở góc phải bật, tắt tiếng hiệu ứng của các trò lớp 3. iPhone để chế độ im lặng (gạt chuông) mà vẫn không nghe tiếng thì gạt chuông lên hoặc tăng âm lượng — iOS 17 trở lên thì không cần.</>,
    ],
    cta: { href: "/lop/1/tro-choi", label: "Vào khu trò chơi" },
  },
  {
    id: "dang-nhap",
    title: "Đăng nhập để theo dõi tiến độ (không bắt buộc)",
    points: [
      <>Không đăng nhập vẫn làm bài, nghe đọc, tải đề và chơi trò chơi bình thường.</>,
      <>Đăng nhập thì kết quả mỗi lần làm bài được lưu lại — xem ở mục <b>Tiến độ học tập</b> trong menu tài khoản.</>,
      <>Người đã đăng nhập còn có tên trong <b>Bảng xếp hạng</b> của lớp (tên được che bớt, vd “ngo***01”). Mỗi bài tính lần làm tốt nhất, tối đa 100 điểm, nên làm càng nhiều bài càng nhiều điểm; làm lại một bài chỉ nâng điểm bài đó.</>,
    ],
    cta: { href: "/login", label: "Đăng nhập / Đăng ký" },
  },
];

const FAQ: GuideFaq[] = [
  {
    q: "Thấy câu hỏi sai đáp án, hoặc muốn góp ý?",
    a: "Ở trang kết quả, mỗi câu có nút “Báo lỗi câu này” (hình lá cờ) — web tự gửi kèm bài và số câu. Góp ý chung thì vào trang Góp ý & liên hệ (link ở cuối trang chủ).",
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
      intro="Lần đầu dùng Ôn Tập Cùng Con? Các bước dưới đây chỉ cho phụ huynh cách dùng — mất khoảng 2 phút đọc."
      steps={STEPS}
      faq={FAQ}
      switchTo={{
        href: "/huong-dan/soan-de",
        label: "Thầy cô, phụ huynh muốn tự soạn bài / đề?",
        desc: "Xem hướng dẫn soạn đề: gõ câu hỏi, dán cả đề, quét ảnh đề, sửa đề, gắn giọng đọc.",
      }}
      outro={{
        title: "Sẵn sàng rồi!",
        desc: "Chọn lớp của con để bắt đầu bài đầu tiên.",
        href: "/#grades",
        label: "Chọn lớp của con",
      }}
    />
  );
}
