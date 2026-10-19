// lib/exam5/paper.ts
// "Tờ đề" — cấu trúc chung của một đề kiểm tra như đề giấy: các phần (Trắc nghiệm, Tự
// luận, Đọc hiểu…), mỗi câu có điểm, câu tự luận có chỗ làm bài. Một tờ đề vừa in được
// (lib/exam5/print.ts), vừa làm được trên máy: `paperRows` lấy ra các câu máy chấm được.
//
// Câu "mở" (viết câu, viết đoạn văn) không có đáp án máy chấm được: chỉ in, không vào quiz.

import type { GenQuestionRow } from "../mathGen";

/** Chỗ làm bài khi in. */
export type Work =
  | "none"
  | "dat-tinh"   // ô trống để đặt tính
  | "bai-giai"   // "Bài giải" + dòng kẻ chấm
  | "lines";     // vài dòng kẻ chấm để viết câu trả lời

export interface PaperQuestion {
  row: GenQuestionRow;
  points: number;
  work?: Work;
  /** Số dòng kẻ cho "bai-giai" / "lines". */
  lines?: number;
  /** Câu mở: in ra, không chấm trên máy. `answerHint` là gợi ý đáp án cho hướng dẫn chấm. */
  open?: { answerHint: string };
}

/** Một bài nhiều ý a), b), c)… dùng chung một lời dẫn ("Đặt tính rồi tính:"). */
export interface PaperGroup {
  prompt: string;
  parts: PaperQuestion[];
  work?: Work;
}

export type PaperItem = PaperQuestion | PaperGroup;

export const isGroup = (it: PaperItem): it is PaperGroup => "parts" in it;

export interface PaperSection {
  title: string;
  note?: string;
  /** "Câu 1." hay "Bài 1." */
  label: "Câu" | "Bài";
  items: PaperItem[];
}

export interface Reading {
  title: string;
  /** Đoạn văn, các đoạn cách nhau bởi dòng trống. */
  text: string;
  source?: string;
}

export interface Writing {
  title: string;
  prompt: string;
  points: number;
  minutes: number;
}

export interface ExamPaper {
  title: string;
  subject: string;
  grade: number;
  /** "Giữa học kì I"… */
  kindLabel: string;
  minutes: number;
  /** Tiếng Việt: phần A. Kiểm tra đọc có bài đọc chung cho các câu đọc hiểu. */
  reading?: Reading;
  /** Tiếng Việt: điểm đọc thành tiếng (giáo viên kiểm tra riêng, chỉ ghi trong hướng dẫn chấm). */
  readAloudPoints?: number;
  sections: PaperSection[];
  /** Tiếng Việt: phần B. Kiểm tra viết — chỉ in. */
  writing?: Writing;
}

/** Mọi câu của một mục, tách nhóm thành từng ý. */
export function questionsOf(it: PaperItem): PaperQuestion[] {
  return isGroup(it) ? it.parts : [it];
}

/** Tổng điểm các phần câu hỏi (không gồm đọc thành tiếng và phần viết). */
export function sectionPoints(paper: ExamPaper): number {
  return round2(paper.sections.reduce((s, sec) => s + sec.items.flatMap(questionsOf).reduce((a, q) => a + q.points, 0), 0));
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Các câu máy chấm được, theo đúng thứ tự trên tờ đề. Ý của một nhóm mang theo lời
 * dẫn ("Đặt tính rồi tính: 12,5 + 3,75 = ___") vì trên máy mỗi ý là một câu riêng.
 */
export function paperRows(paper: ExamPaper): GenQuestionRow[] {
  const out: GenQuestionRow[] = [];
  for (const sec of paper.sections) {
    for (const it of sec.items) {
      if (isGroup(it)) {
        for (const p of it.parts) if (!p.open) out.push({ ...p.row, content: `${it.prompt} ${p.row.content}` });
      } else if (!it.open) out.push(it.row);
    }
  }
  return out;
}

/** Điểm hiển thị kiểu Việt Nam: 0,5 điểm; 1 điểm. */
export const pointsText = (n: number) => `${String(round2(n)).replace(".", ",")} điểm`;
