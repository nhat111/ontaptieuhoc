// lib/mathGen/index.ts
// Bộ sinh đề Toán lớp 1, 2, 3, 5 — không gọi AI, không gọi dịch vụ ngoài.
// Mỗi chủ đề là một "bài luyện tập" 10 câu; `buildLessonQuestions` trả về các dòng
// sẵn sàng INSERT vào bảng `questions` (xem scripts/gen-math-sql.ts).
//
// Mã hoá correct_answer phải khớp lib/quizData.ts → scoreAnswer:
//   mcq     → nội dung đáp án đúng (phải nằm trong options)
//   numeric → số; chỉ dùng khi số < 1000 (scoreAnswer đọc "5.000" thành 5)
//   short   → các cách viết được chấp nhận, nối bằng "|" (số ≥ 1000, phân số)

import type { QType } from "../quizData";
import { type Draft, type Generator, type Rng, mulberry32, seedFrom, shuffle, variants } from "./core";
import { LOP1 } from "./lop1";
import { LOP2 } from "./lop2";
import { LOP3 } from "./lop3";
import { LOP5 } from "./lop5";

export type MathGrade = 1 | 2 | 3 | 5;

export interface MathLessonSpec {
  /** Khoá ổn định, dùng làm lessons.source_id = "gen_" + id. Đừng đổi khi đã import. */
  id: string;
  grade: MathGrade;
  title: string;
  mix: [Generator, number][]; // [dạng bài, số câu]
}

const L = (s: MathLessonSpec) => s;

export const MATH_LESSONS: MathLessonSpec[] = [
  /* ─────────── LỚP 1 ─────────── */
  L({ id: "toan-1-cac-so-0-10", grade: 1, title: "Các số từ 0 đến 10",
    mix: [[LOP1.demHinh, 4], [LOP1.tachSo, 2], [LOP1.soSanh10, 2], [LOP1.sapXep10, 2]] }),
  L({ id: "toan-1-cong-tru-pv10", grade: 1, title: "Phép cộng, phép trừ trong phạm vi 10",
    mix: [[LOP1.congTru10, 6], [LOP1.dungSai1, 2], [LOP1.tachSo, 2]] }),
  L({ id: "toan-1-so-den-100", grade: 1, title: "Các số đến 100",
    mix: [[LOP1.chucDonVi, 3], [LOP1.lienTruocSau, 3], [LOP1.soSanh100, 2], [LOP1.sapXep100, 2]] }),
  L({ id: "toan-1-cong-tru-pv100", grade: 1, title: "Cộng, trừ (không nhớ) trong phạm vi 100",
    mix: [[LOP1.congTru100, 5], [LOP1.loiVan1, 3], [LOP1.doDaiCm, 2]] }),
  L({ id: "toan-1-thoi-gian", grade: 1, title: "Xem giờ đúng, các ngày trong tuần",
    mix: [[LOP1.xemGio, 5], [LOP1.ngayTrongTuan, 5]] }),

  /* ─────────── LỚP 2 ─────────── */
  L({ id: "toan-2-cong-tru-pv20", grade: 2, title: "Cộng, trừ qua 10 trong phạm vi 20",
    mix: [[LOP2.congTru20, 6], [LOP2.thanhPhanPhepTinh, 2], [LOP2.nhieuHonItHon, 2]] }),
  L({ id: "toan-2-cong-tru-pv100", grade: 2, title: "Cộng, trừ có nhớ trong phạm vi 100",
    mix: [[LOP2.congTru100, 6], [LOP2.nhieuHonItHon, 2], [LOP2.duongGapKhuc, 2]] }),
  L({ id: "toan-2-nhan-chia", grade: 2, title: "Bảng nhân, bảng chia 2 và 5",
    mix: [[LOP2.bangNhanChia, 6], [LOP2.nhanChiaLoiVan, 2], [LOP2.dungSai2, 2]] }),
  L({ id: "toan-2-so-den-1000", grade: 2, title: "Các số trong phạm vi 1000",
    mix: [[LOP2.tramChucDonVi, 4], [LOP2.soSanh1000, 2], [LOP2.sapXep1000, 2], [LOP2.congTru1000, 2]] }),
  L({ id: "toan-2-do-luong", grade: 2, title: "Độ dài, ki-lô-gam, lít, tiền Việt Nam",
    mix: [[LOP2.donViDo2, 4], [LOP2.tienVN, 3], [LOP2.duongGapKhuc, 3]] }),
  L({ id: "toan-2-thoi-gian", grade: 2, title: "Xem đồng hồ, ngày – tháng",
    mix: [[LOP2.xemGio, 5], [LOP2.ngayTrongTuan, 2], [LOP2.ngayThang, 3]] }),

  /* ─────────── LỚP 3 ─────────── */
  L({ id: "toan-3-nhan-chia-6-7", grade: 3, title: "Bảng nhân, bảng chia 6 và 7",
    mix: [[LOP3.bangNhanChia67, 3], [LOP3.timThuaSo67, 1], [LOP3.bieuThuc67, 1], [LOP3.soSanhTich67, 1],
      [LOP3.dungSai3, 1], [LOP3.loiVan67, 2], [LOP3.loiVanHaiBuoc67, 1]] }),

  /* ─────────── LỚP 5 ─────────── */
  L({ id: "toan-5-phan-so-hon-so", grade: 5, title: "Phân số thập phân và hỗn số",
    mix: [[LOP5.phanSoThapPhan, 4], [LOP5.honSo, 4], [LOP5.phanSoSangSTP, 2]] }),
  L({ id: "toan-5-so-thap-phan", grade: 5, title: "Số thập phân: các hàng, so sánh, sắp xếp",
    mix: [[LOP5.hangSoThapPhan, 3], [LOP5.phanSoSangSTP, 2], [LOP5.soSanhSTP, 3], [LOP5.sapXepSTP, 2]] }),
  L({ id: "toan-5-phep-tinh-stp", grade: 5, title: "Cộng, trừ, nhân, chia số thập phân",
    mix: [[LOP5.congTruSTP, 3], [LOP5.nhanSTP, 3], [LOP5.chiaSTP, 3], [LOP5.dungSai5, 1]] }),
  L({ id: "toan-5-doi-don-vi", grade: 5, title: "Đổi đơn vị đo độ dài, khối lượng, diện tích, thể tích",
    mix: [[LOP5.doiDonVi, 10]] }),
  L({ id: "toan-5-ti-so-phan-tram", grade: 5, title: "Tỉ số phần trăm",
    mix: [[LOP5.tiSoPhanTram, 8], [LOP5.dungSai5, 2]] }),
  L({ id: "toan-5-hinh-hoc", grade: 5, title: "Diện tích, chu vi, thể tích các hình",
    mix: [[LOP5.dienTichHinh, 5], [LOP5.theTich, 5]] }),
  L({ id: "toan-5-thoi-gian-chuyen-dong", grade: 5, title: "Số đo thời gian, chuyển động đều",
    mix: [[LOP5.thoiGian, 5], [LOP5.chuyenDong, 5]] }),
  L({ id: "toan-5-on-tap-loi-van", grade: 5, title: "Ôn tập toán có lời văn",
    mix: [[LOP5.loiVan5, 3], [LOP5.tiSoPhanTram, 2], [LOP5.chuyenDong, 3], [LOP5.theTich, 2]] }),
];

/* ───────────── Draft → dòng bảng `questions` ───────────── */

export type GenQuestionRow = {
  content: string;
  type: QType;
  options: string[];
  correct_answer: string;
  /** JSON `{ solution, images? }` — cùng định dạng lib/db.ts đang đọc. */
  explanation: string;
};

const SEQ_SEP = "; "; // số thập phân dùng dấu phẩy nên không nối dãy bằng ","

export function toQuestionRow(d: Draft, r: Rng): GenQuestionRow {
  const explanation = JSON.stringify({
    solution: d.explanation,
    ...(d.image ? { images: [{ url: d.image, position: "after" }] } : {}),
  });

  switch (d.type) {
    case "multiple_choice":
      return {
        content: d.question, type: "mcq", explanation,
        options: d.options.map((o) => o.text),
        correct_answer: d.options.find((o) => o.id === d.answer)!.text,
      };

    case "true_false":
      return { content: d.question, type: "mcq", explanation, options: ["Đúng", "Sai"], correct_answer: d.answer ? "Đúng" : "Sai" };

    case "ordering": {
      // Không có dạng kéo-thả trong quiz → hỏi "Dãy nào sắp xếp đúng?"
      const text = (id: string) => d.items.find((i) => i.id === id)!.content;
      const correct = d.correctOrder.map(text);
      const asc = d.question.includes("bé đến lớn");
      const seqs = new Set<string>([correct.join(SEQ_SEP)]);
      const add = (arr: string[]) => seqs.add(arr.join(SEQ_SEP));
      add([...correct].reverse());                       // nhầm chiều
      add(d.items.map((i) => i.content));                // thứ tự đề cho
      add([correct[1], correct[0], ...correct.slice(2)]); // đổi chỗ 2 số đầu
      add([...correct.slice(0, 2), correct[3], correct[2]]); // đổi chỗ 2 số cuối
      for (let t = 0; seqs.size < 4 && t < 50; t++) add(shuffle(r, correct));
      const answer = correct.join(SEQ_SEP);
      const wrong = shuffle(r, [...seqs].filter((s) => s !== answer)).slice(0, 3);
      return {
        content: `Dãy số nào được sắp xếp theo thứ tự từ ${asc ? "bé đến lớn" : "lớn đến bé"}?`,
        type: "mcq", explanation,
        options: shuffle(r, [answer, ...wrong]),
        correct_answer: answer,
      };
    }

    case "fill_blank": {
      const a = d.answers[0];
      // "5.000" (dấu chấm ngăn hàng nghìn) hay "13/5" thì scoreAnswer kiểu numeric chấm sai
      // → dùng short với mọi cách viết hợp lệ.
      if (a.includes("/") || a.includes(".")) {
        const accepted = new Set([...(d.acceptedAnswers?.[0] ?? []), ...variants(a)]);
        if (a.includes(".")) accepted.add(a.replace(/\./g, " "));
        if (a.includes("/")) accepted.add(a.replace("/", " / "));
        return { content: d.question, type: "short", explanation, options: [], correct_answer: [...accepted].join("|") };
      }
      return { content: d.question, type: "numeric", explanation, options: [], correct_answer: a };
    }
  }
}

/* ───────────── Sinh một bài ───────────── */

/**
 * Sinh các câu hỏi của một bài. Cùng `seed` → cùng đề; đổi seed để có bộ đề mới.
 * Không có câu nào trùng nội dung trong cùng một bài.
 */
export function buildLessonQuestions(spec: MathLessonSpec, seed = "v1"): GenQuestionRow[] {
  const r = mulberry32(seedFrom(`${spec.id}|${seed}`));
  const seen = new Set<string>();
  const rows: GenQuestionRow[] = [];
  for (const [gen, count] of spec.mix) {
    for (let i = 0; i < count; i++) {
      const key = (q: GenQuestionRow) => q.content + "\u0000" + q.options.join("\u0000");
      let row = toQuestionRow(gen(r), r);
      for (let t = 0; t < 30 && seen.has(key(row)); t++) row = toQuestionRow(gen(r), r);
      seen.add(key(row));
      rows.push(row);
    }
  }
  return rows;
}

/* ───────────── Phiếu bài tập (nhiều chủ đề, số câu tuỳ chọn) ───────────── */

/** Chia `total` thành các phần tỉ lệ với `weights` (phương pháp dư lớn nhất), tổng đúng bằng `total`. */
function apportion(total: number, weights: number[]): number[] {
  const sum = weights.reduce((s, w) => s + w, 0);
  const raw = weights.map((w) => (total * w) / sum);
  const out = raw.map(Math.floor);
  const order = raw.map((v, i) => [v - Math.floor(v), i] as const).sort((a, b) => b[0] - a[0]);
  const left = total - out.reduce((s, x) => s + x, 0);
  for (let k = 0; k < left; k++) out[order[k % order.length][1]]++;
  return out;
}

/**
 * Sinh câu hỏi cho một phiếu bài tập: chia đều `total` câu cho các chủ đề, trong
 * mỗi chủ đề giữ tỉ lệ các dạng bài như `mix`. Cùng `seed` → cùng phiếu.
 * Không có câu trùng nội dung trong phiếu (trừ khi một dạng bài cạn hết biến thể).
 */
export function buildWorksheetQuestions(specs: MathLessonSpec[], total: number, seed: string): GenQuestionRow[] {
  if (specs.length === 0 || total <= 0) return [];
  const r = mulberry32(seedFrom(`phieu|${specs.map((s) => s.id).join(",")}|${total}|${seed}`));
  const seen = new Set<string>();
  const key = (q: GenQuestionRow) => q.content + "\u0000" + q.options.join("\u0000");
  const rows: GenQuestionRow[] = [];
  const perSpec = apportion(total, specs.map(() => 1));
  specs.forEach((spec, si) => {
    const counts = apportion(perSpec[si], spec.mix.map(([, n]) => n));
    spec.mix.forEach(([gen], gi) => {
      for (let i = 0; i < counts[gi]; i++) {
        let row = toQuestionRow(gen(r), r);
        for (let t = 0; t < 30 && seen.has(key(row)); t++) row = toQuestionRow(gen(r), r);
        seen.add(key(row));
        rows.push(row);
      }
    });
  });
  return rows;
}

export { LOP1, LOP2, LOP3, LOP5 };
export type { Draft, Generator };
