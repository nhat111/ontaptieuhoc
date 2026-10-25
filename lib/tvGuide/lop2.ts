// lib/tvGuide/lop2.ts
// Tiếng Việt 2 – Kết nối tri thức: mục lục và hướng dẫn cách làm từng dạng bài.
// Hướng dẫn và ví dụ do Ôn Tập Cùng Con TỰ VIẾT, không chép sách. CẦN NGƯỜI DUYỆT nội dung.
// Dùng ngoặc kép cong “ ”. `npx tsx scripts/tv-guide-check.ts` kiểm tra phần máy kiểm được.
//
// Sách lớp 2 xếp như lớp 3: bài lẻ = Đọc · Viết chữ hoa · Nói và nghe / Kể chuyện; bài chẵn =
// Đọc · Nghe – viết · Luyện tập (Luyện từ và câu + Luyện viết đoạn) · Đọc mở rộng. Vì vậy
// `ltvcBai: "chan"`, và phần Viết của bài chẵn gộp Nghe – viết với bài viết đoạn. Tên bài đọc,
// chữ hoa, Nói và nghe, Nghe – viết lấy nguyên văn mục lục (tên bài đọc trùng
// lib/sgk/books/tv2.ts); mục lục chỉ ghi “Luyện tập” nên tên phần Luyện từ và câu, viết đoạn
// là tóm tắt theo các yêu cầu bài tập trong sách. Lớp 2 viết đoạn 2–5 câu, chưa có bài văn.

import type { TvGuide, TvSkill } from "./types";

const S = (s: TvSkill) => s;

const SKILLS: TvSkill[] = [
  /* ───────────── Luyện từ và câu ───────────── */
  S({
    id: "su-vat-hoat-dong", loai: "ltvc", ten: "Từ ngữ chỉ sự vật, hoạt động",
    laGi: "Từ chỉ sự vật gọi tên người, con vật, đồ vật, cây cối (học sinh, con mèo, cặp sách, cây bàng). Từ chỉ hoạt động nói về việc người, con vật đang làm (đọc, chạy, quét nhà).",
    cachLam: [
      "Nhìn tranh hoặc đọc câu, tìm từng từ.",
      "Hỏi: “Ai? Con gì? Cái gì?” Trả lời được thì đó là từ chỉ sự vật.",
      "Hỏi: “Đang làm gì?” Trả lời được thì đó là từ chỉ hoạt động.",
    ],
    viDu: {
      de: "Tìm từ chỉ sự vật, từ chỉ hoạt động trong câu:",
      cau: "Bạn Lan tưới cây, chú mèo nằm ngủ.",
      dapAn: "Sự vật: “Bạn Lan”, “cây”, “chú mèo”. Hoạt động: “tưới”, “nằm ngủ”.",
    },
    loi: "Xếp từ chỉ đặc điểm (đẹp, cao) vào nhóm hoạt động.",
  }),
  S({
    id: "dac-diem", loai: "ltvc", ten: "Từ ngữ chỉ đặc điểm",
    laGi: "Từ chỉ đặc điểm nói sự vật trông thế nào: màu sắc (đỏ, xanh), hình dáng (tròn, dài), to nhỏ (to, bé), tính nết (hiền, chăm chỉ).",
    cachLam: [
      "Tìm sự vật trong câu hoặc trong tranh.",
      "Hỏi: sự vật đó “thế nào?” Từ trả lời là từ chỉ đặc điểm.",
      "Muốn tìm thêm, nghĩ xem sự vật màu gì, hình gì, to hay nhỏ, sờ vào thấy thế nào.",
    ],
    viDu: {
      de: "Tìm từ chỉ đặc điểm trong câu:",
      cau: "Chiếc bút chì dài, nhọn hoắt.",
      dapAn: "“dài”, “nhọn hoắt”.",
    },
    loi: "Gạch cả tên sự vật (“Chiếc bút chì”) vào từ chỉ đặc điểm.",
  }),
  S({
    id: "von-tu", loai: "ltvc", ten: "Mở rộng vốn từ theo chủ điểm",
    laGi: "Tìm thêm và xếp nhóm những từ cùng một chủ đề: đồ dùng học tập, đồ chơi, người thân, tình cảm bạn bè, các mùa, cây cối, con vật, nghề nghiệp…",
    cachLam: [
      "Đọc kĩ tên chủ đề hoặc tên các nhóm đề bài cho.",
      "Nhìn tranh, nghĩ đến những gì em thấy, em dùng, em làm trong chủ đề đó.",
      "Với mỗi từ, hỏi: từ này hợp với nhóm nào? Mỗi từ chỉ xếp vào một nhóm.",
      "Đặt thử một câu với từ vừa tìm để chắc em hiểu nghĩa.",
    ],
    viDu: {
      de: "Xếp các từ sau vào hai nhóm đồ dùng học tập và đồ chơi:",
      cau: "thước kẻ, búp bê, cục tẩy, quả bóng.",
      dapAn: "Đồ dùng học tập: “thước kẻ”, “cục tẩy”. Đồ chơi: “búp bê”, “quả bóng”.",
    },
    loi: "Tìm từ lạc chủ đề, hoặc xếp một từ vào cả hai nhóm.",
  }),
  S({
    id: "kieu-cau", loai: "ltvc", ten: "Câu giới thiệu, câu nêu hoạt động, câu nêu đặc điểm",
    laGi: "Câu giới thiệu trả lời câu hỏi Ai (cái gì) là gì? Câu nêu hoạt động trả lời câu hỏi Ai (con gì) làm gì? Câu nêu đặc điểm trả lời câu hỏi Ai (cái gì) thế nào?",
    cachLam: [
      "Đọc câu và hỏi: câu này giới thiệu, nói việc làm hay nói sự vật thế nào?",
      "Câu giới thiệu thường có từ “là”: Em là học sinh lớp 2.",
      "Câu nêu hoạt động có từ chỉ hoạt động; câu nêu đặc điểm có từ chỉ đặc điểm.",
      "Khi tự đặt câu: viết hoa chữ đầu câu, cuối câu đặt dấu chấm.",
    ],
    viDu: {
      de: "Mỗi câu sau là câu gì?",
      cau: "Mai là bạn thân của em. Mai đang nhảy dây. Tóc Mai dài và mượt.",
      dapAn: "“Mai là bạn thân của em.” là câu giới thiệu. “Mai đang nhảy dây.” là câu nêu hoạt động. “Tóc Mai dài và mượt.” là câu nêu đặc điểm.",
    },
    loi: "Câu thiếu ý, chỉ có tên sự vật (“Quả bóng của em.”), không nói được quả bóng là gì, làm gì hay thế nào.",
  }),
  S({
    id: "dau-cau", loai: "ltvc", ten: "Dấu chấm, dấu chấm hỏi, dấu chấm than",
    laGi: "Dấu chấm đặt cuối câu kể, câu giới thiệu. Dấu chấm hỏi đặt cuối câu hỏi. Dấu chấm than đặt cuối câu bộc lộ cảm xúc (vui, ngạc nhiên) hoặc lời gọi, lời đề nghị.",
    cachLam: [
      "Đọc to câu, nghe giọng: hỏi, kể hay reo lên?",
      "Câu có từ để hỏi (ai, gì, nào, đâu, sao, không, chưa) → dấu chấm hỏi.",
      "Câu có ôi, a, quá, thật, ơi, hãy và đọc lên giọng mạnh → dấu chấm than.",
      "Còn lại là câu kể → dấu chấm. Sau dấu câu, chữ đầu câu tiếp theo viết hoa.",
    ],
    viDu: {
      de: "Chọn dấu chấm, dấu chấm hỏi hoặc dấu chấm than cho mỗi ô trống:",
      cau: "Con gì có cái vòi rất dài □ Ôi, chú voi to quá □ Voi đang uống nước □",
      dapAn: "Ô thứ nhất: dấu chấm hỏi (câu hỏi, có “Con gì”). Ô thứ hai: dấu chấm than (có “Ôi”, “quá”). Ô thứ ba: dấu chấm (câu kể).",
    },
    loi: "Thấy câu có “con gì” là đặt dấu chấm hỏi mà không đọc cả câu (“Em thích con gì nhất.” khi câu đang kể).",
  }),
  S({
    id: "dau-phay", loai: "ltvc", ten: "Dấu phẩy",
    laGi: "Ở lớp 2, dấu phẩy dùng để ngăn cách các từ cùng loại đứng liền nhau trong câu (nhiều đồ vật, nhiều người, nhiều hoạt động).",
    cachLam: [
      "Đọc câu, tìm những từ cùng loại đứng liền nhau (VD: tên nhiều đồ chơi).",
      "Đặt dấu phẩy giữa các từ đó.",
      "Trước chữ “và” cuối cùng thì không cần dấu phẩy.",
    ],
    viDu: {
      de: "Đặt dấu phẩy vào chỗ thích hợp:",
      cau: "Em có búp bê ô tô và quả bóng.",
      dapAn: "Em có búp bê, ô tô và quả bóng. (dấu phẩy ngăn “búp bê” với “ô tô”)",
    },
    loi: "Đặt dấu phẩy ngắt giữa một từ (“búp, bê”) hoặc trước chữ “và”.",
  }),
  S({
    id: "hoi-dap", loai: "ltvc", ten: "Hỏi – đáp, đặt câu hỏi",
    laGi: "Dựa vào tranh hoặc bài đọc, đặt câu hỏi về một sự vật, một việc làm và trả lời bằng một câu đủ ý.",
    cachLam: [
      "Chọn điều muốn hỏi: ai, làm gì, ở đâu, khi nào, thế nào, để làm gì.",
      "Đặt câu hỏi có từ để hỏi, cuối câu đặt dấu chấm hỏi.",
      "Trả lời bằng cả câu, dùng lại từ ngữ của câu hỏi (hỏi “Chuột sống ở đâu?”, đáp “Chuột sống trong hang.”).",
    ],
    viDu: {
      de: "Đặt một câu hỏi về nơi ở của con vật cho câu trả lời sau:",
      cau: "Chuột sống trong hang.",
      dapAn: "Câu hỏi: Chuột sống ở đâu? Câu trả lời dùng lại từ “Chuột sống” và thêm “trong hang”.",
    },
    loi: "Chỉ trả lời một hai chữ (“Trong hang.”) hoặc quên dấu chấm hỏi ở câu hỏi.",
  }),

  /* ───────────── Viết ───────────── */
  S({
    id: "chu-hoa", loai: "viet", ten: "Viết chữ hoa",
    laGi: "Tập viết một chữ hoa đúng mẫu, rồi viết câu ứng dụng có chữ hoa đó. Học kì hai có thêm chữ hoa kiểu 2 (A, M, N, Q, V).",
    cachLam: [
      "Nhìn mẫu: chữ hoa cao mấy li, gồm những nét nào, đặt bút ở đâu.",
      "Viết theo đúng thứ tự nét, nối liền sang chữ thường phía sau.",
      "Viết câu ứng dụng: chữ đầu câu viết hoa, các chữ cách nhau bằng một con chữ o.",
    ],
    loi: "Viết chữ hoa thấp bằng chữ thường, hoặc nhấc bút giữa chữ hoa và chữ thường.",
  }),
  S({
    id: "chinh-ta", loai: "viet", ten: "Nghe – viết và bài tập chính tả",
    laGi: "Nghe đọc một đoạn rồi viết lại, sau đó làm bài tập phân biệt chữ dễ lẫn (c/k, g/gh, ng/ngh, ch/tr, s/x, l/n, r/d/gi, các vần, dấu hỏi/ngã).",
    cachLam: [
      "Đọc trước đoạn viết cùng người lớn, để ý chữ khó, tên riêng, dấu câu.",
      "Nghe trọn một cụm từ rồi mới viết, không viết từng tiếng một.",
      "Viết hoa chữ đầu câu, chữ đầu dòng thơ và tên riêng.",
      "Viết xong, đọc lại để soát lỗi.",
      "Bài tập chính tả: k, gh, ngh chỉ đứng trước e, ê, i; các cặp khác thì đọc to và nghĩ nghĩa của từ.",
    ],
    viDu: {
      de: "Điền g hoặc gh: …à mái, cái …ế, …ọn gàng.",
      dapAn: "gà mái, cái ghế, gọn gàng (gh đứng trước ê).",
    },
    loi: "Viết “ghà”, “kon”; quên viết hoa chữ đầu dòng thơ.",
  }),
  S({
    id: "gioi-thieu-ban-than", loai: "viet", ten: "Viết câu tự giới thiệu",
    laGi: "Viết 2–3 câu cho người khác biết về em: tên, lớp, trường, điều em thích.",
    cachLam: [
      "Câu 1: em tên là gì, học lớp nào, trường nào.",
      "Câu 2: em thích gì, giỏi việc gì.",
      "Câu 3: mong muốn làm quen hoặc điều em muốn cố gắng.",
    ],
    viDu: {
      de: "Viết 2–3 câu tự giới thiệu về bản thân.",
      dapAn: "Em tên là Minh, học sinh lớp 2B Trường Tiểu học Kim Đồng. Em thích đá bóng và đọc truyện tranh. Em rất muốn làm quen với các bạn mới.",
    },
    loi: "Viết thành danh sách rời (Tên: Minh. Lớp: 2B.) thay vì viết thành câu.",
  }),
  S({
    id: "ke-viec", loai: "viet", ten: "Kể một việc làm, một hoạt động",
    laGi: "Viết 3–5 câu kể một việc em đã làm hoặc đã thấy: làm việc nhà, chơi trò chơi, chăm sóc cây, giờ ra chơi, đi chơi cùng người thân…",
    cachLam: [
      "Câu đầu: việc gì, làm khi nào, ở đâu, cùng ai.",
      "Các câu giữa: kể lần lượt việc làm trước, việc làm sau (đầu tiên, sau đó, cuối cùng).",
      "Câu cuối: kết quả và em cảm thấy thế nào.",
    ],
    viDu: {
      de: "Viết 3–4 câu kể về một việc em đã làm ở nhà.",
      dapAn: "Chiều Chủ nhật, em giúp mẹ nhặt rau. Đầu tiên, em bỏ lá úa, lá sâu. Sau đó, em ngắt rau thành từng đoạn và cho vào rổ. Mẹ khen em khéo tay, em vui lắm.",
    },
    loi: "Kể lộn xộn, việc sau trước việc trước; quên câu nói em cảm thấy thế nào.",
  }),
  S({
    id: "thoi-gian-bieu", loai: "viet", ten: "Lập thời gian biểu",
    laGi: "Thời gian biểu ghi những việc em làm theo từng giờ trong ngày, để em biết lúc nào làm việc gì.",
    cachLam: [
      "Nghĩ lại các việc em làm trong buổi, theo thứ tự từ sớm đến muộn.",
      "Ghi giờ bên trái, việc làm bên phải, mỗi việc một dòng.",
      "Đọc lại xem giờ có tăng dần không, có quên việc nào không.",
    ],
    viDu: {
      de: "Lập thời gian biểu buổi tối của em.",
      dapAn: "17:00 – 18:00: tắm, chơi. 18:00 – 19:00: ăn tối cùng gia đình. 19:00 – 20:00: học bài. 20:00 – 20:30: chuẩn bị sách vở. 21:00: đi ngủ.",
    },
    loi: "Ghi giờ lộn xộn, hoặc viết thành đoạn văn thay vì từng dòng.",
  }),
  S({
    id: "danh-sach", loai: "viet", ten: "Lập danh sách",
    laGi: "Danh sách ghi tên nhiều người (hoặc đồ vật) theo cột, có số thứ tự, để dễ đọc và dễ tìm.",
    cachLam: [
      "Viết tên danh sách ở trên cùng (VD: Danh sách tổ 1 đăng kí câu lạc bộ).",
      "Kẻ các cột: số thứ tự, họ và tên, nội dung cần ghi (câu lạc bộ, ghi chú…).",
      "Ghi mỗi người một dòng. Có thể xếp tên theo thứ tự bảng chữ cái.",
    ],
    loi: "Quên cột số thứ tự, hoặc viết tên người không viết hoa.",
  }),
  S({
    id: "do-vat", loai: "viet", ten: "Giới thiệu, tả một đồ vật, đồ chơi",
    laGi: "Viết 3–5 câu giới thiệu hoặc tả một đồ vật quen thuộc (đồ dùng học tập, đồ chơi, đồ dùng trong nhà, đồ làm từ tre gỗ): nó là gì, trông thế nào, dùng để làm gì, em thích nó ra sao.",
    cachLam: [
      "Câu đầu: giới thiệu đồ vật (tên, ai cho hoặc em có từ bao giờ).",
      "Tả vài đặc điểm nổi bật: màu sắc, hình dáng, to nhỏ, làm bằng gì.",
      "Nói công dụng: đồ vật dùng để làm gì.",
      "Câu cuối: tình cảm của em, em giữ gìn nó thế nào.",
    ],
    viDu: {
      de: "Viết 3–4 câu tả một đồ chơi của em.",
      dapAn: "Em có một chú gấu bông mẹ tặng sinh nhật. Gấu có bộ lông màu nâu, mềm mượt và đôi mắt đen tròn. Tối nào em cũng ôm gấu đi ngủ. Em rất yêu chú gấu bông của mình.",
    },
    loi: "Chỉ kể tên nhiều đồ vật mà không tả kĩ một đồ vật nào.",
  }),
  S({
    id: "nguoi-than", loai: "viet", ten: "Kể về người thân, người em biết",
    laGi: "Viết 3–5 câu kể về một người: việc người đó làm cho em, công việc của người đó, và tình cảm của em.",
    cachLam: [
      "Câu đầu: người em kể là ai.",
      "Kể một việc cụ thể người đó đã làm (cho em, cho mọi người), hoặc công việc hằng ngày của người đó.",
      "Nói tình cảm của em: yêu quý, biết ơn, tự hào… và vì sao.",
    ],
    viDu: {
      de: "Viết 3–4 câu kể một việc người thân đã làm cho em.",
      dapAn: "Người em yêu nhất là ông nội. Hôm em bị ốm, ông ngồi cạnh kể chuyện cho em nghe suốt buổi chiều. Ông còn nấu cháo cho em ăn. Em thương ông nhiều lắm.",
    },
    loi: "Tả người dài mà quên kể việc làm và tình cảm của em.",
  }),
  S({
    id: "tin-nhan", loai: "viet", ten: "Viết tin nhắn",
    laGi: "Tin nhắn ngắn để báo cho người khác một việc khi không gặp được nhau.",
    cachLam: [
      "Xác định nhắn cho ai, nhắn việc gì.",
      "Mở đầu bằng lời gọi (Mẹ ơi, Bà ơi…).",
      "Nói việc cần báo: việc gì, ở đâu, khi nào về.",
      "Cuối tin nhắn ghi tên em.",
    ],
    viDu: {
      de: "Em sang nhà bạn học nhóm, nhắn cho mẹ biết.",
      dapAn: "Mẹ ơi, con sang nhà bạn Hà học nhóm, 5 giờ chiều con về ạ. Con: Lan.",
    },
    loi: "Quên ghi tên mình hoặc quên giờ về.",
  }),
  S({
    id: "thiep", loai: "viet", ten: "Viết thiệp chúc mừng",
    laGi: "Tấm thiệp ngắn gửi lời chúc nhân dịp đặc biệt (Tết, sinh nhật, ngày 20/11…).",
    cachLam: [
      "Đầu thiệp: lời gọi người nhận (Kính gửi ông bà, Bạn Nam thân mến).",
      "Lời chúc: chúc điều gì, nhân dịp gì.",
      "Cuối thiệp: tên em.",
    ],
    viDu: {
      de: "Viết thiệp chúc Tết gửi ông bà ở quê.",
      dapAn: "Ông bà kính yêu! Nhân dịp năm mới, cháu chúc ông bà luôn mạnh khỏe và vui vẻ. Cháu hứa sẽ chăm ngoan, học giỏi. Cháu của ông bà: Minh.",
    },
    loi: "Viết lời chúc mà không ghi gửi ai, ai gửi.",
  }),
  S({
    id: "gioi-thieu-tranh", loai: "viet", ten: "Giới thiệu tranh, ảnh về con vật",
    laGi: "Viết 3–5 câu cho người khác biết bức tranh (ảnh) vẽ con vật gì, con vật trông thế nào, đang làm gì.",
    cachLam: [
      "Câu đầu: em thấy bức tranh (ảnh) ở đâu.",
      "Trong tranh có con vật gì, đang làm gì.",
      "Tả vài đặc điểm: bộ lông, đôi mắt, cái đuôi…",
      "Câu cuối: vì sao em thích bức tranh (con vật) đó.",
    ],
    viDu: {
      de: "Viết 3–4 câu giới thiệu ảnh về một con vật em yêu thích.",
      dapAn: "Em thấy bức ảnh này trong quyển truyện về rừng xanh. Trong ảnh có một chú hươu cao cổ đang ăn lá cây. Hươu có cái cổ rất dài và bộ lông vàng có đốm nâu. Em thích hươu vì trông nó rất hiền.",
    },
    loi: "Chỉ kể tên con vật mà không nói nó trông thế nào, đang làm gì.",
  }),
  S({
    id: "xin-loi-cam-on", loai: "viet", ten: "Viết lời xin lỗi, lời cảm ơn",
    laGi: "Viết vài câu nói lời xin lỗi khi em làm sai, hoặc lời cảm ơn người đã giúp đỡ, đã làm việc tốt.",
    cachLam: [
      "Gọi người nhận một cách lễ phép (Thưa cô, Chú bộ đội kính mến…).",
      "Xin lỗi: nói rõ em đã làm sai điều gì và hứa sửa. Cảm ơn: nói rõ cảm ơn về việc gì.",
      "Câu cuối: lời hứa hoặc lời chúc.",
    ],
    viDu: {
      de: "Viết lời xin lỗi cô giáo vì em làm việc riêng trong giờ học.",
      dapAn: "Thưa cô, em xin lỗi cô vì trong giờ học em đã ngồi gấp giấy, không chú ý nghe giảng. Từ nay em sẽ tập trung học bài ạ.",
    },
    loi: "Chỉ viết “Em xin lỗi.” mà không nói lỗi gì và sẽ sửa ra sao.",
  }),
];

/** Phần Viết của bài chẵn: Nghe – viết + bài viết đoạn trong Luyện tập. */
const nv = (ngheViet: string, doan: string, ky: string) => ({ ten: `Nghe - viết: ${ngheViet}; ${doan}`, ky: ["chinh-ta", ky] });
/** Phần Viết của bài lẻ. */
const hoa = (ten: string) => ({ ten, ky: "chu-hoa" });

export const TV_GUIDE_2: TvGuide = {
  grade: 2,
  book: "Tiếng Việt 2 – Kết nối tri thức với cuộc sống",
  source: "Mục lục và yêu cầu bài tập tập 1, tập 2 đối chiếu trên loigiaihay.com (10/2026)",
  ltvcBai: "chan",
  chuDiem: [
    { so: 1, ten: "Em lớn lên từng ngày", tap: 1, tu: 1, den: 8, docHieu: "Các bài đọc nói về bạn nhỏ lớp 2, việc nhà, giờ học, giờ chơi. Đọc xong, con thử trả lời: bạn nhỏ là ai, đã làm gì, cảm thấy thế nào." },
    { so: 2, ten: "Đi học vui sao", tap: 1, tu: 9, den: 16, docHieu: "Các bài đọc nói về thầy cô, trường lớp, sách vở. Chú ý những việc thầy cô và các bạn làm, và vì sao bạn nhỏ yêu trường." },
    { so: 3, ten: "Niềm vui tuổi thơ", tap: 1, tu: 17, den: 24, docHieu: "Các bài đọc nói về bạn bè, đồ chơi, trò chơi. Tìm chi tiết cho thấy các bạn quý nhau và chơi vui với nhau thế nào." },
    { so: 4, ten: "Mái ấm gia đình", tap: 1, tu: 25, den: 32, docHieu: "Các bài đọc nói về ông bà, bố mẹ, anh chị em. Tìm việc làm, lời nói thể hiện tình yêu thương trong gia đình." },
    { so: 5, ten: "Vẻ đẹp quanh em", tap: 2, tu: 1, den: 8, docHieu: "Các bài đọc tả các mùa, ngày Tết, cây cối, đồng lúa. Tìm từ ngữ chỉ màu sắc, âm thanh và cảnh vật đẹp." },
    { so: 6, ten: "Hành tinh xanh của em", tap: 2, tu: 9, den: 16, docHieu: "Các bài đọc nói về con vật, cây cỏ và môi trường. Ghi nhớ con vật sống ở đâu, trông thế nào, và em làm gì để bảo vệ chúng." },
    { so: 7, ten: "Giao tiếp và kết nối", tap: 2, tu: 17, den: 20, docHieu: "Các bài đọc nói về cách chào hỏi, sách báo, thư từ, điện thoại, in-tơ-nét. Chú ý mỗi cách giúp mọi người liên lạc với nhau ra sao." },
    { so: 8, ten: "Con người Việt Nam", tap: 2, tu: 21, den: 24, docHieu: "Các bài đọc kể về Mai An Tiêm, Trần Quốc Toản, Bác Hồ, các chú bộ đội. Tìm việc tốt nhân vật làm và điều đáng học ở họ." },
    { so: 9, ten: "Việt Nam quê hương em", tap: 2, tu: 25, den: 30, docHieu: "Các bài đọc nói về cảnh đẹp các miền đất nước, biển đảo, đồng quê. Ghi nhớ tên địa danh và cảnh đẹp được tả." },
  ],
  bai: [
    // Tập 1
    { tap: 1, so: 1, doc: "Tôi là học sinh lớp 2", viet: hoa("Chữ hoa A"), them: "Nói và nghe: Những ngày hè của em" },
    { tap: 1, so: 2, doc: "Ngày hôm qua đâu rồi?", ltvc: { ten: "Từ ngữ chỉ sự vật, hoạt động; câu giới thiệu", ky: ["su-vat-hoat-dong", "kieu-cau"] }, viet: nv("Ngày hôm qua đâu rồi?", "viết 2 – 3 câu tự giới thiệu", "gioi-thieu-ban-than"), them: "Đọc mở rộng" },
    { tap: 1, so: 3, doc: "Niềm vui của Bi và Bống", viet: hoa("Chữ hoa Ă, Â"), them: "Kể chuyện Niềm vui của Bi và Bống" },
    { tap: 1, so: 4, doc: "Làm việc thật là vui", ltvc: { ten: "Từ ngữ chỉ sự vật, hoạt động; câu nêu hoạt động", ky: ["su-vat-hoat-dong", "kieu-cau"] }, viet: nv("Làm việc thật là vui", "viết 2 – 3 câu kể về một việc em đã làm ở nhà", "ke-viec"), them: "Đọc mở rộng" },
    { tap: 1, so: 5, doc: "Em có xinh không?", viet: hoa("Chữ hoa B"), them: "Kể chuyện Em có xinh không?" },
    { tap: 1, so: 6, doc: "Một giờ học", ltvc: { ten: "Từ ngữ chỉ đặc điểm; câu nêu đặc điểm", ky: ["dac-diem", "kieu-cau"] }, viet: nv("Một giờ học", "viết 3 – 4 câu kể việc em thường làm trước khi đi học", "ke-viec"), them: "Đọc mở rộng" },
    { tap: 1, so: 7, doc: "Cây xấu hổ", viet: hoa("Chữ hoa C"), them: "Kể chuyện Chú đỗ con" },
    { tap: 1, so: 8, doc: "Cầu thủ dự bị", ltvc: { ten: "Từ ngữ về thể thao, trò chơi; câu nêu hoạt động", ky: ["von-tu", "kieu-cau"] }, viet: nv("Cầu thủ dự bị", "viết 3 – 4 câu kể về một hoạt động thể thao hoặc trò chơi", "ke-viec"), them: "Đọc mở rộng" },
    { tap: 1, so: 9, doc: "Cô giáo lớp em", viet: hoa("Chữ hoa D"), them: "Kể chuyện Cậu bé ham học" },
    { tap: 1, so: 10, doc: "Thời khóa biểu", ltvc: { ten: "Từ ngữ chỉ sự vật, hoạt động; câu nêu hoạt động", ky: ["su-vat-hoat-dong", "kieu-cau"] }, viet: nv("Thời khóa biểu", "viết thời gian biểu", "thoi-gian-bieu"), them: "Đọc mở rộng" },
    { tap: 1, so: 11, doc: "Cái trống trường em", viet: hoa("Chữ hoa Đ"), them: "Nói và nghe: Ngôi trường của em" },
    { tap: 1, so: 12, doc: "Danh sách học sinh", ltvc: { ten: "Từ ngữ chỉ sự vật, đặc điểm; câu nêu đặc điểm", ky: ["su-vat-hoat-dong", "dac-diem", "kieu-cau"] }, viet: nv("Cái trống trường em", "lập danh sách học sinh", "danh-sach"), them: "Đọc mở rộng" },
    { tap: 1, so: 13, doc: "Yêu lắm trường ơi!", viet: hoa("Chữ hoa E, Ê"), them: "Kể chuyện Bữa ăn trưa" },
    { tap: 1, so: 14, doc: "Em học vẽ", ltvc: { ten: "Từ ngữ về đồ dùng học tập; dấu chấm, dấu chấm hỏi", ky: ["von-tu", "dau-cau"] }, viet: nv("Em học vẽ", "viết 3 – 4 câu giới thiệu một đồ vật dùng để vẽ", "do-vat"), them: "Đọc mở rộng" },
    { tap: 1, so: 15, doc: "Cuốn sách của em", viet: hoa("Chữ hoa G"), them: "Kể chuyện Họa mi, vẹt và quạ" },
    { tap: 1, so: 16, doc: "Khi trang sách mở ra", ltvc: { ten: "Từ ngữ chỉ đặc điểm; câu nêu đặc điểm; dấu chấm, dấu chấm hỏi", ky: ["dac-diem", "kieu-cau", "dau-cau"] }, viet: nv("Khi trang sách mở ra", "viết 2 – 3 câu tả một đồ dùng học tập", "do-vat"), them: "Đọc mở rộng: Viết phiếu đọc sách" },
    { tap: 1, so: 17, doc: "Gọi bạn", viet: hoa("Chữ hoa H"), them: "Kể chuyện Gọi bạn" },
    { tap: 1, so: 18, doc: "Tớ nhớ cậu", ltvc: { ten: "Từ ngữ chỉ tình cảm bạn bè; dấu chấm, dấu chấm hỏi, dấu chấm than", ky: ["von-tu", "dau-cau"] }, viet: nv("Tớ nhớ cậu", "viết 3 – 4 câu kể về một hoạt động em tham gia cùng các bạn", "ke-viec"), them: "Đọc mở rộng" },
    { tap: 1, so: 19, doc: "Chữ A và những người bạn", viet: hoa("Chữ hoa I, K"), them: "Nói và nghe: Niềm vui của em" },
    { tap: 1, so: 20, doc: "Nhím nâu kết bạn", ltvc: { ten: "Từ ngữ chỉ hoạt động, đặc điểm; câu nêu hoạt động", ky: ["su-vat-hoat-dong", "dac-diem", "kieu-cau"] }, viet: nv("Nhím nâu kết bạn", "viết 3 – 4 câu kể về một giờ ra chơi", "ke-viec"), them: "Đọc mở rộng" },
    { tap: 1, so: 21, doc: "Thả diều", viet: hoa("Chữ hoa L"), them: "Kể chuyện Chúng mình là bạn" },
    { tap: 1, so: 22, doc: "Tớ là Lê-gô", ltvc: { ten: "Từ ngữ chỉ đồ chơi; câu nêu đặc điểm", ky: ["von-tu", "kieu-cau"] }, viet: nv("Đồ chơi yêu thích", "viết 3 – 4 câu giới thiệu một đồ chơi", "do-vat"), them: "Đọc mở rộng" },
    { tap: 1, so: 23, doc: "Rồng rắn lên mây", viet: hoa("Chữ hoa M"), them: "Kể chuyện Búp bê biết khóc" },
    { tap: 1, so: 24, doc: "Nặn đồ chơi", ltvc: { ten: "Từ ngữ chỉ đồ chơi; dấu phẩy", ky: ["von-tu", "dau-phay"] }, viet: nv("Nặn đồ chơi", "viết 3 – 4 câu tả một đồ chơi của em", "do-vat"), them: "Đọc mở rộng" },
    { tap: 1, so: 25, doc: "Sự tích hoa tỉ muội", viet: hoa("Chữ hoa N"), them: "Kể chuyện Hai anh em" },
    { tap: 1, so: 26, doc: "Em mang về yêu thương", ltvc: { ten: "Từ ngữ chỉ người thân; từ ngữ chỉ đặc điểm", ky: ["von-tu", "dac-diem"] }, viet: nv("Em mang về yêu thương", "viết 3 – 4 câu kể một việc người thân đã làm cho em", "nguoi-than"), them: "Đọc mở rộng" },
    { tap: 1, so: 27, doc: "Mẹ", viet: hoa("Chữ hoa O"), them: "Kể chuyện Sự tích cây vú sữa" },
    { tap: 1, so: 28, doc: "Trò chơi của bố", ltvc: { ten: "Từ ngữ chỉ tình cảm gia đình; dấu chấm, dấu chấm hỏi, dấu chấm than", ky: ["von-tu", "dau-cau"] }, viet: nv("Trò chơi của bố", "viết 3 – 4 câu thể hiện tình cảm với người thân", "nguoi-than"), them: "Đọc mở rộng" },
    { tap: 1, so: 29, doc: "Cánh cửa nhớ bà", viet: hoa("Chữ hoa Ô, Ơ"), them: "Kể chuyện Bà cháu" },
    { tap: 1, so: 30, doc: "Thương ông", ltvc: { ten: "Từ ngữ chỉ sự vật, hoạt động; câu nêu hoạt động", ky: ["su-vat-hoat-dong", "kieu-cau"] }, viet: nv("Thương ông", "viết 3 – 5 câu kể một việc em đã làm cùng người thân", "ke-viec"), them: "Đọc mở rộng" },
    { tap: 1, so: 31, doc: "Ánh sáng của yêu thương", viet: hoa("Chữ hoa P"), them: "Kể chuyện Ánh sáng của yêu thương" },
    { tap: 1, so: 32, doc: "Chơi chong chóng", ltvc: { ten: "Từ ngữ chỉ tình cảm gia đình; dấu phẩy", ky: ["von-tu", "dau-phay"] }, viet: nv("Chơi chong chóng", "viết tin nhắn", "tin-nhan"), them: "Đọc mở rộng" },
    // Tập 2
    { tap: 2, so: 1, doc: "Chuyện bốn mùa", viet: hoa("Chữ hoa Q"), them: "Kể chuyện Chuyện bốn mùa" },
    { tap: 2, so: 2, doc: "Mùa nước nổi", ltvc: { ten: "Từ ngữ về các mùa; dấu chấm, dấu chấm hỏi", ky: ["von-tu", "dau-cau"] }, viet: nv("Mùa nước nổi", "viết 3 – 5 câu tả một đồ vật dùng để tránh nắng, tránh mưa", "do-vat"), them: "Đọc mở rộng" },
    { tap: 2, so: 3, doc: "Họa mi hót", viet: hoa("Chữ hoa R"), them: "Kể chuyện Hồ nước và mây" },
    { tap: 2, so: 4, doc: "Tết đến rồi", ltvc: { ten: "Từ ngữ chỉ sự vật, hoạt động ngày Tết; hỏi – đáp", ky: ["su-vat-hoat-dong", "hoi-dap"] }, viet: nv("Tết đến rồi", "viết thiệp chúc Tết", "thiep"), them: "Đọc mở rộng" },
    { tap: 2, so: 5, doc: "Giọt nước và biển lớn", viet: hoa("Chữ hoa S"), them: "Kể chuyện Chiếc đèn lồng" },
    { tap: 2, so: 6, doc: "Mùa vàng", ltvc: { ten: "Từ ngữ về cây cối; câu nêu hoạt động", ky: ["von-tu", "kieu-cau"] }, viet: nv("Mùa vàng", "viết 3 – 5 câu kể việc em và các bạn chăm sóc cây", "ke-viec"), them: "Đọc mở rộng" },
    { tap: 2, so: 7, doc: "Hạt thóc", viet: hoa("Chữ hoa T"), them: "Kể chuyện Sự tích cây khoai lang" },
    { tap: 2, so: 8, doc: "Lũy tre", ltvc: { ten: "Từ ngữ chỉ sự vật, đặc điểm; hỏi – đáp về đặc điểm", ky: ["dac-diem", "hoi-dap"] }, viet: nv("Lũy tre", "viết 3 – 5 câu kể về một sự việc ở nơi em sống", "ke-viec"), them: "Đọc mở rộng" },
    { tap: 2, so: 9, doc: "Vè chim", viet: hoa("Chữ hoa U, Ư"), them: "Kể chuyện Cảm ơn họa mi" },
    { tap: 2, so: 10, doc: "Khủng long", ltvc: { ten: "Từ ngữ chỉ con vật, hoạt động; dấu chấm, dấu chấm hỏi, dấu chấm than", ky: ["von-tu", "dau-cau"] }, viet: nv("Khủng long", "viết 3 – 5 câu giới thiệu tranh (ảnh) về một con vật", "gioi-thieu-tranh"), them: "Đọc mở rộng" },
    { tap: 2, so: 11, doc: "Sự tích cây thì là", viet: hoa("Chữ hoa V"), them: "Kể chuyện Sự tích cây thì là" },
    { tap: 2, so: 12, doc: "Bờ tre đón khách", ltvc: { ten: "Từ ngữ chỉ vật nuôi; từ ngữ chỉ đặc điểm", ky: ["von-tu", "dac-diem"] }, viet: nv("Bờ tre đón khách", "viết 3 – 5 câu kể hoạt động của một con vật", "ke-viec"), them: "Đọc mở rộng" },
    { tap: 2, so: 13, doc: "Tiếng chổi tre", viet: hoa("Chữ hoa X"), them: "Kể chuyện Hạt giống nhỏ" },
    { tap: 2, so: 14, doc: "Cỏ non cười rồi", ltvc: { ten: "Từ ngữ về bảo vệ môi trường; dấu phẩy", ky: ["von-tu", "dau-phay"] }, viet: nv("Cỏ non cười rồi", "viết lời xin lỗi", "xin-loi-cam-on"), them: "Đọc mở rộng" },
    { tap: 2, so: 15, doc: "Những con sao biển", viet: hoa("Chữ hoa Y"), them: "Nói và nghe: Bảo vệ môi trường" },
    { tap: 2, so: 16, doc: "Tạm biệt cánh cam", ltvc: { ten: "Từ ngữ chỉ loài vật; hỏi – đáp", ky: ["von-tu", "hoi-dap"] }, viet: nv("Tạm biệt cánh cam", "viết 4 – 5 câu kể việc em làm để bảo vệ môi trường", "ke-viec"), them: "Đọc mở rộng" },
    { tap: 2, so: 17, doc: "Những cách chào độc đáo", viet: hoa("Chữ hoa A (kiểu 2)"), them: "Kể chuyện Lớp học viết thư" },
    { tap: 2, so: 18, doc: "Thư viện biết đi", ltvc: { ten: "Dấu chấm, dấu chấm than; dấu phẩy", ky: ["dau-cau", "dau-phay"] }, viet: nv("Thư viện biết đi", "viết 4 – 5 câu giới thiệu một đồ dùng học tập", "do-vat"), them: "Đọc mở rộng" },
    { tap: 2, so: 19, doc: "Cảm ơn anh hà mã", viet: hoa("Chữ hoa M (kiểu 2)"), them: "Kể chuyện Cảm ơn anh hà mã" },
    { tap: 2, so: 20, doc: "Từ chú bồ câu đến in-tơ-nét", ltvc: { ten: "Từ ngữ chỉ hoạt động; công dụng của đồ vật; dấu câu", ky: ["su-vat-hoat-dong", "dau-cau"] }, viet: nv("Từ chú bồ câu đến in-tơ-nét", "viết 4 – 5 câu tả một đồ dùng trong gia đình", "do-vat"), them: "Đọc mở rộng" },
    { tap: 2, so: 21, doc: "Mai An Tiêm", viet: hoa("Chữ hoa N (kiểu 2)"), them: "Kể chuyện Mai An Tiêm" },
    { tap: 2, so: 22, doc: "Thư gửi bố ngoài đảo", ltvc: { ten: "Từ ngữ chỉ nghề nghiệp trên biển; hỏi – đáp “để làm gì?”", ky: ["von-tu", "hoi-dap"] }, viet: nv("Thư gửi bố ngoài đảo", "viết 4 – 5 câu cảm ơn các chú bộ đội hải quân", "xin-loi-cam-on"), them: "Đọc mở rộng" },
    { tap: 2, so: 23, doc: "Bóp nát quả cam", viet: hoa("Chữ hoa Q (kiểu 2)"), them: "Kể chuyện Bóp nát quả cam" },
    { tap: 2, so: 24, doc: "Chiếc rễ đa tròn", ltvc: { ten: "Từ ngữ chỉ tình cảm với Bác Hồ; từ ngữ chỉ phẩm chất", ky: ["von-tu", "dac-diem"] }, viet: nv("Chiếc rễ đa tròn", "viết 4 – 5 câu kể một việc Bác Hồ đã làm", "ke-viec"), them: "Đọc mở rộng" },
    { tap: 2, so: 25, doc: "Đất nước chúng mình", viet: hoa("Chữ hoa V (kiểu 2)"), them: "Kể chuyện Thánh Gióng" },
    { tap: 2, so: 26, doc: "Trên các miền đất nước", ltvc: { ten: "Từ ngữ chỉ sự vật quê hương; câu giới thiệu", ky: ["von-tu", "kieu-cau"] }, viet: nv("Trên các miền đất nước", "viết 4 – 5 câu giới thiệu một đồ vật làm từ tre hoặc gỗ", "do-vat"), them: "Đọc mở rộng" },
    { tap: 2, so: 27, doc: "Chuyện quả bầu", viet: hoa("Ôn chữ hoa A, M, N (kiểu 2)"), them: "Kể chuyện Chuyện quả bầu" },
    { tap: 2, so: 28, doc: "Khám phá đáy biển ở Trường Sa", ltvc: { ten: "Từ ngữ chỉ loài vật dưới biển; câu nêu hoạt động; dấu phẩy", ky: ["von-tu", "kieu-cau", "dau-phay"] }, viet: nv("Khám phá đáy biển ở Trường Sa", "viết 4 – 5 câu kể về một buổi đi chơi", "ke-viec"), them: "Đọc mở rộng" },
    { tap: 2, so: 29, doc: "Hồ Gươm", viet: hoa("Ôn chữ hoa Q, V (kiểu 2)"), them: "Nói và nghe: Nói về quê hương, đất nước em" },
    { tap: 2, so: 30, doc: "Cánh đồng quê em", ltvc: { ten: "Từ ngữ chỉ nghề nghiệp; hỏi – đáp về công việc", ky: ["von-tu", "hoi-dap"] }, viet: nv("Cánh đồng quê em", "viết 4 – 5 câu kể về công việc của một người em biết", "nguoi-than"), them: "Đọc mở rộng" },
  ],
  skills: Object.fromEntries(SKILLS.map((s) => [s.id, s])),
};
