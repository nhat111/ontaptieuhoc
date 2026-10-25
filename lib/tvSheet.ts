// lib/tvSheet.ts — chủ đề của phiếu bài tập Tiếng Việt (tab "Tiếng Việt" trên /phieu-bai-tap).
// Cùng khuôn MathLessonSpec với phiếu Toán nên dùng chung buildWorksheetQuestions và
// buildWorksheetHtml. Mọi câu là trắc nghiệm (khoanh chữ đặt trước câu trả lời đúng).
// Lớp 1, 2 dùng lại các dạng của bài tập theo sách (lib/tvGen/am.ts, lop1.ts, spell.ts, ltvc.ts;
// lớp 1 chỉ hỏi bằng tiếng có âm, vần đã học hết tập một); lớp 3, 4, 5 thêm các dạng trong
// lib/tvGen/lop3.ts, lop4.ts, lop5.ts và câu luyện từ và câu của đề Tạo đề nhanh
// (lib/exam5/tvContent*.ts). Kiểm tra: scripts/tv-sheet-check.ts.
//
// `id` nằm trong seed của phiếu — đổi id thì phiếu cùng seed ra bộ câu khác.

import type { MathLessonSpec } from "./mathGen";
import { chinhTa, hoiNga } from "./tvGen/spell";
import { ALPHABET } from "./tvGen/core";
import { amDau, coAmVan, cungVan, dauThanh, ghepTieng, nhanChu } from "./tvGen/am";
import { dienTu, DIEN_TU } from "./tvGen/lop1";
import { knownAtBai } from "./sgk/books/tv1";
import { tuNganHang } from "./tvGen/bank";
import {
  chuNgu4, coNhanHoa, DAU_CAU4, danhTuChung, danhTuRieng, nhanHoaVat, trangNgu4, trangNguChiGi, tuLoai4, tuLoaiLaGi4,
  vietHoa4, viNgu4,
} from "./tvGen/lop4";
import {
  cauDon, cauGhep, DAI_TU, DAU_CAU5, dongNghia5, dongNghiaDong, ketTu, khongDongNghia, lienKet, nghiaChuyen, nghiaGoc,
} from "./tvGen/lop5";
import { LTVC_BANK_4 } from "./exam5/tvContent4";
import { LTVC_BANK as LTVC_BANK_5 } from "./exam5/tvContent";
import {
  cauGi, cauLa, chuCaiSau, chuHoa, CHU_HOA, dauCuoiCau, dauPhay, tenRieng, tuChi, tuLaGi, vonTu, xepTen,
} from "./tvGen/ltvc";
import {
  boPhanTraLoi, capTuDongNghia, capTuTraiNghia, cauKieu, cauLaKieuGi, coSoSanh, congDungDau, dienDauCau,
  dienTuSoSanh, dongNghia, soSanhVoi, traiNghia, traLoiCauHoiNao,
} from "./tvGen/lop3";

const ct = chinhTa;
const L = (s: MathLessonSpec) => s;

/** Lớp 1: âm, vần, dấu thanh đã học hết tập một (bài 83). */
const K1 = knownAtBai(83);
const b4 = (...keys: string[]) => tuNganHang(keys.flatMap((k) => LTVC_BANK_4[k]), "ltvc-4");
const b5 = (key: keyof typeof LTVC_BANK_5, keep: (q: string) => boolean = () => true) =>
  tuNganHang(LTVC_BANK_5[key].filter((it) => keep(it.q)), "ltvc-5");

export const TV_SHEET_LESSONS: MathLessonSpec[] = [
  /* ── Lớp 1 ── */
  L({ id: "tv1-am-chu", grade: 1, title: "Nhận chữ, âm đầu",
    mix: [[nhanChu(ALPHABET), 4], [amDau([...K1.onsets], K1), 6]] }),
  L({ id: "tv1-van", grade: 1, title: "Vần",
    mix: [[coAmVan("van", [...K1.rhymes], K1), 6], [cungVan(K1), 4]] }),
  L({ id: "tv1-dau-thanh", grade: 1, title: "Dấu thanh, ghép tiếng",
    mix: [[dauThanh(K1), 5], [ghepTieng(K1), 5]] }),
  L({ id: "tv1-c-k-g-gh", grade: 1, title: "Chính tả: c/k, g/gh, ng/ngh",
    mix: [[ct("c-k"), 4], [ct("g-gh"), 3], [ct("ng-ngh"), 3]] }),
  L({ id: "tv1-am-de-lan", grade: 1, title: "Chính tả: ch/tr, s/x, l/n, h/th/kh, v/d/gi",
    mix: [[ct("ch-tr"), 2], [ct("s-x"), 2], [ct("l-n"), 2], [ct("h-th-kh"), 2], [ct("v-d-gi"), 2]] }),
  L({ id: "tv1-dien-tu", grade: 1, title: "Chọn từ ngữ điền vào chỗ trống",
    mix: (Object.keys(DIEN_TU) as (keyof typeof DIEN_TU)[]).map((t) => [dienTu(t), 1] as [ReturnType<typeof dienTu>, number]) }),
  L({ id: "tv1-dau-cau", grade: 1, title: "Dấu chấm, dấu chấm hỏi, viết hoa",
    mix: [[dauCuoiCau([".", "?"]), 5], [chuHoa(["A", "B", "C", "Đ", "E", "H", "L", "M", "N", "Q", "S", "T", "V"]), 5]] }),
  L({ id: "tv1-von-tu", grade: 1, title: "Mở rộng vốn từ",
    mix: [[vonTu("gia-dinh"), 1], [vonTu("truong-hoc"), 1], [vonTu("tinh-cam-ban-be"), 1], [vonTu("thien-nhien"), 1],
      [vonTu("am-thanh"), 1], [vonTu("nghe-nghiep"), 1], [vonTu("do-choi"), 1], [vonTu("vat-nuoi"), 1],
      [vonTu("an-toan"), 1], [vonTu("duc-tinh"), 1]] }),

  /* ── Lớp 2 ── */
  L({ id: "tv2-am-dau-1", grade: 2, title: "Chính tả: c/k, g/gh, ng/ngh",
    mix: [[ct("c-k"), 4], [ct("g-gh"), 3], [ct("ng-ngh"), 3]] }),
  L({ id: "tv2-am-dau-2", grade: 2, title: "Chính tả: ch/tr, s/x, l/n, r/d/gi",
    mix: [[ct("ch-tr"), 3], [ct("s-x"), 3], [ct("l-n"), 2], [ct("r-d-gi"), 2]] }),
  L({ id: "tv2-van", grade: 2, title: "Chính tả: vần dễ lẫn, dấu hỏi / dấu ngã",
    mix: [[ct("ao-au"), 1], [ct("ai-ay"), 1], [ct("an-ang"), 1], [ct("iu-uu"), 1], [ct("ieu-uou"), 1],
      [ct("en-eng"), 1], [ct("ien-ieng"), 1], [ct("uon-uong"), 1], [hoiNga, 2]] }),
  L({ id: "tv2-tu-loai", grade: 2, title: "Từ chỉ sự vật, hoạt động, đặc điểm",
    mix: [[tuChi("su-vat"), 2], [tuChi("hoat-dong"), 2], [tuChi("dac-diem"), 2], [tuLaGi(), 4]] }),
  L({ id: "tv2-kieu-cau", grade: 2, title: "Câu giới thiệu, câu nêu hoạt động, câu nêu đặc điểm",
    mix: [[cauLa("gioi-thieu", ["hoat-dong", "dac-diem"]), 2], [cauLa("hoat-dong", ["gioi-thieu", "dac-diem"]), 2],
      [cauLa("dac-diem", ["gioi-thieu", "hoat-dong"]), 2], [cauGi(["gioi-thieu", "hoat-dong", "dac-diem"]), 4]] }),
  L({ id: "tv2-dau-cau", grade: 2, title: "Dấu chấm, dấu chấm hỏi, dấu chấm than, dấu phẩy",
    mix: [[dauCuoiCau([".", "?", "!"]), 7], [dauPhay, 3]] }),
  L({ id: "tv2-viet-hoa", grade: 2, title: "Viết hoa, bảng chữ cái",
    mix: [[chuHoa(Object.keys(CHU_HOA)), 3], [tenRieng, 3], [chuCaiSau, 2], [xepTen, 2]] }),
  L({ id: "tv2-von-tu", grade: 2, title: "Mở rộng vốn từ",
    mix: [[vonTu("do-dung-hoc-tap"), 1], [vonTu("gia-dinh"), 1], [vonTu("tinh-cam-ban-be"), 1], [vonTu("do-choi"), 1],
      [vonTu("cac-mua"), 1], [vonTu("vat-nuoi"), 1], [vonTu("cay-coi"), 1], [vonTu("nghe-nghiep"), 1],
      [vonTu("duoi-bien"), 1], [vonTu("truong-hoc"), 1]] }),

  /* ── Lớp 3 ── */
  L({ id: "tv3-am-dau", grade: 3, title: "Chính tả: s/x, ch/tr, l/n, r/d/gi, dấu hỏi / dấu ngã",
    mix: [[ct("s-x"), 2], [ct("ch-tr"), 2], [ct("l-n"), 2], [ct("r-d-gi"), 2], [hoiNga, 2]] }),
  L({ id: "tv3-van", grade: 3, title: "Chính tả: vần dễ lẫn",
    mix: [[ct("an-ang"), 1], [ct("en-eng"), 1], [ct("ien-ieng"), 1], [ct("uon-uong"), 1], [ct("uon-uong-2"), 1],
      [ct("ac-at"), 1], [ct("uc-ut"), 1], [ct("iet-iec"), 1], [ct("uoc-uot"), 1], [ct("oanh-oach"), 1]] }),
  L({ id: "tv3-tu-loai", grade: 3, title: "Từ chỉ sự vật, hoạt động, đặc điểm",
    mix: [[tuChi("su-vat"), 2], [tuChi("hoat-dong"), 2], [tuChi("dac-diem"), 2], [tuLaGi(), 4]] }),
  L({ id: "tv3-giong-trai", grade: 3, title: "Từ có nghĩa giống nhau, trái ngược nhau",
    mix: [[dongNghia, 3], [traiNghia, 3], [capTuDongNghia, 2], [capTuTraiNghia, 2]] }),
  L({ id: "tv3-so-sanh", grade: 3, title: "Biện pháp so sánh",
    mix: [[coSoSanh, 4], [soSanhVoi, 4], [dienTuSoSanh, 2]] }),
  L({ id: "tv3-kieu-cau", grade: 3, title: "Câu kể, câu hỏi, câu cảm, câu khiến",
    mix: [[cauKieu("ke"), 1], [cauKieu("hoi"), 1], [cauKieu("cam"), 2], [cauKieu("khien"), 2], [cauLaKieuGi, 4]] }),
  L({ id: "tv3-hoi-dap", grade: 3, title: "Khi nào? Ở đâu? Bằng gì? Để làm gì?",
    mix: [[boPhanTraLoi(), 6], [traLoiCauHoiNao, 4]] }),
  L({ id: "tv3-dau-cau", grade: 3, title: "Dấu câu: dấu hai chấm, dấu gạch ngang, dấu phẩy…",
    mix: [[dienDauCau, 7], [congDungDau, 3]] }),
  L({ id: "tv3-von-tu", grade: 3, title: "Mở rộng vốn từ",
    mix: [[vonTu("truong-hoc"), 1], [vonTu("gia-dinh"), 1], [vonTu("tinh-cam-gia-dinh"), 1], [vonTu("thien-nhien"), 1],
      [vonTu("nghe-nghiep"), 1], [vonTu("moi-truong"), 1], [vonTu("san-pham"), 1], [vonTu("duc-tinh"), 1],
      [vonTu("am-thanh"), 1], [vonTu("an-toan"), 1]] }),

  /* ── Lớp 4 ── */
  L({ id: "tv4-danh-tu", grade: 4, title: "Danh từ, danh từ chung, danh từ riêng",
    mix: [[tuLoai4("danh-tu"), 2], [danhTuRieng, 3], [danhTuChung, 2], [b4("danh-tu"), 3]] }),
  L({ id: "tv4-dong-tinh-tu", grade: 4, title: "Động từ, tính từ",
    mix: [[tuLoai4("dong-tu"), 2], [tuLoai4("tinh-tu"), 2], [tuLoaiLaGi4, 3], [b4("dong-tu", "tinh-tu"), 3]] }),
  L({ id: "tv4-viet-hoa", grade: 4, title: "Viết hoa tên người, tên địa lí, tên cơ quan, tổ chức",
    mix: [[vietHoa4("viet"), 4], [vietHoa4("nuoc-ngoai"), 3], [vietHoa4("to-chuc"), 3]] }),
  L({ id: "tv4-nhan-hoa", grade: 4, title: "Biện pháp nhân hoá",
    mix: [[coNhanHoa, 4], [nhanHoaVat, 3], [b4("nhan-hoa"), 3]] }),
  L({ id: "tv4-chu-vi", grade: 4, title: "Chủ ngữ, vị ngữ",
    mix: [[chuNgu4, 4], [viNgu4, 4], [b4("chu-vi"), 2]] }),
  L({ id: "tv4-trang-ngu", grade: 4, title: "Trạng ngữ",
    mix: [[trangNgu4, 4], [trangNguChiGi, 4], [b4("trang-ngu"), 2]] }),
  L({ id: "tv4-dau-cau", grade: 4, title: "Dấu câu: gạch ngang, ngoặc kép, ngoặc đơn…",
    mix: [[tuNganHang([...DAU_CAU4, ...LTVC_BANK_4["dau-cau"]], "dấu câu"), 7], [dienDauCau, 3]] }),
  L({ id: "tv4-von-tu", grade: 4, title: "Mở rộng vốn từ",
    mix: [[vonTu("duc-tinh"), 2], [vonTu("giao-tiep"), 1], [vonTu("nghe-nghiep"), 1], [vonTu("moi-truong"), 2],
      [vonTu("an-toan"), 1], [vonTu("san-pham"), 1], [vonTu("bac-ho"), 1], [vonTu("am-thanh"), 1]] }),

  /* ── Lớp 5 ── */
  L({ id: "tv5-dong-nghia", grade: 5, title: "Từ đồng nghĩa",
    mix: [[dongNghia5, 4], [khongDongNghia, 2], [dongNghiaDong, 2], [b5("dong-nghia"), 2]] }),
  L({ id: "tv5-da-nghia", grade: 5, title: "Từ đa nghĩa",
    mix: [[nghiaGoc, 4], [nghiaChuyen, 4], [b5("da-nghia"), 2]] }),
  L({ id: "tv5-dai-tu", grade: 5, title: "Đại từ",
    mix: [[tuNganHang(DAI_TU, "đại từ"), 7], [b5("dai-tu"), 3]] }),
  L({ id: "tv5-ket-tu", grade: 5, title: "Kết từ",
    mix: [[ketTu, 9], [b5("ket-tu", (q) => !q.startsWith("Chọn kết từ")), 1]] }),
  L({ id: "tv5-cau-ghep", grade: 5, title: "Câu ghép",
    mix: [[cauGhep, 3], [cauDon, 3], [b5("cau-ghep"), 4]] }),
  L({ id: "tv5-lien-ket", grade: 5, title: "Liên kết câu",
    mix: [[lienKet, 7], [b5("lien-ket"), 3]] }),
  L({ id: "tv5-dau-cau", grade: 5, title: "Dấu câu: gạch ngang, hai chấm, ngoặc kép…",
    mix: [[tuNganHang([...DAU_CAU5, ...LTVC_BANK_5["dau-gach-ngang"].filter((it) => it.q.startsWith("Dấu"))], "dấu câu"), 7], [dienDauCau, 3]] }),
];

export const TV_SHEET_GRADES = [...new Set(TV_SHEET_LESSONS.map((l) => l.grade))].sort((a, b) => a - b);
