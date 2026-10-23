// lib/sgk/books/toan1.ts — Toán 1, sách Kết nối tri thức với cuộc sống: 10 chủ đề, 41 bài.
// Tên chủ đề, tên bài chép đúng mục lục sách. Đối chiếu từng bài:
// .claude/ai-context/feature-specs/toan-kntt.md.

import type { Draft } from "../../mathGen/core";
import { LOP1, KNTT1, KNTT3 } from "../../mathGen";
import { soSanhSo } from "../../mathGen/shared";
import { daySo, demHinhPhang, doDaiThuoc, phepTinhThichHop, soLonNhat, xemGio } from "../../exam5/toan1to4";
import { type SgkBook, type SgkTopic, has, only, tagged } from "../types";

/** Đáp án trắc nghiệm là một số nằm trong [lo, hi] (đếm hình 0–5 hay 6–10). */
const ansIn = (lo: number, hi: number) => (d: Draft) => {
  if (d.type !== "multiple_choice") return false;
  const v = Number(d.options.find((o) => o.id === d.answer)!.text);
  return v >= lo && v <= hi;
};
const cong10 = only(LOP1.congTru10, tagged("phép cộng"));
const tru10 = only(LOP1.congTru10, tagged("phép trừ"));
/** "Viết phép tính thích hợp" (lớp 1 chưa học trình bày Bài giải), lọc theo dạng phép tính của bài. */
const vietPhepTinh = (max: 10 | 100, op: "+" | "-", re: RegExp) => only(phepTinhThichHop(max, op), (d) => re.test(d.explanation));

const topics: SgkTopic[] = [
  { so: 1, tap: 1, ten: "Các số từ 0 đến 10", bai: [
    { so: 1, ten: "Các số 0, 1, 2, 3, 4, 5", mix: [[only(LOP1.demHinh, ansIn(0, 5)), 6], [soSanhSo(0, 5), 2], [daySo(5, [1]), 2]] },
    { so: 2, ten: "Các số 6, 7, 8, 9, 10", mix: [[only(LOP1.demHinh, ansIn(6, 10)), 6], [soSanhSo(5, 10), 2], [daySo(10, [1]), 2]] },
    { so: 3, ten: "Nhiều hơn, ít hơn, bằng nhau", mix: [[KNTT1.nhieuItBang, 10]] },
    { so: 4, ten: "So sánh số", mix: [[LOP1.soSanh10, 6], [soLonNhat(0, 10), 2], [LOP1.sapXep10, 2]] },
    { so: 5, ten: "Mấy và mấy", mix: [[LOP1.tachSo, 10]] },
    { so: 6, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 2, tap: 1, ten: "Làm quen với một số hình phẳng", bai: [
    { so: 7, ten: "Hình vuông, hình tròn, hình tam giác, hình chữ nhật", mix: [[demHinhPhang, 6], [KNTT1.hinhDoVat, 4]] },
    { so: 8, ten: "Thực hành lắp ghép, xếp hình", thucHanh: true },
    { so: 9, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 3, tap: 1, ten: "Phép cộng, phép trừ trong phạm vi 10", bai: [
    { so: 10, ten: "Phép cộng trong phạm vi 10", mix: [[cong10, 6], [only(LOP1.dungSai1, has(/\+/)), 2], [vietPhepTinh(10, "+", /^Phép tính: /), 2]] },
    { so: 11, ten: "Phép trừ trong phạm vi 10", mix: [[tru10, 6], [only(LOP1.dungSai1, has(/ - /)), 2], [vietPhepTinh(10, "-", /^Phép tính: /), 2]] },
    { so: 12, ten: "Bảng cộng, bảng trừ trong phạm vi 10", mix: [[LOP1.congTru10, 7], [LOP1.dungSai1, 3]] },
    { so: 13, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 4, tap: 1, ten: "Làm quen với một số hình khối", bai: [
    { so: 14, ten: "Khối lập phương, khối hộp chữ nhật", mix: [[only(KNTT3.khoiHop, has(/khối gì|Đồ vật nào/)), 10]] },
    { so: 15, ten: "Vị trí, định hướng trong không gian", mix: [[KNTT1.viTri, 10]] },
    { so: 16, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 5, tap: 1, ten: "Ôn tập học kì 1", bai: [
    { so: 17, ten: "Ôn tập các số trong phạm vi 10", luyen: true, tron: [1, 2, 3, 4, 5] },
    { so: 18, ten: "Ôn tập phép cộng, phép trừ trong phạm vi 10", luyen: true, tron: [10, 11, 12] },
    { so: 19, ten: "Ôn tập hình học", luyen: true, tron: [7, 14, 15] },
    { so: 20, ten: "Ôn tập chung", luyen: true, tron: [1, 2, 3, 4, 5, 7, 10, 11, 12, 14, 15] },
  ] },
  { so: 6, tap: 2, ten: "Các số đến 100", bai: [
    { so: 21, ten: "Số có hai chữ số", mix: [[LOP1.chucDonVi, 6], [LOP1.lienTruocSau, 4]] },
    { so: 22, ten: "So sánh số có hai chữ số", mix: [[LOP1.soSanh100, 6], [LOP1.sapXep100, 2], [soLonNhat(10, 99), 2]] },
    { so: 23, ten: "Bảng các số từ 1 đến 100", mix: [[daySo(100, [1, 10]), 6], [LOP1.lienTruocSau, 4]] },
    { so: 24, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 7, tap: 2, ten: "Độ dài và đo độ dài", bai: [
    { so: 25, ten: "Dài hơn, ngắn hơn", mix: [[KNTT1.daiNganHon, 10]] },
    { so: 26, ten: "Đơn vị đo độ dài", mix: [[doDaiThuoc, 5], [LOP1.doDaiCm, 5]] },
    { so: 27, ten: "Thực hành ước lượng và đo độ dài", thucHanh: true },
    { so: 28, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 8, tap: 2, ten: "Phép cộng, phép trừ (không nhớ) trong phạm vi 100", bai: [
    { so: 29, ten: "Phép cộng số có hai chữ số với số có một chữ số", mix: [[KNTT1.cong21, 8], [vietPhepTinh(100, "+", /^Phép tính: \d{2} \+ \d = /), 2]] },
    { so: 30, ten: "Phép cộng số có hai chữ số với số có hai chữ số", mix: [[KNTT1.cong22, 8], [vietPhepTinh(100, "+", /^Phép tính: \d{2} \+ \d{2} = /), 2]] },
    { so: 31, ten: "Phép trừ số có hai chữ số cho số có một chữ số", mix: [[KNTT1.tru21, 8], [vietPhepTinh(100, "-", /^Phép tính: \d{2} - \d = /), 2]] },
    { so: 32, ten: "Phép trừ số có hai chữ số cho số có hai chữ số", mix: [[KNTT1.tru22, 8], [vietPhepTinh(100, "-", /^Phép tính: \d{2} - \d{2} = /), 2]] },
    { so: 33, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 9, tap: 2, ten: "Thời gian, giờ và lịch", bai: [
    { so: 34, ten: "Xem giờ đúng trên đồng hồ", mix: [[LOP1.xemGio, 5], [xemGio([0]), 5]] },
    { so: 35, ten: "Các ngày trong tuần", mix: [[LOP1.ngayTrongTuan, 10]] },
    { so: 36, ten: "Thực hành xem lịch và giờ", mix: [[only(KNTT3.xemLich, has(/thứ mấy\?/)), 5], [xemGio([0]), 3], [LOP1.ngayTrongTuan, 2]] },
    { so: 37, ten: "Luyện tập chung", luyen: true },
  ] },
  { so: 10, tap: 2, ten: "Ôn tập cuối năm", bai: [
    { so: 38, ten: "Ôn tập các số và phép tính trong phạm vi 10", luyen: true, tron: [1, 2, 3, 4, 5, 10, 11, 12] },
    { so: 39, ten: "Ôn tập các số và phép tính trong phạm vi 100", luyen: true, tron: [21, 22, 23, 29, 30, 31, 32] },
    { so: 40, ten: "Ôn tập hình học và đo lường", luyen: true, tron: [7, 14, 15, 25, 26, 34, 35] },
    { so: 41, ten: "Ôn tập chung", luyen: true, tron: [4, 12, 22, 23, 26, 29, 30, 31, 32, 34, 35] },
  ] },
];

export const TOAN1: SgkBook = {
  id: "kntt-toan-1", subject: "Toán", slug: "toan", grade: 1, book: "Kết nối tri thức với cuộc sống",
  source: "Mục lục đối chiếu với kế hoạch dạy học Toán 1 Kết nối tri thức trên HoaTieu.vn (10/2026).",
  topics,
};
