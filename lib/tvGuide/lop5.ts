// lib/tvGuide/lop5.ts
// Tiếng Việt 5 – Kết nối tri thức: mục lục (nguyên văn) và hướng dẫn cách làm từng dạng bài.
// Luyện từ và câu: hướng dẫn, ví dụ do Ôn Tập Cùng Con TỰ VIẾT, không chép sách. CẦN NGƯỜI DUYỆT.
// Viết: lấy dàn ý từ hướng dẫn làm văn lớp 5 (lib/lamVan.ts) và trỏ sang trang chi tiết,
// để hai nơi không bao giờ lệch nhau.
// Dùng ngoặc kép cong “ ”. `npx tsx scripts/tv-guide-check.ts` kiểm tra phần máy kiểm được.

import { guideById, type GuideId } from "../lamVan";
import type { TvGuide, TvSkill } from "./types";

const S = (s: TvSkill) => s;

/** Dạng Viết dựng từ hướng dẫn làm văn: dàn ý thành các bước, lỗi đầu tiên thành "lỗi hay mắc". */
function fromLamVan(id: string, guideId: GuideId, override?: Partial<Pick<TvSkill, "ten" | "laGi">>): TvSkill {
  const g = guideById(guideId);
  if (!g) throw new Error(`lamVan: không có dạng ${guideId}`);
  return {
    id,
    loai: "viet",
    ten: override?.ten ?? g.name,
    laGi: override?.laGi ?? g.blurb,
    cachLam: g.outline.map((o) => `${o.part}: ${o.points.join(" ")}`),
    loi: g.mistakes[0],
    link: { href: `/lam-van/lop-5/${g.id}`, label: "Xem dàn ý, bài tham khảo và lỗi hay mắc" },
  };
}

const SKILLS: TvSkill[] = [
  /* ───────────── Luyện từ và câu ───────────── */
  S({
    id: "tu-loai", loai: "ltvc", ten: "Danh từ, động từ, tính từ",
    laGi: "Ôn ba từ loại đã học ở lớp 4: danh từ chỉ sự vật, động từ chỉ hoạt động, trạng thái, tính từ chỉ đặc điểm.",
    cachLam: [
      "Đặt câu hỏi cho từng từ: “cái gì, con gì, ai?” (danh từ), “làm gì?” (động từ), “thế nào?” (tính từ).",
      "Thử thêm “đang” trước từ (hợp → động từ) hoặc “rất” (hợp → tính từ).",
      "Một từ có thể đổi loại theo câu, nên luôn xét từ trong câu cụ thể.",
    ],
    viDu: {
      de: "Xếp các từ trong câu vào ba nhóm:",
      cau: "Gió thổi mạnh, những cánh diều bay cao.",
      dapAn: "Danh từ: “Gió”, “cánh diều”. Động từ: “thổi”, “bay”. Tính từ: “mạnh”, “cao”.",
    },
  }),
  S({
    id: "dai-tu", loai: "ltvc", ten: "Đại từ",
    laGi: "Đại từ là từ dùng để xưng hô (tôi, chúng tôi, bạn, nó, họ…), để hỏi (ai, gì, đâu, nào, bao nhiêu…) hoặc để thay thế cho danh từ, động từ, tính từ, cụm từ (vậy, thế, đó, này…) cho khỏi lặp.",
    cachLam: [
      "Tìm từ dùng để gọi người nói, người nghe, người được nhắc tới → đại từ xưng hô.",
      "Tìm từ dùng để hỏi → đại từ nghi vấn.",
      "Tìm từ đứng thay cho một từ ngữ đã nói trước đó → đại từ thay thế; nói rõ nó thay cho từ ngữ nào.",
    ],
    viDu: {
      de: "Tìm đại từ và cho biết nó dùng để làm gì:",
      cau: "Nam thích đá bóng, tôi cũng vậy.",
      dapAn: "“tôi”: đại từ xưng hô. “vậy”: đại từ thay thế cho “thích đá bóng”.",
    },
    loi: "Bỏ sót đại từ thay thế như “vậy”, “thế” vì chúng không chỉ người.",
  }),
  S({
    id: "dong-nghia", loai: "ltvc", ten: "Từ đồng nghĩa",
    laGi: "Từ đồng nghĩa là những từ có nghĩa giống nhau hoặc gần giống nhau. Có từ thay được cho nhau trong mọi câu (hổ – cọp), có từ khác nhau về sắc thái, phải chọn cho hợp câu (ăn – xơi – chén).",
    cachLam: [
      "Hiểu nghĩa của từ đã cho, nghĩ những từ cùng nghĩa với nó.",
      "Khi chọn từ điền vào câu: thay lần lượt từng từ đồng nghĩa, đọc lên, chọn từ hợp sắc thái nhất (trang trọng, thân mật, mạnh, nhẹ).",
    ],
    viDu: {
      de: "Chọn từ hợp nhất: “Mời ông … cơm ạ!” (ăn, xơi, chén)",
      dapAn: "“xơi”: lời mời người lớn tuổi cần từ trang trọng, lễ phép.",
    },
    loi: "Chọn từ đúng nghĩa nhưng sai sắc thái, như dùng “chén” trong lời mời ông bà.",
  }),
  S({
    id: "da-nghia", loai: "ltvc", ten: "Từ đa nghĩa",
    laGi: "Từ đa nghĩa có một nghĩa gốc và một hay nhiều nghĩa chuyển. Các nghĩa này có liên quan với nhau (chân người, chân bàn, chân núi: đều là phần ở dưới cùng).",
    cachLam: [
      "Tìm nghĩa gốc: nghĩa đầu tiên, thường chỉ bộ phận cơ thể, sự vật cụ thể.",
      "So từng câu với nghĩa gốc: nghĩa khác nhưng có nét giống → nghĩa chuyển.",
      "Nếu các nghĩa hoàn toàn không liên quan thì đó là từ đồng âm, không phải từ đa nghĩa.",
    ],
    viDu: {
      de: "Từ “chân” trong câu nào mang nghĩa gốc, câu nào mang nghĩa chuyển?",
      cau: "Em bé ngồi cạnh chân bàn, hai chân đung đưa.",
      dapAn: "“hai chân” (chân của em bé): nghĩa gốc. “chân bàn”: nghĩa chuyển, chỉ phần dưới cùng của cái bàn.",
    },
  }),
  S({
    id: "dong-nghia-da-nghia", loai: "ltvc", ten: "Phân biệt từ đồng nghĩa và từ đa nghĩa",
    laGi: "Từ đồng nghĩa là NHIỀU từ khác nhau có nghĩa giống nhau. Từ đa nghĩa là MỘT từ có nhiều nghĩa liên quan với nhau.",
    cachLam: [
      "Đề cho nhiều từ khác nhau → xét xem nghĩa có giống nhau không (đồng nghĩa).",
      "Đề cho một từ dùng trong nhiều câu → tìm nghĩa gốc, nghĩa chuyển (đa nghĩa).",
    ],
    viDu: {
      de: "“siêng năng – chăm chỉ” và “mũi (người) – mũi (thuyền)”: cặp nào là từ đồng nghĩa, cặp nào là từ đa nghĩa?",
      dapAn: "“siêng năng – chăm chỉ”: hai từ đồng nghĩa. “mũi”: một từ đa nghĩa (mũi thuyền là nghĩa chuyển).",
    },
  }),
  S({
    id: "tu-dien", loai: "ltvc", ten: "Sử dụng từ điển",
    laGi: "Từ điển xếp từ theo thứ tự bảng chữ cái, mỗi từ có các nghĩa được đánh số và ví dụ cách dùng. Dùng từ điển để hiểu nghĩa từ, tìm từ đồng nghĩa, phân biệt nghĩa gốc, nghĩa chuyển.",
    cachLam: [
      "Tìm đến phần chữ cái đầu của từ, rồi dò tiếp theo các chữ cái sau.",
      "Đọc tất cả các nghĩa được đánh số và ví dụ.",
      "Chọn nghĩa hợp với câu đang xét; nghĩa gốc thường được ghi trước.",
    ],
    loi: "Chỉ đọc nghĩa thứ nhất rồi dùng cho mọi câu.",
  }),
  S({
    id: "gach-ngang", loai: "ltvc", ten: "Dấu gạch ngang",
    laGi: "Dấu gạch ngang dùng để: đánh dấu lời nói của nhân vật; đánh dấu các ý liệt kê; nối các từ ngữ trong một liên danh; đánh dấu phần chú thích, giải thích trong câu.",
    cachLam: [
      "Đầu dòng, trước lời nhân vật → đánh dấu lời nói.",
      "Đầu mỗi ý của một danh sách → đánh dấu ý liệt kê.",
      "Giữa hai tên riêng (Hà Nội – Huế) → nối các từ ngữ trong liên danh.",
      "Giữa câu, trước phần nói thêm cho rõ → đánh dấu phần chú thích.",
    ],
    viDu: {
      de: "Dấu gạch ngang trong câu sau dùng để làm gì?",
      cau: "Tuyến đường sắt Bắc – Nam dài hơn 1 700 ki-lô-mét.",
      dapAn: "Nối “Bắc” và “Nam” trong một liên danh (tên tuyến đường).",
    },
    loi: "Viết dấu gạch nối ngắn (-) thay cho dấu gạch ngang (–).",
  }),
  S({
    id: "diep-tu", loai: "ltvc", ten: "Biện pháp điệp từ, điệp ngữ",
    laGi: "Điệp từ, điệp ngữ là lặp lại một từ hoặc một cụm từ để nhấn mạnh ý, gây ấn tượng, tạo nhịp điệu cho câu thơ, câu văn.",
    cachLam: [
      "Tìm từ, cụm từ được lặp lại nhiều lần.",
      "Nói rõ việc lặp lại đó nhấn mạnh điều gì, gợi cảm xúc gì.",
    ],
    viDu: {
      de: "Tìm điệp ngữ và nêu tác dụng:",
      cau: "Nhớ sao tiếng mẹ ru hời, / Nhớ sao bóng mẹ bên đời con thơ.",
      dapAn: "Điệp ngữ “Nhớ sao” nhấn mạnh nỗi nhớ mẹ da diết.",
    },
    loi: "Nhầm lỗi lặp từ khi viết (lặp vì thiếu từ) với điệp từ (lặp có chủ ý để nhấn mạnh).",
  }),
  S({
    id: "ket-tu", loai: "ltvc", ten: "Kết từ",
    laGi: "Kết từ dùng để nối các từ ngữ hoặc các câu, cho biết quan hệ giữa chúng: và, với, hay, hoặc, nhưng, mà, thì, của, ở, bằng, để, vì, nên, do, nhờ…",
    cachLam: [
      "Tìm từ đứng giữa, nối hai từ ngữ hoặc hai vế câu.",
      "Xác định quan hệ: cùng loại (và, với), lựa chọn (hay, hoặc), tương phản (nhưng, mà), nguyên nhân – kết quả (vì, nên, do, nhờ)…",
      "Khi điền kết từ: đọc cả hai vế, xem chúng quan hệ thế nào rồi chọn từ.",
    ],
    viDu: {
      de: "Tìm kết từ và nêu quan hệ nó biểu thị:",
      cau: "Trời mưa to nhưng chúng em vẫn đến trường đúng giờ.",
      dapAn: "“nhưng”: biểu thị quan hệ tương phản.",
    },
  }),
  S({
    id: "dai-tu-ket-tu", loai: "ltvc", ten: "Đại từ và kết từ",
    laGi: "Đại từ đứng thay cho từ ngữ (tôi, nó, vậy, thế…); kết từ nối các từ ngữ, các câu (và, nhưng, vì, nên…).",
    cachLam: [
      "Từ đứng thay cho người, vật, việc đã nói → đại từ.",
      "Từ nối hai từ ngữ hoặc hai vế câu → kết từ.",
    ],
    viDu: {
      de: "Tìm đại từ và kết từ:",
      cau: "Tôi thích đọc truyện nhưng em gái tôi lại thích vẽ.",
      dapAn: "Đại từ xưng hô: “Tôi”, “tôi”. Kết từ: “nhưng” (quan hệ tương phản).",
    },
  }),
  S({
    id: "cau-ghep", loai: "ltvc", ten: "Câu đơn, câu ghép và cách nối các vế",
    laGi: "Câu đơn có một cụm chủ ngữ – vị ngữ. Câu ghép có từ hai vế trở lên, mỗi vế có chủ ngữ – vị ngữ riêng. Các vế nối bằng kết từ (và, nhưng, hoặc, vì… nên, nếu… thì, tuy… nhưng), cặp từ hô ứng (vừa… đã, càng… càng) hoặc dấu câu (dấu phẩy, dấu chấm phẩy, dấu hai chấm).",
    cachLam: [
      "Tìm tất cả các cụm chủ ngữ – vị ngữ trong câu: một cụm là câu đơn, từ hai cụm là câu ghép.",
      "Tách các vế, gạch chủ ngữ, vị ngữ của từng vế.",
      "Xem các vế được nối bằng gì: kết từ, cặp từ hô ứng hay dấu câu.",
    ],
    viDu: {
      de: "Câu sau là câu đơn hay câu ghép? Các vế nối bằng gì?",
      cau: "Vì trời mưa to nên trận đấu bị hoãn.",
      dapAn: "Câu ghép, hai vế “trời mưa to” và “trận đấu bị hoãn”, nối bằng cặp kết từ “Vì” … “nên” (nguyên nhân – kết quả).",
    },
    loi: "Tưởng câu có nhiều vị ngữ chung một chủ ngữ là câu ghép (“Em quét nhà và rửa bát.” là câu đơn).",
  }),
  S({
    id: "lien-ket", loai: "ltvc", ten: "Liên kết câu trong đoạn văn",
    laGi: "Các câu trong đoạn văn được nối với nhau bằng cách lặp từ ngữ, dùng từ ngữ nối (vì vậy, tuy nhiên, sau đó, ngoài ra…) hoặc dùng từ ngữ thay thế (đại từ, từ đồng nghĩa).",
    cachLam: [
      "Đọc câu sau, tìm từ ngữ giúp nó nối với câu trước.",
      "Từ ngữ được nhắc lại y nguyên → lặp từ ngữ. Từ ngữ đứng đầu câu chỉ quan hệ → từ ngữ nối. Từ ngữ khác nhưng chỉ cùng người, vật → từ ngữ thay thế.",
      "Khi tự viết, dùng thay thế cho đỡ lặp, nhưng phải rõ đang nói về ai.",
    ],
    viDu: {
      de: "Tìm từ ngữ liên kết các câu:",
      cau: "Lan và Hoa là đôi bạn thân. Hai bạn cùng học một lớp. Vì vậy, họ thường đi học cùng nhau.",
      dapAn: "“Hai bạn”, “họ”: từ ngữ thay thế cho Lan và Hoa. “Vì vậy”: từ ngữ nối.",
    },
  }),
  S({
    id: "viet-hoa-ton-trong", loai: "ltvc", ten: "Viết hoa danh từ chung để tỏ sự tôn trọng",
    laGi: "Một số danh từ chung được viết hoa để thể hiện sự tôn trọng đặc biệt, ví dụ “Bác”, “Người” khi chỉ Bác Hồ, “Tổ quốc”.",
    cachLam: [
      "Xác định từ đó chỉ ai, chỉ điều gì trong câu.",
      "Nếu chỉ Bác Hồ hoặc Tổ quốc thì viết hoa chữ cái đầu để tỏ lòng kính trọng.",
    ],
    viDu: {
      de: "Vì sao từ “Người” trong câu thứ hai được viết hoa?",
      cau: "Bác Hồ rất yêu thiếu nhi. Người thường gửi thư cho các cháu.",
      dapAn: "“Người” chỉ “Bác Hồ”, viết hoa để thể hiện sự tôn kính.",
    },
  }),
  S({
    id: "ten-nuoc-ngoai", loai: "ltvc", ten: "Viết tên người, tên địa lí nước ngoài",
    laGi: "Tên phiên âm theo âm Hán Việt viết như tên Việt Nam (Bắc Kinh). Tên phiên âm trực tiếp: viết hoa chữ cái đầu của mỗi bộ phận, các tiếng trong cùng một bộ phận nối với nhau bằng dấu gạch nối (Mát-xcơ-va, Lép Tôn-xtôi).",
    cachLam: [
      "Chia tên thành các bộ phận (họ, tên; hoặc một tên địa lí).",
      "Viết hoa chữ cái đầu của mỗi bộ phận.",
      "Bộ phận có nhiều tiếng thì nối các tiếng bằng dấu gạch nối, chỉ tiếng đầu viết hoa.",
    ],
    viDu: {
      de: "Viết lại cho đúng: “mát-xcơ-va”, “lép tôn-xtôi”, “bắc kinh”.",
      dapAn: "Mát-xcơ-va; Lép Tôn-xtôi; Bắc Kinh.",
    },
    loi: "Viết hoa mọi tiếng (“Mát-Xcơ-Va”) hoặc quên dấu gạch nối.",
  }),

  /* ───────────── Viết: lấy từ hướng dẫn làm văn lớp 5 ───────────── */
  fromLamVan("ke-chuyen-sang-tao", "ke-chuyen-sang-tao"),
  fromLamVan("bao-cao-cong-viec", "bao-cao-cong-viec"),
  fromLamVan("ta-canh", "ta-canh"),
  fromLamVan("gioi-thieu-nhan-vat", "gioi-thieu-nhan-vat"),
  fromLamVan("cam-xuc-cau-chuyen", "cam-xuc-cau-chuyen"),
  fromLamVan("cam-xuc-bai-tho", "cam-xuc-bai-tho"),
  fromLamVan("ta-nguoi", "ta-nguoi"),
  fromLamVan("cam-xuc-su-viec", "cam-xuc-su-viec"),
  fromLamVan("chuong-trinh-hoat-dong", "chuong-trinh-hoat-dong"),
  fromLamVan("y-kien-tan-thanh", "neu-y-kien", {
    ten: "Đoạn văn nêu ý kiến tán thành",
    laGi: "Nêu ý kiến đồng tình với một sự việc, hiện tượng và đưa ra lí do, dẫn chứng thuyết phục.",
  }),
  fromLamVan("y-kien-phan-doi", "neu-y-kien", {
    ten: "Đoạn văn nêu ý kiến phản đối",
    laGi: "Nêu ý kiến không đồng tình với một sự việc, hiện tượng, đưa ra lí do, dẫn chứng và đề xuất cách làm đúng.",
  }),
];

export const TV_GUIDE_5: TvGuide = {
  grade: 5,
  book: "Tiếng Việt 5 – Kết nối tri thức với cuộc sống",
  source: "Mục lục tập 1, tập 2 đối chiếu trên loigiaihay.com và vietjack.com (10/2026)",
  chuDiem: [
    { so: 1, ten: "Thế giới tuổi thơ", tap: 1, tu: 1, den: 8, docHieu: "Các bài đọc nói về niềm vui, ước mơ, trí tưởng tượng của tuổi thơ. Chú ý cảm xúc của nhân vật và chi tiết em thấy thú vị." },
    { so: 2, ten: "Thiên nhiên kì thú", tap: 1, tu: 9, den: 16, docHieu: "Các bài đọc tả cảnh thiên nhiên trong nước và trên thế giới. Tìm từ ngữ, hình ảnh tả vẻ đẹp, sự kì lạ của cảnh và tình cảm của tác giả." },
    { so: 3, ten: "Trên con đường học tập", tap: 1, tu: 17, den: 24, docHieu: "Các bài đọc nói về việc học, tự học và tấm gương học tập. Trả lời được: nhân vật học như thế nào, gặp khó khăn gì, em học được điều gì." },
    { so: 4, ten: "Nghệ thuật muôn màu", tap: 1, tu: 25, den: 32, docHieu: "Các bài đọc nói về âm nhạc, hội hoạ, điện ảnh, múa, kiến trúc. Tìm nét đặc sắc của môn nghệ thuật được nói tới và cảm xúc nó mang lại." },
    { so: 5, ten: "Vẻ đẹp cuộc sống", tap: 2, tu: 1, den: 8, docHieu: "Các bài đọc nói về vẻ đẹp của con người, lao động và tình cảm gia đình. Chú ý việc làm, phẩm chất đáng quý của nhân vật." },
    { so: 6, ten: "Hương sắc trăm miền", tap: 2, tu: 9, den: 16, docHieu: "Các bài đọc giới thiệu phong tục, lễ hội, sản vật, cảnh đẹp các vùng miền. Ghi nhớ nét riêng của từng miền và tình cảm của tác giả." },
    { so: 7, ten: "Tiếp bước cha ông", tap: 2, tu: 17, den: 24, docHieu: "Các bài đọc nói về truyền thống, danh nhân, người anh hùng. Nắm được nhân vật là ai, đã làm gì, vì sao đáng kính trọng." },
    { so: 8, ten: "Thế giới của chúng ta", tap: 2, tu: 25, den: 30, docHieu: "Các bài đọc nói về hoà bình, môi trường, khoa học và cuộc sống hiện đại. Tìm thông tin chính và thông điệp tác giả muốn gửi." },
  ],
  bai: [
    // Tập 1
    { tap: 1, so: 1, doc: "Thanh âm của gió", ltvc: { ten: "Luyện tập về danh từ, động từ, tính từ", ky: "tu-loai" }, viet: { ten: "Tìm hiểu cách viết bài văn kể chuyện sáng tạo", ky: "ke-chuyen-sang-tao" } },
    { tap: 1, so: 2, doc: "Cánh đồng hoa", viet: { ten: "Tìm hiểu cách viết bài văn kể chuyện sáng tạo (tiếp theo)", ky: "ke-chuyen-sang-tao" }, them: "Đọc mở rộng" },
    { tap: 1, so: 3, doc: "Tuổi ngựa", ltvc: { ten: "Đại từ", ky: "dai-tu" }, viet: { ten: "Lập dàn ý cho bài văn kể chuyện sáng tạo", ky: "ke-chuyen-sang-tao" } },
    { tap: 1, so: 4, doc: "Bến sông tuổi thơ", viet: { ten: "Viết bài văn kể chuyện sáng tạo", ky: "ke-chuyen-sang-tao" }, them: "Những câu chuyện thú vị" },
    { tap: 1, so: 5, doc: "Tiếng hạt nảy mầm", ltvc: { ten: "Luyện tập về đại từ", ky: "dai-tu" }, viet: { ten: "Đánh giá, chỉnh sửa bài văn kể chuyện sáng tạo", ky: "ke-chuyen-sang-tao" } },
    { tap: 1, so: 6, doc: "Ngôi sao sân cỏ", viet: { ten: "Tìm hiểu cách viết báo cáo công việc", ky: "bao-cao-cong-viec" }, them: "Đọc mở rộng" },
    { tap: 1, so: 7, doc: "Bộ sưu tập độc đáo", ltvc: { ten: "Luyện tập về đại từ (Tiếp theo)", ky: "dai-tu" }, viet: { ten: "Viết báo cáo công việc", ky: "bao-cao-cong-viec" } },
    { tap: 1, so: 8, doc: "Hành tinh kì lạ", viet: { ten: "Đánh giá, chỉnh sửa báo cáo công việc", ky: "bao-cao-cong-viec" }, them: "Những điểm vui chơi lí thú" },
    { tap: 1, so: 9, doc: "Trước cổng trời", ltvc: { ten: "Từ đồng nghĩa", ky: "dong-nghia" }, viet: { ten: "Tìm hiểu cách viết bài văn tả phong cảnh", ky: "ta-canh" } },
    { tap: 1, so: 10, doc: "Kì diệu rừng xanh", viet: { ten: "Tìm hiểu cách viết bài văn tả phong cảnh (Tiếp theo)", ky: "ta-canh" }, them: "Đọc mở rộng" },
    { tap: 1, so: 11, doc: "Hang Sơn Đoòng - Những điều kì thú", ltvc: { ten: "Luyện tập về từ đồng nghĩa", ky: "dong-nghia" }, viet: { ten: "Viết mở bài và kết bài cho bài văn tả phong cảnh", ky: "ta-canh" } },
    { tap: 1, so: 12, doc: "Những hòn đảo trên Vịnh Hạ Long", viet: { ten: "Quan sát phong cảnh", ky: "ta-canh" }, them: "Bảo tồn động vật hoang dã" },
    { tap: 1, so: 13, doc: "Mầm non", ltvc: { ten: "Từ đa nghĩa", ky: "da-nghia" }, viet: { ten: "Lập dàn ý cho bài văn tả phong cảnh", ky: "ta-canh" } },
    { tap: 1, so: 14, doc: "Những ngọn núi nóng rẫy", viet: { ten: "Viết đoạn văn tả phong cảnh", ky: "ta-canh" }, them: "Đọc mở rộng" },
    { tap: 1, so: 15, doc: "Bài ca về mặt trời", ltvc: { ten: "Luyện tập về từ đa nghĩa", ky: "da-nghia" }, viet: { ten: "Viết bài văn tả phong cảnh", ky: "ta-canh" } },
    { tap: 1, so: 16, doc: "Xin chào, Xa-ha-ra", viet: { ten: "Đánh giá, chỉnh sửa bài văn tả phong cảnh", ky: "ta-canh" }, them: "Cảnh đẹp thiên nhiên" },
    { tap: 1, so: 17, doc: "Thư gửi các học sinh", ltvc: { ten: "Sử dụng từ điển", ky: "tu-dien" }, viet: { ten: "Tìm hiểu cách viết đoạn văn giới thiệu nhân vật trong một cuốn sách", ky: "gioi-thieu-nhan-vat" } },
    { tap: 1, so: 18, doc: "Tấm gương tự học", viet: { ten: "Tìm ý cho đoạn văn giới thiệu nhân vật trong một cuốn sách", ky: "gioi-thieu-nhan-vat" }, them: "Đọc mở rộng" },
    { tap: 1, so: 19, doc: "Trải nghiệm để sáng tạo", ltvc: { ten: "Luyện tập sử dụng từ điển", ky: "tu-dien" }, viet: { ten: "Viết đoạn văn giới thiệu nhân vật trong một cuốn sách", ky: "gioi-thieu-nhan-vat" } },
    { tap: 1, so: 20, doc: "Khổ luyện thành tài", viet: { ten: "Đánh giá, chỉnh sửa đoạn văn giới thiệu nhân vật trong một cuốn sách", ky: "gioi-thieu-nhan-vat" }, them: "Cuốn sách tôi yêu" },
    { tap: 1, so: 21, doc: "Thế giới trong trang sách", ltvc: { ten: "Dấu gạch ngang", ky: "gach-ngang" }, viet: { ten: "Tìm hiểu cách viết đoạn văn thể hiện tình cảm, cảm xúc về một câu chuyện", ky: "cam-xuc-cau-chuyen" } },
    { tap: 1, so: 22, doc: "Từ những câu chuyện ấu thơ", viet: { ten: "Tìm ý cho đoạn văn thể hiện tình cảm, cảm xúc về một câu chuyện", ky: "cam-xuc-cau-chuyen" }, them: "Đọc mở rộng" },
    { tap: 1, so: 23, doc: "Giới thiệu sách Dế mèn phiêu lưu kí", ltvc: { ten: "Luyện tập về dấu gạch ngang", ky: "gach-ngang" }, viet: { ten: "Viết đoạn văn thể hiện tình cảm, cảm xúc về một câu chuyện", ky: "cam-xuc-cau-chuyen" } },
    { tap: 1, so: 24, doc: "Tinh thần học tập của nhà Phi-lít", viet: { ten: "Đánh giá, chỉnh sửa đoạn văn thể hiện tình cảm, cảm xúc về một câu chuyện", ky: "cam-xuc-cau-chuyen" }, them: "Lợi ích của tự học" },
    { tap: 1, so: 25, doc: "Tiếng đàn Ba-la-lai-ca trên sông Đà", ltvc: { ten: "Biện pháp điệp từ, điệp ngữ", ky: "diep-tu" }, viet: { ten: "Tìm hiểu cách viết đoạn văn thể hiện tình cảm, cảm xúc về một bài thơ", ky: "cam-xuc-bai-tho" } },
    { tap: 1, so: 26, doc: "Trí tưởng tượng phong phú", viet: { ten: "Tìm ý cho đoạn văn thể hiện tình cảm, cảm xúc về một bài thơ", ky: "cam-xuc-bai-tho" }, them: "Đọc mở rộng" },
    { tap: 1, so: 27, doc: "Tranh làng Hồ", ltvc: { ten: "Luyện tập về điệp từ, điệp ngữ", ky: "diep-tu" }, viet: { ten: "Viết đoạn văn thể hiện tình cảm, cảm xúc về một bài thơ", ky: "cam-xuc-bai-tho" } },
    { tap: 1, so: 28, doc: "Tập hát quan họ", viet: { ten: "Đánh giá, chỉnh sửa đoạn văn thể hiện tình cảm, cảm xúc về một bài thơ", ky: "cam-xuc-bai-tho" }, them: "Chương trình nghệ thuật em yêu thích" },
    { tap: 1, so: 29, doc: "Phim hoạt hình Chú ốc sên bay", ltvc: { ten: "Kết từ", ky: "ket-tu" }, viet: { ten: "Tìm hiểu cách viết đoạn văn giới thiệu nhân vật trong một bộ phim hoạt hình", ky: "gioi-thieu-nhan-vat" } },
    { tap: 1, so: 30, doc: "Nghệ thuật múa ba lê", viet: { ten: "Tìm ý cho đoạn văn giới thiệu nhân vật trong một bộ phim hoạt hình", ky: "gioi-thieu-nhan-vat" }, them: "Đọc mở rộng" },
    { tap: 1, so: 31, doc: "Một ngôi chùa độc đáo", ltvc: { ten: "Luyện tập về kết từ", ky: "ket-tu" }, viet: { ten: "Viết đoạn văn giới thiệu nhân vật trong một bộ phim hoạt hình", ky: "gioi-thieu-nhan-vat" } },
    { tap: 1, so: 32, doc: "Sự tích chú Tễu", viet: { ten: "Đánh giá, chỉnh sửa đoạn văn giới thiệu nhân vật trong một bộ phim hoạt hình", ky: "gioi-thieu-nhan-vat" }, them: "Bộ phim yêu thích" },
    // Tập 2
    { tap: 2, so: 1, doc: "Tiếng hát của người đá", ltvc: { ten: "Câu đơn và câu ghép", ky: "cau-ghep" }, viet: { ten: "Tìm hiểu cách viết bài văn tả người", ky: "ta-nguoi" } },
    { tap: 2, so: 2, doc: "Khúc hát ru những em bé lớn trên lưng mẹ", viet: { ten: "Viết mở bài và kết bài cho bài văn tả người", ky: "ta-nguoi" }, them: "Đọc mở rộng" },
    { tap: 2, so: 3, doc: "Hạt gạo làng ta", ltvc: { ten: "Cách nối các vế câu ghép", ky: "cau-ghep" }, viet: { ten: "Quan sát để viết bài văn tả người", ky: "ta-nguoi" } },
    { tap: 2, so: 4, doc: "Hộp quà màu thiên thanh", viet: { ten: "Lập dàn ý cho bài văn tả người", ky: "ta-nguoi" }, them: "Nét đẹp học đường" },
    { tap: 2, so: 5, doc: "Giỏ hoa tháng Năm", ltvc: { ten: "Cách nối các vế câu ghép (Tiếp theo)", ky: "cau-ghep" }, viet: { ten: "Viết đoạn văn tả người", ky: "ta-nguoi" } },
    { tap: 2, so: 6, doc: "Thư của bố", viet: { ten: "Viết bài văn tả người (Bài viết số 1)", ky: "ta-nguoi" } },
    { tap: 2, so: 7, doc: "Đoàn thuyền đánh cá", ltvc: { ten: "Luyện tập về câu ghép", ky: "cau-ghep" }, viet: { ten: "Đánh giá, chỉnh sửa bài văn tả người", ky: "ta-nguoi" } },
    { tap: 2, so: 8, doc: "Khu rừng của Mát", viet: { ten: "Viết bài văn tả người (Bài viết số 2)", ky: "ta-nguoi" }, them: "Những ý kiến khác biệt" },
    { tap: 2, so: 9, doc: "Hội thổi cơm thi ở Đồng Vân", ltvc: { ten: "Liên kết câu bằng cách lặp từ ngữ", ky: "lien-ket" }, viet: { ten: "Tìm hiểu cách viết đoạn văn thể hiện tình cảm, cảm xúc về một sự việc", ky: "cam-xuc-su-viec" } },
    { tap: 2, so: 10, doc: "Những búp chè trên cây cổ thụ", viet: { ten: "Tìm ý cho đoạn văn thể hiện tình cảm, cảm xúc về một sự việc", ky: "cam-xuc-su-viec" }, them: "Đọc mở rộng" },
    { tap: 2, so: 11, doc: "Hương cốm mùa thu", ltvc: { ten: "Liên kết câu bằng từ ngữ nối", ky: "lien-ket" }, viet: { ten: "Viết đoạn văn thể hiện tình cảm, cảm xúc về một sự việc", ky: "cam-xuc-su-viec" } },
    { tap: 2, so: 12, doc: "Vũ điệu trên nền thổ cẩm", viet: { ten: "Đánh giá, chỉnh sửa đoạn văn thể hiện tình cảm, cảm xúc về một sự việc", ky: "cam-xuc-su-viec" }, them: "Địa điểm tham quan, du lịch" },
    { tap: 2, so: 13, doc: "Đàn t'rưng - Tiếng ca đại ngàn", ltvc: { ten: "Liên kết câu bằng từ ngữ thay thế", ky: "lien-ket" }, viet: { ten: "Tìm hiểu cách viết chương trình hoạt động", ky: "chuong-trinh-hoat-dong" } },
    { tap: 2, so: 14, doc: "Đường quê Đồng Tháp Mười", viet: { ten: "Viết chương trình hoạt động (Bài viết số 1)", ky: "chuong-trinh-hoat-dong" }, them: "Đọc mở rộng" },
    { tap: 2, so: 15, doc: "Xuồng ba lá quê tôi", ltvc: { ten: "Luyện tập về liên kết câu trong đoạn văn", ky: "lien-ket" }, viet: { ten: "Đánh giá, chỉnh sửa chương trình hoạt động", ky: "chuong-trinh-hoat-dong" } },
    { tap: 2, so: 16, doc: "Về thăm Đất Mũi", viet: { ten: "Viết chương trình hoạt động (Bài viết số 2)", ky: "chuong-trinh-hoat-dong" }, them: "Sản vật địa phương" },
    { tap: 2, so: 17, doc: "Nghìn năm văn hiến", ltvc: { ten: "Luyện tập về đại từ và kết từ", ky: "dai-tu-ket-tu" }, viet: { ten: "Tìm hiểu cách viết đoạn văn nêu ý kiến tán thành một sự việc, hiện tượng", ky: "y-kien-tan-thanh" } },
    { tap: 2, so: 18, doc: "Người thầy của muôn đời", viet: { ten: "Tìm ý cho đoạn văn nêu ý kiến tán thành một sự việc, hiện tượng", ky: "y-kien-tan-thanh" }, them: "Đọc mở rộng" },
    { tap: 2, so: 19, doc: "Danh y Tuệ Tĩnh", ltvc: { ten: "Luyện tập về từ đồng nghĩa và từ đa nghĩa", ky: "dong-nghia-da-nghia" }, viet: { ten: "Viết đoạn văn nêu ý kiến tán thành một sự việc, hiện tượng (Bài viết số 1)", ky: "y-kien-tan-thanh" } },
    { tap: 2, so: 20, doc: "Cụ Đồ Chiểu", viet: { ten: "Đánh giá, chỉnh sửa đoạn văn nêu ý kiến tán thành một sự việc, hiện tượng", ky: "y-kien-tan-thanh" }, them: "Đền ơn đáp nghĩa" },
    { tap: 2, so: 21, doc: "Anh hùng Lao động Trần Đại Nghĩa", ltvc: { ten: "Luyện tập về câu ghép", ky: "cau-ghep" }, viet: { ten: "Viết đoạn văn nêu ý kiến tán thành một sự việc, hiện tượng (Bài viết số 2)", ky: "y-kien-tan-thanh" } },
    { tap: 2, so: 22, doc: "Bộ đội về làng", viet: { ten: "Luyện viết đoạn văn thể hiện tình cảm, cảm xúc về một sự việc", ky: "cam-xuc-su-viec" }, them: "Đọc mở rộng" },
    { tap: 2, so: 23, doc: "Về ngôi nhà đang xây", ltvc: { ten: "Viết hoa danh từ chung để thể hiện sự tôn trọng đặc biệt", ky: "viet-hoa-ton-trong" }, viet: { ten: "Luyện tập lập dàn ý cho bài văn tả phong cảnh", ky: "ta-canh" } },
    { tap: 2, so: 24, doc: "Việt Nam quê hương ta", viet: { ten: "Luyện viết bài văn tả phong cảnh", ky: "ta-canh" }, them: "Di tích lịch sử" },
    { tap: 2, so: 25, doc: "Bài ca trái đất", ltvc: { ten: "Cách viết tên người và tên địa lí nước ngoài", ky: "ten-nuoc-ngoai" }, viet: { ten: "Luyện tập lập dàn ý cho bài văn tả người", ky: "ta-nguoi" } },
    { tap: 2, so: 26, doc: "Những con hạc giấy", viet: { ten: "Luyện viết bài văn tả người", ky: "ta-nguoi" }, them: "Đọc mở rộng" },
    { tap: 2, so: 27, doc: "Người hùng thầm lặng", ltvc: { ten: "Luyện tập về dấu gạch ngang", ky: "gach-ngang" }, viet: { ten: "Tìm hiểu cách viết đoạn văn nêu ý kiến phản đối một sự việc, hiện tượng", ky: "y-kien-phan-doi" } },
    { tap: 2, so: 28, doc: "Giờ trái đất", viet: { ten: "Tìm ý cho đoạn văn nêu ý kiến phản đối một sự việc, hiện tượng", ky: "y-kien-phan-doi" }, them: "Trải nghiệm ngày hè" },
    { tap: 2, so: 29, doc: "Điện thoại di động", ltvc: { ten: "Luyện tập về liên kết câu trong đoạn văn", ky: "lien-ket" }, viet: { ten: "Viết đoạn văn nêu ý kiến phản đối một sự việc, hiện tượng", ky: "y-kien-phan-doi" } },
    { tap: 2, so: 30, doc: "Thành phố thông minh Mát-xđa", viet: { ten: "Đánh giá, chỉnh sửa đoạn văn nêu ý kiến phản đối một sự việc, hiện tượng", ky: "y-kien-phan-doi" }, them: "Đọc mở rộng" },
  ],
  skills: Object.fromEntries(SKILLS.map((s) => [s.id, s])),
};
