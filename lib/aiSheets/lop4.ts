// lib/aiSheets/lop4.ts — 12 phiếu hoạt động AI lớp 4.
// Tên chủ đề + mã yêu cầu cần đạt theo Quyết định 2422/QĐ-BGDĐT (phần Lớp 4).
// Không nêu tên thương hiệu ứng dụng; mô tả bằng chức năng.

import type { AiGrade } from "./index";

const A = "A. Tư duy lấy con người làm trung tâm";
const B = "B. Đạo đức AI";
const C = "C. Các kĩ thuật và ứng dụng AI";
const D = "D. Thiết kế hệ thống AI";

export const LOP4: AiGrade = {
  grade: 4,
  coreCodes: ["4.A1.1", "4.A1.2", "4.A2.1", "4.A2.2", "4.A3.1", "4.B2.1", "4.B2.2", "4.C2.1", "4.D1.1", "4.D2.1"],
  sheets: [
    /* ───────────── Tiết 1 ───────────── */
    {
      no: 1, title: "AI trong công việc hằng ngày", codes: ["4.A1.1"], strand: A,
      activities: [
        {
          kind: "match", title: "Nối mỗi việc AI làm với lĩnh vực phù hợp.",
          left: [
            "Máy bay không người lái chụp ruộng, tìm chỗ lúa bị sâu",
            "Máy xem ảnh chụp X-quang, đánh dấu chỗ bác sĩ cần xem kĩ",
            "Đèn giao thông tự đổi thời gian đèn xanh theo lượng xe",
            "Ứng dụng bản đồ chỉ đường tránh chỗ kẹt xe",
            "Hệ thống tưới dựa vào dự báo thời tiết để tưới vừa đủ",
            "Rô-bốt ở bệnh viện chỉ đường cho người đến khám",
          ],
          right: ["Nông nghiệp", "Y tế", "Giao thông"],
          answer: "1–A, 2–B, 3–C, 4–C, 5–A, 6–B.",
        },
        {
          kind: "table", title: "Người lớn trong nhà em hoặc ở nơi em sống làm nghề gì? AI có thể giúp nghề đó việc gì?",
          headers: ["Nghề", "AI có thể giúp…"], widths: [35, 65],
          rows: [[null, null], [null, null]],
          answer: "Tuỳ học sinh. Ví dụ: ngư dân – dự báo thời tiết, chọn ngày ra khơi; người bán hàng – gợi ý hàng cần nhập thêm; giáo viên – chấm bài trắc nghiệm.",
        },
      ],
      think: "Nếu AI giúp bác nông dân tìm ra chỗ lúa bị sâu, bác nông dân vẫn cần tự làm những việc gì?",
      teacher: {
        goals: ["Kể được một số lĩnh vực AI hỗ trợ con người như nông nghiệp, y tế, giao thông."],
        steps: [
          "Khởi động (5 phút): hỏi \"Em đã thấy máy nào thông minh khi đi đường, đi khám bệnh?\"; ghi các ý lên bảng.",
          "Hoạt động 1 (10 phút): học sinh làm cá nhân, sau đó đổi phiếu cho bạn kiểm tra.",
          "Hoạt động 2 (10 phút): thảo luận nhóm đôi về nghề của người thân, mỗi nhóm kể một ví dụ.",
          "Chia sẻ (10 phút): trả lời câu \"Em nghĩ gì?\"; chốt ý AI làm một phần việc, con người vẫn làm và quyết định phần chính.",
        ],
      },
    },

    /* ───────────── Tiết 2 ───────────── */
    {
      no: 2, title: "AI hỗ trợ, con người suy nghĩ", codes: ["4.A1.2", "4.A1.MR1"], strand: A,
      activities: [
        {
          kind: "tick", title: "Đọc câu chuyện, rồi đánh dấu ✓ vào bạn đúng với từng câu.",
          intro: "Cô giao bài: viết 3 câu tả con mèo nhà em. Bạn An nhờ AI viết rồi chép nguyên đoạn đó. Bạn Bình nhờ AI gợi ý vài từ hay để tả bộ lông, rồi tự viết về con mèo nhà mình.",
          columns: ["An", "Bình"],
          rows: [
            "Bài viết đúng là con mèo nhà mình",
            "Bạn hiểu và nhớ được từ mới",
            "Cô giáo biết bạn viết giỏi tới đâu",
            "Lần sau bạn tự viết được tốt hơn",
          ],
          answer: "Cả 4 câu đều đúng với Bình, không đúng với An.",
        },
        {
          kind: "sort", title: "Viết chữ cái của mỗi việc vào cột phù hợp.",
          items: [
            "Gợi ý cách trình bày bài cho đẹp",
            "Hiểu bài để làm bài kiểm tra trên lớp",
            "Tra nghĩa một từ khó",
            "An ủi bạn khi bạn buồn",
            "Dịch thử một câu tiếng Anh",
            "Quyết định xin lỗi khi mình làm sai",
          ],
          columns: ["AI có thể hỗ trợ", "Em cần tự làm"],
          answer: "AI có thể hỗ trợ: A, C, E. Em cần tự làm: B, D, F.",
        },
      ],
      think: "Vì sao không nên chép nguyên câu trả lời của AI vào bài làm của mình?",
      teacher: {
        goals: [
          "Nhận biết AI giúp học tập, làm việc hiệu quả hơn nhưng không thay được suy nghĩ, cảm xúc và sự sáng tạo của con người.",
          "Mở rộng: giải thích vì sao người học cần tự suy nghĩ, kiểm tra và hiểu bài thay vì chép câu trả lời của AI.",
        ],
        steps: [
          "Khởi động (5 phút): hỏi \"Có cái máy làm bài hộ, em có muốn dùng không? Vì sao?\"",
          "Hoạt động 1 (12 phút): đọc to câu chuyện, học sinh đánh dấu; mời vài em giải thích lựa chọn.",
          "Hoạt động 2 (10 phút): làm cá nhân, chữa chung trên bảng.",
          "Chia sẻ (8 phút): \"Em nghĩ gì?\"; chốt: AI là người gợi ý, em là người suy nghĩ.",
        ],
      },
    },

    /* ───────────── Tiết 3 ───────────── */
    {
      no: 3, title: "AI vì cuộc sống tốt đẹp hơn", codes: ["4.A2.1"], strand: A,
      activities: [
        {
          kind: "sort", title: "AI giúp gì trong mỗi tình huống? Viết chữ cái vào cột em thấy hợp nhất.",
          items: [
            "Máy hút bụi tự dọn nhà khi cả nhà đi vắng",
            "Hệ thống báo cháy phát hiện khói trong bếp",
            "AI giúp các nhà khoa học dự báo bão sớm hơn",
            "Ứng dụng dịch giúp hỏi đường ở nước ngoài",
            "Camera nhắc tài xế khi có dấu hiệu buồn ngủ",
            "Máy tự chấm bài trắc nghiệm cho cô giáo",
          ],
          columns: ["Tiết kiệm thời gian", "Giải quyết việc khó", "Sống an toàn hơn"],
          answer: "Gợi ý: Tiết kiệm thời gian: A, F. Giải quyết việc khó: C, D. Sống an toàn hơn: B, E. Chấp nhận cách xếp khác nếu học sinh giải thích hợp lí (VD dự báo bão cũng giúp an toàn hơn).",
        },
        {
          kind: "write", title: "Kể một việc trong gia đình em mà AI có thể giúp. AI giúp như thế nào?", lines: 3,
          answer: "Tuỳ học sinh. Ví dụ: nhắc ông bà uống thuốc đúng giờ, bật đèn khi trời tối, đọc truyện cho em nhỏ.",
        },
      ],
      think: "AI có làm mọi việc tốt hơn con người không? Vì sao?",
      teacher: {
        goals: ["Hiểu AI được làm ra để hỗ trợ con người: giải quyết vấn đề, tiết kiệm thời gian, nâng cao chất lượng cuộc sống."],
        steps: [
          "Khởi động (5 phút): trò chơi \"Nếu có một rô-bốt giúp việc, em nhờ nó làm gì?\"",
          "Hoạt động 1 (12 phút): làm theo nhóm 4; mỗi nhóm giải thích một cách xếp khác nhau.",
          "Hoạt động 2 (10 phút): làm cá nhân, mời 3–4 em đọc.",
          "Chia sẻ (8 phút): \"Em nghĩ gì?\"; chốt: AI giỏi việc lặp lại và tính toán, con người giỏi thấu hiểu và quyết định.",
        ],
      },
    },

    /* ───────────── Tiết 4 ───────────── */
    {
      no: 4, title: "AI trong xã hội", codes: ["4.A2.2"], strand: A,
      activities: [
        {
          kind: "match", title: "Nối mỗi nhóm người với cách AI có thể hỗ trợ họ.",
          left: [
            "Người khiếm thị (không nhìn thấy)",
            "Người khiếm thính (không nghe được)",
            "Ông bà sống một mình",
            "Công nhân làm việc nặng, nguy hiểm",
            "Bạn nhỏ chưa nói thạo tiếng Việt",
            "Bác nông dân",
          ],
          right: [
            "Đồng hồ báo cho con cháu khi ông bà bị ngã",
            "Ứng dụng đọc to chữ trên giấy, biển hiệu",
            "Ứng dụng luyện nghe, nói tiếng Việt",
            "Phụ đề tự động đổi lời nói thành chữ",
            "Dự báo thời tiết, sâu bệnh cho mùa vụ",
            "Rô-bốt làm thay việc nặng trong nhà máy",
          ],
          answer: "1–B, 2–D, 3–A, 4–F, 5–C, 6–E.",
        },
        {
          kind: "write", title: "Chọn một nhóm người ở trên. Nếu em là nhà sáng chế, em muốn AI giúp họ thêm việc gì?", lines: 3,
          answer: "Tuỳ học sinh, khen những ý tưởng nghĩ từ nhu cầu thật của người đó.",
        },
      ],
      think: "Vì sao khi làm ra AI, cần nghĩ đến cả những người gặp khó khăn?",
      teacher: {
        goals: ["Nêu được một số nhóm người AI có thể hỗ trợ như người lao động, người có hoàn cảnh khó khăn."],
        steps: [
          "Khởi động (5 phút): bịt mắt một bạn, nhờ bạn đọc một dòng chữ; hỏi cả lớp có cách nào giúp bạn \"đọc\" được.",
          "Hoạt động 1 (12 phút): làm cá nhân, chữa chung.",
          "Hoạt động 2 (10 phút): nhóm đôi trao đổi rồi viết.",
          "Chia sẻ (8 phút): \"Em nghĩ gì?\"; chốt: AI nên giúp mọi người, nhất là người gặp khó khăn.",
        ],
      },
    },

    /* ───────────── Tiết 5 ───────────── */
    {
      no: 5, title: "Con người quyết định khi dùng AI", codes: ["4.A3.1", "4.A3.MR1"], strand: A,
      activities: [
        {
          kind: "tick", title: "Trước khi dùng AI, hãy tự hỏi: Để làm gì? Có cần không? Có an toàn không? Đánh dấu ✓ và ghi lí do.",
          columns: ["Nên", "Không nên"], reason: true,
          rows: [
            "Tra nghĩa từ \"hoàng hôn\" trong bài đọc, có bố mẹ ngồi cạnh",
            "Một ứng dụng hỏi địa chỉ nhà và tên trường để \"tặng quà\"",
            "Nhờ AI làm hộ toàn bộ bài toán về nhà",
            "Cả lớp dùng ứng dụng nhận biết tên cây, có cô hướng dẫn",
            "Dùng ứng dụng ghép mặt để làm ảnh trêu chọc bạn",
          ],
          answer: "a) Nên – để hiểu bài, có người lớn. b) Không nên – lộ thông tin cá nhân. c) Không nên – em không tự học. d) Nên – có mục đích học tập, có thầy cô. e) Không nên – làm tổn thương bạn.",
        },
        {
          kind: "tick", title: "Đúng hay sai? Đánh dấu ✓.",
          columns: ["Đúng", "Sai"],
          rows: [
            "Em có thể từ chối dùng AI nếu thấy không an toàn.",
            "Việc gì AI làm được thì phải để AI làm.",
            "Nên hỏi bố mẹ, thầy cô trước khi dùng ứng dụng AI mới.",
            "Dùng AI càng nhiều thì càng học giỏi.",
          ],
          answer: "a) Đúng. b) Sai. c) Đúng. d) Sai.",
        },
      ],
      think: "Viết một quy tắc dùng AI mà em muốn cả lớp cùng thực hiện.",
      teacher: {
        goals: [
          "Hiểu việc có dùng AI hay không do con người quyết định, dựa trên mục đích, nhu cầu và sự an toàn.",
          "Mở rộng: thực hành quyết định trong tình huống cụ thể; biết có thể từ chối AI gây rủi ro về quyền riêng tư, đạo đức.",
        ],
        steps: [
          "Khởi động (5 phút): viết 3 câu hỏi \"Để làm gì? Có cần không? Có an toàn không?\" lên bảng.",
          "Hoạt động 1 (15 phút): nhóm 4, mỗi nhóm trình bày một tình huống.",
          "Hoạt động 2 (7 phút): làm cá nhân, chữa nhanh.",
          "Chia sẻ (8 phút): gom các quy tắc của học sinh thành \"Quy tắc dùng AI của lớp\" dán lên tường.",
        ],
      },
    },

    /* ───────────── Tiết 6 ───────────── */
    {
      no: 6, title: "Bảo vệ thông tin cá nhân (phần 1)", codes: ["4.B2.1"], strand: B,
      activities: [
        {
          kind: "check", title: "Đánh dấu ✓ vào những thông tin KHÔNG được nói với ứng dụng AI hay người lạ trên mạng.",
          items: [
            "Họ và tên đầy đủ của em", "Món ăn em thích",
            "Địa chỉ nhà em", "Màu em thích",
            "Số điện thoại của bố mẹ", "Tên con vật em thích",
            "Tên trường, tên lớp của em", "Một câu hỏi về bài toán",
            "Mật khẩu", "Ảnh chân dung của em",
          ],
          answer: "Không được nói: họ và tên đầy đủ, địa chỉ nhà, số điện thoại của bố mẹ, tên trường và lớp, mật khẩu, ảnh chân dung. Có thể nói: món ăn, màu, con vật em thích, câu hỏi về bài toán.",
        },
        {
          kind: "write", title: "Viết lại lời nhờ dưới đây cho an toàn (bỏ thông tin cá nhân nhưng vẫn nhờ được việc).",
          intro: "\"Mình tên Nguyễn Minh An, học lớp 4A trường Tiểu học Hoà Bình, nhà ở số 12 đường Lê Lợi. Giúp mình viết thiệp chúc mừng sinh nhật mẹ.\"",
          lines: 2,
          answer: "Ví dụ: \"Giúp mình viết thiệp chúc mừng sinh nhật mẹ.\" Không cần tên, trường, địa chỉ mà vẫn nhờ được.",
        },
      ],
      think: "Vì sao không nên đưa ảnh của em lên một ứng dụng AI khi chưa hỏi bố mẹ?",
      teacher: {
        goals: ["Nhận biết những thông tin cá nhân cần giữ bí mật, không chia sẻ với AI."],
        steps: [
          "Khởi động (5 phút): hỏi \"Nếu người lạ trên mạng hỏi nhà em ở đâu, em làm gì?\"",
          "Hoạt động 1 (12 phút): làm cá nhân, chữa chung; nhấn mạnh tên trường + lớp cũng giúp người lạ tìm ra em.",
          "Hoạt động 2 (10 phút): làm cá nhân, mời vài em đọc câu đã sửa.",
          "Chia sẻ (8 phút): \"Em nghĩ gì?\"; chốt: hỏi được việc mà không cần kể mình là ai.",
        ],
      },
    },

    /* ───────────── Tiết 7 ───────────── */
    {
      no: 7, title: "Bảo vệ thông tin cá nhân (phần 2)", codes: ["4.B2.2", "4.B2.MR1"], strand: B,
      activities: [
        {
          kind: "match", title: "Nếu thông tin bị lộ, điều gì có thể xảy ra? Nối cho phù hợp.",
          left: ["Địa chỉ nhà", "Mật khẩu", "Ảnh khuôn mặt", "Số điện thoại của bố mẹ"],
          right: [
            "Bị người xấu ghép thành ảnh giả",
            "Kẻ gian gọi điện lừa bố mẹ",
            "Người lạ biết chỗ để tìm đến nhà",
            "Người khác vào tài khoản của em",
          ],
          answer: "1–C, 2–D, 3–A, 4–B.",
        },
        {
          kind: "order", title: "Em lỡ gửi mật khẩu cho một ứng dụng lạ. Đánh số 1, 2, 3, 4 theo thứ tự việc em nên làm.",
          steps: [
            "Cùng bố mẹ đổi mật khẩu mới",
            "Dừng lại, không gửi thêm thông tin gì",
            "Nhớ không chia sẻ mật khẩu lần sau",
            "Báo ngay cho bố mẹ hoặc thầy cô",
          ],
          answer: "Dừng lại (1) → Báo bố mẹ, thầy cô (2) → Đổi mật khẩu (3) → Nhớ lần sau (4). Thứ tự trên phiếu: 3, 1, 4, 2.",
        },
        {
          kind: "write", title: "Khi gặp chuyện không an toàn trên mạng, những người lớn em tin cậy để kể là:", lines: 1,
          answer: "Tuỳ học sinh: bố mẹ, ông bà, thầy cô chủ nhiệm…",
        },
      ],
      think: "Vì sao khi gặp chuyện không ổn trên mạng, em không nên giấu mà nên kể ngay cho người lớn?",
      teacher: {
        goals: [
          "Nêu được hậu quả khi thông tin cá nhân bị lộ hoặc bị dùng sai.",
          "Mở rộng: xử lý tình huống giả định thông tin cá nhân bị lộ qua AI theo hướng dẫn.",
        ],
        steps: [
          "Khởi động (5 phút): nhắc lại các thông tin cần giữ kín ở tiết trước.",
          "Hoạt động 1 (8 phút): làm cá nhân, chữa chung.",
          "Hoạt động 2 (12 phút): nhóm đôi đóng vai: một bạn lỡ gửi mật khẩu, một bạn là bố mẹ.",
          "Hoạt động 3 và chia sẻ (10 phút): học sinh ghi tên người lớn tin cậy; chốt: kể ngay, không bị mắng vì đã nói thật.",
        ],
      },
    },

    /* ───────────── Tiết 8 ───────────── */
    {
      no: 8, title: "Một số ứng dụng AI quen thuộc", codes: ["4.C2.1", "4.C2.MR1"], strand: C,
      activities: [
        {
          kind: "match", title: "Nối mỗi loại ứng dụng với việc nó làm.",
          left: [
            "Ứng dụng dịch",
            "Bản đồ chỉ đường",
            "Trợ lí giọng nói",
            "Ứng dụng nhận biết cây, con vật",
            "Ứng dụng gợi ý video",
            "Ứng dụng đọc chữ viết tay",
          ],
          right: [
            "Đoán video em muốn xem tiếp",
            "Đổi chữ viết tay thành chữ đánh máy",
            "Đổi câu tiếng Anh sang tiếng Việt",
            "Tìm đường nhanh, tránh kẹt xe",
            "Nghe em nói rồi trả lời hoặc làm theo",
            "Chụp ảnh rồi cho biết tên cây, con vật",
          ],
          answer: "1–C, 2–D, 3–E, 4–F, 5–A, 6–B.",
        },
        {
          kind: "table", title: "Kể ứng dụng AI em hoặc gia đình em đã dùng.",
          headers: ["Ứng dụng (loại gì)", "Dùng để làm gì", "Có lúc nào nó sai không?"], widths: [30, 35, 35],
          rows: [[null, null, null], [null, null, null]],
          answer: "Tuỳ học sinh. Hướng các em nhận ra ứng dụng nào cũng có lúc sai (dịch sai, chỉ đường vòng, nghe nhầm).",
        },
        {
          kind: "tick", title: "Đúng hay sai? Đánh dấu ✓.",
          columns: ["Đúng", "Sai"],
          rows: [
            "Ứng dụng gợi ý video luôn chọn video tốt nhất cho em.",
            "Ứng dụng dịch có thể dịch sai.",
          ],
          answer: "a) Sai – nó gợi ý video giống video em hay xem, không chắc đã tốt cho em. b) Đúng.",
        },
      ],
      think: "Ứng dụng cứ gợi ý video mới mãi khiến em xem quá lâu. Em sẽ làm gì?",
      teacher: {
        goals: [
          "Nêu được một số ứng dụng AI trong học tập và cuộc sống, nhất là các ứng dụng quen thuộc ở Việt Nam.",
          "Mở rộng: trải nghiệm một số ứng dụng AI (nếu trường có máy, có thầy cô hướng dẫn).",
        ],
        steps: [
          "Khởi động (5 phút): hỏi \"Ở nhà em, ai hay nói chuyện với điện thoại?\"",
          "Hoạt động 1 (10 phút): làm cá nhân, chữa chung.",
          "Hoạt động 2 (10 phút): nhóm đôi kể cho nhau rồi điền bảng.",
          "Hoạt động 3 và chia sẻ (10 phút): bàn về ứng dụng gợi ý video và thời gian dùng màn hình.",
        ],
        extend: "Nếu có máy chiếu: thầy cô làm mẫu một ứng dụng dịch hoặc nhận biết cây, cố tình cho một ví dụ máy làm sai để cả lớp tìm lỗi.",
      },
    },

    /* ───────────── Tiết 9 ───────────── */
    {
      no: 9, title: "Từ vấn đề đến ý tưởng AI (phần 1)", codes: ["4.D1.1"], strand: D,
      activities: [
        {
          kind: "table", title: "Ý tưởng mẫu: máy phân loại rác. Điền vào ô trống, chọn từ trong khung: ảnh rác qua camera · báo rác bỏ vào thùng nào · học sinh trực nhật",
          headers: ["Câu hỏi", "Máy phân loại rác"], widths: [35, 65],
          rows: [
            ["Vấn đề là gì?", "Rác bỏ lẫn lộn nên khó tái chế"],
            ["Máy cần \"nhìn\" thấy gì?", null],
            ["Máy học từ đâu?", "Thật nhiều ảnh chai nhựa, vỏ lon, giấy, vỏ trái cây đã ghi đúng loại"],
            ["Máy làm gì?", null],
            ["Ai kiểm tra lại khi máy sai?", null],
          ],
          answer: "Máy cần nhìn: ảnh rác qua camera. Máy làm: báo rác bỏ vào thùng nào. Ai kiểm tra: học sinh trực nhật.",
        },
        {
          kind: "sort", title: "Em làm \"máy phân loại\": viết chữ cái của mỗi thứ vào đúng thùng.",
          items: ["Chai nhựa", "Vỏ chuối", "Lon nước ngọt", "Lá cây khô", "Giấy báo cũ", "Cơm thừa"],
          columns: ["Thùng tái chế", "Thùng rác hữu cơ"],
          answer: "Tái chế: A, C, E. Hữu cơ: B, D, F.",
        },
      ],
      think: "Nếu máy chỉ được học ảnh chai nhựa màu xanh, máy có nhận ra chai nhựa màu trắng không? Vì sao?",
      teacher: {
        goals: ["Đề xuất được ý tưởng AI ban đầu cho việc học tập, giải quyết vấn đề, ưu tiên vấn đề gần gũi ở Việt Nam."],
        prepare: "Vài món rác sạch (chai, giấy, lá khô) để làm mẫu.",
        steps: [
          "Khởi động (5 phút): đặt vài món rác lên bàn, hỏi \"Bỏ vào thùng nào?\"",
          "Hoạt động 1 (12 phút): cả lớp đi qua từng câu hỏi trong bảng — đây là khung để tiết sau nhóm tự nghĩ ý tưởng.",
          "Hoạt động 2 (8 phút): làm cá nhân, chữa nhanh.",
          "Chia sẻ (10 phút): \"Em nghĩ gì?\"; nối sang ý: máy cần học từ nhiều ví dụ khác nhau.",
        ],
      },
    },

    /* ───────────── Tiết 10 ───────────── */
    {
      no: 10, title: "Từ vấn đề đến ý tưởng AI (phần 2)", codes: ["4.D1.1", "4.D1.MR1"], strand: D,
      activities: [
        {
          kind: "table", title: "Phiếu ý tưởng của nhóm. Gợi ý vấn đề: quên mang đồ dùng học tập; vòi nước trong trường quên khoá; cây trong sân bị héo; bạn mới chưa nói thạo tiếng Việt.",
          headers: ["Câu hỏi", "Ý tưởng của nhóm"], widths: [42, 58],
          rows: [
            ["Vấn đề ở trường, lớp em là gì?", null],
            ["Ai gặp vấn đề này?", null],
            ["Tên máy thông minh của nhóm", null],
            ["Máy cần nhìn, nghe hoặc biết gì?", null],
            ["Máy làm gì để giúp?", null],
            ["Điều cần cẩn thận (an toàn, thông tin cá nhân)", null],
          ],
          answer: "Tuỳ nhóm. Ví dụ (vấn đề gợi ý thứ tư): Máy \"Bạn đồng hành\" nghe bạn mới đọc, sửa cách phát âm tiếng Việt; cần cẩn thận không ghi âm khi chưa được phép.",
        },
        { kind: "write", title: "Vẽ máy thông minh của nhóm em.", lines: 0, draw: true },
      ],
      think: "Ý tưởng của nhóm bạn nào em thích nhất? Vì sao?",
      teacher: {
        goals: [
          "Đề xuất được ý tưởng AI ban đầu để giải quyết một vấn đề gần gũi.",
          "Mở rộng: trình bày cách AI có thể giúp một vấn đề đơn giản, ví dụ hỗ trợ học sinh dân tộc thiểu số học tiếng Việt qua lời nói và chữ viết.",
        ],
        steps: [
          "Khởi động (3 phút): nhắc lại khung câu hỏi của máy phân loại rác ở tiết 9.",
          "Làm nhóm (20 phút): nhóm 4 chọn vấn đề, điền phiếu, vẽ máy.",
          "Trình bày (12 phút): mỗi nhóm 1–2 phút; cả lớp hỏi \"Máy có thể sai ở đâu?\"",
        ],
        extend: "Tiêu chí khen: vấn đề có thật ở trường; nói được máy cần dữ liệu gì; có nghĩ đến an toàn.",
      },
    },

    /* ───────────── Tiết 11 ───────────── */
    {
      no: 11, title: "Liên tục cải tiến AI", codes: ["4.D2.1"], strand: D,
      activities: [
        {
          kind: "table", title: "Nhóm bạn thử \"máy nhận biết trái cây\". Ghi Đ (đúng) hoặc S (sai) vào cột cuối.",
          headers: ["Ảnh đưa vào máy", "Máy đoán", "Đ / S"], widths: [45, 35, 20],
          rows: [
            ["Quả táo đỏ", "Táo", null],
            ["Quả táo xanh", "Ổi", null],
            ["Nải chuối chín vàng", "Chuối", null],
            ["Nải chuối còn xanh", "Dưa chuột", null],
            ["Quả cam", "Cam", null],
            ["Quả quýt nhỏ", "Cam", null],
          ],
          answer: "Đ, S, Đ, S, Đ, S – máy đoán đúng 3/6.",
        },
        {
          kind: "write", title: "Máy hay đoán sai với những quả nào? Em sẽ cho máy học thêm ảnh gì?", lines: 2,
          answer: "Máy hay sai với quả còn xanh và quả nhỏ giống quả khác. Cần thêm nhiều ảnh táo xanh, chuối xanh, quýt.",
        },
        {
          kind: "order", title: "Đánh số 1–5 theo thứ tự các bước làm máy giỏi hơn.",
          steps: ["Cho máy học lại", "Thử máy với ảnh mới", "Thêm ảnh phù hợp", "Thử lại xem máy đã đúng hơn chưa", "Ghi lại những lần máy sai"],
          answer: "Thử máy (1) → Ghi lại lần sai (2) → Thêm ảnh phù hợp (3) → Cho máy học lại (4) → Thử lại (5). Thứ tự trên phiếu: 4, 1, 3, 5, 2.",
        },
      ],
      think: "Vì sao người làm ra AI phải kiểm tra và nâng cấp máy nhiều lần, không làm một lần là xong?",
      teacher: {
        goals: ["Hiểu con người cần liên tục đánh giá, nâng cấp sản phẩm AI để hệ thống cho kết quả tốt hơn."],
        steps: [
          "Khởi động (5 phút): hỏi \"Em tập đi xe đạp có ngã lần nào không? Lần sau em làm khác đi thế nào?\"",
          "Hoạt động 1–2 (15 phút): nhóm đôi chấm kết quả, tìm điểm chung của các lần sai.",
          "Hoạt động 3 (7 phút): làm cá nhân, chữa chung.",
          "Chia sẻ (8 phút): \"Em nghĩ gì?\"; chốt: máy cũng \"học từ lỗi sai\" nhờ con người thêm dữ liệu.",
        ],
        extend: "Nếu trường có máy: dùng công cụ học máy trực quan (VD Teachable Machine) dạy máy phân biệt 2 loại quả, rồi thêm ảnh để sửa lỗi (nội dung mở rộng 4.C5.MR1–MR2).",
      },
    },

    /* ───────────── Tiết 12 ───────────── */
    {
      no: 12, title: "Ôn tập: Em và AI", codes: ["4.A1.1", "4.A1.2", "4.A2.1", "4.A2.2", "4.A3.1", "4.B2.1", "4.B2.2", "4.C2.1", "4.D1.1", "4.D2.1"], strand: "A, B, C, D (ôn tập)",
      activities: [
        {
          kind: "tick", title: "Đúng hay sai? Đánh dấu ✓.",
          columns: ["Đúng", "Sai"],
          rows: [
            "AI có thể giúp bác sĩ nhưng bác sĩ vẫn phải kiểm tra lại.",
            "Chép nguyên câu trả lời của AI giúp em học giỏi hơn.",
            "AI có thể hỗ trợ người khiếm thị đọc chữ.",
            "Có thể nói địa chỉ nhà cho ứng dụng AI nếu nó hỏi lịch sự.",
            "Em có quyền từ chối dùng AI nếu thấy không an toàn.",
            "Ứng dụng AI không bao giờ sai.",
            "Muốn máy đoán đúng hơn, có thể cho máy học thêm dữ liệu.",
            "Lỡ để lộ mật khẩu thì nên giấu, không kể với ai.",
          ],
          answer: "Đúng: a, c, e, g. Sai: b, d, f, h.",
        },
        {
          kind: "table", title: "Viết một điều em nhớ nhất ở mỗi phần.",
          headers: ["Phần", "Điều em nhớ nhất"], widths: [32, 68],
          rows: [
            ["Con người và AI", null],
            ["Dùng AI an toàn", null],
            ["AI quanh em", null],
            ["Em nghĩ ra ý tưởng AI", null],
          ],
          answer: "Tuỳ học sinh.",
        },
      ],
      think: "Sau 12 tiết, em muốn tìm hiểu thêm điều gì về AI?",
      teacher: {
        goals: ["Ôn lại các yêu cầu cần đạt cốt lõi của lớp 4 theo 4 mạch nội dung."],
        steps: [
          "Hoạt động 1 (10 phút): làm cá nhân; chữa chung, với mỗi câu hỏi \"Em học điều này ở tiết nào?\"",
          "Hoạt động 2 (12 phút): làm cá nhân, sau đó chia sẻ trong nhóm.",
          "Chia sẻ (13 phút): \"Em nghĩ gì?\"; thầy cô ghi các câu hỏi của học sinh để dùng cho năm học sau.",
        ],
        extend: "Đánh giá theo quá trình (Công văn 5588): dựa vào phiếu cả năm và cách học sinh giải thích, không chấm điểm số.",
      },
    },
  ],
};
