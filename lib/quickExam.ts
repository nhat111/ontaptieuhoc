// lib/quickExam.ts
// "Tạo đề nhanh": phụ huynh chọn lớp → loại đề (giữa/cuối học kì) → môn, máy sinh ra
// một đề kiểm tra để làm trên máy (/quiz?de=…) hoặc in ra giấy (/tao-de).
//
// Chỉ môn có nội dung sinh sẵn mới có đề: Toán lớp 1–5, Tiếng Việt lớp 1–5 và Tiếng Anh lớp 3–5, đều
// theo cấu trúc đề giấy thật (lib/exam5: toan1to4.ts, toan5.ts, tiengViet.ts, tv12.ts, tiengAnh.ts). Mỗi đề là
// một "tờ đề" (lib/exam5/paper.ts): in ra được (lib/exam5/print.ts) và làm được trên máy.
// Không gọi AI, không đọc DB: cùng `seed` → cùng đề, nên link /quiz?de=toan-3-cuoi-hk1&seed=abc
// mở lại đúng đề đó (server và trình duyệt trùng nhau).
//
// Phạm vi kiến thức mỗi kì lấy theo thứ tự chủ đề thường gặp trong SGK lớp 1–5
// (chương trình GDPT 2018); mỗi kì là một danh sách id chủ đề trong MATH_LESSONS — dùng để
// giới thiệu nội dung đề cho phụ huynh. Câu hỏi cụ thể do BLUEPRINTS của từng lớp quyết định.
// Đổi/xoá id ở MATH_LESSONS thì sửa ở đây — scripts/quick-exam-check.ts báo id lạc.

import { MATH_LESSONS, type GenQuestionRow, type MathLessonSpec } from "./mathGen";
import type { Question, QImage } from "./quizData";
import { paperRows, type ExamPaper } from "./exam5/paper";
import { buildToan5 } from "./exam5/toan5";
import { buildToan1to4, isSmallGrade, toanCount, toanMinutes } from "./exam5/toan1to4";
import { TV_CONTENT, buildTiengViet, passagesFor } from "./exam5/tiengViet";
import { TV12_MINUTES, buildTv12, tv12Passages, type Tv12Content } from "./exam5/tv12";
import { TV1_EXAM } from "./exam5/tvContent1";
import { TV2_EXAM } from "./exam5/tvContent2";
import { EN_UNITS, buildTiengAnh, enPassages, unitsFor, type EnContent } from "./exam5/tiengAnh";
import { EN3 } from "./exam5/enContent3";
import { EN4 } from "./exam5/enContent4";
import { EN5 } from "./exam5/enContent5";

/** Tiếng Anh theo sách Global Success; lớp nào có nội dung thì có đề. */
export const EN: Record<number, EnContent> = { 3: EN3, 4: EN4, 5: EN5 };

const TV12: Record<number, Tv12Content> = { 1: TV1_EXAM, 2: TV2_EXAM };

export const EXAM_KINDS = [
  { key: "giua-hk1", label: "Giữa học kì I", short: "Giữa HK I" },
  { key: "cuoi-hk1", label: "Cuối học kì I", short: "Cuối HK I" },
  { key: "giua-hk2", label: "Giữa học kì II", short: "Giữa HK II" },
  { key: "cuoi-hk2", label: "Cuối học kì II", short: "Cuối năm" },
] as const;

export type ExamKind = (typeof EXAM_KINDS)[number]["key"];

export function isExamKind(v: unknown): v is ExamKind {
  return EXAM_KINDS.some((k) => k.key === v);
}

export function examKindLabel(kind: ExamKind): string {
  return EXAM_KINDS.find((k) => k.key === kind)!.label;
}

/** Chủ đề (id trong MATH_LESSONS) của từng kì, theo lớp. Cuối kì gồm cả phần giữa kì. */
export const MATH_SCOPE: Record<number, Record<ExamKind, string[]>> = {
  1: {
    "giua-hk1": ["toan-1-cac-so-0-10", "toan-1-cong-tru-pv10"],
    "cuoi-hk1": ["toan-1-cac-so-0-10", "toan-1-cong-tru-pv10"],
    "giua-hk2": ["toan-1-so-den-100"],
    "cuoi-hk2": ["toan-1-so-den-100", "toan-1-cong-tru-pv100", "toan-1-thoi-gian"],
  },
  2: {
    "giua-hk1": ["toan-2-cong-tru-pv20"],
    "cuoi-hk1": ["toan-2-cong-tru-pv20", "toan-2-cong-tru-pv100", "toan-2-thoi-gian"],
    "giua-hk2": ["toan-2-nhan-chia", "toan-2-so-den-1000"],
    "cuoi-hk2": ["toan-2-nhan-chia", "toan-2-so-den-1000", "toan-2-do-luong"],
  },
  3: {
    "giua-hk1": ["toan-3-bang-nhan-chia-3-4", "toan-3-nhan-chia-6-7", "toan-3-bang-nhan-chia-8-9"],
    "cuoi-hk1": ["toan-3-bang-nhan-chia-3-4", "toan-3-nhan-chia-6-7", "toan-3-bang-nhan-chia-8-9", "toan-3-gap-giam", "toan-3-nhan-chia-mot-chu-so"],
    "giua-hk2": ["toan-3-so-den-100000", "toan-3-phep-tinh-100000"],
    "cuoi-hk2": ["toan-3-so-den-100000", "toan-3-phep-tinh-100000", "toan-3-hinh-do-luong"],
  },
  4: {
    "giua-hk1": ["toan-4-so-nhieu-chu-so", "toan-4-don-vi-do"],
    "cuoi-hk1": ["toan-4-so-nhieu-chu-so", "toan-4-don-vi-do", "toan-4-cong-tru", "toan-4-tbc-tong-hieu"],
    "giua-hk2": ["toan-4-nhan-chia"],
    "cuoi-hk2": ["toan-4-nhan-chia", "toan-4-phan-so"],
  },
  5: {
    "giua-hk1": ["toan-5-phan-so-hon-so", "toan-5-so-thap-phan"],
    "cuoi-hk1": ["toan-5-so-thap-phan", "toan-5-phep-tinh-stp", "toan-5-doi-don-vi"],
    "giua-hk2": ["toan-5-ti-so-phan-tram", "toan-5-hinh-hoc"],
    "cuoi-hk2": ["toan-5-ti-so-phan-tram", "toan-5-hinh-hoc", "toan-5-thoi-gian-chuyen-dong", "toan-5-on-tap-loi-van"],
  },
};

export interface QuickExamSpec {
  /** Khoá trong URL: "toan-3-cuoi-hk1", "tieng-viet-5-giua-hk2". */
  id: string;
  grade: number;
  subject: string;
  kind: ExamKind;
  title: string;
  /** Nội dung kiểm tra, hiện cho phụ huynh xem trước khi tạo đề. */
  scope: string[];
  /** Số câu làm trên máy (câu máy chấm được). */
  count: number;
  minutes: number;
  /** Tờ đề đầy đủ (để in và để lấy câu làm trên máy). Cùng seed → cùng đề. */
  paper: (seed: string) => ExamPaper;
}

/** Dòng cuối phần "Nội dung kiểm tra" của đề Toán lớp 1–4. */
const FIGURE_NOTE: Record<1 | 2 | 3 | 4, string> = {
  1: "Có câu hình vẽ (đếm hình, đo bằng thước, xem đồng hồ) và viết phép tính thích hợp như đề thật",
  2: "Có câu hình vẽ (đồng hồ, đường gấp khúc, tiền, đếm hình), đặt tính và bài giải như đề thật",
  3: "Có câu hình vẽ (hình tròn, chu vi – diện tích, đồng hồ, tiền), đặt tính và bài giải như đề thật",
  4: "Có câu hình vẽ (góc, hình bình hành – hình thoi, biểu đồ cột, phân số), đặt tính và bài giải như đề thật",
};

const SUBJECT_SLUG: Record<string, string> = { "Toán": "toan", "Tiếng Việt": "tieng-viet", "Tiếng Anh": "tieng-anh" };
const lowerFirst = (s: string) => s.replace(/^./, (c) => c.toLowerCase());

/** Đề tạo được cho (lớp, môn, kì); null khi môn đó chưa có bộ sinh câu hỏi. */
export function getQuickExam(grade: number, subject: string, kind: ExamKind): QuickExamSpec | null {
  const slug = SUBJECT_SLUG[subject];
  if (!slug) return null;
  const kindLabel = examKindLabel(kind);
  // Chỉ hạ chữ đầu: "Cuối học kì I" → "cuối học kì I" (toLowerCase sẽ biến "I" thành "i").
  const title = `Đề kiểm tra ${lowerFirst(kindLabel)} – ${subject} lớp ${grade}`;
  const base = { id: `${slug}-${grade}-${kind}`, grade, subject, kind, title };

  if (subject === "Tiếng Anh") {
    const en = EN[grade];
    if (!en) return null;
    const [a, b] = EN_UNITS[kind];
    return {
      ...base,
      scope: [
        `${en.book}: Unit ${a}–${b} (${unitsFor(en, kind).map((u) => u.title).join(", ")})`,
        `Reading: chọn từ khác loại, đọc đoạn văn (${enPassages(en, kind).map((p) => p.title).join(" hoặc ")}) và chọn True / False`,
        "Writing: chọn đáp án đúng, chọn câu đúng thứ tự từ",
        "Listening (người lớn đọc lời in kèm) và Speaking (hỏi đáp) chấm trên giấy",
      ],
      count: 12, minutes: 35,
      paper: (seed) => buildTiengAnh(en, kind, kindLabel, seed),
    };
  }

  if (subject === "Tiếng Việt" && TV12[grade]) {
    const tv = TV12[grade];
    const passages = tv12Passages(tv, kind).map((p) => `“${p.title}”`).join(" hoặc ");
    return {
      ...base,
      scope: grade === 1
        ? [
          `Đọc hiểu: một bài đọc ngắn (${passages}) và 3 câu hỏi`,
          `Bài tập chính tả: ${tv.spellingNames[kind]}`,
          "Đọc thành tiếng và viết chính tả nghe – viết (giáo viên, phụ huynh kiểm tra trên giấy)",
        ]
        : [
          `Đọc hiểu: một bài đọc mới (${passages}) và 4 câu hỏi`,
          `Luyện từ và câu: ${tv.ltvc![kind].names}`,
          `Bài tập chính tả: ${tv.spellingNames[kind]}`,
          "Chính tả nghe – viết và viết đoạn văn 4–5 câu (in kèm, chấm trên giấy)",
        ],
      count: grade === 1 ? 6 : 9, minutes: TV12_MINUTES[grade as 1 | 2][0] + 10,
      paper: (seed) => buildTv12(tv, kind, kindLabel, seed),
    };
  }

  if (subject === "Tiếng Việt") {
    const tv = TV_CONTENT[grade];
    if (!tv) return null;
    const [t8, t9] = tv.ltvcByKind[kind];
    return {
      ...base,
      scope: [
        `Đọc hiểu: một bài đọc mới (${passagesFor(tv, kind).map((p) => `“${p.title}”`).join(" hoặc ")}) và 6 câu hỏi`,
        `Luyện từ và câu: ${[...new Set([t8, t9])].map((t) => tv.topicNames[t]).join(", ")}`,
        "Câu hỏi viết 1–2 câu (chấm trên giấy)",
        "Kiểm tra viết: một đề tập làm văn (in kèm, chấm trên giấy)",
      ],
      count: 9, minutes: 35,
      paper: (seed) => buildTiengViet(tv, kind, kindLabel, seed),
    };
  }

  const ids = MATH_SCOPE[grade]?.[kind];
  if (!ids) return null;
  const topics = ids.map((id) => MATH_LESSONS.find((l) => l.id === id)).filter((l): l is MathLessonSpec => !!l);
  if (topics.length === 0) return null;
  if (grade === 5) {
    return {
      ...base, scope: [...topics.map((t) => t.title), "Có câu hình vẽ, đặt tính, tìm x và bài toán có lời văn như đề thật"],
      count: 16, minutes: 40,
      paper: (seed) => buildToan5(kind, kindLabel, seed),
    };
  }
  if (!isSmallGrade(grade)) return null;
  return {
    ...base, scope: [...topics.map((t) => t.title), FIGURE_NOTE[grade]],
    count: toanCount(grade, kind), minutes: toanMinutes(grade),
    paper: (seed) => buildToan1to4(grade, kind, kindLabel, seed),
  };
}

/** Đọc lại spec từ khoá trong URL (`?de=`); khoá lạ → null. */
export function quickExamById(id: string | undefined | null): QuickExamSpec | null {
  const m = id?.match(/^(toan|tieng-viet|tieng-anh)-(\d)-(giua-hk[12]|cuoi-hk[12])$/);
  if (!m || !isExamKind(m[3])) return null;
  const subject = Object.keys(SUBJECT_SLUG).find((k) => SUBJECT_SLUG[k] === m[1])!;
  return getQuickExam(Number(m[2]), subject, m[3]);
}

/** Môn nào của lớp này có đề tự sinh (để giao diện gắn nhãn "Sắp có" cho môn còn lại). */
export function hasQuickExam(grade: number, subject: string): boolean {
  return EXAM_KINDS.some((k) => getQuickExam(grade, subject, k.key) !== null);
}

/** Seed chỉ gồm chữ thường và số, ngắn — nằm trong URL nên lọc cho sạch. */
export function cleanSeed(seed: string | undefined | null): string | null {
  const s = (seed ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12);
  return s || null;
}

/** Các câu làm trên máy, đúng thứ tự trên tờ đề in. */
export function buildQuickExamRows(spec: QuickExamSpec, seed: string): GenQuestionRow[] {
  return paperRows(spec.paper(seed));
}

/** Dòng tự sinh → câu hỏi của trang quiz (cùng cách đọc `explanation` như lib/db.ts). */
export function rowToQuestion(row: GenQuestionRow, id: number): Question {
  let images: QImage[] = [];
  let explanation: string | undefined;
  try {
    const exp = JSON.parse(row.explanation) as { solution?: string; images?: { url: string; position?: string }[] };
    images = (exp.images ?? []).map((im) => ({ url: im.url, position: im.position === "before" ? "before" : "after" }));
    if (exp.solution?.trim()) explanation = exp.solution;
  } catch { /* không có lời giải thì thôi */ }
  return {
    id,
    type: row.type,
    question: row.content,
    options: row.options,
    correctAnswer: row.correct_answer,
    images,
    imageUrl: images[0]?.url,
    explanation,
  };
}

export function quickExamHref(spec: QuickExamSpec, seed: string): string {
  return `/quiz?de=${spec.id}&seed=${encodeURIComponent(seed)}`;
}
