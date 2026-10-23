// lib/sgk/books/toan3.ts — Toán 3, sách Kết nối tri thức với cuộc sống: 16 chủ đề, 81 bài.
// Tên chủ đề, tên bài chép đúng mục lục sách. Mỗi bài trỏ tới các dạng câu tự sinh
// (`mix`, cùng generator với lib/mathGen) hoặc trộn câu của các bài khác (`tron`). Bài
// chưa có dạng câu nào để trống `mix` → trang bài hiện "Đang soạn".
// Đối chiếu từng bài: .claude/ai-context/feature-specs/toan-kntt.md.

import { LOP2, LOP3, KNTT3 } from "../../mathGen";
import { demTamGiac, demTuGiac, doDaiThuoc, duongGapKhuc, hinhCN, hinhTron3, tienHinh, xemGio } from "../../exam5/toan1to4";
import { type SgkBook, type SgkTopic, has, only, tagged } from "../types";

const bang = (k: number) => tagged(`bảng ${k}`);
/** Lời văn một bước của bảng nhân k (dòng phép tính của "Bài giải" là "k × …" hoặc "… : k = …"). */
const loiVanBang = (k: number) => (d: { explanation: string }) => new RegExp(`(^|: )${k} × |: ${k} = `, "m").test(d.explanation);

// Nhân, chia với số có một chữ số tách theo số chữ số của thừa số / số bị chia.
const nhan3 = only(LOP3.nhanChiaMotChuSo, has(/^\d{3} × \d = ___$/));
const chia3 = only(LOP3.nhanChiaMotChuSo, has(/^\d{3} : \d = /));
const gap = only(LOP3.gapGiam, has(/^Gấp /));
const giam = only(LOP3.gapGiam, has(/^Giảm /));
const loiVanGap = only(LOP3.loiVanGapGiam, tagged("gấp một số lên nhiều lần"));
const loiVanGiam = only(LOP3.loiVanGapGiam, tagged("giảm một số đi nhiều lần"));
const doi = (unit: RegExp) => only(LOP3.doiDonVi3, has(unit));
const op5 = (re: RegExp) => only(LOP3.phepTinh100000, has(re));

const bangMix = (k: number, nhan: typeof LOP3.bangNhanChia34, tim: typeof LOP3.timThuaSo34,
  dungSai: typeof LOP3.dungSai34, loiVan: typeof LOP3.loiVan34): SgkTopic["bai"][number]["mix"] => [
  [only(nhan, bang(k)), 5], [only(tim, bang(k)), 1], [only(dungSai, bang(k)), 1], [only(loiVan, loiVanBang(k)), 3],
];

const topics: SgkTopic[] = [
  { so: 1, tap: 1, ten: "Ôn tập và bổ sung", bai: [
    { so: 1, ten: "Ôn tập các số đến 1000", mix: [[LOP2.tramChucDonVi, 5], [LOP2.soSanh1000, 3], [LOP2.sapXep1000, 2]] },
    { so: 2, ten: "Ôn tập phép cộng, phép trừ trong phạm vi 1000", mix: [[LOP2.congTru1000, 7], [LOP2.nhieuHonItHon, 3]] },
    { so: 3, ten: "Tìm thành phần trong phép cộng, phép trừ", mix: [[LOP2.thanhPhanPhepTinh, 10]] },
    { so: 4, ten: "Ôn tập bảng nhân 2; 5, bảng chia 2; 5", mix: [[LOP2.bangNhanChia, 7], [LOP2.nhanChiaLoiVan, 3]] },
    { so: 5, ten: "Bảng nhân 3, bảng chia 3", mix: bangMix(3, LOP3.bangNhanChia34, LOP3.timThuaSo34, LOP3.dungSai34, LOP3.loiVan34) },
    { so: 6, ten: "Bảng nhân 4, bảng chia 4", mix: bangMix(4, LOP3.bangNhanChia34, LOP3.timThuaSo34, LOP3.dungSai34, LOP3.loiVan34) },
    { so: 7, ten: "Ôn tập hình học và đo lường", mix: [[duongGapKhuc(false), 3], [doDaiThuoc, 2], [LOP2.donViDo2, 3], [LOP2.xemGio, 2]] },
    { so: 8, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 2, tap: 1, ten: "Bảng nhân, bảng chia", bai: [
    { so: 9, ten: "Bảng nhân 6, bảng chia 6", mix: bangMix(6, LOP3.bangNhanChia67, LOP3.timThuaSo67, LOP3.dungSai3, LOP3.loiVan67) },
    { so: 10, ten: "Bảng nhân 7, bảng chia 7", mix: bangMix(7, LOP3.bangNhanChia67, LOP3.timThuaSo67, LOP3.dungSai3, LOP3.loiVan67) },
    { so: 11, ten: "Bảng nhân 8, bảng chia 8", mix: bangMix(8, LOP3.bangNhanChia89, LOP3.timThuaSo89, LOP3.dungSai89, LOP3.loiVan89) },
    { so: 12, ten: "Bảng nhân 9, bảng chia 9", mix: bangMix(9, LOP3.bangNhanChia89, LOP3.timThuaSo89, LOP3.dungSai89, LOP3.loiVan89) },
    { so: 13, ten: "Tìm thành phần trong phép nhân, phép chia", mix: [[LOP3.timThanhPhanNhanChia, 10]] },
    { so: 14, ten: "Một phần mấy", mix: [[LOP3.motPhanMay, 10]] },
    { so: 15, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 3, tap: 1, ten: "Làm quen với hình phẳng, hình khối", bai: [
    { so: 16, ten: "Điểm ở giữa, trung điểm của đoạn thẳng", mix: [[KNTT3.diemOGiua, 4], [KNTT3.trungDiem, 6]] },
    { so: 17, ten: "Hình tròn. Tâm, bán kính, đường kính của hình tròn", mix: [[KNTT3.banKinhDuongKinh, 6], [hinhTron3, 4]] },
    { so: 18, ten: "Góc, góc vuông, góc không vuông", mix: [[KNTT3.gocVuong, 10]] },
    { so: 19, ten: "Hình tam giác, hình tứ giác. Hình chữ nhật, hình vuông", mix: [[KNTT3.hinhPhang3, 7], [demTamGiac([1, 2], false), 2], [demTuGiac([1, 2], "hình chữ nhật", false), 1]] },
    { so: 20, ten: "Thực hành vẽ góc vuông, vẽ đường tròn, hình vuông, hình chữ nhật và vẽ trang trí", thucHanh: true },
    { so: 21, ten: "Khối lập phương, khối hộp chữ nhật", mix: [[KNTT3.khoiHop, 10]] },
    { so: 22, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 4, tap: 1, ten: "Phép nhân, phép chia trong phạm vi 100", bai: [
    { so: 23, ten: "Nhân số có hai chữ số với số có một chữ số", mix: [[KNTT3.nhan2ChuSo, 8], [KNTT3.lvNhan2, 2]] },
    { so: 24, ten: "Gấp một số lên một số lần", mix: [[gap, 6], [loiVanGap, 4]] },
    { so: 25, ten: "Phép chia hết, phép chia có dư", mix: [[KNTT3.chiaHetCoDu, 8], [KNTT3.lvChiaDu, 2]] },
    { so: 26, ten: "Chia số có hai chữ số cho số có một chữ số", mix: [[KNTT3.chia2ChuSo, 8], [KNTT3.lvChia2, 2]] },
    { so: 27, ten: "Giảm một số đi một số lần", mix: [[giam, 6], [loiVanGiam, 4]] },
    { so: 28, ten: "Bài toán giải bằng hai bước tính", mix: [[KNTT3.haiBuocTinh, 10]] },
    { so: 29, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 5, tap: 1, ten: "Một số đơn vị đo độ dài, khối lượng, dung tích, nhiệt độ", bai: [
    { so: 30, ten: "Mi-li-mét", mix: [[doi(/ mm$/), 8], [KNTT3.lvMm, 2]] },
    { so: 31, ten: "Gam", mix: [[doi(/ g$/), 8], [KNTT3.lvGam, 2]] },
    { so: 32, ten: "Mi-li-lít", mix: [[doi(/ ml$/), 8], [KNTT3.lvMl, 2]] },
    { so: 33, ten: "Nhiệt độ. Đơn vị đo nhiệt độ", mix: [[KNTT3.nhietDo, 10]] },
    { so: 34, ten: "Thực hành và trải nghiệm với các đơn vị mi-li-mét, gam, mi-li-lít, độ C", thucHanh: true },
    { so: 35, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 6, tap: 1, ten: "Phép nhân, phép chia trong phạm vi 1000", bai: [
    { so: 36, ten: "Nhân số có ba chữ số với số có một chữ số", mix: [[nhan3, 8], [KNTT3.lvNhan3, 2]] },
    { so: 37, ten: "Chia số có ba chữ số cho số có một chữ số", mix: [[chia3, 8], [KNTT3.lvChia3, 2]] },
    { so: 38, ten: "Biểu thức số. Tính giá trị của biểu thức số", mix: [[LOP3.bieuThuc3, 10]] },
    { so: 39, ten: "So sánh số lớn gấp mấy lần số bé", mix: [[KNTT3.soLonGapMayLan, 10]] },
    { so: 40, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 7, tap: 1, ten: "Ôn tập học kì 1", bai: [
    { so: 41, ten: "Ôn tập phép nhân, phép chia trong phạm vi 100, 1000", luyen: true, tron: [23, 24, 25, 26, 27, 36, 37, 39] },
    { so: 42, ten: "Ôn tập biểu thức số", luyen: true, tron: [38] },
    { so: 43, ten: "Ôn tập hình học và đo lường", luyen: true, tron: [16, 17, 18, 19, 21, 30, 31, 32, 33] },
    { so: 44, ten: "Ôn tập chung", luyen: true, tron: [5, 6, 9, 10, 11, 12, 13, 14, 23, 26, 36, 37, 38, 39] },
  ] },
  { so: 8, tap: 2, ten: "Các số đến 10 000", bai: [
    { so: 45, ten: "Các số có bốn chữ số. Số 10 000", mix: [[KNTT3.so4ChuSo, 10]] },
    { so: 46, ten: "So sánh các số trong phạm vi 10 000", mix: [[KNTT3.soSanh10000, 7], [KNTT3.sapXep10000, 3]] },
    { so: 47, ten: "Làm quen với chữ số La Mã", mix: [[LOP3.soLaMa, 10]] },
    { so: 48, ten: "Làm tròn số đến hàng chục, hàng trăm", mix: [[only(LOP3.lamTron3, has(/đến hàng (chục|trăm) thì/)), 10]] },
    { so: 49, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 9, tap: 2, ten: "Chu vi, diện tích một số hình phẳng", bai: [
    { so: 50, ten: "Chu vi hình tam giác, hình tứ giác, hình chữ nhật, hình vuông", mix: [[KNTT3.chuViDaGiac, 4], [hinhCN("chuVi"), 3], [only(LOP3.chuViDienTich, has(/Chu vi/)), 1], [KNTT3.lvChuVi3, 2]] },
    { so: 51, ten: "Diện tích của một hình. Xăng-ti-mét vuông", mix: [[KNTT3.dienTichO, 10]] },
    { so: 52, ten: "Diện tích hình chữ nhật, diện tích hình vuông", mix: [[only(LOP3.chuViDienTich, has(/Diện tích/)), 8], [KNTT3.lvDienTich3, 2]] },
    { so: 53, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 10, tap: 2, ten: "Cộng, trừ, nhân, chia trong phạm vi 10 000", bai: [
    { so: 54, ten: "Phép cộng trong phạm vi 10 000", mix: [[KNTT3.cong10000, 8], [KNTT3.lvCong4, 2]] },
    { so: 55, ten: "Phép trừ trong phạm vi 10 000", mix: [[KNTT3.tru10000, 8], [KNTT3.lvTru4, 2]] },
    { so: 56, ten: "Nhân số có bốn chữ số với số có một chữ số", mix: [[KNTT3.nhan10000, 8], [KNTT3.lvNhan4, 2]] },
    { so: 57, ten: "Chia số có bốn chữ số cho số có một chữ số", mix: [[KNTT3.chia10000, 8], [KNTT3.lvChia4, 2]] },
    { so: 58, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 11, tap: 2, ten: "Các số đến 100 000", bai: [
    { so: 59, ten: "Các số có năm chữ số. Số 100 000", mix: [[LOP3.cauTaoSo, 6], [LOP3.giaTriChuSo3, 4]] },
    { so: 60, ten: "So sánh các số trong phạm vi 100 000", mix: [[LOP3.soSanh100000, 7], [LOP3.sapXep100000, 3]] },
    { so: 61, ten: "Làm tròn số đến hàng nghìn, hàng chục nghìn", mix: [[only(LOP3.lamTron3, has(/đến hàng (nghìn|chục nghìn) thì/)), 10]] },
    { so: 62, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 12, tap: 2, ten: "Cộng, trừ trong phạm vi 100 000", bai: [
    { so: 63, ten: "Phép cộng trong phạm vi 100 000", mix: [[op5(/^[\d.]+ \+ /), 8], [KNTT3.lvCong5, 2]] },
    { so: 64, ten: "Phép trừ trong phạm vi 100 000", mix: [[op5(/^[\d.]+ - /), 8], [KNTT3.lvTru5, 2]] },
    { so: 65, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 13, tap: 2, ten: "Xem đồng hồ. Tháng – năm. Tiền Việt Nam", bai: [
    { so: 66, ten: "Xem đồng hồ. Tháng – năm", mix: [[xemGio([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]), 6], [LOP3.thangNam, 4]] },
    { so: 67, ten: "Thực hành xem đồng hồ, xem lịch", mix: [[KNTT3.xemLich, 7], [xemGio([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]), 3]] },
    { so: 68, ten: "Tiền Việt Nam", mix: [[tienHinh([1000, 2000, 5000, 10000, 20000, 50000], [3, 5]), 5], [LOP3.tienVN3, 5]] },
    { so: 69, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 14, tap: 2, ten: "Nhân, chia trong phạm vi 100 000", bai: [
    { so: 70, ten: "Nhân số có năm chữ số với số có một chữ số", mix: [[op5(/^[\d.]+ × /), 8], [KNTT3.lvNhan5, 2]] },
    { so: 71, ten: "Chia số có năm chữ số cho số có một chữ số", mix: [[op5(/^[\d.]+ : /), 8], [KNTT3.lvChia5, 2]] },
    { so: 72, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 15, tap: 2, ten: "Làm quen với yếu tố thống kê, xác suất", bai: [
    { so: 73, ten: "Thu thập, phân loại, ghi chép số liệu. Bảng số liệu", mix: [[KNTT3.bangSoLieu, 10]] },
    { so: 74, ten: "Khả năng xảy ra của một sự kiện", mix: [[KNTT3.khaNang, 10]] },
    { so: 75, ten: "Thực hành và trải nghiệm thu thập, phân loại, ghi chép số liệu, đọc bảng số liệu", thucHanh: true },
  ] },
  { so: 16, tap: 2, ten: "Ôn tập cuối năm", bai: [
    { so: 76, ten: "Ôn tập các số trong phạm vi 10 000, 100 000", luyen: true, tron: [45, 46, 47, 48, 59, 60, 61] },
    { so: 77, ten: "Ôn tập phép cộng, phép trừ trong phạm vi 100 000", luyen: true, tron: [54, 55, 63, 64] },
    { so: 78, ten: "Ôn tập phép nhân, phép chia trong phạm vi 100 000", luyen: true, tron: [56, 57, 70, 71] },
    { so: 79, ten: "Ôn tập hình học và đo lường", luyen: true, tron: [50, 51, 52, 66, 67, 68] },
    { so: 80, ten: "Ôn tập bảng số liệu, khả năng xảy ra của một sự kiện", luyen: true, tron: [73, 74] },
    { so: 81, ten: "Ôn tập chung", luyen: true, tron: [46, 48, 52, 54, 55, 56, 57, 60, 61, 63, 64, 66, 68, 70, 71] },
  ] },
];

export const TOAN3: SgkBook = {
  id: "kntt-toan-3", subject: "Toán", slug: "toan", grade: 3, book: "Kết nối tri thức với cuộc sống",
  source: "Mục lục đối chiếu với trang lý thuyết Toán 3 Kết nối tri thức của VietJack (10/2026).",
  topics,
};
