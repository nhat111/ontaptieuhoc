// lib/sgk/books/toan2.ts — Toán 2, sách Kết nối tri thức với cuộc sống: 14 chủ đề, 75 bài.
// Tên chủ đề, tên bài chép đúng mục lục sách. Đối chiếu từng bài:
// .claude/ai-context/feature-specs/toan-kntt.md.

import type { Generator } from "../../mathGen/core";
import { LOP1, LOP2, KNTT1, KNTT2, KNTT3 } from "../../mathGen";
import {
  daySo, demTuGiac, duongGapKhuc, nhomHinh, soDoCoNho, soLonNhat, soSanhPT20, tienHinh, timSoCoNho, xemGio,
} from "../../exam5/toan1to4";
import { type SgkBook, type SgkTopic, has, only, tagged } from "../types";

const cong20 = only(LOP2.congTru20, has(/\+/));
const tru20 = only(LOP2.congTru20, has(/ - /));
/** Bảng nhân / bảng chia k: phép tính trong bảng, đúng sai, bài toán. */
const bangNhan = (k: 2 | 5): [Generator, number][] => [
  [only(LOP2.bangNhanChia, (d) => d.tags.includes(`bảng ${k}`) && d.tags.includes("phép nhân")), 6],
  [only(LOP2.dungSai2, tagged(`bảng ${k}`)), 2],
  [only(LOP2.nhanChiaLoiVan, has(new RegExp(`Mỗi bạn có ${k} `))), 2],
];
const bangChia = (k: 2 | 5): [Generator, number][] => [
  [only(LOP2.bangNhanChia, (d) => d.tags.includes(`bảng ${k}`) && / : /.test(d.question)), 5],
  [k === 2 ? KNTT2.chia2 : KNTT2.chia5, 3],
  [only(LOP2.nhanChiaLoiVan, has(new RegExp(`cho ${k} bạn`))), 2],
];
const gio = xemGio([0, 15, 30]);

const topics: SgkTopic[] = [
  { so: 1, tap: 1, ten: "Ôn tập và bổ sung", bai: [
    { so: 1, ten: "Ôn tập các số đến 100", mix: [[LOP1.chucDonVi, 4], [LOP1.soSanh100, 3], [soLonNhat(10, 99), 2], [LOP1.sapXep100, 1]] },
    { so: 2, ten: "Tia số. Số liền trước, số liền sau", mix: [[KNTT2.tiaSo, 5], [LOP1.lienTruocSau, 5]] },
    { so: 3, ten: "Các thành phần của phép cộng, phép trừ", mix: [[KNTT2.tenCongTru, 5], [LOP2.thanhPhanPhepTinh, 5]] },
    { so: 4, ten: "Hơn kém nhau bao nhiêu", mix: [[KNTT2.honKem, 10]] },
    { so: 5, ten: "Ôn tập phép cộng, phép trừ (không nhớ) trong phạm vi 100", mix: [[KNTT1.cong22, 3], [KNTT1.tru22, 3], [KNTT1.cong21, 2], [KNTT1.tru21, 2]] },
    { so: 6, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 2, tap: 1, ten: "Phép cộng, phép trừ trong phạm vi 20", bai: [
    { so: 7, ten: "Phép cộng (qua 10) trong phạm vi 20", mix: [[cong20, 5], [only(timSoCoNho(20), has(/\+/)), 3], [only(KNTT2.them20, tagged("thêm")), 1], [only(KNTT2.nhieuIt20, tagged("nhiều hơn")), 1]] },
    { so: 8, ten: "Bảng cộng (qua 10)", mix: [[cong20, 6], [only(soSanhPT20, has(/\+/)), 4]] },
    { so: 9, ten: "Bài toán về thêm, bớt một số đơn vị", mix: [[KNTT2.them20, 10]] },
    { so: 10, ten: "Luyện tập chung", luyen: true },
    { so: 11, ten: "Phép trừ (qua 10) trong phạm vi 20", mix: [[tru20, 5], [only(timSoCoNho(20), has(/ - /)), 3], [only(KNTT2.them20, tagged("bớt")), 1], [only(KNTT2.nhieuIt20, tagged("ít hơn")), 1]] },
    { so: 12, ten: "Bảng trừ (qua 10)", mix: [[tru20, 6], [only(soSanhPT20, has(/ - /)), 4]] },
    { so: 13, ten: "Bài toán về nhiều hơn, ít hơn một số đơn vị", mix: [[KNTT2.nhieuIt20, 10]] },
    { so: 14, ten: "Luyện tập chung", luyen: true, tron: [11, 12, 13] },
  ] },
  { so: 3, tap: 1, ten: "Làm quen với khối lượng, dung tích", bai: [
    { so: 15, ten: "Ki-lô-gam", mix: [[KNTT2.kiLoGam, 10]] },
    { so: 16, ten: "Lít", mix: [[KNTT2.lit, 10]] },
    { so: 17, ten: "Thực hành và trải nghiệm với các đơn vị ki-lô-gam, lít", thucHanh: true },
    { so: 18, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 4, tap: 1, ten: "Phép cộng, phép trừ có nhớ trong phạm vi 100", bai: [
    { so: 19, ten: "Phép cộng (có nhớ) số có hai chữ số với số có một chữ số", mix: [[KNTT2.cong21, 10]] },
    { so: 20, ten: "Phép cộng (có nhớ) số có hai chữ số với số có hai chữ số", mix: [[KNTT2.cong22, 8], [only(soDoCoNho, has(/\+/)), 2]] },
    { so: 21, ten: "Luyện tập chung", luyen: true },
    { so: 22, ten: "Phép trừ (có nhớ) số có hai chữ số cho số có một chữ số", mix: [[KNTT2.tru21, 10]] },
    { so: 23, ten: "Phép trừ (có nhớ) số có hai chữ số cho số có hai chữ số", mix: [[KNTT2.tru22, 8], [only(soDoCoNho, has(/ - /)), 2]] },
    { so: 24, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 5, tap: 1, ten: "Làm quen với hình phẳng", bai: [
    { so: 25, ten: "Điểm, đoạn thẳng, đường thẳng, đường cong, ba điểm thẳng hàng", mix: [[KNTT2.doanThang, 10]] },
    { so: 26, ten: "Đường gấp khúc. Hình tứ giác", mix: [[duongGapKhuc(false), 3], [LOP2.duongGapKhuc, 3], [demTuGiac([1, 2], "hình tứ giác", false), 4]] },
    { so: 27, ten: "Thực hành gấp, cắt, ghép, xếp hình. Vẽ đoạn thẳng", thucHanh: true },
    { so: 28, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 6, tap: 1, ten: "Ngày – giờ, giờ – phút, ngày – tháng", bai: [
    { so: 29, ten: "Ngày – giờ, giờ – phút", mix: [[KNTT2.gioPhut, 6], [gio, 4]] },
    { so: 30, ten: "Ngày – tháng", mix: [[KNTT3.xemLich, 4], [KNTT2.ngayThang2, 4], [LOP2.ngayThang, 2]] },
    { so: 31, ten: "Thực hành và trải nghiệm xem đồng hồ, xem lịch", mix: [[gio, 4], [KNTT3.xemLich, 4], [LOP2.ngayTrongTuan, 2]] },
  ] },
  { so: 7, tap: 1, ten: "Ôn tập học kì 1", bai: [
    { so: 32, ten: "Luyện tập chung", luyen: true, tron: [29, 30, 31] },
    { so: 33, ten: "Ôn tập phép cộng, phép trừ trong phạm vi 20, 100", luyen: true, tron: [7, 8, 11, 12, 19, 20, 22, 23] },
    { so: 34, ten: "Ôn tập hình phẳng", luyen: true, tron: [25, 26] },
    { so: 35, ten: "Ôn tập đo lường", luyen: true, tron: [15, 16, 29, 30] },
    { so: 36, ten: "Ôn tập chung", luyen: true, tron: [4, 8, 9, 12, 13, 15, 16, 20, 23, 26, 29, 30] },
  ] },
  { so: 8, tap: 2, ten: "Phép nhân, phép chia", bai: [
    { so: 37, ten: "Phép nhân", mix: [[KNTT2.phepNhan, 7], [nhomHinh, 3]] },
    { so: 38, ten: "Thừa số, tích", mix: [[KNTT2.tenNhan, 10]] },
    { so: 39, ten: "Bảng nhân 2", mix: bangNhan(2) },
    { so: 40, ten: "Bảng nhân 5", mix: bangNhan(5) },
    { so: 41, ten: "Phép chia", mix: [[KNTT2.phepChia, 10]] },
    { so: 42, ten: "Số bị chia, số chia, thương", mix: [[KNTT2.tenChia, 10]] },
    { so: 43, ten: "Bảng chia 2", mix: bangChia(2) },
    { so: 44, ten: "Bảng chia 5", mix: bangChia(5) },
    { so: 45, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 9, tap: 2, ten: "Làm quen với hình khối", bai: [
    { so: 46, ten: "Khối trụ, khối cầu", mix: [[KNTT2.khoiTruCau, 7], [only(KNTT3.khoiHop, has(/khối gì|Đồ vật nào/)), 3]] },
    { so: 47, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 10, tap: 2, ten: "Các số trong phạm vi 1000", bai: [
    { so: 48, ten: "Đơn vị, chục, trăm, nghìn", mix: [[KNTT2.tramChucNghin, 10]] },
    { so: 49, ten: "Các số tròn trăm, tròn chục", mix: [[KNTT2.tronTramChuc, 10]] },
    { so: 50, ten: "So sánh các số tròn trăm, tròn chục", mix: [[KNTT2.soSanhTron, 10]] },
    { so: 51, ten: "Số có ba chữ số", mix: [[KNTT2.docViet3, 5], [only(LOP2.tramChucDonVi, has(/gồm/)), 5]] },
    { so: 52, ten: "Viết số thành tổng các trăm, chục, đơn vị", mix: [[KNTT2.vietTong, 7], [only(LOP2.tramChucDonVi, has(/ \+ /)), 3]] },
    { so: 53, ten: "So sánh các số có ba chữ số", mix: [[LOP2.soSanh1000, 5], [LOP2.sapXep1000, 2], [soLonNhat(100, 999), 3]] },
    { so: 54, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 11, tap: 2, ten: "Độ dài và đơn vị đo độ dài. Tiền Việt Nam", bai: [
    { so: 55, ten: "Đề-xi-mét. Mét. Ki-lô-mét", mix: [[KNTT2.donViDai, 5], [only(LOP2.donViDo2, has(/^\d+ \w+ = ___ \w+$/)), 3], [KNTT2.lvDoDai2, 2]] },
    { so: 56, ten: "Giới thiệu tiền Việt Nam", mix: [[tienHinh([100, 200, 500, 1000], [2, 4]), 4], [LOP2.tienVN, 4], [KNTT2.lvTien2, 2]] },
    { so: 57, ten: "Thực hành và trải nghiệm đo độ dài", thucHanh: true },
    { so: 58, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 12, tap: 2, ten: "Phép cộng, phép trừ trong phạm vi 1000", bai: [
    { so: 59, ten: "Phép cộng (không nhớ) trong phạm vi 1000", mix: [[KNTT2.cong1000, 10]] },
    { so: 60, ten: "Phép cộng (có nhớ) trong phạm vi 1000", mix: [[KNTT2.cong1000Nho, 10]] },
    { so: 61, ten: "Phép trừ (không nhớ) trong phạm vi 1000", mix: [[KNTT2.tru1000, 10]] },
    { so: 62, ten: "Phép trừ (có nhớ) trong phạm vi 1000", mix: [[KNTT2.tru1000Nho, 10]] },
    { so: 63, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 13, tap: 2, ten: "Làm quen với yếu tố thống kê, xác suất", bai: [
    { so: 64, ten: "Thu thập, phân loại, kiểm đếm số liệu", mix: [[KNTT2.kiemDem, 10]] },
    { so: 65, ten: "Biểu đồ tranh", mix: [[KNTT2.bieuDoTranh, 10]] },
    { so: 66, ten: "Chắc chắn, có thể, không thể", mix: [[KNTT3.khaNang, 10]] },
    { so: 67, ten: "Thực hành và trải nghiệm thu thập, phân loại, kiểm đếm số liệu", thucHanh: true },
  ] },
  { so: 14, tap: 2, ten: "Ôn tập cuối năm", bai: [
    { so: 68, ten: "Ôn tập các số trong phạm vi 1000", luyen: true, tron: [48, 49, 50, 51, 52, 53] },
    { so: 69, ten: "Ôn tập phép cộng, phép trừ trong phạm vi 100", luyen: true, tron: [7, 8, 11, 12, 19, 20, 22, 23] },
    { so: 70, ten: "Ôn tập phép cộng, phép trừ trong phạm vi 1000", luyen: true, tron: [59, 60, 61, 62] },
    { so: 71, ten: "Ôn tập phép nhân, phép chia", luyen: true, tron: [37, 38, 39, 40, 41, 42, 43, 44] },
    { so: 72, ten: "Ôn tập hình học", luyen: true, tron: [25, 26, 46] },
    { so: 73, ten: "Ôn tập đo lường", luyen: true, tron: [15, 16, 29, 30, 55, 56] },
    { so: 74, ten: "Ôn tập kiểm đếm số liệu và lựa chọn khả năng", luyen: true, tron: [64, 65, 66] },
    { so: 75, ten: "Ôn tập chung", luyen: true, tron: [12, 23, 29, 39, 40, 43, 44, 53, 55, 56, 60, 62] },
  ] },
];

export const TOAN2: SgkBook = {
  id: "kntt-toan-2", subject: "Toán", slug: "toan", grade: 2, book: "Kết nối tri thức với cuộc sống",
  source: "Mục lục đối chiếu với kế hoạch dạy học Toán 2 Kết nối tri thức trên HoaTieu.vn (10/2026).",
  topics,
};
