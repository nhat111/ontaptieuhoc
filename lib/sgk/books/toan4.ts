// lib/sgk/books/toan4.ts — Toán 4, sách Kết nối tri thức với cuộc sống: 13 chủ đề, 73 bài.
// Tên chủ đề, tên bài chép đúng mục lục sách. Đối chiếu từng bài:
// .claude/ai-context/feature-specs/toan-kntt.md.

import { LOP3, LOP4, KNTT4 } from "../../mathGen";
import {
  bieuDoCot, chia4, chiaDu4, cong6, gocHinh, hinhNhanDang, phanSoHinh, phanSoLoiVan, soLonNhat, tbcBai, tbcSo, thuanTienNhan, tru6,
} from "../../exam5/toan1to4";
import { type SgkBook, type SgkTopic, has, only, tagged } from "../types";

const nhan1 = only(LOP4.nhanSoLon, has(/^[\d.]+ × \d = ___$/));
const nhan2 = only(LOP4.nhanSoLon, tagged("nhân với số có hai chữ số"));
const chia1 = only(chia4, tagged("chia cho số có một chữ số"));
const chia2 = only(chia4, tagged("chia cho số có hai chữ số"));
const loiVanNhan = only(LOP4.loiVanNhanChia4, tagged("phép nhân"));
const loiVanChia = only(LOP4.loiVanNhanChia4, tagged("phép chia"));

const topics: SgkTopic[] = [
  { so: 1, tap: 1, ten: "Ôn tập và bổ sung", bai: [
    { so: 1, ten: "Ôn tập các số đến 100 000", mix: [[LOP3.cauTaoSo, 3], [LOP3.giaTriChuSo3, 2], [LOP3.soSanh100000, 3], [LOP3.lamTron3, 2]] },
    { so: 2, ten: "Ôn tập các phép tính trong phạm vi 100 000", mix: [[LOP3.phepTinh100000, 8], [LOP3.bieuThuc3, 2]] },
    { so: 3, ten: "Số chẵn, số lẻ", mix: [[KNTT4.chanLe, 10]] },
    { so: 4, ten: "Biểu thức chứa chữ", mix: [[KNTT4.bieuThucChu, 10]] },
    { so: 5, ten: "Giải bài toán có ba bước tính", mix: [[KNTT4.baBuoc, 10]] },
    { so: 6, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 2, tap: 1, ten: "Góc và đơn vị đo góc", bai: [
    { so: 7, ten: "Đo góc, đơn vị đo góc", mix: [[KNTT4.doGoc, 10]] },
    { so: 8, ten: "Góc nhọn, góc tù, góc bẹt", mix: [[gocHinh, 1], [KNTT4.loaiGoc, 6], [KNTT4.doGoc, 3]] },
    { so: 9, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 3, tap: 1, ten: "Số có nhiều chữ số", bai: [
    { so: 10, ten: "Số có sáu chữ số. Số 1 000 000", mix: [[KNTT4.docVietSo6, 10]] },
    { so: 11, ten: "Hàng và lớp", mix: [[LOP4.hangLop, 6], [LOP4.giaTriChuSo, 4]] },
    { so: 12, ten: "Các số trong phạm vi lớp triệu", mix: [[KNTT4.docVietSo9, 7], [LOP4.giaTriChuSo, 3]] },
    { so: 13, ten: "Làm tròn số đến hàng trăm nghìn", mix: [[LOP4.lamTron, 10]] },
    { so: 14, ten: "So sánh các số có nhiều chữ số", mix: [[LOP4.soSanhSoLon, 6], [LOP4.sapXepSoLon, 2], [soLonNhat(100000, 999999999), 2]] },
    { so: 15, ten: "Làm quen với dãy số tự nhiên", mix: [[KNTT4.daySoTN, 10]] },
    { so: 16, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 4, tap: 1, ten: "Một số đơn vị đo đại lượng", bai: [
    { so: 17, ten: "Yến, tạ, tấn", mix: [[LOP4.doiKhoiLuong, 10]] },
    { so: 18, ten: "Đề-xi-mét vuông, mét vuông, mi-li-mét vuông", mix: [[LOP4.doiDienTich, 10]] },
    { so: 19, ten: "Giây, thế kỉ", mix: [[LOP4.thoiGian4, 10]] },
    { so: 20, ten: "Thực hành và trải nghiệm sử dụng một số đơn vị đo đại lượng", thucHanh: true },
    { so: 21, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 5, tap: 1, ten: "Phép cộng và phép trừ", bai: [
    { so: 22, ten: "Phép cộng các số có nhiều chữ số", mix: [[cong6, 8], [only(LOP4.dungSai4, has(/\+/)), 2]] },
    { so: 23, ten: "Phép trừ các số có nhiều chữ số", mix: [[tru6, 8], [only(LOP4.dungSai4, has(/ - /)), 2]] },
    { so: 24, ten: "Tính chất giao hoán và kết hợp của phép cộng", mix: [[KNTT4.tinhChatCong, 5], [LOP4.tinhThuanTien, 5]] },
    { so: 25, ten: "Tìm hai số biết tổng và hiệu của hai số đó", mix: [[LOP4.tongHieu, 10]] },
    { so: 26, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 6, tap: 1, ten: "Đường thẳng vuông góc, đường thẳng song song", bai: [
    { so: 27, ten: "Hai đường thẳng vuông góc", mix: [[KNTT4.vuongGoc, 10]] },
    { so: 28, ten: "Thực hành và trải nghiệm vẽ hai đường thẳng vuông góc", thucHanh: true },
    { so: 29, ten: "Hai đường thẳng song song", mix: [[KNTT4.songSong, 10]] },
    { so: 30, ten: "Thực hành và trải nghiệm vẽ hai đường thẳng song song", thucHanh: true },
    { so: 31, ten: "Hình bình hành, hình thoi", mix: [[hinhNhanDang, 1], [KNTT4.hbhThoi, 9]] },
    { so: 32, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 7, tap: 1, ten: "Ôn tập học kì 1", bai: [
    { so: 33, ten: "Ôn tập các số đến lớp triệu", luyen: true, tron: [3, 10, 11, 12, 13, 14, 15] },
    { so: 34, ten: "Ôn tập phép cộng, phép trừ", luyen: true, tron: [22, 23, 24, 25] },
    { so: 35, ten: "Ôn tập hình học", luyen: true, tron: [7, 8, 27, 29, 31] },
    { so: 36, ten: "Ôn tập đo lường", luyen: true, tron: [17, 18, 19] },
    { so: 37, ten: "Ôn tập chung", luyen: true, tron: [4, 5, 8, 12, 14, 17, 18, 22, 23, 25, 31] },
  ] },
  { so: 8, tap: 2, ten: "Phép nhân, phép chia", bai: [
    { so: 38, ten: "Nhân với số có một chữ số", mix: [[nhan1, 8], [loiVanNhan, 2]] },
    { so: 39, ten: "Chia cho số có một chữ số", mix: [[chia1, 6], [chiaDu4, 2], [loiVanChia, 2]] },
    { so: 40, ten: "Tính chất giao hoán và kết hợp của phép nhân", mix: [[KNTT4.tinhChatNhan, 5], [only(thuanTienNhan, has(/× \d+ × /)), 5]] },
    { so: 41, ten: "Nhân, chia với 10, 100, 1 000, …", mix: [[LOP4.nhanChia10, 10]] },
    { so: 42, ten: "Tính chất phân phối của phép nhân đối với phép cộng", mix: [[KNTT4.phanPhoi, 5], [only(thuanTienNhan, (d) => !/× \d+ × /.test(d.question)), 5]] },
    { so: 43, ten: "Nhân với số có hai chữ số", mix: [[nhan2, 10]] },
    { so: 44, ten: "Chia cho số có hai chữ số", mix: [[chia2, 10]] },
    { so: 45, ten: "Thực hành và trải nghiệm ước lượng trong tính toán", thucHanh: true },
    { so: 46, ten: "Tìm số trung bình cộng", mix: [[tbcSo, 5], [tbcBai, 5]] },
    { so: 47, ten: "Bài toán liên quan đến rút về đơn vị", mix: [[KNTT4.rutVeDonVi, 10]] },
    { so: 48, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 9, tap: 2, ten: "Làm quen với yếu tố thống kê, xác suất", bai: [
    { so: 49, ten: "Dãy số liệu thống kê", mix: [[KNTT4.daySoLieu, 10]] },
    { so: 50, ten: "Biểu đồ cột", mix: [[bieuDoCot, 10]] },
    { so: 51, ten: "Số lần xuất hiện của một sự kiện", mix: [[KNTT4.soLanXuatHien, 10]] },
    { so: 52, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 10, tap: 2, ten: "Phân số", bai: [
    { so: 53, ten: "Khái niệm phân số", mix: [[phanSoHinh(false), 5], [KNTT4.docPhanSo, 5]] },
    { so: 54, ten: "Phân số và phép chia số tự nhiên", mix: [[KNTT4.thuongPhanSo, 10]] },
    { so: 55, ten: "Tính chất cơ bản của phân số", mix: [[KNTT4.tinhChatPS, 6], [LOP4.phanSoBangNhau, 4]] },
    { so: 56, ten: "Rút gọn phân số", mix: [[LOP4.rutGonPhanSo, 10]] },
    { so: 57, ten: "Quy đồng mẫu số các phân số", mix: [[KNTT4.quyDong, 10]] },
    { so: 58, ten: "So sánh phân số", mix: [[LOP4.soSanhPhanSo, 10]] },
    { so: 59, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 11, tap: 2, ten: "Phép cộng, phép trừ phân số", bai: [
    { so: 60, ten: "Phép cộng phân số", mix: [[only(LOP4.congTruPhanSo, tagged("cộng phân số")), 10]] },
    { so: 61, ten: "Phép trừ phân số", mix: [[only(LOP4.congTruPhanSo, tagged("trừ phân số")), 10]] },
    { so: 62, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 12, tap: 2, ten: "Phép nhân, phép chia phân số", bai: [
    { so: 63, ten: "Phép nhân phân số", mix: [[only(LOP4.nhanChiaPhanSo, tagged("nhân phân số")), 10]] },
    { so: 64, ten: "Phép chia phân số", mix: [[only(LOP4.nhanChiaPhanSo, tagged("chia phân số")), 10]] },
    { so: 65, ten: "Tìm phân số của một số", mix: [[KNTT4.phanSoCuaSo, 7], [phanSoLoiVan, 3]] },
    { so: 66, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 13, tap: 2, ten: "Ôn tập cuối năm", bai: [
    { so: 67, ten: "Ôn tập số tự nhiên", luyen: true, tron: [3, 10, 11, 12, 13, 14, 15] },
    { so: 68, ten: "Ôn tập phép tính với số tự nhiên", luyen: true, tron: [22, 23, 38, 39, 41, 43, 44, 46] },
    { so: 69, ten: "Ôn tập phân số", luyen: true, tron: [53, 54, 55, 56, 57, 58] },
    { so: 70, ten: "Ôn tập phép tính với phân số", luyen: true, tron: [60, 61, 63, 64, 65] },
    { so: 71, ten: "Ôn tập hình học và đo lường", luyen: true, tron: [7, 8, 17, 18, 19, 27, 29, 31] },
    { so: 72, ten: "Ôn tập một số yếu tố thống kê và xác suất", luyen: true, tron: [49, 50, 51] },
    { so: 73, ten: "Ôn tập chung", luyen: true, tron: [12, 14, 25, 31, 43, 44, 46, 47, 56, 58, 60, 63, 65] },
  ] },
];

export const TOAN4: SgkBook = {
  id: "kntt-toan-4", subject: "Toán", slug: "toan", grade: 4, book: "Kết nối tri thức với cuộc sống",
  source: "Mục lục đối chiếu với kế hoạch dạy học Toán 4 Kết nối tri thức trên HoaTieu.vn (10/2026).",
  topics,
};
