// lib/quickExam.ts
// "Tạo đề nhanh": phụ huynh chọn lớp → loại đề (giữa/cuối học kì) → môn, máy sinh ra
// một đề kiểm tra để làm trên máy (/quiz?de=…) hoặc in ra giấy (/tao-de).
//
// Chỉ môn có nội dung sinh sẵn mới có đề: Toán lớp 1–5 (lib/mathGen) và — theo cấu trúc
// đề giấy thật, có hình vẽ — Toán, Tiếng Việt lớp 5 (lib/exam5). Mỗi đề là một "tờ đề"
// (lib/exam5/paper.ts): in ra được (lib/exam5/print.ts) và làm được trên máy.
// Không gọi AI, không đọc DB: cùng `seed` → cùng đề, nên link /quiz?de=toan-3-cuoi-hk1&seed=abc
// mở lại đúng đề đó (server và trình duyệt trùng nhau).
//
// Phạm vi kiến thức mỗi kì lấy theo thứ tự chủ đề thường gặp trong SGK lớp 1–5
// (chương trình GDPT 2018); mỗi kì là một danh sách id chủ đề trong MATH_LESSONS.
// Đổi/xoá id ở MATH_LESSONS thì sửa ở đây — scripts/quick-exam-check.ts báo id lạc.

import { MATH_LESSONS, buildWorksheetQuestions, type GenQuestionRow, type MathLessonSpec } from "./mathGen";
import type { Question, QImage } from "./quizData";
import { paperRows, type ExamPaper, type PaperSection } from "./exam5/paper";
import { buildToan5 } from "./exam5/toan5";
import { buildTiengViet5, passagesFor } from "./exam5/tiengViet5";
import { LTVC_BY_KIND, LTVC_TOPIC_NAMES } from "./exam5/tvContent";

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
    "giua-hk1": ["toan-1-cac-so-0-10"],
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

/** Số câu và thời gian (lớp 1–4): giữa kì ngắn hơn cuối kì; lớp nhỏ làm ít câu hơn. */
function sizeOf(grade: number, kind: ExamKind): { count: number; minutes: number } {
  const final = kind.startsWith("cuoi");
  if (grade <= 2) return final ? { count: 15, minutes: 35 } : { count: 10, minutes: 30 };
  return final ? { count: 20, minutes: 40 } : { count: 15, minutes: 35 };
}

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

const SUBJECT_SLUG: Record<string, string> = { "Toán": "toan", "Tiếng Việt": "tieng-viet" };
const lowerFirst = (s: string) => s.replace(/^./, (c) => c.toLowerCase());

/**
 * Lớp 1–4: câu tự sinh xếp thành tờ đề — trắc nghiệm trước (0,5 điểm/câu), tự luận sau,
 * chia đều phần điểm còn lại theo bậc 0,25 sao cho tổng đúng 10 điểm.
 */
function paperFromRows(title: string, grade: number, kind: ExamKind, minutes: number, rows: GenQuestionRow[]): ExamPaper {
  const mcq = rows.filter((r) => r.type === "mcq");
  const open = rows.filter((r) => r.type !== "mcq");
  const split = (total: number, n: number) => {
    const each = Math.floor((total / n) * 4) / 4;
    return Array.from({ length: n }, (_, i) => (i === n - 1 ? Math.round((total - each * (n - 1)) * 100) / 100 : each));
  };
  const mcqPts = open.length ? mcq.map(() => 0.5) : split(10, mcq.length);
  const openPts = open.length ? split(10 - mcqPts.reduce((a, b) => a + b, 0), open.length) : [];
  const wordProblem = (r: GenQuestionRow) => /Trả lời: ___ .+\.$/.test(r.content);
  const sections: PaperSection[] = [];
  if (mcq.length) sections.push({ title: "PHẦN I. TRẮC NGHIỆM", note: "Khoanh vào chữ đặt trước câu trả lời đúng.", label: "Câu", items: mcq.map((row, i) => ({ row, points: mcqPts[i] })) });
  if (open.length) sections.push({
    title: mcq.length ? "PHẦN II. TỰ LUẬN" : "TỰ LUẬN", label: "Bài",
    items: open.map((row, i) => ({ row, points: openPts[i], ...(wordProblem(row) ? { work: "bai-giai" as const, lines: 4 } : {}) })),
  });
  return { title, subject: "Toán", grade, kindLabel: examKindLabel(kind), minutes, sections };
}

/** Đề tạo được cho (lớp, môn, kì); null khi môn đó chưa có bộ sinh câu hỏi. */
export function getQuickExam(grade: number, subject: string, kind: ExamKind): QuickExamSpec | null {
  const slug = SUBJECT_SLUG[subject];
  if (!slug) return null;
  const kindLabel = examKindLabel(kind);
  // Chỉ hạ chữ đầu: "Cuối học kì I" → "cuối học kì I" (toLowerCase sẽ biến "I" thành "i").
  const title = `Đề kiểm tra ${lowerFirst(kindLabel)} – ${subject} lớp ${grade}`;
  const base = { id: `${slug}-${grade}-${kind}`, grade, subject, kind, title };

  if (subject === "Tiếng Việt") {
    if (grade !== 5) return null;
    const [t8, t9] = LTVC_BY_KIND[kind];
    return {
      ...base,
      scope: [
        `Đọc hiểu: một bài đọc mới (${passagesFor(kind).map((p) => `“${p.title}”`).join(" hoặc ")}) và 6 câu hỏi`,
        `Luyện từ và câu: ${[...new Set([t8, t9])].map((t) => LTVC_TOPIC_NAMES[t]).join(", ")}`,
        "Câu hỏi viết 1–2 câu (chấm trên giấy)",
        "Kiểm tra viết: một đề tập làm văn (in kèm, chấm trên giấy)",
      ],
      count: 9, minutes: 35,
      paper: (seed) => buildTiengViet5(kind, kindLabel, seed),
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
  const { count, minutes } = sizeOf(grade, kind);
  return {
    ...base, scope: topics.map((t) => t.title), count, minutes,
    paper: (seed) => {
      const rows = buildWorksheetQuestions(topics, count, `de|${base.id}|${seed}`);
      return paperFromRows(title, grade, kind, minutes, [...rows.filter((r) => r.type === "mcq"), ...rows.filter((r) => r.type !== "mcq")]);
    },
  };
}

/** Đọc lại spec từ khoá trong URL (`?de=`); khoá lạ → null. */
export function quickExamById(id: string | undefined | null): QuickExamSpec | null {
  const m = id?.match(/^(toan|tieng-viet)-(\d)-(giua-hk[12]|cuoi-hk[12])$/);
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
