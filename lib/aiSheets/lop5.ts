// lib/aiSheets/lop5.ts — 12 phiếu hoạt động AI lớp 5.
// Tên chủ đề + mã yêu cầu cần đạt theo Quyết định 2422/QĐ-BGDĐT (phần Lớp 5).
// Riêng 5.C5.2 (thao tác với công cụ học máy trực quan) là yêu cầu CỐT LÕI cần máy:
// tiết 10 là phiếu theo dõi dùng kèm phần thầy cô làm mẫu trên máy.
// Không nêu tên thương hiệu ứng dụng; mô tả bằng chức năng.

import type { AiGrade } from "./index";

const A = "A. Tư duy lấy con người làm trung tâm";
const B = "B. Đạo đức AI";
const C = "C. Các kĩ thuật và ứng dụng AI";
const D = "D. Thiết kế hệ thống AI";

export const LOP5: AiGrade = {
  grade: 5,
  coreCodes: [
    "5.A1.1", "5.A1.2", "5.A2.1", "5.A2.2", "5.A2.3", "5.A3.1", "5.A3.2",
    "5.B1.1", "5.B1.2", "5.B2.1", "5.B3.1", "5.C5.1", "5.C5.2", "5.D1.1", "5.D2.1",
  ],
  sheets: [
    /* ───────────── Tiết 1 ───────────── */
    {
      no: 1, title: "Con người chịu trách nhiệm", codes: ["5.A1.1", "5.A1.2", "5.A1.MR1"], strand: A,
      activities: [
        {
          kind: "sort", title: "Viết chữ cái của mỗi việc vào cột phù hợp.",
          items: [
            "Lắp ráp hàng nghìn linh kiện giống nhau trong nhà máy",
            "Soi tìm vết nứt rất nhỏ trên sản phẩm",
            "Chở hàng trong kho suốt đêm",
            "Quyết định có phẫu thuật cho bệnh nhân hay không",
            "Vào thăm dò nơi có khí độc sau sự cố",
            "Quyết định cách nhắc nhở khi một bạn vi phạm nội quy",
          ],
          columns: ["Có thể giao cho máy (lặp lại, nguy hiểm, cần rất chính xác)", "Con người phải quyết định"],
          answer: "Giao cho máy: A, B, C, E. Con người quyết định: D, F.",
        },
        {
          kind: "tick", title: "Đúng hay sai? Đánh dấu ✓.",
          columns: ["Đúng", "Sai"],
          rows: [
            "Máy gợi ý chẩn đoán sai, bác sĩ không xem lại mà làm theo – lỗi chỉ là của máy.",
            "Người làm ra AI phải thử thật kĩ trước khi cho mọi người dùng.",
            "Xe tự lái chở hàng gây va chạm thì không ai phải chịu trách nhiệm.",
            "Em nhờ AI viết bài rồi nộp; nếu bài có chỗ sai, em vẫn phải chịu trách nhiệm.",
          ],
          answer: "a) Sai – bác sĩ phải kiểm tra lại. b) Đúng. c) Sai – người làm ra, người vận hành xe vẫn chịu trách nhiệm. d) Đúng.",
        },
      ],
      think: "Vì sao người ta nói: \"AI làm việc, nhưng con người chịu trách nhiệm\"?",
      teacher: {
        goals: [
          "Nêu được AI có thể làm thay những việc lặp lại, nguy hiểm hoặc cần độ chính xác cao.",
          "Nêu được ví dụ về trách nhiệm của người làm ra và người dùng AI (VD bác sĩ xem lại chẩn đoán của máy).",
          "Mở rộng: con người chịu trách nhiệm cuối cùng về mọi quyết định, kết quả do AI tạo ra.",
        ],
        steps: [
          "Khởi động (5 phút): chiếu ảnh rô-bốt trong nhà máy, hỏi \"Vì sao giao việc này cho rô-bốt?\"",
          "Hoạt động 1 (10 phút): làm cá nhân, chữa chung; hỏi vì sao D, F không giao cho máy.",
          "Hoạt động 2 (12 phút): nhóm 4 tranh luận từng câu, mỗi nhóm trình bày một câu.",
          "Chia sẻ (8 phút): \"Em nghĩ gì?\"; chốt: máy không chịu trách nhiệm được, con người phải kiểm tra và chịu trách nhiệm.",
        ],
      },
    },

    /* ───────────── Tiết 2 ───────────── */
    {
      no: 2, title: "AI không thay thế con người", codes: ["5.A2.1", "5.A2.MR1"], strand: A,
      activities: [
        {
          kind: "sort", title: "Viết chữ cái của mỗi việc vào cột phù hợp.",
          items: [
            "Tính nhanh hàng nghìn phép tính",
            "Viết bài thơ tặng mẹ từ chính cảm xúc của em",
            "Thấu hiểu và an ủi một bạn đang buồn",
            "Tìm một bức ảnh trong hàng nghìn bức ảnh",
            "Quyết định điều gì đúng, điều gì sai",
            "Nhắc lịch họp đúng giờ",
          ],
          columns: ["AI làm tốt", "Chỉ con người làm được"],
          answer: "AI làm tốt: A, D, F. Chỉ con người làm được: B, C, E.",
        },
        {
          kind: "tick", title: "Đúng hay sai? Đánh dấu ✓.",
          columns: ["Đúng", "Sai"],
          rows: [
            "Khi đã có AI thì con người không cần học nữa.",
            "AI giúp con người có thêm thời gian cho việc sáng tạo.",
            "Con người phải điều khiển và định hướng AI.",
            "AI có thể yêu thương và quan tâm em như người thân.",
          ],
          answer: "a) Sai. b) Đúng. c) Đúng. d) Sai – AI có thể nói lời quan tâm nhưng không có cảm xúc thật.",
        },
        {
          kind: "write", title: "Kể một việc ở lớp em mà dù có AI, thầy cô và các bạn vẫn cần tự làm. Vì sao?", lines: 2,
          answer: "Tuỳ học sinh. VD: góp ý, động viên nhau; quyết định chọn bạn làm lớp trưởng; tự làm bài kiểm tra.",
        },
      ],
      think: "Nếu một ngày rô-bốt có thể giảng bài, em vẫn muốn có thầy cô không? Vì sao?",
      teacher: {
        goals: [
          "Hiểu AI được làm ra để hỗ trợ con người, không thay thế vai trò, suy nghĩ, cảm xúc và trách nhiệm của con người.",
          "Mở rộng: chỉ con người mới sáng tạo, thấu hiểu cảm xúc và đưa ra quyết định đạo đức, nên con người phải điều khiển, định hướng AI.",
        ],
        steps: [
          "Khởi động (5 phút): hỏi \"Máy tính bỏ túi tính nhanh hơn em. Vậy em có cần học toán không?\"",
          "Hoạt động 1 (10 phút): làm cá nhân, chữa chung.",
          "Hoạt động 2 (8 phút): làm cá nhân; thảo luận kĩ câu d.",
          "Hoạt động 3 và chia sẻ (12 phút): mời 4–5 em đọc; trả lời \"Em nghĩ gì?\".",
        ],
      },
    },

    /* ───────────── Tiết 3 ───────────── */
    {
      no: 3, title: "AI phục vụ lợi ích chung", codes: ["5.A2.2", "5.A2.3"], strand: A,
      activities: [
        {
          kind: "match", title: "Nối mỗi vấn đề của cộng đồng với cách AI có thể giúp.",
          left: [
            "Rừng dễ cháy vào mùa khô",
            "Vùng xa thiếu bác sĩ chuyên khoa",
            "Rác thải nhựa bỏ lẫn lộn",
            "Mưa lớn dễ gây lũ quét",
            "Học sinh vùng cao chưa đọc thạo tiếng Việt",
          ],
          right: [
            "Máy phân loại rác để tái chế",
            "Ứng dụng luyện đọc, luyện nói tiếng Việt",
            "Camera phát hiện khói sớm, báo cho kiểm lâm",
            "Dự báo mưa lũ sớm để người dân sơ tán",
            "Khám từ xa, AI hỗ trợ đọc ảnh chụp X-quang",
          ],
          answer: "1–C, 2–E, 3–A, 4–D, 5–B.",
        },
        {
          kind: "table", title: "Ghi một lợi ích AI mang lại cho cộng đồng ở mỗi lĩnh vực. Ví dụ: Giao thông – đèn tín hiệu thông minh giúp bớt kẹt xe.",
          headers: ["Lĩnh vực", "Lợi ích AI mang lại cho mọi người"], widths: [30, 70],
          rows: [["Y tế", null], ["Giáo dục", null], ["Môi trường", null]],
          answer: "Gợi ý: Y tế – phát hiện bệnh sớm qua ảnh chụp; Giáo dục – bài tập phù hợp sức học từng bạn; Môi trường – theo dõi chất lượng không khí, cảnh báo ô nhiễm.",
        },
      ],
      think: "Ở nơi em sống có vấn đề chung nào (giao thông, rác, nước…) mà AI có thể giúp giải quyết?",
      teacher: {
        goals: [
          "Hiểu AI được tạo ra để phục vụ lợi ích chung của xã hội: nâng cao chất lượng cuộc sống, giải quyết vấn đề phức tạp.",
          "Nêu được ví dụ về lợi ích của AI cho cộng đồng trong y tế, giáo dục, môi trường.",
        ],
        steps: [
          "Khởi động (5 phút): hỏi \"Vấn đề nào ở địa phương làm nhiều người khổ nhất?\"",
          "Hoạt động 1 (10 phút): làm cá nhân, chữa chung.",
          "Hoạt động 2 (12 phút): nhóm 3, mỗi bạn phụ trách một lĩnh vực rồi góp lại.",
          "Chia sẻ (8 phút): \"Em nghĩ gì?\"; ghi các vấn đề lên bảng để dùng lại ở tiết 9.",
        ],
      },
    },

    /* ───────────── Tiết 4 ───────────── */
    {
      no: 4, title: "Con người trong kỉ nguyên AI", codes: ["5.A3.1", "5.A3.2", "5.A3.MR1"], strand: A,
      activities: [
        {
          kind: "table", title: "Mỗi người nên dùng AI thế nào cho an toàn, vừa sức?",
          headers: ["Người dùng", "Nên dùng AI để…", "Cần cẩn thận điều gì?"], widths: [22, 39, 39],
          rows: [["Em (học sinh lớp 5)", null, null], ["Em nhỏ 5 tuổi", null, null], ["Bố mẹ", null, null], ["Ông bà", null, null]],
          answer: "Gợi ý: Em – tra cứu, luyện tập; không chép bài, không tin ngay. Em nhỏ – nghe truyện, học hát có người lớn bên cạnh; không tự dùng một mình. Bố mẹ – công việc, tra đường; cẩn thận tin giả, lộ thông tin. Ông bà – nhắc uống thuốc, gọi video; cẩn thận cuộc gọi, tin nhắn lừa đảo.",
        },
        {
          kind: "tick", title: "Thói quen nào tốt, thói quen nào chưa tốt? Đánh dấu ✓.",
          columns: ["Tốt", "Chưa tốt"],
          rows: [
            "Hỏi AI mọi chuyện, không tự nghĩ trước",
            "Tự đặt giờ giới hạn dùng thiết bị mỗi ngày",
            "Tin ngay mọi điều AI nói",
            "Kiểm tra lại câu trả lời bằng sách hoặc hỏi thầy cô",
            "Gửi ảnh của bạn cho ứng dụng AI mà không hỏi bạn",
            "Chỉ dùng AI khi thật sự cần",
          ],
          answer: "Tốt: b, d, f. Chưa tốt: a, c, e.",
        },
      ],
      think: "Mười năm nữa, em mong AI giúp gì cho ông bà, cha mẹ và cho chính em?",
      teacher: {
        goals: [
          "Hiểu mọi người, kể cả trẻ em và người cao tuổi, cần hiểu và dùng AI an toàn, hiệu quả.",
          "Biết dùng AI phù hợp với nhu cầu, khả năng; tránh lạm dụng và thói quen không an toàn.",
          "Mở rộng: mô tả tình huống trong tương lai AI hỗ trợ trẻ em, người lớn, người cao tuổi.",
        ],
        steps: [
          "Khởi động (5 phút): hỏi \"Trong nhà em, ai dùng điện thoại nhiều nhất? Dùng để làm gì?\"",
          "Hoạt động 1 (13 phút): nhóm 4, mỗi nhóm lo một người dùng rồi chia sẻ.",
          "Hoạt động 2 (7 phút): làm cá nhân, chữa nhanh.",
          "Chia sẻ (10 phút): \"Em nghĩ gì?\" (nội dung mở rộng 5.A3.MR1).",
        ],
      },
    },

    /* ───────────── Tiết 5 ───────────── */
    {
      no: 5, title: "Hệ thống AI công bằng", codes: ["5.B1.1", "5.B1.2"], strand: B,
      activities: [
        {
          kind: "tick", title: "Tình huống nào công bằng, tình huống nào không công bằng? Đánh dấu ✓.",
          columns: ["Công bằng", "Không công bằng"],
          rows: [
            "Thư viện cho mọi bạn mượn sách như nhau",
            "Ứng dụng chọn đội bóng chỉ chọn bạn nam, dù có bạn nữ chơi giỏi",
            "Máy nghe giọng nói chỉ hiểu giọng một vùng, không hiểu giọng vùng khác",
            "Ứng dụng học tập chỉ dùng được trên điện thoại đắt tiền",
            "Máy nhận diện khuôn mặt nhận đúng mọi bạn, dù màu da, kiểu tóc khác nhau",
          ],
          answer: "Công bằng: a, e. Không công bằng: b, c, d.",
        },
        {
          kind: "write", title: "Chọn một tình huống không công bằng ở trên. Theo em, vì sao máy lại như vậy?", lines: 3,
          answer: "Gợi ý: máy được dạy bằng dữ liệu thiếu (ít giọng các vùng, ít ảnh bạn nữ chơi bóng) hoặc người làm ra máy không nghĩ đến mọi người.",
        },
      ],
      think: "Vì sao AI cần đối xử bình đẳng với mọi người, dù là nam hay nữ, ở vùng nào, giàu hay nghèo?",
      teacher: {
        goals: [
          "Nhận biết tình huống công bằng và không công bằng trong cuộc sống và trong tình huống có AI.",
          "Giải thích được AI cần phục vụ mọi người bình đẳng, không phân biệt giới tính, vùng miền, điều kiện kinh tế, hoàn cảnh.",
        ],
        steps: [
          "Khởi động (5 phút): chia kẹo cố tình không đều cho 2 nhóm, hỏi cảm giác của nhóm được ít.",
          "Hoạt động 1 (12 phút): làm cá nhân, chữa chung; hỏi \"Ai bị thiệt trong tình huống này?\"",
          "Hoạt động 2 (10 phút): nhóm đôi thảo luận rồi viết.",
          "Chia sẻ (8 phút): \"Em nghĩ gì?\"; nối sang tiết 6: làm sao để AI công bằng hơn.",
        ],
      },
    },

    /* ───────────── Tiết 6 ───────────── */
    {
      no: 6, title: "Giúp AI công bằng", codes: ["5.B2.1", "5.B2.MR1"], strand: B,
      activities: [
        {
          kind: "check", title: "Đánh dấu ✓ vào những cách giúp máy nhận biết mèo công bằng, chính xác hơn.",
          intro: "Một nhóm dạy máy nhận biết \"con mèo\" bằng 100 ảnh: 95 ảnh mèo lông vàng, 5 ảnh mèo đen, không có ảnh mèo trắng. Máy hay nhận nhầm mèo trắng thành con khác.",
          items: [
            "Thêm ảnh mèo trắng, mèo đen, mèo tam thể",
            "Bỏ bớt ảnh mèo đen cho gọn",
            "Thêm ảnh mèo chụp ở nhiều nơi, nhiều góc",
            "Chỉ dùng ảnh con mèo nhà mình",
            "Thử máy với ảnh mèo đủ màu rồi xem kết quả",
            "Nhờ nhiều bạn ở các nơi gửi ảnh mèo",
          ],
          answer: "Nên làm: thêm mèo đủ màu; ảnh nhiều nơi, nhiều góc; thử với ảnh đủ màu; nhờ nhiều bạn gửi ảnh. Không nên: bỏ ảnh mèo đen; chỉ dùng ảnh mèo nhà mình.",
        },
        {
          kind: "write", title: "Nhóm em cần ảnh \"học sinh giơ tay phát biểu\" để dạy máy. Đặt 3 quy tắc khi thu thập ảnh để bộ ảnh đa dạng, đúng mực.", lines: 3,
          answer: "Gợi ý: có cả bạn nam và bạn nữ, nhiều lớp khác nhau; chụp ở nơi sáng và nơi tối, nhiều góc; xin phép bạn và thầy cô trước khi chụp, không chụp mặt bạn khi bạn không đồng ý.",
        },
      ],
      think: "Vì sao vẫn cần kiểm tra kết quả của AI, kể cả khi máy đã học rất nhiều ảnh?",
      teacher: {
        goals: [
          "Nêu được một số cách giúp AI công bằng hơn: dùng dữ liệu đa dạng, tránh định kiến, kiểm tra kết quả của AI.",
          "Mở rộng: đề xuất quy tắc thu thập dữ liệu để bộ dữ liệu đa dạng.",
        ],
        steps: [
          "Khởi động (5 phút): hỏi \"Nếu em chỉ từng thấy mèo vàng, gặp mèo trắng em có nhận ra không?\"",
          "Hoạt động 1 (12 phút): đọc to tình huống, làm cá nhân, chữa chung.",
          "Hoạt động 2 (10 phút): nhóm 4 đặt quy tắc, chọn quy tắc hay nhất của cả lớp.",
          "Chia sẻ (8 phút): \"Em nghĩ gì?\"; chốt: dữ liệu đa dạng + kiểm tra kết quả.",
        ],
      },
    },

    /* ───────────── Tiết 7 ───────────── */
    {
      no: 7, title: "Cần hiểu cách AI suy nghĩ", codes: ["5.B3.1"], strand: B,
      activities: [
        {
          kind: "tick", title: "Đọc tình huống, rồi đánh dấu ✓ vào máy đúng với từng câu.",
          intro: "Em hỏi máy: \"Em có được vào thư viện đọc sách bây giờ không?\". Máy A trả lời: \"Không.\" Máy B trả lời: \"Không, vì thư viện đóng cửa lúc 16 giờ 30, bây giờ là 17 giờ.\"",
          columns: ["Máy A", "Máy B"],
          rows: [
            "Em biết vì sao mình không được vào",
            "Em biết lần sau nên đến lúc nào",
            "Nếu máy nhầm giờ, em phát hiện được",
            "Em tin câu trả lời của máy hơn",
          ],
          answer: "Cả 4 câu đều đúng với Máy B.",
        },
        {
          kind: "tick", title: "Đúng hay sai? Đánh dấu ✓.",
          columns: ["Đúng", "Sai"],
          rows: [
            "AI chỉ cần trả lời đúng, không cần cho biết vì sao.",
            "Khi biết AI dựa vào đâu để quyết định, con người dễ phát hiện chỗ sai.",
            "Bác sĩ cần biết vì sao máy gợi ý một bệnh trước khi chữa.",
          ],
          answer: "a) Sai. b) Đúng. c) Đúng.",
        },
      ],
      think: "Một ứng dụng chấm bài cho em 6 điểm mà không cho biết sai ở đâu. Em sẽ làm gì?",
      teacher: {
        goals: ["Giải thích được vì sao con người cần hiểu cách AI đưa ra quyết định: để minh bạch và đáng tin cậy."],
        steps: [
          "Khởi động (5 phút): hỏi \"Cô chấm bài em 6 điểm mà không ghi lời phê, em thấy thế nào?\"",
          "Hoạt động 1 (12 phút): hai bạn đóng vai Máy A, Máy B; cả lớp làm phiếu.",
          "Hoạt động 2 (8 phút): làm cá nhân, chữa chung.",
          "Chia sẻ (10 phút): \"Em nghĩ gì?\"; chốt: AI tốt là AI giải thích được, con người kiểm tra được.",
        ],
      },
    },

    /* ───────────── Tiết 8 ───────────── */
    {
      no: 8, title: "Thuật toán AI dựa trên luật", codes: ["5.C5.1", "5.C5.MR1"], strand: C,
      activities: [
        {
          kind: "table", title: "Em là máy tưới cây. Làm đúng theo luật để điền cột cuối.",
          intro: "Luật 1: Nếu đất khô và trời không mưa thì bật vòi tưới. Luật 2: Nếu đất ướt thì tắt vòi. Luật 3: Nếu trời mưa thì tắt vòi.",
          headers: ["Đất", "Trời", "Máy làm gì?"], widths: [30, 30, 40],
          rows: [["Khô", "Nắng", null], ["Khô", "Mưa", null], ["Ướt", "Nắng", null], ["Ướt", "Mưa", null]],
          answer: "Bật vòi; Tắt vòi (luật 3); Tắt vòi (luật 2); Tắt vòi.",
        },
        {
          kind: "write", title: "Viết 2 luật \"Nếu … thì …\" cho đèn hành lang tự động (dựa vào trời tối hay sáng, có người đi qua hay không).", lines: 2,
          answer: "VD: Nếu trời tối và có người đi qua thì bật đèn. Nếu trời sáng hoặc không có ai thì tắt đèn.",
        },
        {
          kind: "tick", title: "Đúng hay sai? Đánh dấu ✓.",
          columns: ["Đúng", "Sai"],
          rows: [
            "Máy dùng luật \"nếu … thì …\" làm đúng những gì con người đã viết.",
            "Gặp trường hợp chưa có luật, máy tự biết cách làm.",
          ],
          answer: "a) Đúng. b) Sai – con người phải viết thêm luật.",
        },
      ],
      think: "Có trường hợp nào luật của máy tưới cây chưa tính đến không? Em sẽ thêm luật gì?",
      teacher: {
        goals: [
          "Mô tả được việc dùng cấu trúc \"nếu … thì …\" trong lập trình AI đơn giản.",
          "Mở rộng: thực hành viết cấu trúc \"nếu … thì …\" (có thể nối với Scratch trong môn Tin học).",
        ],
        steps: [
          "Khởi động (5 phút): trò chơi \"Nếu cô giơ tay trái thì cả lớp đứng lên, nếu cô giơ tay phải thì ngồi xuống\".",
          "Hoạt động 1 (10 phút): làm cá nhân, chữa chung; chỉ rõ luật nào được dùng ở mỗi dòng.",
          "Hoạt động 2–3 (12 phút): nhóm đôi viết luật, đổi phiếu để \"chạy thử\" luật của nhau.",
          "Chia sẻ (8 phút): \"Em nghĩ gì?\" (VD: đất khô nhưng trời sắp mưa; cây đã được tưới buổi sáng).",
        ],
      },
    },

    /* ───────────── Tiết 9 ───────────── */
    {
      no: 9, title: "Quy trình huấn luyện AI", codes: ["5.D1.1", "5.D1.MR1"], strand: D,
      activities: [
        {
          kind: "order", title: "Dạy máy phân biệt lá cây khỏe và lá bị bệnh. Đánh số 1–4 theo đúng thứ tự các bước.",
          steps: [
            "Thu thập dữ liệu: chụp nhiều ảnh lá khỏe, lá bệnh và ghi đúng nhãn",
            "Kiểm tra, đánh giá: thử máy với ảnh lá mới, đếm số lần đúng",
            "Xác định vấn đề: cần phân biệt lá khỏe và lá bị bệnh",
            "Huấn luyện: cho máy học từ bộ ảnh đã ghi nhãn",
          ],
          answer: "Xác định vấn đề (1) → Thu thập dữ liệu (2) → Huấn luyện (3) → Kiểm tra, đánh giá (4). Thứ tự trên phiếu: 2, 4, 1, 3.",
        },
        {
          kind: "table", title: "Lên kế hoạch thu thập dữ liệu cho máy nhận biết \"quả chín\" và \"quả xanh\".",
          headers: ["Câu hỏi", "Kế hoạch của nhóm"], widths: [38, 62],
          rows: [
            ["Cần ảnh những gì?", null],
            ["Mỗi loại bao nhiêu ảnh?", null],
            ["Chụp ở đâu, lúc nào?", null],
            ["Ai ghi nhãn, ai kiểm tra lại nhãn?", null],
          ],
          answer: "Gợi ý: ảnh nhiều loại quả (chuối, cam, xoài…) cả chín và xanh; mỗi loại ít nhất vài chục ảnh, hai loại số lượng gần bằng nhau; chụp ở nơi sáng, nơi tối, nhiều góc; một bạn ghi nhãn, một bạn khác kiểm tra.",
        },
      ],
      think: "Nếu bỏ qua bước kiểm tra mà đem máy ra dùng ngay, điều gì có thể xảy ra?",
      teacher: {
        goals: [
          "Mô tả được các bước cơ bản huấn luyện mô hình AI: xác định vấn đề, thu thập dữ liệu, huấn luyện, kiểm tra và đánh giá.",
          "Mở rộng: thực hành thu thập dữ liệu để huấn luyện AI cho một vấn đề đơn giản.",
        ],
        prepare: "Vài chiếc lá khỏe và lá bị sâu, vàng úa (hoặc ảnh in) để làm mẫu.",
        steps: [
          "Khởi động (5 phút): cho học sinh xem lá thật, hỏi \"Làm sao em biết lá này bị bệnh?\"",
          "Hoạt động 1 (10 phút): làm cá nhân, chữa chung; viết 4 bước lên bảng.",
          "Hoạt động 2 (12 phút): nhóm 4 lập kế hoạch; dùng lại ở tiết 10 nếu trường có máy.",
          "Chia sẻ (8 phút): \"Em nghĩ gì?\"",
        ],
      },
    },

    /* ───────────── Tiết 10 ───────────── */
    {
      no: 10, title: "Làm quen với một số công cụ ứng dụng học máy trực quan", codes: ["5.C5.2", "5.C5.MR2", "5.C5.MR3"], strand: C,
      activities: [
        {
          kind: "order", title: "Đánh số 1–4 theo thứ tự các thao tác với công cụ học máy.",
          steps: ["Bấm nút huấn luyện", "Đặt tên cho các nhóm (VD: lá khỏe, lá bệnh)", "Đưa ảnh mới vào để thử", "Thêm ảnh mẫu cho từng nhóm"],
          answer: "Đặt tên nhóm (1) → Thêm ảnh mẫu (2) → Bấm huấn luyện (3) → Đưa ảnh mới vào thử (4). Thứ tự trên phiếu: 3, 1, 4, 2.",
        },
        {
          kind: "table", title: "Phiếu theo dõi: ghi lại khi thầy cô (hoặc nhóm em) dùng công cụ học máy.",
          headers: ["Nội dung", "Ghi chép của em"], widths: [42, 58],
          rows: [
            ["Tên hai nhóm em dạy máy", null],
            ["Số ảnh mẫu của mỗi nhóm", null],
            ["Thử với 5 ảnh mới: máy đoán đúng mấy ảnh?", null],
            ["Ảnh nào máy đoán sai?", null],
          ],
          answer: "Tuỳ kết quả thực hành.",
        },
        {
          kind: "write", title: "Vì sao máy đoán sai ảnh đó? Cần làm gì để máy đoán đúng hơn?", lines: 2,
          answer: "Gợi ý: ảnh mẫu còn ít, chưa có ảnh giống ảnh bị sai (mờ, tối, góc lạ); cần thêm ảnh mẫu đa dạng rồi huấn luyện lại.",
        },
      ],
      think: "Em muốn dạy máy nhận biết hai thứ gì? Em sẽ chuẩn bị ảnh mẫu thế nào?",
      teacher: {
        goals: [
          "Thực hiện được thao tác cơ bản với một công cụ học máy trực quan có giám sát (yêu cầu cốt lõi, cần máy tính).",
          "Mở rộng: huấn luyện mô hình phân loại đơn giản (lá khỏe – lá bệnh), kiểm tra và tìm những trường hợp máy phân loại sai.",
        ],
        prepare: "Ít nhất 1 máy tính có mạng và máy chiếu; một công cụ học máy trực quan (VD Teachable Machine); khoảng 20 ảnh lá khỏe, 20 ảnh lá bệnh và 5 ảnh để thử. Không có máy: dùng thẻ ảnh, cả lớp đóng vai \"máy\" học và đoán.",
        steps: [
          "Khởi động (3 phút): nhắc lại 4 bước huấn luyện ở tiết 9.",
          "Làm mẫu (12 phút): thầy cô làm trên máy chiếu theo 4 thao tác, học sinh làm Hoạt động 1 và ghi phiếu theo dõi.",
          "Thực hành (12 phút): nếu có máy, các nhóm lần lượt thử; nếu không, các nhóm đoán ảnh thử và ghi kết quả.",
          "Chia sẻ (8 phút): Hoạt động 3 và \"Em nghĩ gì?\"",
        ],
        extend: "Không cho học sinh tạo tài khoản riêng; thầy cô đăng nhập và thao tác (Công văn 5588: học sinh không bắt buộc có tài khoản AI). Không dùng ảnh khuôn mặt học sinh làm dữ liệu.",
      },
    },

    /* ───────────── Tiết 11 ───────────── */
    {
      no: 11, title: "Cải tiến hệ thống AI bằng dữ liệu", codes: ["5.D2.1", "5.D2.MR1"], strand: D,
      activities: [
        {
          kind: "table", title: "Máy nhận biết chữ số viết tay được thử 3 lần, mỗi lần với 10 chữ số mới. Tính tỉ lệ đoán đúng.",
          headers: ["Lần", "Dữ liệu máy đã học", "Số chữ đoán đúng", "Tỉ lệ đúng"], widths: [10, 50, 20, 20],
          rows: [
            ["1", "100 ảnh, chữ của 3 bạn", "6/10", null],
            ["2", "300 ảnh, chữ của 15 bạn", "8/10", null],
            ["3", "600 ảnh, chữ của 30 bạn, có cả chữ viết nghiêng", "9/10", null],
          ],
          answer: "60%, 80%, 90%.",
        },
        {
          kind: "write", title: "Vì sao những lần sau máy đoán đúng hơn?", lines: 2,
          answer: "Máy được học thêm nhiều ảnh hơn, chữ của nhiều bạn hơn, có cả kiểu chữ khó (viết nghiêng) nên quen với nhiều cách viết.",
        },
        {
          kind: "check", title: "Đánh dấu ✓ vào dữ liệu nên thêm để máy đọc đúng chữ số của cả lớp em.",
          items: [
            "Chữ số của nhiều bạn khác nhau",
            "Chỉ chữ của bạn viết đẹp nhất lớp",
            "Chữ viết to, viết nhỏ, viết nghiêng",
            "Ảnh mờ, không rõ là số mấy",
            "Ảnh chụp ở nơi sáng và nơi tối",
            "Chữ của các bạn mới chuyển đến lớp",
          ],
          answer: "Nên thêm: chữ nhiều bạn; chữ to, nhỏ, nghiêng; ảnh nơi sáng và tối; chữ bạn mới. Không nên: chỉ chữ đẹp nhất; ảnh mờ không rõ số.",
        },
      ],
      think: "Vì sao các ứng dụng AI thường xuyên được cập nhật?",
      teacher: {
        goals: [
          "Giải thích được bằng ví dụ: hệ thống AI được cải tiến khi bổ sung, cập nhật dữ liệu thường xuyên.",
          "Mở rộng: thực hành cải tiến hệ thống AI bằng cách bổ sung dữ liệu (nối tiếp tiết 10 nếu có máy).",
        ],
        steps: [
          "Khởi động (5 phút): mỗi bạn viết số 7 lên giấy nháp, so xem có bao nhiêu kiểu viết khác nhau.",
          "Hoạt động 1 (8 phút): làm cá nhân – ôn tỉ số phần trăm của môn Toán.",
          "Hoạt động 2–3 (12 phút): nhóm đôi thảo luận, chữa chung.",
          "Chia sẻ (10 phút): \"Em nghĩ gì?\"; chốt: thêm dữ liệu đa dạng → máy tốt hơn, và phải kiểm tra lại sau mỗi lần cập nhật.",
        ],
        extend: "Nếu có máy: dùng lại mô hình lá khỏe – lá bệnh ở tiết 10, thêm ảnh cho những trường hợp máy đoán sai, huấn luyện lại và so kết quả.",
      },
    },

    /* ───────────── Tiết 12 ───────────── */
    {
      no: 12, title: "Ôn tập: Em và AI", strand: "A, B, C, D (ôn tập)",
      codes: ["5.A1.1", "5.A1.2", "5.A2.1", "5.A2.2", "5.A2.3", "5.A3.1", "5.A3.2", "5.B1.1", "5.B1.2", "5.B2.1", "5.B3.1", "5.C5.1", "5.C5.2", "5.D1.1", "5.D2.1"],
      activities: [
        {
          kind: "tick", title: "Đúng hay sai? Đánh dấu ✓.",
          columns: ["Đúng", "Sai"],
          rows: [
            "Khi máy làm sai, con người không phải chịu trách nhiệm gì.",
            "AI giúp con người chứ không thay thế con người.",
            "AI chỉ nên phục vụ những người giàu có.",
            "Dữ liệu càng đa dạng thì AI càng công bằng hơn.",
            "Không cần biết vì sao AI đưa ra quyết định.",
            "Luật \"nếu … thì …\" là một cách để máy ra quyết định.",
            "Bước đầu tiên khi huấn luyện AI là xác định vấn đề.",
            "Sau khi cập nhật dữ liệu, không cần thử lại máy.",
          ],
          answer: "Đúng: b, d, f, g. Sai: a, c, e, h.",
        },
        {
          kind: "table", title: "Viết một điều em nhớ nhất ở mỗi phần.",
          headers: ["Phần", "Điều em nhớ nhất"], widths: [32, 68],
          rows: [["Con người và AI", null], ["AI công bằng, minh bạch", null], ["Luật và học máy", null], ["Huấn luyện, cải tiến AI", null]],
          answer: "Tuỳ học sinh.",
        },
      ],
      think: "Lên lớp 6, em muốn tìm hiểu thêm điều gì về AI?",
      teacher: {
        goals: ["Ôn lại các yêu cầu cần đạt cốt lõi của lớp 5 theo 4 mạch nội dung."],
        steps: [
          "Hoạt động 1 (10 phút): làm cá nhân; chữa chung, với mỗi câu hỏi \"Em học điều này ở tiết nào?\"",
          "Hoạt động 2 (12 phút): làm cá nhân, sau đó chia sẻ trong nhóm.",
          "Chia sẻ (13 phút): \"Em nghĩ gì?\"; ghi lại câu hỏi của học sinh để gửi giáo viên lớp 6.",
        ],
        extend: "Đánh giá theo quá trình (Công văn 5588): dựa vào phiếu cả năm và cách học sinh giải thích, không chấm điểm số.",
      },
    },
  ],
};
