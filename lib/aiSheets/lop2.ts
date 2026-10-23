// lib/aiSheets/lop2.ts — 12 phiếu hoạt động AI lớp 2.
// Tên chủ đề + mã yêu cầu cần đạt theo Quyết định 2422/QĐ-BGDĐT (phần Lớp 2): 12 nội dung,
// mỗi nội dung một tiết. Không nêu tên thương hiệu ứng dụng; mô tả bằng chức năng.

import type { AiGrade } from "./index";

const A = "A. Tư duy lấy con người làm trung tâm";
const B = "B. Đạo đức AI";
const C = "C. Các kĩ thuật và ứng dụng AI";
const D = "D. Thiết kế hệ thống AI";

export const LOP2: AiGrade = {
  grade: 2,
  coreCodes: [
    "2.A1.1", "2.A1.2", "2.A1.3", "2.A1.4", "2.A2.1", "2.A2.2", "2.A3.1",
    "2.B1.1", "2.B3.1", "2.B3.2", "2.C1.1", "2.C3.1", "2.C3.2", "2.D1.1", "2.D1.2", "2.D2.1", "2.D2.2",
  ],
  sheets: [
    /* ───────────── Tiết 1 ───────────── */
    {
      no: 1, title: "Khi nào nên và không nên dùng AI", codes: ["2.A1.1", "2.A1.2"], strand: A,
      activities: [
        {
          kind: "tick", title: "Có nên nhờ AI không? Đánh dấu ✓.",
          columns: ["Nên", "Cẩn thận / Không nên"],
          rows: [
            "Dịch câu chào bằng tiếng Anh",
            "Tìm xem con khủng long ăn gì",
            "Gửi ảnh khuôn mặt và địa chỉ nhà cho một ứng dụng lạ",
            "Nhờ máy làm hết bài tập về nhà",
            "Tìm lỗi chính tả trong đoạn em đã viết",
            "Nói to số điện thoại của bố mẹ cho loa thông minh ở nơi đông người",
          ],
          answer: "Nên: a, b, e. Cẩn thận / Không nên: c, f (lộ thông tin cá nhân), d (để máy làm thay hết).",
        },
        {
          kind: "write", title: "Kể một việc ở nhà em có thể nhờ AI giúp.", lines: 2,
          answer: "Tuỳ học sinh, VD: hỏi thời tiết hôm nay, bật đèn bằng giọng nói, dịch tên con vật sang tiếng Anh.",
        },
      ],
      think: "Vì sao không nên cho ứng dụng lạ biết khuôn mặt và địa chỉ nhà em?",
      teacher: {
        goals: [
          "Trình bày được một số tình huống AI hỗ trợ hiệu quả (dịch, tìm thông tin, tìm lỗi chính tả, điều khiển thiết bị trong nhà).",
          "Trình bày được tình huống không nên hoặc cần thận trọng khi dùng AI (lộ khuôn mặt, địa chỉ, giọng nói; để AI làm thay hoàn toàn).",
        ],
        steps: [
          "Khởi động (5 phút): hỏi \"Em đã thấy người lớn hỏi điện thoại điều gì?\".",
          "Hoạt động 1 (12 phút): làm cá nhân, sau đó cả lớp thảo luận từng câu \"Cẩn thận\".",
          "Hoạt động 2 (8 phút): viết 1–2 câu, vài em đọc.",
          "Chia sẻ (10 phút): chốt: AI giúp việc nhanh hơn nhưng em phải giữ kín thông tin cá nhân và tự làm việc của mình.",
        ],
      },
    },

    /* ───────────── Tiết 2 ───────────── */
    {
      no: 2, title: "AI làm việc, con người kiểm soát", codes: ["2.A1.3", "2.A1.4"], strand: A,
      activities: [
        {
          kind: "match", title: "Nối mỗi máy với việc con người vẫn phải làm.",
          left: ["Xe tự lái chạy trên đường", "Máy gợi ý bệnh cho bác sĩ", "Máy tưới cây tự động", "Ứng dụng chỉ đường"],
          right: ["Người lái vẫn nhìn đường, sẵn sàng phanh", "Bác sĩ khám lại, quyết định cách chữa", "Bác nông dân ra xem cây có héo không", "Người đi đường nhìn biển báo, đèn giao thông"],
          answer: "1–A, 2–B, 3–C, 4–D.",
        },
        {
          kind: "tick", title: "Bạn nào dùng AI đúng cách? Đánh dấu ✓.",
          columns: ["Đúng cách", "Chưa đúng"],
          rows: [
            "Minh dùng máy dịch, rồi hỏi cô xem câu dịch có đúng không",
            "Lan tin hết mọi điều máy nói, không hỏi lại ai",
            "Bố cho xe tự lái chạy và ngủ quên trên xe",
            "Hà nhờ máy gợi ý tên truyện, rồi tự chọn tên em thích",
          ],
          answer: "Đúng cách: a, d. Chưa đúng: b, c.",
        },
      ],
      think: "Vì sao bác sĩ phải xem lại kết quả máy đưa ra?",
      teacher: {
        goals: [
          "Nêu được ví dụ cần con người giám sát AI (người lái quan sát khi xe tự lái chạy; bác sĩ kiểm tra lại kết quả AI gợi ý).",
          "Nêu được thái độ đúng khi dùng AI: tin ở mức hợp lí, vẫn có trách nhiệm và kiểm soát.",
        ],
        steps: [
          "Khởi động (5 phút): hỏi \"Khi em đi xe đạp có bánh phụ, bố mẹ có đi cạnh không? Vì sao?\".",
          "Hoạt động 1 (10 phút): làm theo cặp.",
          "Hoạt động 2 (10 phút): làm cá nhân, giải thích câu \"Chưa đúng\".",
          "Chia sẻ (10 phút): chốt: máy làm việc, con người trông chừng và quyết định.",
        ],
      },
    },

    /* ───────────── Tiết 3 ───────────── */
    {
      no: 3, title: "AI trong gia đình", codes: ["2.A2.1", "2.A2.MR1", "2.A2.MR2"], strand: A,
      activities: [
        {
          kind: "match", title: "Nối máy trong nhà với việc máy làm.",
          left: ["Loa thông minh", "Rô-bốt hút bụi", "Máy điều hoà tự động", "Ti vi thông minh", "Camera ở cửa"],
          right: ["Nghe lệnh, bật nhạc, báo giờ", "Tự đi quanh nhà hút bụi", "Tự chỉnh cho phòng mát vừa đủ", "Gợi ý chương trình em hay xem", "Nhận ra người quen đến nhà"],
          answer: "1–A, 2–B, 3–C, 4–D, 5–E.",
        },
        {
          kind: "table", title: "Nhà em có máy thông minh nào? Ai thường dùng?",
          headers: ["Máy", "Ai dùng?", "Dùng để làm gì?"], widths: [30, 25, 45],
          rows: [[null, null, null], [null, null, null]],
          answer: "Tuỳ học sinh. Nhắc: em chỉ dùng các máy này khi có người lớn ở bên.",
        },
      ],
      think: "Vì sao em chỉ nên dùng máy thông minh khi có người lớn ở bên?",
      teacher: {
        goals: ["Nêu được một số thiết bị, ứng dụng trong gia đình có AI (loa thông minh, rô-bốt hút bụi, điều hoà tự chỉnh nhiệt độ, camera nhận diện, ti vi gợi ý chương trình)."],
        steps: [
          "Khởi động (5 phút): các em kể đồ dùng điện trong nhà; thầy cô hỏi đồ nào tự làm được việc.",
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): điền bảng, chia sẻ theo nhóm.",
          "Chia sẻ (10 phút): chốt: nhiều máy trong nhà có AI; em dùng khi có người lớn giám sát.",
        ],
        extend: "Mở rộng (2.A2.MR1, MR2): nếu lớp có thiết bị, cho các em thử ra lệnh cho loa hoặc ứng dụng dưới sự hướng dẫn của thầy cô; nhắc không dùng khi không có người lớn.",
      },
    },

    /* ───────────── Tiết 4 ───────────── */
    {
      no: 4, title: "AI hỗ trợ mọi người", codes: ["2.A2.2", "2.A2.MR3"], strand: A,
      activities: [
        {
          kind: "match", title: "AI có thể giúp ai trong nhà? Nối cho phù hợp.",
          left: ["Máy đọc to tin tức", "Máy nhắc giờ uống thuốc", "Ứng dụng kể chuyện cổ tích", "Máy gợi ý món ăn từ đồ có trong tủ lạnh"],
          right: ["Ông nội mắt kém", "Bà bị ốm", "Em bé", "Mẹ nấu cơm"],
          answer: "1–A, 2–B, 3–C, 4–D (có thể có cách nối khác hợp lí).",
        },
        {
          kind: "check", title: "Máy thông minh trong nhà giúp gì cho cả nhà? Đánh dấu ✓.",
          items: ["Tiện hơn, đỡ mệt hơn", "An toàn hơn", "Có nhiều thời gian cho nhau hơn", "Mọi người không cần nói chuyện với nhau nữa"],
          answer: "Đúng: ý 1, 2, 3.",
        },
      ],
      think: "Khi máy làm bớt việc nhà, cả nhà em có thể cùng nhau làm gì?",
      teacher: {
        goals: ["Nhận biết và kể tên được các thành viên trong gia đình mà AI có thể hỗ trợ."],
        steps: [
          "Khởi động (5 phút): mỗi em kể các thành viên trong nhà.",
          "Hoạt động 1 (10 phút): làm theo cặp.",
          "Hoạt động 2 (10 phút): làm cá nhân; hỏi vì sao ý 4 sai.",
          "Chia sẻ (10 phút): chốt: AI giúp cả nhà tiện nghi, an toàn, có thêm thời gian cho nhau.",
        ],
      },
    },

    /* ───────────── Tiết 5 ───────────── */
    {
      no: 5, title: "Con người dạy AI qua tương tác", codes: ["2.A3.1", "2.A3.MR1"], strand: A,
      activities: [
        {
          kind: "tick", title: "Khi em làm những việc sau, máy có thể ghi lại để “học” không? Đánh dấu ✓.",
          columns: ["Có", "Không"],
          rows: ["Hỏi trợ lí ảo một câu", "Xem hết một video hoạt hình", "Đọc sách giấy", "Bấm “thích” một bài hát", "Chơi đá cầu ngoài sân"],
          answer: "Có: a, b, d. Không: c, e (không dùng máy).",
        },
        {
          kind: "tick", title: "Cách nói nào giúp máy học điều tốt? Đánh dấu ✓.",
          columns: ["Tốt", "Chưa tốt"],
          rows: ["Hỏi lịch sự, rõ ràng", "Cố tình nói sai để trêu máy", "Báo cho máy khi máy trả lời sai", "Dùng lời nói tục"],
          answer: "Tốt: a, c. Chưa tốt: b, d.",
        },
      ],
      think: "Nếu nhiều người dạy máy điều sai, máy sẽ thế nào?",
      teacher: {
        goals: ["Nhận biết mỗi lần nói chuyện, hỏi, tìm kiếm, lựa chọn với hệ thống AI (trợ lí ảo, ứng dụng gợi ý video, nhạc) thì AI có thể ghi nhận dữ liệu để học."],
        steps: [
          "Khởi động (5 phút): hỏi \"Vì sao ti vi biết gợi ý phim hoạt hình em hay xem?\".",
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): làm theo cặp.",
          "Chia sẻ (10 phút): chốt: máy học từ cách con người dùng nó, nên em dùng lịch sự, đúng mực.",
        ],
        extend: "Mở rộng (2.A3.MR1): con người “dạy” AI qua cách tương tác; dữ liệu sai lệch làm AI học sai.",
      },
    },

    /* ───────────── Tiết 6 ───────────── */
    {
      no: 6, title: "Sự đối xử không công bằng", codes: ["2.B1.1", "2.B1.MR1", "2.B1.MR2"], strand: B,
      activities: [
        {
          kind: "tick", title: "Đọc câu chuyện, rồi đánh dấu ✓.",
          intro: "Máy chọn bạn vào đội bóng của lớp. Máy chỉ được xem ảnh các bạn trai đá bóng, nên máy không chọn bạn gái nào, dù bạn Mai đá rất giỏi.",
          columns: ["Đúng", "Sai"],
          rows: ["Máy đã đối xử công bằng", "Máy chọn sai vì chỉ học từ ảnh bạn trai", "Bạn Mai không được chọn là không công bằng", "Cho máy xem ảnh cả bạn trai và bạn gái thì máy chọn tốt hơn"],
          answer: "a: Sai; b: Đúng; c: Đúng; d: Đúng.",
        },
        {
          kind: "write", title: "Em sẽ làm gì nếu thấy một máy chọn người không công bằng?", lines: 2,
          answer: "VD: báo cho thầy cô, bố mẹ; nhờ người lớn kiểm tra lại; không tin ngay kết quả của máy.",
        },
      ],
      think: "Vì sao máy có thể đối xử không công bằng dù máy không có ý xấu?",
      teacher: {
        goals: ["Nhận biết AI đôi khi có thể thiên kiến, tức là đối xử không công bằng với một số nhóm người."],
        steps: [
          "Khởi động (5 phút): hỏi \"Thế nào là công bằng khi chia kẹo cho cả lớp?\".",
          "Hoạt động 1 (12 phút): thầy cô đọc câu chuyện, các em làm cá nhân.",
          "Hoạt động 2 (8 phút): viết 1–2 câu.",
          "Chia sẻ (10 phút): chốt: máy học từ dữ liệu; dữ liệu không đủ đa dạng thì máy có thể thiên vị.",
        ],
        extend: "Mở rộng (2.B1.MR1, MR2): kể thêm ví dụ thiên kiến; giải thích dữ liệu chưa đa dạng làm AI học thiên vị.",
      },
    },

    /* ───────────── Tiết 7 ───────────── */
    {
      no: 7, title: "Của bạn và của tớ", codes: ["2.B3.1", "2.B3.2", "2.B3.MR1", "2.B3.MR2"], strand: B,
      activities: [
        {
          kind: "table", title: "Kể tên đồ vật là của riêng em và đồ vật là của người khác.",
          headers: ["Của em", "Của người khác"], widths: [50, 50],
          rows: [[null, null], [null, null], [null, null]],
          answer: "Tuỳ học sinh. VD: của em – cặp sách, bức tranh em vẽ; của người khác – bút của bạn, điện thoại của bố.",
        },
        {
          kind: "tick", title: "Làm thế có đúng không? Đánh dấu ✓.",
          columns: ["Đúng", "Sai"],
          rows: [
            "Lấy tranh bạn vẽ, ghi tên mình vào",
            "Hỏi bạn trước khi mượn bút màu",
            "Bố dùng máy làm ra một bài hát, bài hát đó là của bố",
            "Lấy ảnh của bạn đăng lên mà không hỏi bạn",
          ],
          answer: "Đúng: b, c. Sai: a, d (muốn dùng thứ của người khác phải hỏi và được đồng ý).",
        },
      ],
      think: "Muốn dùng bức tranh bạn vẽ, em phải làm gì trước?",
      teacher: {
        goals: [
          "Kể được một số thứ của riêng em và của người khác.",
          "Nêu được ví dụ về quyền sở hữu đối với sản phẩm do con người hoặc AI tạo ra.",
        ],
        steps: [
          "Khởi động (5 phút): thầy cô cầm một đồ vật của một em, hỏi \"Cô có được lấy không?\".",
          "Hoạt động 1 (10 phút): điền bảng cá nhân.",
          "Hoạt động 2 (10 phút): làm theo cặp, giải thích câu sai.",
          "Chia sẻ (10 phút): chốt: thứ người khác làm ra (cả khi họ dùng máy để làm) là của họ; muốn dùng phải hỏi.",
        ],
        extend: "Mở rộng (2.B3.MR1, MR2): đóng vai mượn đồ – hỏi – cảm ơn.",
      },
    },

    /* ───────────── Tiết 8 ───────────── */
    {
      no: 8, title: "Cách AI học và học liệu của AI", codes: ["2.C1.1", "2.C1.MR1"], strand: C,
      activities: [
        {
          kind: "check", title: "Thứ nào là “dữ liệu” để dạy máy nhận ra con chó? Đánh dấu ✓.",
          items: ["Ảnh con chó", "Tiếng chó sủa", "Cái bàn học", "Ảnh chó đang chạy", "Cục tẩy", "Video chó vẫy đuôi"],
          answer: "Dữ liệu: ảnh con chó, tiếng chó sủa, ảnh chó đang chạy, video chó vẫy đuôi.",
        },
        {
          kind: "tick", title: "Em học hay máy học? Đánh dấu ✓ (có thể chọn cả hai).",
          columns: ["Em", "Máy"],
          rows: ["Học nhờ nhìn nhiều ví dụ", "Học nhờ thầy cô giảng giải", "Cần rất nhiều ảnh mới nhận ra con mèo", "Hiểu vì sao con mèo đáng yêu"],
          answer: "a: Em và Máy; b: Em; c: Máy; d: Em.",
        },
      ],
      think: "Muốn dạy máy nhận ra tiếng gà gáy, em cần cho máy nghe gì?",
      teacher: {
        goals: ["Giải thích được “dữ liệu” là những ví dụ (hình ảnh, âm thanh) con người dùng để dạy AI."],
        steps: [
          "Khởi động (5 phút): hỏi \"Em học chữ a bằng cách nào?\" (nhìn, đọc nhiều lần).",
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): làm theo cặp, so sánh cách học của em và của máy.",
          "Chia sẻ (10 phút): chốt: dữ liệu là “sách học” của máy.",
        ],
        extend: "Mở rộng (2.C1.MR1): so sánh cách học của con người và AI.",
      },
    },

    /* ───────────── Tiết 9 ───────────── */
    {
      no: 9, title: "Sơ lược cách AI phân loại đồ vật", codes: ["2.C3.1", "2.C3.2", "2.C3.MR1"], strand: C,
      activities: [
        {
          kind: "sort", title: "Em hãy làm “máy phân loại”: viết chữ cái vào đúng nhóm.",
          items: ["Quả táo", "Cái thìa", "Quả chuối", "Đôi đũa", "Quả cam", "Cái bát"],
          columns: ["Hoa quả", "Đồ dùng ăn uống"],
          answer: "Hoa quả: A, C, E. Đồ dùng ăn uống: B, D, F.",
        },
        {
          kind: "tick", title: "Máy phân loại ảnh như sau. Máy đúng hay sai? Đánh dấu ✓.",
          columns: ["Đúng", "Sai"],
          rows: ["Ảnh quả bóng đỏ → máy xếp vào “hoa quả”", "Ảnh quả chuối → “hoa quả”", "Ảnh cái thìa → “đồ dùng ăn uống”", "Ảnh con mèo trắng → “đồ dùng ăn uống”"],
          answer: "a: Sai (máy nhầm vì quả bóng đỏ tròn giống quả táo); b: Đúng; c: Đúng; d: Sai.",
        },
      ],
      think: "Vì sao máy có thể nhầm quả bóng đỏ với quả táo?",
      teacher: {
        goals: ["Nhận biết AI có thể phân loại.", "Nêu được AI có thể phân loại sai."],
        prepare: "Vài đồ vật thật hoặc tranh: hoa quả, thìa, bát, quả bóng.",
        steps: [
          "Khởi động (5 phút): các em chia đồ vật trên bàn thầy cô thành hai nhóm.",
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): làm theo cặp, giải thích vì sao máy nhầm.",
          "Chia sẻ (10 phút): chốt: máy xếp đồ vật vào nhóm dựa trên những gì nó đã học; máy có thể xếp sai.",
        ],
        extend: "Mở rộng (2.C3.MR1): thầy cô làm mẫu một ứng dụng phân loại ảnh trên máy, các em so sánh với cách mình phân loại.",
      },
    },

    /* ───────────── Tiết 10 ───────────── */
    {
      no: 10, title: "Máy thông minh giúp giải quyết vấn đề quanh em", codes: ["2.D1.1"], strand: D,
      activities: [
        {
          kind: "match", title: "Nối mỗi vấn đề với máy thông minh có thể giúp.",
          left: ["Hay quên tưới cây", "Đường trước cổng trường đông xe", "Bà hay quên tắt bếp", "Em bé khóc khi bố mẹ ở phòng khác"],
          right: ["Máy tưới cây tự động", "Đèn giao thông tự đổi theo số xe", "Bếp tự tắt khi không có người", "Camera báo cho bố mẹ biết"],
          answer: "1–A, 2–B, 3–C, 4–D.",
        },
        {
          kind: "table", title: "Ở trường hoặc ở nhà em có vấn đề gì máy thông minh có thể giúp?",
          headers: ["Vấn đề", "Máy có thể giúp thế nào?"], widths: [45, 55],
          rows: [[null, null], [null, null]],
          answer: "Tuỳ học sinh, VD: lớp hay quên tắt quạt – máy tự tắt khi không có người; sân trường nhiều rác – thùng rác tự báo khi đầy.",
        },
      ],
      think: "Vấn đề nào ở lớp em cần con người tự giải quyết, không cần máy?",
      teacher: {
        goals: ["Nêu được một số vấn đề đơn giản, gần gũi trong đời sống có thể áp dụng AI để giải quyết."],
        steps: [
          "Khởi động (5 phút): hỏi \"Ở lớp mình có việc gì hay bị quên?\".",
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (12 phút): nhóm 4 em tìm vấn đề và cách máy có thể giúp.",
          "Chia sẻ (8 phút): các nhóm trình bày; chốt: không phải vấn đề nào cũng cần máy.",
        ],
      },
    },

    /* ───────────── Tiết 11 ───────────── */
    {
      no: 11, title: "Ý tưởng máy thông minh", codes: ["2.D1.2", "2.D1.MR1"], strand: D,
      activities: [
        {
          kind: "table", title: "Nghĩ ra một máy thông minh. Điền vào bảng.",
          headers: ["Tên máy", "Máy giúp ai?", "Máy làm việc gì?"], widths: [30, 30, 40],
          rows: [[null, null, null]],
          answer: "Tuỳ học sinh, VD: “Máy nhắc mang áo mưa” – giúp các bạn – xem trời sắp mưa thì nhắc mang áo mưa.",
        },
        {
          kind: "write", title: "Vẽ máy thông minh của em.", lines: 0, draw: true,
        },
      ],
      think: "Muốn máy của em làm đúng, em cần cho máy học những ví dụ nào?",
      teacher: {
        goals: ["Nêu được một số ý tưởng máy thông minh."],
        steps: [
          "Khởi động (5 phút): nhắc lại các vấn đề tìm được ở tiết trước.",
          "Hoạt động 1 (8 phút): mỗi em điền bảng.",
          "Hoạt động 2 (12 phút): vẽ máy.",
          "Chia sẻ (10 phút): vài em giới thiệu máy; cả lớp góp ý máy cần học những ví dụ nào.",
        ],
        extend: "Mở rộng (2.D1.MR1): nêu ví dụ phù hợp để “dạy” máy của em (VD máy nhắc mang áo mưa: ảnh trời mưa, trời nắng).",
      },
    },

    /* ───────────── Tiết 12 ───────────── */
    {
      no: 12, title: "Vai trò của dữ liệu", codes: ["2.D2.1", "2.D2.2", "2.D2.MR1"], strand: D,
      activities: [
        {
          kind: "check", title: "Dạy máy nhận ra quả cam. Ảnh nào nên cho máy xem? Đánh dấu ✓.",
          items: ["Quả cam rõ nét", "Ảnh bị mờ, không nhìn rõ quả gì", "Quả cam bổ đôi", "Quả bóng màu cam ghi chữ “cam”", "Nhiều quả cam trong rổ", "Ảnh quả chanh ghi chữ “cam”"],
          answer: "Nên: quả cam rõ nét, cam bổ đôi, nhiều quả cam trong rổ. Không nên: ảnh mờ, quả bóng, quả chanh ghi nhầm “cam”.",
        },
        {
          kind: "tick", title: "Đúng hay sai? Đánh dấu ✓.",
          columns: ["Đúng", "Sai"],
          rows: ["Dữ liệu càng rõ ràng, máy càng trả lời đúng", "Ghi nhầm tên ảnh thì máy học nhầm", "Máy tự biết ảnh nào bị ghi sai", "Con người cần chọn dữ liệu cẩn thận"],
          answer: "a: Đúng; b: Đúng; c: Sai; d: Đúng.",
        },
      ],
      think: "Nếu em dạy máy bằng ảnh quả chanh ghi tên “cam”, máy sẽ thế nào?",
      teacher: {
        goals: [
          "Giải thích được ở mức cơ bản vai trò của dữ liệu trong việc “dạy” AI.",
          "Giải thích được cần cung cấp dữ liệu chính xác, rõ ràng để AI cho kết quả đúng.",
        ],
        steps: [
          "Khởi động (5 phút): thầy cô chỉ quả chanh và nói \"Đây là quả cam\"; hỏi các em có học nhầm không.",
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): làm theo cặp.",
          "Chia sẻ (10 phút): chốt: dữ liệu đúng, rõ thì máy học đúng; dữ liệu sai thì máy học sai.",
        ],
        extend: "Mở rộng (2.D2.MR1): các em sưu tầm tranh ảnh để làm bộ dữ liệu dạy máy nhận ra một loại quả.",
      },
    },
  ],
};
