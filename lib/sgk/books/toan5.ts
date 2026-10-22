// lib/sgk/books/toan5.ts — Toán 5, sách Kết nối tri thức với cuộc sống: 12 chủ đề, 75 bài.
// Tên chủ đề, tên bài chép đúng mục lục sách. Đối chiếu từng bài:
// .claude/ai-context/feature-specs/toan-kntt.md.

import type { Draft } from "../../mathGen/core";
import { LOP4, LOP5, KNTT4, KNTT5 } from "../../mathGen";
import { chia4, cong6, hinhNhanDang, tru6 } from "../../exam5/toan1to4";
import {
  bieuDoQuat, hieuTi, hinhHopHinh, hinhThangHinh, hinhTronHinh, phanTramBai, tamGiacHinh, tamGiacVuong, tongTi,
} from "../../exam5/toan5";
import { type SgkBook, type SgkTopic, has, only, tagged } from "../types";

const all = (...ps: ((d: Draft) => boolean)[]) => (d: Draft) => ps.every((p) => p(d));
const not = (p: (d: Draft) => boolean) => (d: Draft) => !p(d);

/** Cộng, trừ hai phân số khác mẫu số (bài 6). */
const khacMau = (d: Draft) => { const m = d.question.match(/^\d+\/(\d+) [+-] \d+\/(\d+)/); return !!m && m[1] !== m[2]; };
/** Đổi đơn vị ra số thập phân (bài 12): đáp án có dấu phẩy, không phải thể tích. */
const raSTP = (d: Draft) => d.type === "fill_blank" && d.answers[0].includes(",") && !/m³/.test(d.question);
const nhan10 = has(/× (10|100|1\.000|0,1|0,01|0,001) = ___$/);
const chia10 = has(/: (10|100|1\.000) = ___$/);
const hop = tagged("hình hộp chữ nhật"), lapPhuong = tagged("hình lập phương"), theTich = tagged("thể tích"), dienTich = tagged("diện tích");

const topics: SgkTopic[] = [
  { so: 1, tap: 1, ten: "Ôn tập và bổ sung", bai: [
    { so: 1, ten: "Ôn tập số tự nhiên", mix: [[LOP4.hangLop, 3], [LOP4.giaTriChuSo, 2], [LOP4.soSanhSoLon, 3], [LOP4.lamTron, 2]] },
    { so: 2, ten: "Ôn tập các phép tính với số tự nhiên", mix: [[cong6, 2], [tru6, 2], [LOP4.nhanSoLon, 3], [chia4, 3]] },
    { so: 3, ten: "Ôn tập phân số", mix: [[LOP4.rutGonPhanSo, 3], [LOP4.phanSoBangNhau, 2], [LOP4.soSanhPhanSo, 3], [KNTT4.quyDong, 2]] },
    { so: 4, ten: "Phân số thập phân", mix: [[LOP5.phanSoThapPhan, 6], [KNTT5.phanSoTP, 4]] },
    { so: 5, ten: "Ôn tập các phép tính với phân số", mix: [[LOP4.congTruPhanSo, 5], [LOP4.nhanChiaPhanSo, 5]] },
    { so: 6, ten: "Cộng, trừ hai phân số khác mẫu số", mix: [[only(LOP4.congTruPhanSo, khacMau), 10]] },
    { so: 7, ten: "Hỗn số", mix: [[LOP5.honSo, 10]] },
    { so: 8, ten: "Ôn tập hình học và đo lường", mix: [[LOP4.doiKhoiLuong, 3], [LOP4.doiDienTich, 3], [hinhNhanDang, 1], [KNTT4.hbhThoi, 3]] },
    { so: 9, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 2, tap: 1, ten: "Số thập phân", bai: [
    { so: 10, ten: "Khái niệm số thập phân", mix: [[LOP5.hangSoThapPhan, 3], [LOP5.phanSoSangSTP, 4], [KNTT5.vietSTP, 3]] },
    { so: 11, ten: "So sánh các số thập phân", mix: [[LOP5.soSanhSTP, 6], [LOP5.sapXepSTP, 2], [only(LOP5.dungSai5, tagged("so sánh số thập phân")), 2]] },
    { so: 12, ten: "Viết số đo đại lượng dưới dạng số thập phân", mix: [[only(LOP5.doiDonVi, raSTP), 10]] },
    { so: 13, ten: "Làm tròn số thập phân", mix: [[KNTT5.lamTronSTP, 10]] },
    { so: 14, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 3, tap: 1, ten: "Một số đơn vị đo diện tích", bai: [
    { so: 15, ten: "Ki-lô-mét vuông. Héc-ta", mix: [[KNTT5.kmHa, 10]] },
    { so: 16, ten: "Các đơn vị đo diện tích", mix: [[only(LOP5.doiDonVi, tagged("diện tích")), 7], [LOP4.doiDienTich, 3]] },
    { so: 17, ten: "Thực hành và trải nghiệm với một số đơn vị đo đại lượng", thucHanh: true },
    { so: 18, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 4, tap: 1, ten: "Các phép tính với số thập phân", bai: [
    { so: 19, ten: "Phép cộng số thập phân", mix: [[only(LOP5.congTruSTP, tagged("phép cộng")), 10]] },
    { so: 20, ten: "Phép trừ số thập phân", mix: [[only(LOP5.congTruSTP, tagged("phép trừ")), 10]] },
    { so: 21, ten: "Phép nhân số thập phân", mix: [[only(LOP5.nhanSTP, not(nhan10)), 10]] },
    { so: 22, ten: "Phép chia số thập phân", mix: [[only(LOP5.chiaSTP, not(chia10)), 10]] },
    { so: 23, ten: "Nhân, chia số thập phân với 10; 100; 1 000; … hoặc với 0,1; 0,01; 0,001; …", mix: [[only(LOP5.nhanSTP, nhan10), 5], [only(LOP5.chiaSTP, chia10), 5]] },
    { so: 24, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 5, tap: 1, ten: "Một số hình phẳng. Chu vi và diện tích", bai: [
    { so: 25, ten: "Hình tam giác. Diện tích hình tam giác", mix: [[tamGiacHinh, 4], [tamGiacVuong, 2], [only(LOP5.dienTichHinh, tagged("hình tam giác")), 4]] },
    { so: 26, ten: "Hình thang. Diện tích hình thang", mix: [[hinhThangHinh, 5], [only(LOP5.dienTichHinh, tagged("hình thang")), 5]] },
    { so: 27, ten: "Đường tròn. Chu vi và diện tích hình tròn", mix: [[hinhTronHinh, 4], [only(LOP5.dienTichHinh, tagged("hình tròn")), 6]] },
    { so: 28, ten: "Thực hành và trải nghiệm đo, vẽ, lắp ghép, tạo hình", thucHanh: true },
    { so: 29, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 6, tap: 1, ten: "Ôn tập học kì 1", bai: [
    { so: 30, ten: "Ôn tập số thập phân", luyen: true, tron: [10, 11, 12, 13] },
    { so: 31, ten: "Ôn tập các phép tính với số thập phân", luyen: true, tron: [19, 20, 21, 22, 23] },
    { so: 32, ten: "Ôn tập một số hình phẳng", luyen: true, tron: [8, 25, 26, 27] },
    { so: 33, ten: "Ôn tập diện tích, chu vi một số hình phẳng", luyen: true, tron: [16, 25, 26, 27] },
    { so: 34, ten: "Ôn tập đo lường", luyen: true, tron: [12, 15, 16] },
    { so: 35, ten: "Ôn tập chung", luyen: true, tron: [4, 7, 11, 13, 16, 21, 22, 25, 26, 27] },
  ] },
  { so: 7, tap: 2, ten: "Tỉ số và các bài toán liên quan", bai: [
    { so: 36, ten: "Tỉ số. Tỉ số phần trăm", mix: [[KNTT5.tiSo, 10]] },
    { so: 37, ten: "Tỉ lệ bản đồ và ứng dụng", mix: [[KNTT5.tiLeBanDo, 10]] },
    { so: 38, ten: "Tìm hai số khi biết tổng và tỉ số của hai số đó", mix: [[tongTi, 10]] },
    { so: 39, ten: "Tìm hai số khi biết hiệu và tỉ số của hai số đó", mix: [[hieuTi, 10]] },
    { so: 40, ten: "Tìm tỉ số phần trăm của hai số", mix: [[only(LOP5.tiSoPhanTram, has(/Tỉ số phần trăm của|chiếm/)), 10]] },
    { so: 41, ten: "Tìm giá trị phần trăm của một số", mix: [[only(LOP5.tiSoPhanTram, tagged("tìm giá trị phần trăm")), 5], [KNTT5.phanTramLoiVan, 3], [phanTramBai, 2]] },
    { so: 42, ten: "Máy tính cầm tay", thucHanh: true },
    { so: 43, ten: "Thực hành và trải nghiệm sử dụng máy tính cầm tay", thucHanh: true },
    { so: 44, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 8, tap: 2, ten: "Thể tích. Đơn vị đo thể tích", bai: [
    { so: 45, ten: "Thể tích của một hình", mix: [[KNTT5.theTichHinh, 10]] },
    { so: 46, ten: "Xăng-ti-mét khối. Đề-xi-mét khối", mix: [[only(LOP5.doiDonVi, has(/cm³/)), 6], [KNTT5.theTichHinh, 4]] },
    { so: 47, ten: "Mét khối", mix: [[only(LOP5.doiDonVi, has(/(^|\s)m³/)), 5], [KNTT5.donViTheTich, 5]] },
    { so: 48, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 9, tap: 2, ten: "Diện tích và thể tích của một số hình khối", bai: [
    { so: 49, ten: "Hình khai triển của hình lập phương, hình hộp chữ nhật và hình trụ", mix: [[KNTT5.khaiTrien, 10]] },
    { so: 50, ten: "Diện tích xung quanh và diện tích toàn phần của hình hộp chữ nhật", mix: [[only(LOP5.theTich, all(hop, dienTich)), 7], [only(hinhHopHinh, all(hop, dienTich)), 3]] },
    { so: 51, ten: "Diện tích xung quanh và diện tích toàn phần của hình lập phương", mix: [[only(LOP5.theTich, all(lapPhuong, dienTich)), 7], [only(hinhHopHinh, all(lapPhuong, dienTich)), 3]] },
    { so: 52, ten: "Thể tích của hình hộp chữ nhật", mix: [[only(LOP5.theTich, all(hop, theTich)), 7], [only(hinhHopHinh, all(hop, theTich)), 3]] },
    { so: 53, ten: "Thể tích của hình lập phương", mix: [[only(LOP5.theTich, all(lapPhuong, theTich)), 7], [only(hinhHopHinh, all(lapPhuong, theTich)), 3]] },
    { so: 54, ten: "Thực hành tính toán và ước lượng thể tích một số hình khối", thucHanh: true },
    { so: 55, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 10, tap: 2, ten: "Số đo thời gian. Vận tốc. Các bài toán liên quan đến chuyển động đều", bai: [
    { so: 56, ten: "Các đơn vị đo thời gian", mix: [[only(LOP5.thoiGian, has(/= ___/)), 6], [LOP4.thoiGian4, 4]] },
    { so: 57, ten: "Cộng, trừ số đo thời gian", mix: [[only(LOP5.thoiGian, has(/phút [+-] \d/)), 10]] },
    { so: 58, ten: "Nhân, chia số đo thời gian với một số", mix: [[only(LOP5.thoiGian, has(/×/)), 5], [KNTT5.chiaThoiGian, 5]] },
    { so: 59, ten: "Vận tốc của một chuyển động đều", mix: [[only(LOP5.chuyenDong, tagged("vận tốc")), 10]] },
    { so: 60, ten: "Quãng đường, thời gian của một chuyển động đều", mix: [[only(LOP5.chuyenDong, not(tagged("vận tốc"))), 10]] },
    { so: 61, ten: "Thực hành tính toán và ước lượng về vận tốc, quãng đường, thời gian trong chuyển động đều", thucHanh: true },
    { so: 62, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 11, tap: 2, ten: "Một số yếu tố thống kê và xác suất", bai: [
    { so: 63, ten: "Thu thập, phân loại, sắp xếp các số liệu", mix: [[KNTT5.soLieu5, 10]] },
    { so: 64, ten: "Biểu đồ hình quạt tròn", mix: [[bieuDoQuat, 10]] },
    { so: 65, ten: "Tỉ số của số lần lặp lại một sự kiện so với tổng số lần thực hiện", mix: [[KNTT5.tiSoLanLap, 10]] },
    { so: 66, ten: "Thực hành và trải nghiệm thu thập, phân tích, biểu diễn các số liệu thống kê", thucHanh: true },
    { so: 67, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 12, tap: 2, ten: "Ôn tập cuối năm", bai: [
    { so: 68, ten: "Ôn tập số tự nhiên, phân số, số thập phân", luyen: true, tron: [1, 3, 4, 7, 10, 11, 13] },
    { so: 69, ten: "Ôn tập các phép tính với số tự nhiên, phân số, số thập phân", luyen: true, tron: [2, 5, 6, 19, 20, 21, 22, 23] },
    { so: 70, ten: "Ôn tập tỉ số, tỉ số phần trăm", luyen: true, tron: [36, 38, 39, 40, 41] },
    { so: 71, ten: "Ôn tập hình học", luyen: true, tron: [25, 26, 27, 49, 50, 51, 52, 53] },
    { so: 72, ten: "Ôn tập đo lường", luyen: true, tron: [12, 16, 46, 47, 56, 57] },
    { so: 73, ten: "Ôn tập toán chuyển động đều", luyen: true, tron: [59, 60] },
    { so: 74, ten: "Ôn tập một số yếu tố thống kê và xác suất", luyen: true, tron: [63, 64, 65] },
    { so: 75, ten: "Ôn tập chung", luyen: true, tron: [6, 11, 22, 26, 27, 38, 40, 41, 52, 57, 59, 64] },
  ] },
];

export const TOAN5: SgkBook = {
  id: "kntt-toan-5", subject: "Toán", slug: "toan", grade: 5, book: "Kết nối tri thức với cuộc sống",
  source: "Mục lục đối chiếu với kế hoạch dạy học Toán 5 Kết nối tri thức trên HoaTieu.vn (10/2026).",
  topics,
};
