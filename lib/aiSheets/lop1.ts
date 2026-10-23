// lib/aiSheets/lop1.ts — 12 phiếu hoạt động AI lớp 1.
// Tên chủ đề + mã yêu cầu cần đạt theo Quyết định 2422/QĐ-BGDĐT (phần Lớp 1).
// Không nêu tên thương hiệu ứng dụng; mô tả bằng chức năng.
// Lớp 1 mới tập đọc: câu ngắn, ít mục; thầy cô đọc to từng câu trước khi các em làm.

import type { AiGrade } from "./index";

const A = "A. Tư duy lấy con người làm trung tâm";
const B = "B. Đạo đức AI";
const C = "C. Các kĩ thuật và ứng dụng AI";
const D = "D. Thiết kế hệ thống AI";
const DOC = "Thầy cô đọc to từng câu, các em làm theo.";

export const LOP1: AiGrade = {
  grade: 1,
  coreCodes: [
    "1.A1.1", "1.A1.2", "1.A1.3", "1.A1.4", "1.A2.1", "1.A2.2", "1.A2.3",
    "1.B1.1", "1.B3.1", "1.B3.2", "1.C1.1", "1.C1.2", "1.C1.3", "1.C1.4", "1.D1.1", "1.D2.1", "1.D2.2",
  ],
  sheets: [
    /* ───────────── Tiết 1 ───────────── */
    {
      no: 1, title: "Con người có cảm xúc, AI thì không", codes: ["1.A1.1", "1.A1.2"], strand: A,
      activities: [
        {
          kind: "match", title: "Nối mỗi việc với cảm xúc của em.",
          left: ["Được mẹ ôm", "Làm vỡ cốc", "Bị bạn giật đồ chơi", "Thấy con chó to sủa"],
          right: ["Vui", "Buồn", "Giận", "Sợ"],
          answer: "Gợi ý: 1–A, 2–B, 3–C, 4–D. Chấp nhận câu trả lời khác nếu em giải thích được.",
        },
        {
          kind: "tick", title: "Ai có cảm xúc thật? Đánh dấu ✓ vào cột phù hợp.",
          columns: ["Em", "Rô-bốt"],
          rows: ["Vui khi được khen", "Buồn khi bạn ốm", "Nhận ra khuôn mặt đang cười", "Thấy đau khi bị ngã"],
          answer: "a, b, d: chỉ Em. c: cả Em và Rô-bốt (rô-bốt nhận ra được khuôn mặt cười nhưng không thấy vui).",
        },
      ],
      think: "Rô-bốt nói “Tôi rất vui”. Rô-bốt có vui thật không?",
      teacher: {
        goals: [
          "Nêu được ví dụ về cảm xúc quen thuộc (vui, buồn, giận, sợ…) và bước đầu nhận ra con người có cảm xúc, AI thì không.",
          "Nêu được AI có thể nhận diện, bắt chước cảm xúc nhưng không cảm thấy như con người.",
        ],
        prepare: "Vài tấm thẻ vẽ khuôn mặt vui, buồn, giận, sợ.",
        steps: [
          `Khởi động (5 phút): giơ thẻ khuôn mặt, các em đoán cảm xúc và làm theo nét mặt. ${DOC}`,
          "Hoạt động 1 (10 phút): mỗi em nối, rồi kể một lần em vui hoặc buồn.",
          "Hoạt động 2 (10 phút): làm theo cặp; hỏi \"Rô-bốt có thấy đau không?\".",
          "Chia sẻ (10 phút): trả lời câu \"Em nghĩ gì?\"; chốt: rô-bốt chỉ nói hoặc làm theo cách đã được cài sẵn, em mới có cảm xúc thật.",
        ],
      },
    },

    /* ───────────── Tiết 2 ───────────── */
    {
      no: 2, title: "AI thể hiện cảm xúc do con người lập trình", codes: ["1.A1.3", "1.A1.4"], strand: A,
      activities: [
        {
          kind: "tick", title: "Đúng hay sai? Đánh dấu ✓.",
          columns: ["Đúng", "Sai"],
          rows: [
            "Rô-bốt cười vì người làm ra nó đã cài sẵn",
            "Rô-bốt cười vì nó thấy vui thật",
            "Loa nói “Rất vui được giúp bạn” là câu được cài sẵn",
            "Con người làm cho máy biết cười, biết nói",
          ],
          answer: "a: Đúng; b: Sai; c: Đúng; d: Đúng.",
        },
        {
          kind: "order", title: "Đánh số 1, 2, 3 theo thứ tự.",
          intro: "Rô-bốt cười khi em kể chuyện vui.",
          steps: ["Rô-bốt hiện mặt cười trên màn hình.", "Người làm rô-bốt cài sẵn: nghe chuyện vui thì hiện mặt cười.", "Em kể một chuyện vui cho rô-bốt nghe."],
          answer: "Thứ tự: 2 – 3 – 1 (cài sẵn → em kể chuyện → rô-bốt hiện mặt cười).",
        },
      ],
      think: "Nếu không có ai cài sẵn, rô-bốt có tự biết cười không?",
      teacher: {
        goals: [
          "Nêu được việc AI thể hiện cảm xúc (cười, buồn, ngạc nhiên trên màn hình hoặc qua giọng nói) là do con người lập trình, thiết kế trước.",
          "Nêu được ví dụ (rô-bốt cười khi nghe chuyện vui, trợ lí ảo nói “Tôi rất vui được giúp bạn”) và giải thích đó chỉ là phản ứng cài sẵn.",
        ],
        steps: [
          `Khởi động (5 phút): thầy cô đóng vai “rô-bốt”, chỉ cười khi nghe từ “vui”; các em đoán luật. ${DOC}`,
          "Hoạt động 1 (10 phút): làm cá nhân, cả lớp chữa.",
          "Hoạt động 2 (10 phút): làm theo cặp, mỗi cặp nói lại thứ tự bằng lời.",
          "Chia sẻ (10 phút): chốt: con người \"dạy\" máy cách cười, cách nói; máy không tự thấy vui.",
        ],
      },
    },

    /* ───────────── Tiết 3 ───────────── */
    {
      no: 3, title: "Ý nghĩa cảm xúc mà AI thể hiện", codes: ["1.A2.1", "1.A2.MR1"], strand: A,
      activities: [
        {
          kind: "match", title: "Nối mỗi cách máy thể hiện với chỗ máy dùng.",
          left: ["Mặt cười trên màn hình", "Giọng nói nhẹ nhàng, thân thiện", "Rô-bốt vẫy tay chào"],
          right: ["Hình ảnh", "Giọng nói", "Hành động"],
          answer: "1–A, 2–B, 3–C.",
        },
        {
          kind: "check", title: "Vì sao người ta làm cho máy biết chào, biết cười? Đánh dấu ✓ vào ý đúng.",
          items: ["Để người dùng thấy gần gũi", "Để máy thấy vui", "Để nói chuyện với máy dễ hơn", "Để máy biết buồn khi bị tắt"],
          answer: "Đúng: ý 1 và ý 3.",
        },
      ],
      think: "Em thích máy nói “Chào bạn!” hay chỉ hiện chữ? Vì sao?",
      teacher: {
        goals: [
          "Nêu được các cách AI thể hiện cảm xúc qua hình ảnh, giọng nói, hành vi (khuôn mặt vui, giọng thân thiện, lời chào dễ thương).",
        ],
        steps: [
          `Khởi động (5 phút): thầy cô chào lớp hai lần, một lần giọng lạnh lùng, một lần vui vẻ; hỏi các em thích lần nào. ${DOC}`,
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): thảo luận nhóm đôi rồi đánh dấu.",
          "Chia sẻ (10 phút): chốt: máy được làm cho thân thiện để con người dễ dùng, máy vẫn không có cảm xúc thật.",
        ],
        extend: "Mở rộng (1.A2.MR1): các em kể một máy ở nhà có lời chào hoặc tiếng nhạc vui khi bật lên và nói em thấy thế nào.",
      },
    },

    /* ───────────── Tiết 4 ───────────── */
    {
      no: 4, title: "Nhận diện AI trong cuộc sống", codes: ["1.A2.2", "1.A2.3"], strand: A,
      activities: [
        {
          kind: "check", title: "Máy nào có AI? Đánh dấu ✓.",
          items: ["Loa nghe lời nói và trả lời", "Cái kéo", "Rô-bốt hút bụi tự đi quanh nhà", "Cái bút chì", "Điện thoại mở khóa bằng khuôn mặt", "Cái thìa"],
          answer: "Có AI: loa trả lời bằng giọng nói, rô-bốt hút bụi, điện thoại mở khoá bằng khuôn mặt.",
        },
        {
          kind: "match", title: "Nối máy với việc máy làm giỏi.",
          left: ["Loa thông minh", "Rô-bốt hút bụi", "Ứng dụng dịch", "Camera ở cổng"],
          right: ["Nghe lệnh bằng giọng nói", "Tự tìm đường, tránh vật cản", "Đổi tiếng Anh sang tiếng Việt", "Nhận ra khuôn mặt"],
          answer: "1–A, 2–B, 3–C, 4–D.",
        },
      ],
      think: "Ở nhà em có máy nào giống trong phiếu không?",
      teacher: {
        goals: [
          "Nhận biết và kể tên một số sản phẩm có AI (loa thông minh, trợ lí ảo, rô-bốt hút bụi, camera nhận diện khuôn mặt, ứng dụng dịch…).",
          "Mô tả được công dụng chính của từng sản phẩm và AI giúp nó thông minh hơn thế nào.",
        ],
        prepare: "Tranh hoặc ảnh in loa thông minh, rô-bốt hút bụi, điện thoại.",
        steps: [
          `Khởi động (5 phút): cho xem tranh, các em gọi tên đồ vật. ${DOC}`,
          "Hoạt động 1 (10 phút): làm cá nhân; hỏi \"Vì sao cái kéo không có AI?\".",
          "Hoạt động 2 (10 phút): làm theo cặp.",
          "Chia sẻ (10 phút): mỗi em kể một máy thông minh ở nhà hoặc ngoài đường.",
        ],
      },
    },

    /* ───────────── Tiết 5 ───────────── */
    {
      no: 5, title: "Việc làm tốt và việc làm xấu", codes: ["1.B1.1"], strand: B,
      activities: [
        {
          kind: "tick", title: "Việc nào tốt, việc nào xấu? Đánh dấu ✓.",
          columns: ["Tốt", "Xấu"],
          rows: [
            "Nhờ máy đọc truyện cho em bé nghe",
            "Dùng máy làm giọng giả để trêu bạn",
            "Chụp ảnh bạn rồi sửa cho xấu để chê bạn",
            "Nhờ máy dịch giúp lời chào bạn mới",
          ],
          answer: "Tốt: a, d. Xấu: b, c.",
        },
        {
          kind: "write", title: "Bạn Tí dùng máy làm ảnh bạn Na thành mặt mèo rồi đưa cả lớp xem. Bạn Na sẽ thấy thế nào?", lines: 2,
          answer: "Bạn Na buồn, xấu hổ. Không được dùng máy để trêu chọc, làm bạn buồn.",
        },
      ],
      think: "Nếu bạn rủ em dùng máy để trêu người khác, em sẽ nói gì?",
      teacher: {
        goals: ["Nêu được một số hành vi dùng AI có thể gây hại cho người khác (trêu chọc, làm ảnh xấu, giả giọng…)."],
        steps: [
          `Khởi động (5 phút): hỏi "Khi bị trêu em thấy thế nào?". ${DOC}`,
          "Hoạt động 1 (10 phút): làm cá nhân, cả lớp chữa.",
          "Hoạt động 2 (10 phút): thầy cô đọc tình huống; các em nói hoặc viết 1–2 câu, có thể vẽ khuôn mặt bạn Na.",
          "Chia sẻ (10 phút): chốt: máy có thể dùng để làm việc tốt hoặc việc xấu, em chọn việc tốt.",
        ],
      },
    },

    /* ───────────── Tiết 6 ───────────── */
    {
      no: 6, title: "Máy thông minh làm việc tốt", codes: ["1.B3.1", "1.B3.2"], strand: B,
      activities: [
        {
          kind: "match", title: "Nối máy với việc tốt máy giúp con người.",
          left: ["Máy đọc chữ to", "Máy dịch", "Đèn giao thông thông minh", "Máy nhắc giờ uống thuốc"],
          right: ["Giúp ông bà mắt kém đọc báo", "Giúp nói chuyện với người nước ngoài", "Giúp qua đường an toàn", "Giúp người ốm nhớ uống thuốc"],
          answer: "1–A, 2–B, 3–C, 4–D.",
        },
        {
          kind: "tick", title: "Có được làm không? Đánh dấu ✓.",
          columns: ["Được", "Không"],
          rows: ["Dùng máy để doạ bạn sợ", "Dùng máy nhắc cả nhà đi ngủ đúng giờ", "Dùng máy nói dối để lấy đồ của bạn", "Dùng máy tìm bài hát cho cả lớp hát"],
          answer: "Được: b, d. Không: a, c (không dùng AI để làm hại người khác).",
        },
      ],
      think: "Em muốn có một máy thông minh giúp ai trong nhà? Giúp việc gì?",
      teacher: {
        goals: [
          "Nhận biết không được dùng AI để làm hại người khác.",
          "Nêu được ví dụ con người dùng AI đúng cách, vì mục đích tốt.",
        ],
        steps: [
          `Khởi động (5 phút): hỏi "Ông bà em có dùng kính để đọc chữ không? Máy có thể giúp thế nào?". ${DOC}`,
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): làm theo nhóm đôi, giải thích vì sao \"Không\".",
          "Chia sẻ (10 phút): mỗi em nói một việc tốt em muốn máy giúp.",
        ],
      },
    },

    /* ───────────── Tiết 7 ───────────── */
    {
      no: 7, title: "Nhận biết AI và ứng dụng AI", codes: ["1.C1.1", "1.C1.2"], strand: C,
      activities: [
        {
          kind: "tick", title: "Máy nào biết “nghĩ” để làm việc? Đánh dấu ✓.",
          columns: ["Có AI", "Không có AI"],
          rows: ["Quạt điện bật bằng nút", "Điện thoại nhận ra mặt chủ để mở khoá", "Trợ lí ảo trả lời khi em hỏi", "Đèn pin"],
          answer: "Có AI: b, c. Không có AI: a, d.",
        },
        {
          kind: "check", title: "Trên điện thoại, máy tính bảng có những công cụ AI nào? Đánh dấu ✓.",
          items: ["Trợ lí ảo nghe và trả lời", "Mở khoá bằng khuôn mặt", "Nút tăng âm lượng", "Tìm kiếm bằng giọng nói"],
          answer: "Công cụ AI: trợ lí ảo, mở khoá bằng khuôn mặt, tìm kiếm bằng giọng nói. Nút tăng âm lượng không phải AI.",
        },
      ],
      think: "Vì sao đèn pin không phải là máy thông minh?",
      teacher: {
        goals: [
          "Nhận biết được AI trong một số ví dụ đơn giản.",
          "Nhận diện được một số công cụ AI quen thuộc trên điện thoại, máy tính bảng (trợ lí ảo, nhận diện khuôn mặt…).",
        ],
        steps: [
          `Khởi động (5 phút): trò chơi "Máy nào biết nghe?": thầy cô kể tên máy, các em giơ tay nếu máy đó nghe được lời nói. ${DOC}`,
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): nếu lớp có máy tính bảng, thầy cô cho xem công cụ trợ lí ảo; nếu không, dùng tranh.",
          "Chia sẻ (10 phút): chốt: máy có AI tự nhận ra, tự trả lời; máy không có AI chỉ làm khi con người bấm nút.",
        ],
      },
    },

    /* ───────────── Tiết 8 ───────────── */
    {
      no: 8, title: "Chức năng và công cụ AI", codes: ["1.C1.3", "1.C1.4", "1.C1.MR1", "1.C1.MR2"], strand: C,
      activities: [
        {
          kind: "match", title: "Bộ phận nào của máy giống bộ phận nào của em?",
          left: ["Camera", "Micro", "Loa"],
          right: ["Mắt", "Tai", "Miệng"],
          answer: "1–A (camera là “mắt”), 2–B (micro là “tai”), 3–C (loa là “miệng”).",
        },
        {
          kind: "tick", title: "Loa thông minh làm được không? Đánh dấu ✓.",
          columns: ["Được", "Không"],
          rows: ["Bật nhạc khi em nói “Mở bài hát”", "Trả lời “Hôm nay trời nắng”", "Tự đi ra chợ mua rau", "Ôm em khi em buồn"],
          answer: "Được: a, b (hiểu lệnh đơn giản, trả lời theo kịch bản). Không: c, d.",
        },
      ],
      think: "Nếu máy không có micro, máy có nghe được em nói không?",
      teacher: {
        goals: [
          "Nhận biết thiết bị thông minh có bộ phận giống bộ phận của con người (camera là “mắt”, micro là “tai”).",
          "Nhận biết AI hiểu được mệnh lệnh đơn giản, trò chuyện theo kịch bản định sẵn.",
        ],
        steps: [
          `Khởi động (5 phút): các em chỉ mắt, tai, miệng của mình; thầy cô hỏi máy dùng gì để nhìn, để nghe. ${DOC}`,
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): một em đóng vai “loa thông minh”, chỉ làm được việc có trong phiếu; các bạn ra lệnh.",
          "Chia sẻ (10 phút): chốt: máy nghe, nhìn bằng micro, camera và chỉ làm được những việc đã được cài sẵn.",
        ],
        extend: "Mở rộng (1.C1.MR1, MR2): nếu có máy, cho xem máy nhận ra đồ vật qua camera và phân biệt tiếng chó sủa, tiếng mèo kêu.",
      },
    },

    /* ───────────── Tiết 9 ───────────── */
    {
      no: 9, title: "Máy thông minh học từ ví dụ", codes: ["1.D1.1", "1.D1.MR1"], strand: D,
      activities: [
        {
          kind: "order", title: "Máy học nhận ra con mèo. Đánh số 1, 2, 3 theo thứ tự.",
          steps: ["Máy nhìn một bức ảnh mới và nói “Đây là con mèo”.", "Con người cho máy xem thật nhiều ảnh con mèo.", "Máy tìm ra con mèo có tai nhọn, có ria, có đuôi."],
          answer: "Thứ tự: 2 – 3 – 1.",
        },
        {
          kind: "check", title: "Muốn dạy máy nhận ra quả táo, em cho máy xem ảnh nào? Đánh dấu ✓.",
          items: ["Táo đỏ", "Táo xanh", "Quả cam", "Táo bị cắn một miếng", "Quả bóng đỏ", "Táo trong rổ"],
          answer: "Chọn: táo đỏ, táo xanh, táo bị cắn, táo trong rổ. Không chọn quả cam, quả bóng (sẽ làm máy học nhầm).",
        },
      ],
      think: "Nếu chỉ cho máy xem ảnh táo đỏ, máy có nhận ra táo xanh không?",
      teacher: {
        goals: ["Nêu được ví dụ AI “học” từ hình ảnh, thông tin do con người cung cấp (học nhận biết con mèo, quả táo…)."],
        prepare: "Vài tranh con mèo, quả táo khác nhau (màu, tư thế).",
        steps: [
          `Khởi động (5 phút): cho xem 3 tranh con mèo khác nhau, hỏi "Vì sao em biết đây là con mèo?". ${DOC}`,
          "Hoạt động 1 (10 phút): làm theo cặp.",
          "Hoạt động 2 (10 phút): làm cá nhân, chữa và hỏi vì sao không chọn quả bóng đỏ.",
          "Chia sẻ (10 phút): chốt: máy học từ ví dụ con người đưa; ví dụ đúng và khác nhau thì máy học tốt.",
        ],
        extend: "Mở rộng (1.D1.MR1): để máy trả lời đúng, cần nhiều ví dụ đúng và khác nhau.",
      },
    },

    /* ───────────── Tiết 10 ───────────── */
    {
      no: 10, title: "Nhiều loại máy thông minh (phần 1)", codes: ["1.D2.1"], strand: D,
      activities: [
        {
          kind: "tick", title: "Máy làm được mấy việc? Đánh dấu ✓.",
          columns: ["Một việc", "Nhiều việc"],
          rows: ["Camera ở cổng: chỉ nhận ra khuôn mặt", "Loa thông minh: nghe, trả lời, bật nhạc, đặt báo thức", "Máy chỉ đọc mã vạch ở quầy thu ngân", "Rô-bốt trò chuyện, kể chuyện, nhảy múa"],
          answer: "Một việc: a, c. Nhiều việc: b, d.",
        },
        {
          kind: "write", title: "Kể tên một máy chỉ làm được một việc mà em biết.", lines: 2,
          answer: "Tuỳ học sinh, VD: máy đọc mã vạch, cửa tự mở khi có người đến, máy đếm bước chân.",
        },
      ],
      think: "Máy làm được nhiều việc có giỏi hơn máy chỉ làm một việc không?",
      teacher: {
        goals: ["Nhận biết có máy thông minh chỉ làm được một việc (như nhận biết hình ảnh), có máy làm được nhiều việc (lắng nghe – trả lời, thực hiện lệnh…)."],
        steps: [
          `Khởi động (5 phút): hỏi "Cái bút làm được mấy việc? Cái điện thoại làm được mấy việc?". ${DOC}`,
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): kể theo nhóm, thầy cô ghi lên bảng.",
          "Chia sẻ (10 phút): chốt: máy chỉ làm một việc thường làm việc đó rất giỏi; không có máy nào làm được mọi việc.",
        ],
      },
    },

    /* ───────────── Tiết 11 ───────────── */
    {
      no: 11, title: "Nhiều loại máy thông minh (phần 2)", codes: ["1.D2.2"], strand: D,
      activities: [
        {
          kind: "sort", title: "Viết chữ cái của mỗi máy vào nhóm phù hợp.",
          items: ["Cửa tự mở khi có người đến", "Trợ lí ảo trên điện thoại", "Máy đọc mã vạch", "Rô-bốt trò chuyện, chơi trò chơi", "Đèn tự bật khi trời tối", "Loa thông minh"],
          columns: ["Chỉ làm được một việc", "Làm được nhiều việc"],
          answer: "Một việc: A, C, E. Nhiều việc: B, D, F.",
        },
        {
          kind: "write", title: "Vẽ một máy thông minh em muốn có. Máy làm được mấy việc?", lines: 0, draw: true,
        },
      ],
      think: "Máy em vẽ giúp được ai?",
      teacher: {
        goals: ["Xếp được một số máy thông minh vào hai nhóm: chỉ làm một việc và làm được nhiều việc."],
        steps: [
          `Khởi động (5 phút): nhắc lại hai loại máy ở tiết trước. ${DOC}`,
          "Hoạt động 1 (12 phút): làm theo cặp, chữa.",
          "Hoạt động 2 (12 phút): vẽ máy mơ ước.",
          "Chia sẻ (6 phút): vài em giới thiệu tranh: máy làm việc gì, giúp ai.",
        ],
      },
    },

    /* ───────────── Tiết 12 ───────────── */
    {
      no: 12, title: "Ôn tập: Em và máy thông minh",
      codes: ["1.A1.1", "1.A1.3", "1.A2.2", "1.B1.1", "1.B3.1", "1.C1.3", "1.D1.1", "1.D2.1"],
      strand: "A, B, C, D (ôn tập)",
      activities: [
        {
          kind: "tick", title: "Đúng hay sai? Đánh dấu ✓.",
          columns: ["Đúng", "Sai"],
          rows: [
            "Rô-bốt cũng biết buồn như em",
            "Camera là “mắt” của máy",
            "Máy học từ ví dụ con người cho xem",
            "Được dùng máy để trêu bạn",
            "Có máy chỉ làm được một việc",
          ],
          answer: "a: Sai; b: Đúng; c: Đúng; d: Sai; e: Đúng.",
        },
        {
          kind: "check", title: "Máy nào có AI? Đánh dấu ✓.",
          items: ["Rô-bốt hút bụi", "Cái ô", "Loa nghe lời nói", "Cái bàn"],
          answer: "Có AI: rô-bốt hút bụi, loa nghe lời nói.",
        },
      ],
      think: "Em học được điều gì về máy thông minh trong năm nay?",
      teacher: {
        goals: ["Ôn lại các ý chính của 11 tiết: cảm xúc của con người và AI, nhận diện AI, dùng AI vào việc tốt, máy học từ ví dụ, các loại máy thông minh."],
        steps: [
          `Khởi động (5 phút): trò chơi "Đúng thì đứng, sai thì ngồi" với các câu ở hoạt động 1. ${DOC}`,
          "Hoạt động 1 (10 phút): làm cá nhân.",
          "Hoạt động 2 (10 phút): làm cá nhân, chữa cả lớp.",
          "Chia sẻ (10 phút): mỗi em nói một điều em nhớ nhất; thầy cô nhận xét mức độ đạt yêu cầu của từng em.",
        ],
      },
    },
  ],
};
