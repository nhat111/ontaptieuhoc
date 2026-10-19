// lib/exam5/tiengViet5.ts
// Đề kiểm tra Tiếng Việt lớp 5 theo cấu trúc đề giấy thường gặp:
//   A. Kiểm tra đọc (10 điểm): I. Đọc thành tiếng (3 điểm, giáo viên kiểm tra riêng);
//      II. Đọc hiểu và kiến thức tiếng Việt (7 điểm): câu 1–6 đọc hiểu (0,5 điểm/câu),
//      câu 7 luyện từ và câu gắn với bài đọc, câu 8–9 luyện từ và câu theo kì, câu 10 câu
//      hỏi mở (1 điểm/câu).
//   B. Kiểm tra viết (10 điểm): một đề tập làm văn.
// Nội dung viết tay ở ./tvContent.ts; ở đây chỉ chọn bài, xáo đáp án và dựng tờ đề.
// Câu 10 và phần viết không có đáp án máy chấm được → chỉ in, không vào bài làm trên máy.

import { mulberry32, pick, seedFrom, shuffle, type Rng } from "../mathGen/core";
import type { GenQuestionRow } from "../mathGen";
import type { ExamKind } from "../quickExam";
import type { ExamPaper, PaperQuestion } from "./paper";
import { LTVC_BANK, LTVC_BY_KIND, PASSAGES, WRITING_PROMPTS, type TvMcq } from "./tvContent";

function mcqRow(m: TvMcq, r: Rng): GenQuestionRow {
  return {
    content: m.q, type: "mcq", options: shuffle(r, m.options), correct_answer: m.answer,
    explanation: JSON.stringify({ solution: m.explain }),
  };
}

export const passagesFor = (kind: ExamKind) => PASSAGES.filter((p) => p.kinds.includes(kind));

export function buildTiengViet5(kind: ExamKind, kindLabel: string, seed: string): ExamPaper {
  const r = mulberry32(seedFrom(`tv5|${kind}|${seed}`));
  const passage = pick(r, passagesFor(kind));
  const [t8, t9] = LTVC_BY_KIND[kind];
  const q = (m: TvMcq, points: number): PaperQuestion => ({ row: mcqRow(m, r), points });

  const items: PaperQuestion[] = [
    ...passage.questions.map((m) => q(m, 0.5)),
    q(passage.ltvc, 1),
    q(pick(r, LTVC_BANK[t8]), 1),
    q(pick(r, LTVC_BANK[t9].filter((m) => m.q !== passage.ltvc.q)), 1),
    {
      row: { content: passage.open.q, type: "short", options: [], correct_answer: "", explanation: JSON.stringify({ solution: passage.open.hint }) },
      points: 1, work: "lines", lines: 3, open: { answerHint: passage.open.hint },
    },
  ];

  return {
    title: `Đề kiểm tra ${kindLabel.replace(/^./, (c) => c.toLowerCase())} – Tiếng Việt lớp 5`,
    subject: "Tiếng Việt", grade: 5, kindLabel, minutes: 35,
    reading: { title: passage.title, text: passage.text },
    readAloudPoints: 3,
    sections: [{
      title: "II. ĐỌC HIỂU VÀ KIẾN THỨC TIẾNG VIỆT",
      note: "Đọc bài văn trên rồi khoanh vào chữ đặt trước câu trả lời đúng hoặc làm theo yêu cầu.",
      label: "Câu", items,
    }],
    writing: { title: "B. KIỂM TRA VIẾT", prompt: pick(r, WRITING_PROMPTS[kind]), points: 10, minutes: 40 },
  };
}
