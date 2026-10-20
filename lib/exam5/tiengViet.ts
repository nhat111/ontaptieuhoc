// lib/exam5/tiengViet.ts
// Đề kiểm tra Tiếng Việt lớp 4 và lớp 5 theo cấu trúc đề giấy thường gặp:
//   A. Kiểm tra đọc (10 điểm): I. Đọc thành tiếng (3 điểm, giáo viên kiểm tra riêng);
//      II. Đọc hiểu và kiến thức tiếng Việt (7 điểm): câu 1–6 đọc hiểu (0,5 điểm/câu),
//      câu 7 luyện từ và câu gắn với bài đọc, câu 8–9 luyện từ và câu theo kì, câu 10 câu
//      hỏi mở (1 điểm/câu).
//   B. Kiểm tra viết (10 điểm): một đề tập làm văn.
// Nội dung viết tay ở ./tvContent.ts (lớp 5) và ./tvContent4.ts (lớp 4); ở đây chỉ chọn
// bài, xáo đáp án và dựng tờ đề. Câu 10 và phần viết không có đáp án máy chấm được → chỉ
// in, không vào bài làm trên máy.

import { mulberry32, pick, seedFrom, shuffle, type Rng } from "../mathGen/core";
import type { GenQuestionRow } from "../mathGen";
import type { ExamKind } from "../quickExam";
import type { ExamPaper, PaperQuestion } from "./paper";
import { TV5, type TvContent, type TvMcq } from "./tvContent";
import { TV4 } from "./tvContent4";

export const TV_CONTENT: Record<number, TvContent> = { 4: TV4, 5: TV5 };

function mcqRow(m: TvMcq, r: Rng): GenQuestionRow {
  return {
    content: m.q, type: "mcq", options: shuffle(r, m.options), correct_answer: m.answer,
    explanation: JSON.stringify({ solution: m.explain }),
  };
}

export const passagesFor = (c: TvContent, kind: ExamKind) => c.passages.filter((p) => p.kinds.includes(kind));

export function buildTiengViet(c: TvContent, kind: ExamKind, kindLabel: string, seed: string): ExamPaper {
  // Lớp 5 giữ tiền tố "tv5|" như trước: link đề cũ (?de=…&seed=…) mở lại đúng đề.
  const r = mulberry32(seedFrom(`tv${c.grade}|${kind}|${seed}`));
  const passage = pick(r, passagesFor(c, kind));
  const [t8, t9] = c.ltvcByKind[kind];
  const q = (m: TvMcq, points: number): PaperQuestion => ({ row: mcqRow(m, r), points });

  const items: PaperQuestion[] = [
    ...passage.questions.map((m) => q(m, 0.5)),
    q(passage.ltvc, 1),
    q(pick(r, c.ltvcBank[t8].filter((m) => m.q !== passage.ltvc.q)), 1),
    q(pick(r, c.ltvcBank[t9].filter((m) => m.q !== passage.ltvc.q)), 1),
    {
      row: { content: passage.open.q, type: "short", options: [], correct_answer: "", explanation: JSON.stringify({ solution: passage.open.hint }) },
      points: 1, work: "lines", lines: 3, open: { answerHint: passage.open.hint },
    },
  ];

  return {
    title: `Đề kiểm tra ${kindLabel.replace(/^./, (ch) => ch.toLowerCase())} – Tiếng Việt lớp ${c.grade}`,
    subject: "Tiếng Việt", grade: c.grade, kindLabel, minutes: 35,
    reading: { title: passage.title, text: passage.text },
    readAloudPoints: 3,
    sections: [{
      title: "II. ĐỌC HIỂU VÀ KIẾN THỨC TIẾNG VIỆT",
      note: "Đọc bài văn trên rồi khoanh vào chữ đặt trước câu trả lời đúng hoặc làm theo yêu cầu.",
      label: "Câu", items,
    }],
    writing: { title: "B. KIỂM TRA VIẾT", prompt: pick(r, c.writing[kind]), points: 10, minutes: 40 },
  };
}
