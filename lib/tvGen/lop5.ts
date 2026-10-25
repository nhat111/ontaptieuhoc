// lib/tvGen/lop5.ts — Luyện từ và câu Tiếng Việt 5 cho phiếu bài tập theo chủ đề.
// Kho câu VIẾT SẴN (không chép sách). Quy tắc để mỗi câu có đúng MỘT đáp án:
//   • nhóm từ đồng nghĩa khác nghĩa hẳn nhau, mỗi từ chỉ ở một nhóm;
//   • từ đa nghĩa: mỗi câu "gốc" dùng nghĩa gốc, mỗi câu "chuyển" dùng nghĩa chuyển, và câu
//     nào cũng chứa đúng từ đó;
//   • câu ghép có hai vế, mỗi vế có chủ ngữ – vị ngữ riêng; câu đơn chỉ có một cụm chủ – vị
//     (có thể có chủ ngữ hoặc vị ngữ gồm nhiều bộ phận);
//   • hai câu của phần liên kết chỉ liên kết bằng một cách.
// scripts/tv-sheet-check.ts kiểm tra phần máy kiểm được. CẦN NGƯỜI DUYỆT.

import { pick, shuffle } from "../mathGen/core";
import { CONNECTIVES } from "../games5";
import { itemRng, mc, mcFixed, type Generator } from "./core";
import { Q, type TvMcq } from "./bank";

/* ───────────── Từ đồng nghĩa ───────────── */

export const DONG_NGHIA: string[][] = [
  ["chăm chỉ", "siêng năng", "cần cù"],
  ["dũng cảm", "gan dạ", "can đảm"],
  ["to lớn", "khổng lồ", "đồ sộ"],
  ["nhỏ bé", "bé nhỏ", "tí hon"],
  ["xinh đẹp", "xinh xắn", "đẹp đẽ"],
  ["Tổ quốc", "đất nước", "giang sơn"],
  ["hiền lành", "hiền hậu", "nhân hậu"],
  ["vui vẻ", "vui tươi", "hớn hở"],
  ["buồn bã", "rầu rĩ", "ủ rũ"],
  ["mênh mông", "bao la", "bát ngát"],
  ["yên tĩnh", "tĩnh lặng", "vắng lặng"],
  ["cẩn thận", "thận trọng", "cẩn trọng"],
];

export const dongNghia5: Generator = (r) => {
  const g = pick(r, DONG_NGHIA);
  const w = pick(r, g);
  const ir = itemRng("dongnghia5", w);
  const right = pick(ir, g.filter((x) => x !== w));
  const wrong = shuffle(ir, DONG_NGHIA.filter((x) => x !== g)).slice(0, 3).map((x) => pick(ir, x));
  return mc(`Từ nào đồng nghĩa với từ “${w}”?`, right, wrong, `“${w}”, ${g.filter((x) => x !== w).map((x) => `“${x}”`).join(", ")} là những từ đồng nghĩa.`, ["đồng nghĩa"]);
};

/** "Từ nào KHÔNG cùng nghĩa với các từ còn lại?" — ba từ một nhóm và một từ nhóm khác. */
export const khongDongNghia: Generator = (r) => {
  const g = pick(r, DONG_NGHIA);
  const ir = itemRng("khongdn", g.join());
  const odd = pick(ir, pick(ir, DONG_NGHIA.filter((x) => x !== g)));
  return mcFixed("Từ nào KHÔNG cùng nghĩa với các từ còn lại?", shuffle(ir, [...g, odd]), odd,
    `${g.map((x) => `“${x}”`).join(", ")} là những từ đồng nghĩa; “${odd}” mang nghĩa khác.`, ["đồng nghĩa"]);
};

export const dongNghiaDong: Generator = (r) => {
  const g = pick(r, DONG_NGHIA);
  const ir = itemRng("dongdn", g.join());
  const others = DONG_NGHIA.filter((x) => x !== g);
  const wrong = [0, 1, 2].map(() => shuffle(ir, others).slice(0, 3).map((x) => pick(ir, x)).join(", "));
  return mc("Dòng nào dưới đây gồm các từ đồng nghĩa?", g.join(", "), wrong,
    `“${g.join(", ")}” có nghĩa giống nhau.`, ["đồng nghĩa"]);
};

/* ───────────── Từ đa nghĩa ───────────── */

export type DaNghia = { tu: string; goc: string[]; chuyen: string[]; nghia: string };

export const DA_NGHIA: DaNghia[] = [
  { tu: "chân", nghia: "bộ phận cơ thể dùng để đi, đứng", goc: ["Bé bị đau chân.", "Con gà có hai chân."], chuyen: ["Chân núi phủ đầy mây.", "Cái bàn bị gãy một chân.", "Mẹ đứng chờ ở chân cầu thang."] },
  { tu: "mắt", nghia: "bộ phận cơ thể dùng để nhìn", goc: ["Em bé có đôi mắt đen láy.", "Bà đeo kính vì mắt kém."], chuyen: ["Quả na đã mở mắt.", "Cây tre có nhiều mắt.", "Mắt lưới này rất nhỏ."] },
  { tu: "đầu", nghia: "bộ phận trên cùng của cơ thể", goc: ["Bạn Nam đội mũ lên đầu.", "Em gội đầu bằng nước ấm."], chuyen: ["Lan đứng đầu hàng.", "Nhà em ở đầu làng.", "Cây bút chì bị gãy đầu."] },
  { tu: "miệng", nghia: "bộ phận cơ thể dùng để ăn, nói", goc: ["Bé há miệng ăn cơm.", "Em che miệng khi ho."], chuyen: ["Miệng giếng phủ đầy rêu.", "Miệng bát bị sứt một miếng.", "Nước đã đầy tới miệng chum."] },
  { tu: "lưỡi", nghia: "bộ phận trong miệng dùng để nếm, nói", goc: ["Chú chó thè lưỡi vì trời nóng.", "Em bị bỏng lưỡi vì ăn cháo nóng."], chuyen: ["Lưỡi dao rất sắc.", "Bác nông dân mài lưỡi liềm.", "Lưỡi cày lật từng thớ đất."] },
  { tu: "mũi", nghia: "bộ phận cơ thể dùng để thở, ngửi", goc: ["Em bé có chiếc mũi xinh xinh.", "Bạn Hà bị sổ mũi."], chuyen: ["Mũi thuyền rẽ sóng lao đi.", "Mũi kim rất nhọn.", "Mũi kéo đã bị cùn."] },
  { tu: "ăn", nghia: "đưa thức ăn vào miệng", goc: ["Cả nhà quây quần ăn cơm tối.", "Em bé đang ăn cháo."], chuyen: ["Tàu đang ăn hàng ở cảng.", "Da em bé rất ăn nắng.", "Hai màu áo này rất ăn nhau."] },
  { tu: "chạy", nghia: "di chuyển nhanh bằng chân", goc: ["Bạn Minh chạy nhanh nhất lớp.", "Đàn bê chạy quanh bãi cỏ."], chuyen: ["Chiếc đồng hồ chạy rất đúng giờ.", "Con đường chạy dọc bờ sông.", "Máy giặt đang chạy."] },
  { tu: "lá", nghia: "bộ phận của cây, thường mỏng, màu xanh", goc: ["Lá bàng đỏ rực.", "Gió thổi lá rơi xào xạc."], chuyen: ["Em viết lá thư gửi bà.", "Lá cờ đỏ tung bay trên cột.", "Mẹ cất lá đơn vào cặp."] },
  { tu: "ngọt", nghia: "có vị như đường", goc: ["Quả xoài chín rất ngọt.", "Mẹ pha cốc nước chanh ngọt."], chuyen: ["Bạn ấy nói rất ngọt.", "Con dao này cắt rất ngọt.", "Chị ấy có giọng hát ngọt."] },
];

export const nghiaGoc: Generator = (r) => {
  const e = pick(r, DA_NGHIA);
  const right = pick(r, e.goc);
  return mc(`Trong câu nào, từ “${e.tu}” được dùng với nghĩa gốc?`, right, e.chuyen,
    `Nghĩa gốc của “${e.tu}” là ${e.nghia}: “${right}”. Các câu còn lại dùng nghĩa chuyển.`, ["đa nghĩa"]);
};

export const nghiaChuyen: Generator = (r) => {
  const e = pick(r, DA_NGHIA);
  const right = pick(r, e.chuyen);
  return mc(`Trong câu nào, từ “${e.tu}” được dùng với nghĩa chuyển?`, right, e.goc,
    `“${right}” dùng nghĩa chuyển; nghĩa gốc của “${e.tu}” là ${e.nghia}.`, ["đa nghĩa"]);
};

/* ───────────── Đại từ ───────────── */

export const DAI_TU: TvMcq[] = [
  Q("Từ nào là đại từ trong câu “Hôm nay, tôi được điểm mười.”?", "tôi", ["Hôm nay", "điểm", "được"], "“tôi” là đại từ xưng hô, chỉ người nói."),
  Q("Từ nào là đại từ trong câu “Chúng ta phải bảo vệ môi trường.”?", "Chúng ta", ["bảo vệ", "môi trường", "phải"], "“Chúng ta” là đại từ xưng hô, chỉ cả người nói và người nghe."),
  Q("Từ nào là đại từ trong câu “Họ đang làm việc ngoài đồng.”?", "Họ", ["làm việc", "ngoài đồng", "đang"], "“Họ” là đại từ xưng hô, chỉ những người được nói tới."),
  Q("Từ nào là đại từ trong câu “Ông nội kể chuyện, chúng tôi ngồi nghe say mê.”?", "chúng tôi", ["Ông nội", "kể chuyện", "say mê"], "“chúng tôi” là đại từ xưng hô, chỉ nhóm người nói."),
  Q("Từ nào là đại từ dùng để hỏi trong câu “Ai đã trồng hàng cây này?”?", "Ai", ["trồng", "hàng cây", "đã"], "“Ai” là đại từ nghi vấn, dùng để hỏi về người."),
  Q("Từ nào là đại từ dùng để hỏi trong câu “Cuộc thi diễn ra ở đâu?”?", "đâu", ["Cuộc thi", "diễn ra", "ở"], "“đâu” là đại từ nghi vấn, dùng để hỏi về nơi chốn."),
  Q("Từ nào là đại từ dùng để hỏi trong câu “Bao giờ trường tổ chức hội khoẻ?”?", "Bao giờ", ["trường", "tổ chức", "hội khoẻ"], "“Bao giờ” là đại từ nghi vấn, dùng để hỏi về thời gian."),
  Q("Trong đoạn “Cây phượng nở hoa đỏ rực. Nó báo hiệu mùa hè đã đến.”, từ “Nó” thay thế cho từ ngữ nào?", "Cây phượng", ["hoa", "mùa hè", "đỏ rực"], "“Nó” là đại từ thay thế cho “Cây phượng” ở câu trước."),
  Q("Trong đoạn “Chú chó Mực rất khôn. Nó biết giữ nhà khi cả nhà đi vắng.”, từ “Nó” thay thế cho từ ngữ nào?", "Chú chó Mực", ["nhà", "cả nhà", "khôn"], "“Nó” là đại từ thay thế cho “Chú chó Mực”."),
  Q("Từ nào là đại từ dùng để hỏi trong câu “Ai là người đến lớp sớm nhất?”?", "Ai", ["người", "đến lớp", "sớm nhất"], "“Ai” là đại từ nghi vấn, dùng để hỏi về người."),
  Q("Từ nào là đại từ trong câu “Chúng tôi đi cắm trại ở ven hồ.”?", "Chúng tôi", ["cắm trại", "ven hồ", "đi"], "“Chúng tôi” là đại từ xưng hô, chỉ nhóm người nói."),
  Q("Trong đoạn “Bà em trồng một cây hồng xiêm. Nó cho rất nhiều quả ngọt.”, từ “Nó” thay thế cho từ ngữ nào?", "cây hồng xiêm", ["Bà em", "quả ngọt", "nhiều quả"], "“Nó” là đại từ thay thế cho “cây hồng xiêm” ở câu trước."),
  Q("Từ nào là đại từ dùng để hỏi trong câu “Sao hôm nay đến muộn thế?”?", "Sao", ["hôm nay", "đến", "muộn"], "“Sao” là đại từ nghi vấn, dùng để hỏi về nguyên nhân."),
  Q("Trong câu Mai rủ: “Chúng mình cùng đi thư viện nhé!”, từ nào là đại từ xưng hô?", "Chúng mình", ["Mai", "thư viện", "đi"], "“Chúng mình” chỉ nhóm người nói, gồm cả người nghe."),
];

/* ───────────── Kết từ — dùng lại câu của trò chơi Kết từ (lib/games5.ts) ───────────── */

export const ketTu: Generator = (r) => {
  const it = pick(r, CONNECTIVES);
  const shown = it.text.replace("___", "…");
  return mc(`Chọn kết từ thích hợp điền vào chỗ trống: “${shown}”`, it.answer, it.options.filter((o) => o !== it.answer),
    `Câu đúng: “${it.text.replace("___", it.answer)}”`, ["kết từ"]);
};

/* ───────────── Câu ghép ───────────── */

export const CAU_GHEP: string[] = [
  "Trời nắng, chim hót líu lo.", "Mặt trời lên cao, sương tan dần.", "Vì trời mưa to nên đường trơn trượt.",
  "Tuy nhà xa nhưng Hà luôn đi học đúng giờ.", "Nếu em chăm học thì em sẽ tiến bộ.", "Mẹ nấu cơm, bố quét nhà.",
  "Gió thổi mạnh, sóng biển dâng cao.", "Lan đọc truyện còn Hoa vẽ tranh.", "Trời đã tối nhưng bố vẫn chưa về.",
  "Không những Nam học giỏi mà Nam còn hát hay.",
];

export const CAU_DON: string[] = [
  "Những chú chim hót líu lo trên cành.", "Sáng nay, em đi học rất sớm.", "Bạn Lan và bạn Hoa đều học giỏi.",
  "Mẹ em vừa nấu cơm vừa trông em bé.", "Cánh đồng lúa chín vàng óng.", "Vào mùa hè, hoa phượng nở đỏ rực.",
  "Bà em kể chuyện cổ tích rất hay.", "Chúng em trồng cây để bảo vệ môi trường.", "Đàn cò trắng bay lượn trên cánh đồng.",
];

export const cauGhep: Generator = (r) => {
  const right = pick(r, CAU_GHEP);
  return mc("Câu nào dưới đây là câu ghép?", right, CAU_DON,
    `“${right}” có hai vế, mỗi vế có chủ ngữ và vị ngữ riêng — đó là câu ghép.`, ["câu ghép"]);
};

export const cauDon: Generator = (r) => {
  const right = pick(r, CAU_DON);
  return mc("Câu nào dưới đây KHÔNG phải là câu ghép?", right, CAU_GHEP,
    `“${right}” chỉ có một cụm chủ ngữ – vị ngữ nên là câu đơn; các câu còn lại có hai vế.`, ["câu ghép"]);
};

/* ───────────── Liên kết câu ───────────── */

export type LienKet = "lap" | "thay" | "noi";

export const LK_LABEL: Record<LienKet, string> = { lap: "Lặp lại từ ngữ", thay: "Thay thế từ ngữ", noi: "Dùng từ ngữ nối" };

export const LIEN_KET: { d: string; cach: LienKet; tu: string }[] = [
  { d: "Ông em là một người lính. Ông đã từng chiến đấu ở Điện Biên Phủ.", cach: "lap", tu: "Ông" },
  { d: "Ngôi trường của em nằm bên dòng sông. Ngôi trường có mái ngói đỏ tươi.", cach: "lap", tu: "Ngôi trường" },
  { d: "Hoa sen nở đầy đầm. Hoa sen toả hương thơm ngát.", cach: "lap", tu: "Hoa sen" },
  { d: "Bé Mai rất thích hội hoạ. Em thường vẽ tranh về biển.", cach: "thay", tu: "Em" },
  { d: "Cánh đồng lúa đã chín vàng. Nó trải dài tới tận chân trời.", cach: "thay", tu: "Nó" },
  { d: "Bác Hồ rất yêu thiếu nhi. Người luôn dành cho các cháu những tình cảm ấm áp.", cach: "thay", tu: "Người" },
  { d: "Trời đổ mưa to. Tuy vậy, các bạn vẫn đến lớp đầy đủ.", cach: "noi", tu: "Tuy vậy" },
  { d: "Trời mưa suốt cả tuần. Vì thế, nước sông dâng cao.", cach: "noi", tu: "Vì thế" },
  { d: "Cơn bão đã đi qua. Sau đó, bầu trời quang đãng trở lại.", cach: "noi", tu: "Sau đó" },
  { d: "Mẹ em làm nghề dạy học. Mẹ rất yêu quý học trò của mình.", cach: "lap", tu: "Mẹ" },
  { d: "Cây bàng trước sân trường đã ra lá non. Cây bàng như chiếc ô xanh khổng lồ.", cach: "lap", tu: "Cây bàng" },
  { d: "Nam là lớp trưởng lớp em. Bạn ấy học giỏi và hay giúp đỡ mọi người.", cach: "thay", tu: "Bạn ấy" },
  { d: "Hà Nội là thủ đô của nước ta. Nơi đây có nhiều di tích lịch sử.", cach: "thay", tu: "Nơi đây" },
  { d: "Đêm qua trời rét đậm. Tuy nhiên, sáng nay nắng đã lên.", cach: "noi", tu: "Tuy nhiên" },
  { d: "Vườn nhà em có nhiều cây ăn quả. Ngoài ra, còn có một luống rau xanh.", cach: "noi", tu: "Ngoài ra" },
];

const LK_WHY: Record<LienKet, (t: string) => string> = {
  lap: (t) => `Từ ngữ “${t}” ở câu trước được lặp lại ở câu sau.`,
  thay: (t) => `“${t}” ở câu sau thay thế cho từ ngữ đã nói ở câu trước.`,
  noi: (t) => `“${t}” là từ ngữ nối hai câu.`,
};

const LK_KINDS = Object.keys(LK_LABEL) as LienKet[];

export const lienKet: Generator = (r) => {
  const e = pick(r, LIEN_KET);
  return mcFixed(`Hai câu “${e.d}” được liên kết với nhau bằng cách nào?`, LK_KINDS.map((k) => LK_LABEL[k]), LK_LABEL[e.cach],
    LK_WHY[e.cach](e.tu), ["liên kết câu", e.cach]);
};

/* ───────────── Dấu câu ───────────── */

export const DAU_CAU5: TvMcq[] = [
  Q("Dấu gạch ngang trong câu “Cầu Long Biên – cây cầu thép đầu tiên bắc qua sông Hồng – đã hơn một trăm tuổi.” dùng để làm gì?", "Đánh dấu phần chú thích, giải thích", ["Đánh dấu lời nói của nhân vật", "Nối các từ ngữ trong một liên danh", "Đánh dấu các ý được liệt kê"], "“cây cầu thép đầu tiên bắc qua sông Hồng” giải thích thêm về cầu Long Biên."),
  Q("Trong đoạn “Ở trường, em tham gia nhiều hoạt động: – trồng cây; – đọc sách; – văn nghệ.”, dấu gạch ngang dùng để làm gì?", "Đánh dấu các ý được liệt kê", ["Đánh dấu phần chú thích, giải thích", "Đánh dấu lời nói của nhân vật", "Nối các từ ngữ trong một liên danh"], "Mỗi hoạt động được kể ra sau một dấu gạch ngang."),
  Q("Dấu gạch ngang trong cụm từ “tuyến đường sắt Bắc – Nam” dùng để làm gì?", "Nối các từ ngữ trong một liên danh", ["Đánh dấu phần chú thích, giải thích", "Đánh dấu lời nói của nhân vật", "Đánh dấu các ý được liệt kê"], "Dấu gạch ngang nối “Bắc” và “Nam” — hai đầu của tuyến đường sắt."),
  Q("Dấu hai chấm trong câu “Mẹ mua nhiều loại quả: cam, quýt, bưởi.” dùng để làm gì?", "Báo hiệu phần liệt kê", ["Báo hiệu lời nói của nhân vật", "Đánh dấu phần chú thích", "Nối các từ ngữ trong một liên danh"], "Sau dấu hai chấm là các loại quả được kể ra."),
  Q("Trong câu: Bác Hồ dạy: “Không có việc gì khó, chỉ sợ lòng không bền.” Dấu ngoặc kép dùng để làm gì?", "Đánh dấu lời nói trực tiếp", ["Đánh dấu phần chú thích", "Báo hiệu phần liệt kê", "Nối các từ ngữ trong một liên danh"], "Phần trong ngoặc kép là lời Bác Hồ dạy."),
  Q("Trong đoạn hội thoại “– Cháu chào ông ạ! – Ừ, cháu ngoan quá!”, dấu gạch ngang dùng để làm gì?", "Đánh dấu lời nói của nhân vật", ["Đánh dấu phần chú thích, giải thích", "Nối các từ ngữ trong một liên danh", "Đánh dấu các ý được liệt kê"], "Mỗi lượt lời của nhân vật bắt đầu bằng dấu gạch ngang."),
  Q("Dấu gạch ngang trong câu “Trận đấu Việt Nam – Thái Lan diễn ra rất hấp dẫn.” dùng để làm gì?", "Nối các từ ngữ trong một liên danh", ["Đánh dấu phần chú thích, giải thích", "Đánh dấu lời nói của nhân vật", "Đánh dấu các ý được liệt kê"], "Dấu gạch ngang nối tên hai đội bóng của trận đấu."),
  Q("Dấu gạch ngang trong câu “Hà Nội – thủ đô của nước Việt Nam – có nhiều di tích lịch sử.” dùng để làm gì?", "Đánh dấu phần chú thích, giải thích", ["Đánh dấu lời nói của nhân vật", "Nối các từ ngữ trong một liên danh", "Đánh dấu các ý được liệt kê"], "“thủ đô của nước Việt Nam” giải thích thêm về Hà Nội."),
  Q("Trong câu: Cô giáo nói: “Các em hãy giữ gìn vệ sinh chung.” Dấu hai chấm dùng để làm gì?", "Báo hiệu lời nói của nhân vật", ["Báo hiệu phần liệt kê", "Đánh dấu phần chú thích", "Nối các từ ngữ trong một liên danh"], "Sau dấu hai chấm là lời cô giáo nói."),
  Q("Dấu hai chấm trong câu “Bố dặn em hai điều: học bài đầy đủ và giúp mẹ việc nhà.” dùng để làm gì?", "Báo hiệu phần liệt kê", ["Báo hiệu lời nói của nhân vật", "Đánh dấu phần chú thích", "Nối các từ ngữ trong một liên danh"], "Sau dấu hai chấm là hai điều bố dặn được kể ra."),
  Q("Trong câu: Bạn bè gọi Nam là “cây hài” của lớp. Dấu ngoặc kép dùng để làm gì?", "Đánh dấu từ ngữ được dùng với ý nghĩa đặc biệt", ["Đánh dấu lời nói trực tiếp", "Báo hiệu phần liệt kê", "Nối các từ ngữ trong một liên danh"], "“cây hài” là cách gọi vui, có ý nghĩa đặc biệt."),
  Q("Dấu gạch ngang trong câu “Tô Hoài – tác giả truyện Dế Mèn phiêu lưu kí – sinh ra ở Hà Nội.” dùng để làm gì?", "Đánh dấu phần chú thích, giải thích", ["Đánh dấu lời nói của nhân vật", "Nối các từ ngữ trong một liên danh", "Đánh dấu các ý được liệt kê"], "“tác giả truyện Dế Mèn phiêu lưu kí” giải thích thêm về nhà văn Tô Hoài."),
  Q("Dấu gạch ngang trong câu “Cuộc thi chạy Hà Nội – Hải Phòng thu hút nhiều vận động viên.” dùng để làm gì?", "Nối các từ ngữ trong một liên danh", ["Đánh dấu phần chú thích, giải thích", "Đánh dấu lời nói của nhân vật", "Đánh dấu các ý được liệt kê"], "Dấu gạch ngang nối điểm đầu và điểm cuối của cuộc thi chạy."),
  Q("Dấu hai chấm trong câu “Em thích nhiều môn học: Toán, Tiếng Việt, Khoa học.” dùng để làm gì?", "Báo hiệu phần liệt kê", ["Báo hiệu lời nói của nhân vật", "Đánh dấu phần chú thích", "Nối các từ ngữ trong một liên danh"], "Sau dấu hai chấm là các môn học được kể ra."),
  Q("Trong câu: Bạn Hà hỏi: “Cậu đã làm xong bài chưa?” Dấu ngoặc kép dùng để làm gì?", "Đánh dấu lời nói trực tiếp", ["Đánh dấu phần chú thích", "Báo hiệu phần liệt kê", "Nối các từ ngữ trong một liên danh"], "Phần trong ngoặc kép là câu bạn Hà hỏi."),
  Q("Trong câu: Em đã đọc xong truyện “Dế Mèn phiêu lưu kí”. Dấu ngoặc kép dùng để làm gì?", "Đánh dấu tên tác phẩm", ["Đánh dấu lời nói trực tiếp", "Đánh dấu phần chú thích", "Báo hiệu phần liệt kê"], "“Dế Mèn phiêu lưu kí” là tên một tác phẩm."),
];
