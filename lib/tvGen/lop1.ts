// lib/tvGen/lop1.ts — câu hỏi riêng cho Tiếng Việt 1 tập hai: chọn từ ngữ hoàn thiện câu.
// Câu SOẠN TAY theo từng chủ đề của sách; mỗi câu chỉ một từ ngữ hợp nghĩa, hai từ ngữ còn lại
// sai rõ ràng. CẦN NGƯỜI DUYỆT.

import { pick } from "../mathGen/core";
import { mc, type Generator } from "./core";

type Fill = { cau: string; right: string; wrong: [string, string] };

/** "…" là chỗ trống. */
export const DIEN_TU: Record<string, Fill[]> = {
  "ban-be": [
    { cau: "Hà cho Lan mượn … màu.", right: "bút", wrong: ["nồi", "ghế"] },
    { cau: "Giờ ra chơi, chúng em … dây.", right: "nhảy", wrong: ["ngủ", "nấu"] },
    { cau: "Nam và Minh là đôi bạn …", right: "thân", wrong: ["mưa", "bàn"] },
    { cau: "Em … tay chào cô giáo.", right: "khoanh", wrong: ["ăn", "chạy"] },
    { cau: "Bạn bè phải biết … đỡ nhau.", right: "giúp", wrong: ["cãi", "trêu"] },
  ],
  "gia-dinh": [
    { cau: "Mẹ … cơm cho cả nhà.", right: "nấu", wrong: ["đọc", "bay"] },
    { cau: "Bố đưa em … học.", right: "đi", wrong: ["ngủ", "khóc"] },
    { cau: "Em … quạt cho bà ngủ.", right: "cầm", wrong: ["ăn", "đá"] },
    { cau: "Cả nhà quây quần bên mâm …", right: "cơm", wrong: ["sách", "bút"] },
    { cau: "Anh trai dạy em … chữ.", right: "viết", wrong: ["bơi", "múa"] },
  ],
  "truong-hoc": [
    { cau: "Cô giáo … bài cho chúng em.", right: "giảng", wrong: ["nấu", "quét"] },
    { cau: "Tiếng … trường báo giờ vào lớp.", right: "trống", wrong: ["mèo", "gió"] },
    { cau: "Sân trường có cây … rất to.", right: "bàng", wrong: ["kẹo", "bút"] },
    { cau: "Em đọc sách ở … viện.", right: "thư", wrong: ["nhà", "chợ"] },
    { cau: "Chúng em xếp … vào lớp.", right: "hàng", wrong: ["bàn", "bát"] },
  ],
  "an-toan": [
    { cau: "Em rửa … trước khi ăn.", right: "tay", wrong: ["bàn", "sách"] },
    { cau: "Khi qua đường, em đi trên vạch kẻ cho người đi …", right: "bộ", wrong: ["bơi", "ngủ"] },
    { cau: "Đèn … thì phải dừng lại.", right: "đỏ", wrong: ["vui", "ngọt"] },
    { cau: "Em nói lời cảm … khi được giúp đỡ.", right: "ơn", wrong: ["cơm", "mưa"] },
    { cau: "Em không đi theo người …", right: "lạ", wrong: ["ngọt", "tròn"] },
  ],
  "bai-hoc": [
    { cau: "Chim bồ câu thả cành cây xuống cứu …", right: "kiến", wrong: ["voi", "hổ"] },
    { cau: "Chú bé chăn cừu nói … nên không ai tin.", right: "dối", wrong: ["hay", "khẽ"] },
    { cau: "Nhờ có rễ, cây mới đứng …", right: "vững", wrong: ["buồn", "ngủ"] },
    { cau: "Gấu con nói lời hay thì núi cũng đáp lại lời …", right: "hay", wrong: ["đen", "tròn"] },
    { cau: "Bạn tốt luôn sẵn lòng giúp … nhau.", right: "đỡ", wrong: ["cãi", "chê"] },
  ],
  "thien-nhien": [
    { cau: "Sau cơn mưa, cầu … hiện lên.", right: "vồng", wrong: ["thang", "trượt"] },
    { cau: "Hổ sống trong …", right: "rừng", wrong: ["tủ", "cốc"] },
    { cau: "Hải âu bay trên mặt …", right: "biển", wrong: ["bàn", "ghế"] },
    { cau: "Cây liễu có cành mềm …", right: "mại", wrong: ["cứng", "khô"] },
    { cau: "Chim hót líu … trên cành.", right: "lo", wrong: ["lá", "lò"] },
  ],
  "canh-vat": [
    { cau: "Buổi sáng, ông mặt … mọc.", right: "trời", wrong: ["trăng", "đất"] },
    { cau: "Hoa phượng nở đỏ rực vào mùa …", right: "hè", wrong: ["đông", "mưa"] },
    { cau: "Đàn cò trắng bay trên cánh …", right: "đồng", wrong: ["cửa", "tủ"] },
    { cau: "Buổi trưa hè, cả xóm yên …", right: "lặng", wrong: ["ồn", "ầm"] },
    { cau: "Tia nắng chiếu vào … cửa sổ.", right: "khung", wrong: ["bát", "cơm"] },
  ],
  "dat-nuoc": [
    { cau: "Chú lính cứu hoả dập tắt đám …", right: "cháy", wrong: ["mây", "lá"] },
    { cau: "Ruộng bậc … ở Sa Pa rất đẹp.", right: "thang", wrong: ["bàn", "ghế"] },
    { cau: "Biển Việt Nam có nhiều bãi … đẹp.", right: "cát", wrong: ["bút", "bát"] },
    { cau: "Bác nông dân cày … trên ruộng.", right: "cấy", wrong: ["múa", "hát"] },
    { cau: "Ăn quả nhớ kẻ trồng …", right: "cây", wrong: ["hoa", "rau"] },
  ],
};

export const dienTu = (theme: keyof typeof DIEN_TU): Generator => (r) => {
  const f = pick(r, DIEN_TU[theme]);
  return mc(`Chọn từ ngữ điền vào chỗ trống: “${f.cau}”`, f.right, f.wrong,
    `Câu đúng: “${f.cau.replace("…", f.right)}”`, ["từ ngữ", theme], 3);
};
