// lib/tvSheet.ts — chủ đề của phiếu bài tập Tiếng Việt (tab "Tiếng Việt" trên /phieu-bai-tap).
// Cùng khuôn MathLessonSpec với phiếu Toán nên dùng chung buildWorksheetQuestions và
// buildWorksheetHtml. Mọi câu là trắc nghiệm (khoanh chữ đặt trước câu trả lời đúng).
// Lớp 2 dùng lại các dạng của bài tập theo sách (lib/tvGen/spell.ts, ltvc.ts); lớp 3 thêm
// các dạng trong lib/tvGen/lop3.ts. Kiểm tra: scripts/tv-sheet-check.ts.
//
// `id` nằm trong seed của phiếu — đổi id thì phiếu cùng seed ra bộ câu khác.

import type { MathLessonSpec } from "./mathGen";
import { chinhTa, hoiNga } from "./tvGen/spell";
import {
  cauGi, cauLa, chuCaiSau, chuHoa, CHU_HOA, dauCuoiCau, dauPhay, tenRieng, tuChi, tuLaGi, vonTu, xepTen,
} from "./tvGen/ltvc";
import {
  boPhanTraLoi, capTuDongNghia, capTuTraiNghia, cauKieu, cauLaKieuGi, coSoSanh, congDungDau, dienDauCau,
  dienTuSoSanh, dongNghia, soSanhVoi, traiNghia, traLoiCauHoiNao,
} from "./tvGen/lop3";

const ct = chinhTa;
const L = (s: MathLessonSpec) => s;

export const TV_SHEET_LESSONS: MathLessonSpec[] = [
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
];

export const TV_SHEET_GRADES = [...new Set(TV_SHEET_LESSONS.map((l) => l.grade))].sort((a, b) => a - b);
