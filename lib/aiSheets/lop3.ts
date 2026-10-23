// lib/aiSheets/lop3.ts — 12 phiếu hoạt động AI lớp 3.
// Tên chủ đề + mã yêu cầu cần đạt theo Quyết định 2422/QĐ-BGDĐT (phần Lớp 3). Khung có 14
// nội dung: gộp "Kĩ thuật học máy" + "Quá trình huấn luyện máy thông minh" (tiết 11) và "Dữ liệu
// tốt cho máy thông minh" + "Máy thông minh có thể học sai" (tiết 12) để vừa 12 tiết.
// Không nêu tên thương hiệu ứng dụng; mô tả bằng chức năng.

import type { AiGrade } from "./index";

const A = "A. Tư duy lấy con người làm trung tâm";
const B = "B. Đạo đức AI";
const C = "C. Các kĩ thuật và ứng dụng AI";
const D = "D. Thiết kế hệ thống AI";

export const LOP3: AiGrade = {
  grade: 3,
  coreCodes: [
    "3.A1.1", "3.A1.2", "3.A1.3", "3.A1.4", "3.A1.5", "3.A2.1", "3.A2.2", "3.A2.3", "3.A3.1", "3.A3.2",
    "3.B2.1", "3.B3.1", "3.C4.1", "3.C5.1", "3.C5.2", "3.C5.3", "3.C5.4", "3.D1.1", "3.D2.1", "3.D2.2", "3.D2.3",
  ],
  sheets: [
    /* ───────────── Tiết 1 ───────────── */
    {
      no: 1, title: "Cách sử dụng AI trong học tập", codes: ["3.A1.1", "3.A1.2", "3.A1.MR1"], strand: A,
      activities: [
        {
          kind: "tick", title: "AI có thể giúp em học trong tình huống nào? Đánh dấu ✓.",
          columns: ["Có thể giúp", "Không cần AI"],
          rows: [
            "Luyện phát âm từ tiếng Anh mới học",
            "Nghe đọc lại một đoạn văn khi em chưa đọc trôi chảy",
            "Đá cầu cùng các bạn giờ ra chơi",
            "Hỏi thêm ví dụ khi chưa hiểu phép nhân",
            "Tưới cây ở vườn trường",
          ],
          answer: "Có thể giúp: a, b, d. Không cần AI: c, e.",
        },
        {
          kind: "order", title: "Đánh số thứ tự các bước dùng ứng dụng học tiếng Anh cho đúng cách.",
          steps: ["Tự đọc to lại từ đó, không nhìn máy.", "Xin phép bố mẹ hoặc thầy cô trước khi dùng.", "Nghe máy đọc mẫu một từ mới.", "Đọc theo, nghe máy nhận xét phát âm."],
          answer: "Thứ tự: 2 – 3 – 4 – 1.",
        },
      ],
      think: "Em muốn nhờ trợ lí học tập giúp môn nào nhất? Giúp việc gì?",
      teacher: {
        goals: [
          "Nhận biết được một số tình huống dùng AI hỗ trợ học sinh trong học tập.",
          "Nêu được cách dùng trợ lí học tập thông minh, ứng dụng học ngôn ngữ để hỗ trợ việc học.",
        ],
        steps: [
          "Khởi động (5 phút): hỏi \"Khi chưa hiểu bài ở nhà, em thường hỏi ai?\".",
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): làm theo cặp, nói lại các bước bằng lời.",
          "Chia sẻ (10 phút): chốt: AI giúp luyện tập, giải thích thêm; em vẫn tự học và hỏi thầy cô.",
        ],
        extend: "Mở rộng (3.A1.MR1): nếu lớp có máy, cho các em thử một ứng dụng luyện phát âm dưới sự hướng dẫn của thầy cô.",
      },
    },

    /* ───────────── Tiết 2 ───────────── */
    {
      no: 2, title: "Không phụ thuộc hoàn toàn vào AI", codes: ["3.A1.3", "3.A1.MR2"], strand: A,
      activities: [
        {
          kind: "sort", title: "Viết chữ cái của mỗi việc vào cột phù hợp.",
          items: [
            "Nhờ máy gợi ý từ tả mưa, rồi tự viết đoạn văn",
            "Chép nguyên bài văn máy viết để nộp",
            "Tự làm toán, rồi nhờ máy kiểm tra lại",
            "Nhờ máy làm hết bài tập về nhà",
            "Hỏi máy nghĩa một từ khó, rồi tự đặt câu",
            "Để máy chọn thay em mọi việc trong ngày",
          ],
          columns: ["Dùng AI để hỗ trợ (đúng)", "Để AI làm thay (chưa đúng)"],
          answer: "Hỗ trợ: A, C, E. Làm thay: B, D, F.",
        },
        {
          kind: "check", title: "Nếu việc gì cũng để máy làm thay, em có thể bị làm sao? Đánh dấu ✓.",
          items: ["Khó tự suy nghĩ", "Học giỏi hơn mà không cần cố gắng", "Quên cách tự giải bài", "Kém tự tin khi không có máy"],
          answer: "Đúng: ý 1, 3, 4.",
        },
      ],
      think: "Lần tới khi làm bài văn, em sẽ dùng AI thế nào cho đúng?",
      teacher: {
        goals: ["Phân biệt được dùng AI như công cụ hỗ trợ (chủ động, có kiểm soát) với để AI làm thay toàn bộ (thụ động, thiếu tự lập)."],
        steps: [
          "Khởi động (5 phút): hỏi \"Nếu bạn luôn chép bài của em, bạn có giỏi lên không?\".",
          "Hoạt động 1 (12 phút): làm theo cặp.",
          "Hoạt động 2 (8 phút): làm cá nhân.",
          "Chia sẻ (10 phút): chốt: AI là người trợ giúp, em là người học và làm chính.",
        ],
        extend: "Mở rộng (3.A1.MR2): hậu quả của việc phụ thuộc quá mức vào AI (giảm tư duy độc lập, sáng tạo, kĩ năng giải quyết vấn đề, sự tự tin).",
      },
    },

    /* ───────────── Tiết 3 ───────────── */
    {
      no: 3, title: "Suy nghĩ kĩ trước khi dùng AI", codes: ["3.A1.4", "3.A1.5", "3.A1.MR3"], strand: A,
      activities: [
        {
          kind: "tick", title: "Việc nào có thể gây rủi ro? Đánh dấu ✓.",
          columns: ["Có rủi ro", "An toàn"],
          rows: [
            "Gửi ảnh mặt mình và tên trường cho một ứng dụng lạ",
            "Tin ngay đường đi máy chỉ, dù có biển cấm",
            "Nhờ máy đọc to truyện cổ tích",
            "Làm theo máy bảo uống một loại thuốc mà không hỏi người lớn",
          ],
          answer: "Có rủi ro: a, b, d. An toàn: c.",
        },
        {
          kind: "table", title: "Tình huống: Em muốn nhờ AI viết giúp lời chúc mừng sinh nhật bà. Trả lời các câu hỏi.",
          headers: ["Câu hỏi trước khi dùng AI", "Em trả lời"], widths: [55, 45],
          rows: [["Việc này có cần dùng AI không?", null], ["Nếu AI viết không hay hoặc sai, điều gì xảy ra?", null], ["Em sẽ tự làm phần nào?", null]],
          answer: "Gợi ý: không nhất thiết, tự viết sẽ ý nghĩa hơn; nếu sai thì bà không vui hoặc lời chúc không đúng; em tự viết lời yêu thương riêng của mình.",
        },
      ],
      think: "Câu hỏi nào em sẽ luôn tự hỏi trước khi dùng AI?",
      teacher: {
        goals: [
          "Nêu được một số tình huống có thể gây rủi ro, hậu quả không mong muốn khi dùng AI.",
          "Tự đặt và trả lời được câu hỏi trước khi quyết định dùng AI (Việc này có cần AI không? Nếu AI sai thì sao?…).",
        ],
        steps: [
          "Khởi động (5 phút): hỏi \"Trước khi qua đường em phải làm gì?\" (nhìn trước, nghĩ trước).",
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (12 phút): làm theo cặp, vài cặp đọc câu trả lời.",
          "Chia sẻ (8 phút): chốt bộ 3 câu hỏi: Có cần AI không? Nếu sai thì sao? Mình tự làm phần nào?",
        ],
        extend: "Mở rộng (3.A1.MR3): suy nghĩ và kiểm tra trước khi dùng AI giúp phòng tránh rủi ro, bảo vệ an toàn và quyền riêng tư.",
      },
    },

    /* ───────────── Tiết 4 ───────────── */
    {
      no: 4, title: "AI trong trường học", codes: ["3.A2.1", "3.A2.2", "3.A2.MR1"], strand: A,
      activities: [
        {
          kind: "match", title: "Nối thiết bị, ứng dụng với việc nó giúp ở trường.",
          left: ["Bảng thông minh", "Ứng dụng chấm bài trắc nghiệm", "Ứng dụng nhận dạng chữ viết tay", "Rô-bốt hướng dẫn ở thư viện"],
          right: ["Hiện tranh, video, trò chơi cho bài học", "Chấm nhanh bài làm của cả lớp", "Đổi chữ viết tay thành chữ in", "Chỉ chỗ để sách em cần tìm"],
          answer: "1–A, 2–B, 3–C, 4–D.",
        },
        {
          kind: "check", title: "AI được dùng ở trường để làm gì? Đánh dấu ✓.",
          items: ["Giúp mỗi bạn học theo khả năng của mình", "Làm giờ học vui, nhiều trò chơi tương tác", "Thay thầy cô dạy học", "Giúp thầy cô đỡ mất thời gian chấm bài"],
          answer: "Đúng: ý 1, 2, 4.",
        },
      ],
      think: "Trường học em mơ ước có máy thông minh nào?",
      teacher: {
        goals: [
          "Nhận biết được một số ứng dụng, thiết bị có AI trong trường học (rô-bốt, bảng thông minh, ứng dụng chấm bài, nhận dạng chữ viết).",
          "Nêu được mục đích dùng AI trong trường: hỗ trợ thầy cô và học sinh học hiệu quả hơn, cá nhân hoá việc học, tăng hứng thú.",
        ],
        steps: [
          "Khởi động (5 phút): hỏi \"Ở trường mình có máy nào giúp việc dạy và học?\".",
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): làm theo cặp; hỏi vì sao ý 3 sai.",
          "Chia sẻ (10 phút): vài em mô tả trường học mơ ước.",
        ],
        extend: "Mở rộng (3.A2.MR1, MR2): vẽ trường học tương lai; đề xuất vài nguyên tắc khi dùng AI trong học tập.",
      },
    },

    /* ───────────── Tiết 5 ───────────── */
    {
      no: 5, title: "AI hỗ trợ mọi người", codes: ["3.A2.3", "3.A2.MR3"], strand: A,
      activities: [
        {
          kind: "match", title: "AI có thể giúp ai ở trường? Nối cho phù hợp.",
          left: ["Ứng dụng đọc to bài cho bạn nhìn kém", "Máy chấm bài trắc nghiệm", "Máy điểm danh bằng khuôn mặt", "Ứng dụng gợi ý sách theo sở thích"],
          right: ["Học sinh", "Giáo viên", "Cô văn phòng", "Cô thư viện và học sinh"],
          answer: "1–A, 2–B, 3–C, 4–D (có thể có cách nối khác hợp lí).",
        },
        {
          kind: "write", title: "Viết 1–2 câu: AI giúp việc dạy và học ở trường công bằng hơn như thế nào?", lines: 2,
          answer: "VD: bạn nhìn kém hay nghe kém cũng học được nhờ máy đọc to hoặc hiện chữ; bạn học chậm được luyện thêm theo khả năng.",
        },
      ],
      think: "Ở lớp em, bạn nào có thể được AI giúp nhiều nhất?",
      teacher: {
        goals: ["Nêu được các đối tượng trong trường học mà AI có thể hỗ trợ: học sinh, giáo viên, nhân viên…"],
        steps: [
          "Khởi động (5 phút): các em kể những người làm việc ở trường.",
          "Hoạt động 1 (10 phút): làm theo cặp.",
          "Hoạt động 2 (10 phút): viết cá nhân.",
          "Chia sẻ (10 phút): chốt: AI hỗ trợ mọi thành viên trong trường, giúp dạy và học dễ dàng, hiệu quả, công bằng hơn.",
        ],
      },
    },

    /* ───────────── Tiết 6 ───────────── */
    {
      no: 6, title: "Kiểm tra và phản biện kết quả của AI", codes: ["3.A3.1", "3.A3.2"], strand: A,
      activities: [
        {
          kind: "tick", title: "AI có thể sai trong các tình huống sau không? Đánh dấu ✓.",
          columns: ["Có thể sai", "Không thể sai"],
          rows: ["Ứng dụng dịch một câu tiếng Anh", "Máy nhận ra khuôn mặt trong ảnh tối", "Máy trả lời câu hỏi về lịch sử", "Máy tính bỏ túi tính 2 + 3"],
          answer: "Có thể sai: a, b, c. d là phép tính máy tính bỏ túi làm theo luật nên luôn ra 5 (không phải AI đoán).",
        },
        {
          kind: "order", title: "Máy nói: “Con voi là loài chim lớn nhất.” Đánh số các bước em nên làm.",
          steps: ["Hỏi thầy cô hoặc bố mẹ.", "Nghi ngờ: câu này có đúng không?", "Kết luận câu máy nói là sai.", "Tìm trong sách khoa học, sách tranh về con vật."],
          answer: "Thứ tự: 2 – 4 – 1 – 3.",
        },
      ],
      think: "Khi máy trả lời, em có tin ngay không? Vì sao?",
      teacher: {
        goals: [
          "Nêu được ví dụ AI có thể sai (dịch sai, nhận diện nhầm, trả lời không đúng sự thật).",
          "Trình bày được khi dùng AI cần kiểm tra lại, so sánh với nhiều nguồn và hỏi thầy cô, người lớn.",
        ],
        steps: [
          "Khởi động (5 phút): thầy cô đọc một câu sai rõ ràng, hỏi các em có tin không.",
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): làm theo cặp.",
          "Chia sẻ (10 phút): chốt: thấy lạ thì nghi ngờ, kiểm tra ở sách, hỏi người lớn.",
        ],
      },
    },

    /* ───────────── Tiết 7 ───────────── */
    {
      no: 7, title: "Phân biệt thật và giả", codes: ["3.B2.1"], strand: B,
      activities: [
        {
          kind: "tick", title: "Thật hay có thể là giả do máy tạo ra? Đánh dấu ✓.",
          columns: ["Có thể giả", "Thật"],
          rows: [
            "Ảnh con mèo to bằng ngôi nhà",
            "Video một nhân vật hoạt hình nói chuyện với em",
            "Ảnh lớp em chụp chung với cô giáo hôm khai giảng",
            "Tin nhắn “Em trúng thưởng xe đạp, gửi địa chỉ nhà để nhận”",
          ],
          answer: "Có thể giả: a, b, d. Thật: c (ảnh em biết rõ đã chụp).",
        },
        {
          kind: "check", title: "Khi thấy một ảnh hay video lạ, em nên làm gì? Đánh dấu ✓.",
          items: ["Hỏi bố mẹ, thầy cô", "Chia sẻ ngay cho các bạn", "Xem có hợp lí không", "Tin ngay vì có hình ảnh"],
          answer: "Nên: hỏi bố mẹ, thầy cô; xem có hợp lí không.",
        },
      ],
      think: "Vì sao không nên chia sẻ ngay một bức ảnh lạ?",
      teacher: {
        goals: ["Nhận biết và nêu được ví dụ thông tin, sản phẩm do AI tạo ra có thể không đúng sự thật."],
        steps: [
          "Khởi động (5 phút): kể câu chuyện ngắn về bức ảnh “cá voi bay trên trời”; hỏi có thật không.",
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): làm theo cặp.",
          "Chia sẻ (10 phút): chốt: máy có thể tạo ra ảnh, video, lời nói giống thật; em kiểm tra và hỏi người lớn.",
        ],
      },
    },

    /* ───────────── Tiết 8 ───────────── */
    {
      no: 8, title: "Cùng máy thông minh làm việc tốt", codes: ["3.B3.1", "3.B3.MR1"], strand: B,
      activities: [
        {
          kind: "tick", title: "Việc làm với AI nào tốt, việc nào xấu? Đánh dấu ✓.",
          columns: ["Tốt", "Xấu"],
          rows: [
            "Dùng máy làm giọng giống bạn để gọi điện lừa người khác",
            "Dùng máy dịch giúp du khách hỏi đường",
            "Dùng máy làm ảnh chế để chê bai bạn",
            "Dùng máy nhắc lịch trực nhật cho cả lớp",
          ],
          answer: "Tốt: b, d. Xấu: a (lừa đảo), c (bắt nạt).",
        },
        {
          kind: "write", title: "Em nghĩ ra một việc tốt có thể làm cùng máy thông minh để giúp lớp hoặc gia đình.", lines: 2,
          answer: "Tuỳ học sinh, VD: nhờ máy đọc truyện cho em bé nghe; nhờ máy nhắc cả nhà tiết kiệm điện.",
        },
      ],
      think: "Nếu thấy bạn dùng máy để bắt nạt người khác, em sẽ làm gì?",
      teacher: {
        goals: ["Nhận biết không nên tạo ra hoặc dùng AI cho mục đích xấu như lừa đảo, bắt nạt, gây hại cho người khác."],
        steps: [
          "Khởi động (5 phút): hỏi \"Con dao dùng để nấu ăn hay làm hại người?\" để dẫn vào ý công cụ dùng tốt hay xấu.",
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): viết cá nhân, chia sẻ theo nhóm.",
          "Chia sẻ (10 phút): chốt: con người chọn dùng AI vào việc tốt; thấy dùng xấu thì báo người lớn.",
        ],
        extend: "Mở rộng (3.B3.MR1): con người cần cung cấp dữ liệu đúng và đa dạng để AI hoạt động chính xác, công bằng.",
      },
    },

    /* ───────────── Tiết 9 ───────────── */
    {
      no: 9, title: "Dữ liệu học máy", codes: ["3.C4.1", "3.C4.MR1"], strand: C,
      activities: [
        {
          kind: "table", title: "Bảng dữ liệu về các bạn trong tổ. Điền thêm cho đủ.",
          headers: ["Tên bạn", "Môn thích nhất", "Cách đến trường"], widths: [34, 33, 33],
          rows: [["Lan", "Mĩ thuật", "Đi bộ"], [null, null, null], [null, null, null]],
          answer: "Tuỳ học sinh. Mỗi dòng là dữ liệu về một bạn; mỗi cột là một đặc điểm.",
        },
        {
          kind: "check", title: "Những gì dưới đây là dữ liệu? Đánh dấu ✓.",
          items: ["Ảnh các loại lá cây", "Bảng điểm danh của lớp", "Tiếng chim hót ghi âm lại", "Số đo chiều cao các bạn", "Một cơn gió thổi qua", "Bảng nhiệt độ mỗi ngày trong tuần"],
          answer: "Dữ liệu: ảnh lá cây, bảng điểm danh, tiếng chim ghi âm, số đo chiều cao, bảng nhiệt độ. Cơn gió thổi qua không được ghi lại nên chưa là dữ liệu.",
        },
      ],
      think: "Muốn máy đoán ngày mai có mưa không, máy cần dữ liệu gì?",
      teacher: {
        goals: ["Trình bày được khái niệm dữ liệu qua một số ví dụ."],
        steps: [
          "Khởi động (5 phút): thầy cô hỏi nhanh vài bạn \"Em thích môn gì?\" và ghi lên bảng thành một bảng nhỏ.",
          "Hoạt động 1 (12 phút): làm theo tổ.",
          "Hoạt động 2 (8 phút): làm cá nhân.",
          "Chia sẻ (10 phút): chốt: dữ liệu là thông tin được ghi lại (chữ, số, ảnh, âm thanh); máy học từ dữ liệu.",
        ],
        extend: "Mở rộng (3.C4.MR1): nêu đặc trưng của bộ dữ liệu trong bảng (mỗi cột là một đặc điểm).",
      },
    },

    /* ───────────── Tiết 10 ───────────── */
    {
      no: 10, title: "Kĩ thuật AI dựa trên luật", codes: ["3.C5.1", "3.C5.MR1"], strand: C,
      activities: [
        {
          kind: "match", title: "Nối “nếu” với “thì” cho đúng luật.",
          left: ["Nếu trời tối", "Nếu nhiệt độ phòng quá nóng", "Nếu có người đến gần cửa", "Nếu đất trong chậu khô"],
          right: ["thì đèn tự bật", "thì điều hoà bật mát", "thì cửa tự mở", "thì máy tưới nước"],
          answer: "1–A, 2–B, 3–C, 4–D.",
        },
        {
          kind: "table", title: "Viết luật “nếu … thì …” để máy chia rác.",
          headers: ["Nếu …", "thì …"], widths: [50, 50],
          rows: [["Rác là vỏ chai nhựa", null], ["Rác là vỏ chuối", null], [null, "bỏ vào thùng giấy"]],
          answer: "Gợi ý: vỏ chai nhựa → thùng tái chế; vỏ chuối → thùng rác hữu cơ; rác là giấy vụn → bỏ vào thùng giấy.",
        },
      ],
      think: "Nếu gặp một loại rác không có trong luật, máy sẽ làm gì?",
      teacher: {
        goals: ["Mô tả được cấu trúc “nếu … thì …” trong giải quyết tình huống hoặc phân loại."],
        steps: [
          "Khởi động (5 phút): trò chơi \"Nếu cô vỗ tay thì các em đứng lên\".",
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (12 phút): làm theo cặp.",
          "Chia sẻ (8 phút): chốt: máy dựa trên luật làm đúng những gì con người viết sẵn; gặp trường hợp không có luật thì máy không biết làm.",
        ],
        extend: "Mở rộng (3.C5.MR1): nêu một số công cụ AI đơn giản dùng “nếu … thì …” (đèn cảm biến, cửa tự động, máy tưới tự động).",
      },
    },

    /* ───────────── Tiết 11 ───────────── */
    {
      no: 11, title: "Kĩ thuật học máy và quá trình huấn luyện máy thông minh",
      codes: ["3.C5.2", "3.C5.3", "3.C5.4", "3.D1.1"], strand: "C, D",
      activities: [
        {
          kind: "order", title: "Đánh số các bước huấn luyện máy phân loại rau củ.",
          steps: ["Cho máy xem một củ mới để máy tự nói tên.", "Chụp thật nhiều ảnh cà rốt, khoai tây, cà chua.", "Ghi tên cho từng ảnh.", "Cho máy học từ các ảnh đã ghi tên."],
          answer: "Thứ tự: 2 – 3 – 4 – 1 (thu thập ví dụ → ghi tên → cho máy học → thử).",
        },
        {
          kind: "sort", title: "Bài toán nào là phân loại, bài toán nào là dự đoán? Viết chữ cái vào cột.",
          items: ["Xếp ảnh quả thành táo hoặc cam", "Đoán ngày mai có mưa không", "Chia thư thành thư thường hoặc thư rác", "Đoán cây sẽ cao bao nhiêu sau một tháng"],
          columns: ["Phân loại", "Dự đoán"],
          answer: "Phân loại: A, C. Dự đoán: B, D.",
        },
      ],
      think: "Máy học máy khác máy dựa trên luật ở điểm nào?",
      teacher: {
        goals: [
          "Nêu được đặc điểm chính của học máy là học trên dữ liệu; nêu được tình huống áp dụng học máy (phân loại rau củ, dự báo mưa lũ…).",
          "Nhận biết bài toán học máy phân loại và bài toán dự đoán qua tình huống cụ thể.",
          "Trình bày được quá trình đơn giản để huấn luyện AI: thu thập ví dụ và cho AI học từ ví dụ.",
        ],
        steps: [
          "Khởi động (5 phút): nhắc lại máy dựa trên luật ở tiết trước; hỏi \"Nếu không viết luật được thì sao?\".",
          "Hoạt động 1 (10 phút): làm theo cặp.",
          "Hoạt động 2 (10 phút): làm cá nhân.",
          "Chia sẻ (10 phút): chốt: máy học máy tự tìm ra quy luật từ nhiều ví dụ; cần thu thập ví dụ rồi cho máy học.",
        ],
        extend: "Mở rộng (3.C5.MR2): nếu trường có máy, thầy cô dùng một công cụ học máy miễn phí để làm mẫu bài toán phân loại.",
      },
    },

    /* ───────────── Tiết 12 ───────────── */
    {
      no: 12, title: "Dữ liệu tốt cho máy thông minh – Máy thông minh có thể học sai",
      codes: ["3.D2.1", "3.D2.2", "3.D2.3", "3.D2.MR1"], strand: D,
      activities: [
        {
          kind: "tick", title: "Bộ thẻ dữ liệu dạy máy nhận ra con vật. Thẻ nào ghi đúng? Đánh dấu ✓.",
          columns: ["Đúng", "Sai"],
          rows: ["Ảnh con mèo – ghi “mèo”", "Ảnh con chó – ghi “mèo”", "Ảnh bị mờ, không thấy con gì – ghi “gà”", "Ảnh con gà – ghi “gà”", "Ảnh con vịt – ghi “gà”"],
          answer: "Đúng: a, d. Sai: b, e (ghi nhầm tên), c (ảnh mờ, không đúng sự thật) – cần loại bỏ.",
        },
        {
          kind: "check", title: "Dữ liệu tốt để dạy máy cần thế nào? Đánh dấu ✓.",
          items: ["Rõ ràng", "Ghi tên đúng", "Thật nhiều nhưng không cần đúng", "Có nhiều kiểu khác nhau", "Chỉ cần một ảnh"],
          answer: "Cần: rõ ràng, ghi tên đúng, có nhiều kiểu khác nhau.",
        },
      ],
      think: "Nếu dạy máy bằng nhiều thẻ ghi nhầm, máy sẽ làm việc thế nào?",
      teacher: {
        goals: [
          "Nêu được dữ liệu dạy AI có thể bị thiếu, nhầm lẫn hoặc không đúng sự thật; nêu được yêu cầu cơ bản của dữ liệu huấn luyện.",
          "Trình bày được nếu dữ liệu sai hoặc không tốt thì AI sẽ không hiệu quả, thậm chí hoạt động sai.",
        ],
        prepare: "Một bộ thẻ tranh con vật, trong đó vài thẻ cố ý ghi sai tên.",
        steps: [
          "Khởi động (5 phút): phát bộ thẻ, các nhóm tìm thẻ ghi sai.",
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): làm theo cặp.",
          "Chia sẻ (10 phút): chốt: dữ liệu sai thì máy học sai; con người phải kiểm tra dữ liệu trước khi dạy máy.",
        ],
        extend: "Mở rộng (3.D2.MR1): thực hành kiểm tra bộ thẻ dữ liệu mẫu và loại bỏ thẻ gán nhãn nhầm, thẻ không đúng sự thật.",
      },
    },
  ],
};
