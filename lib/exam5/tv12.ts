// lib/exam5/tv12.ts
// Đề kiểm tra Tiếng Việt lớp 1 và 2 theo cấu trúc đề giấy thường gặp (Thông tư 27):
//   Lớp 1 — A. Đọc (10 điểm): đọc thành tiếng 7 điểm (giáo viên kiểm tra riêng), đọc hiểu
//           3 câu × 1 điểm. B. Viết (10 điểm): chính tả nghe – viết 7 điểm, bài tập chính tả
//           3 câu × 1 điểm.
//   Lớp 2 — A. Đọc (10 điểm): đọc thành tiếng 4 điểm, đọc hiểu và luyện từ và câu 6 điểm
//           (câu 1–4 đọc hiểu × 0,5; câu 5 luyện từ và câu trên bài đọc; câu 6–7 luyện từ và
//           câu theo kì; câu 8 câu hỏi mở, chỉ in). B. Viết (10 điểm): chính tả nghe – viết
//           3 điểm, bài tập chính tả 2 câu × 0,5, viết đoạn văn 4–5 câu 6 điểm.
// Bài đọc, câu hỏi đọc hiểu, đoạn nghe – viết, đề viết đoạn: VIẾT TAY ở ./tvContent1.ts và
// ./tvContent2.ts. Bài tập chính tả, luyện từ và câu theo kì: bộ sinh của lib/tvGen (kho từ đã
// soát, cũng dùng cho bài tập theo từng bài sách).

import { mulberry32, pick, seedFrom, shuffle, type Generator, type Rng } from "../mathGen/core";
import { toQuestionRow, type GenQuestionRow } from "../mathGen";
import type { ExamKind } from "../quickExam";
import type { ExamPaper, PaperQuestion, PaperSection, ReadAloud } from "./paper";
import type { TvMcq } from "./tvContent";

export interface Tv12Passage {
  id: string;
  kinds: ExamKind[];
  title: string;
  /** Các đoạn cách nhau một dòng trống; lời thoại bắt đầu bằng "– ". */
  text: string;
  /** Đọc hiểu: lớp 1 ba câu (3 lựa chọn), lớp 2 bốn câu (4 lựa chọn). */
  questions: TvMcq[];
  /** Lớp 2, câu 5: luyện từ và câu trên bài đọc. */
  ltvc?: TvMcq;
  /** Lớp 2, câu 8: câu hỏi mở, chỉ in. */
  open?: { q: string; hint: string };
  /** Đoạn nghe – viết: trích nguyên văn bài đọc. */
  dictation: string;
}

export interface Tv12Content {
  grade: 1 | 2;
  passages: Tv12Passage[];
  /** Bài tập chính tả theo kì: mỗi câu rút một bộ sinh khác nhau. */
  spelling: Record<ExamKind, Generator[]>;
  /** Tên phần chính tả theo kì (giới thiệu đề cho phụ huynh). */
  spellingNames: Record<ExamKind, string>;
  /** Lớp 2: câu 6, câu 7 theo kì. */
  ltvc?: Record<ExamKind, { names: string; c6: Generator[]; c7: Generator[] }>;
  /** Lớp 2: đề viết đoạn văn 4–5 câu. */
  writing?: Record<ExamKind, string[]>;
  /** Độ dài bài đọc theo kì (số tiếng), scripts/tv12-check.ts soát. */
  words: Record<ExamKind, [number, number]>;
  /** Độ dài đoạn nghe – viết theo kì (số tiếng). */
  dictationWords: Record<ExamKind, [number, number]>;
  /** Tốc độ đọc thành tiếng cần đạt theo kì (ghi trong hướng dẫn chấm). */
  speed: Record<ExamKind, string>;
}

/** Thời gian làm bài: [đọc hiểu, viết] (phút). */
export const TV12_MINUTES: Record<1 | 2, [number, number]> = { 1: [20, 35], 2: [25, 40] };

export const tv12Passages = (c: Tv12Content, kind: ExamKind) => c.passages.filter((p) => p.kinds.includes(kind));

function mcqRow(m: TvMcq, r: Rng): GenQuestionRow {
  return {
    content: m.q, type: "mcq", options: shuffle(r, m.options), correct_answer: m.answer,
    explanation: JSON.stringify({ solution: m.explain }),
  };
}

/** `n` câu từ `n` bộ sinh khác nhau (xáo thứ tự), không trùng nhau. */
function fromGenerators(gens: Generator[], n: number, r: Rng, avoid: Set<string>): GenQuestionRow[] {
  const out: GenQuestionRow[] = [];
  const order = shuffle(r, gens);
  for (let i = 0; i < n; i++) {
    const g = order[i % order.length];
    let row = toQuestionRow(g(r), r);
    for (let t = 0; t < 30 && avoid.has(row.content); t++) row = toQuestionRow(g(r), r);
    avoid.add(row.content);
    out.push(row);
  }
  return out;
}

const READ_ALOUD: Record<1 | 2, (speed: string, title: string) => ReadAloud> = {
  1: (speed, title) => ({
    points: 7,
    task: `Học sinh đọc to bài “${title}” ở trên (hoặc một đoạn trong bài), sau đó trả lời một câu hỏi về nội dung đoạn vừa đọc. Tốc độ cần đạt: ${speed}.`,
    rubric: [
      ["Đọc đúng, rõ ràng các tiếng, từ; không phải đánh vần", 3],
      ["Tốc độ đọc đạt yêu cầu", 2],
      ["Ngắt, nghỉ hơi đúng ở dấu câu", 1],
      ["Trả lời đúng câu hỏi về nội dung đoạn đọc", 1],
    ],
  }),
  2: (speed, title) => ({
    points: 4,
    task: `Học sinh đọc một đoạn khoảng 60–70 tiếng trong bài “${title}” ở trên (hoặc bài đã học), sau đó trả lời một câu hỏi về nội dung đoạn đọc. Tốc độ cần đạt: ${speed}.`,
    rubric: [
      ["Đọc vừa đủ nghe, rõ ràng; tốc độ đạt yêu cầu", 1],
      ["Đọc đúng tiếng, đúng từ (không sai quá 5 tiếng)", 1],
      ["Ngắt, nghỉ hơi đúng ở dấu câu, các cụm từ rõ nghĩa", 1],
      ["Trả lời đúng câu hỏi về nội dung đoạn đọc", 1],
    ],
  }),
};

const DICTATION_RUBRIC: Record<1 | 2, [string, number][]> = {
  1: [
    ["Viết đúng tốc độ (khoảng 15 phút)", 2],
    ["Viết đúng kiểu chữ thường, cỡ vừa; nét chữ đều", 2],
    ["Viết đúng các tiếng, từ, dấu câu (mỗi lỗi trừ 0,25 điểm)", 2],
    ["Trình bày đúng, sạch sẽ", 1],
  ],
  2: [
    ["Viết đúng tốc độ, đúng kiểu chữ, cỡ chữ", 1],
    ["Viết đúng chính tả, không mắc quá 5 lỗi (mỗi lỗi trừ 0,2 điểm)", 1],
    ["Trình bày đúng quy định, viết sạch, đẹp", 1],
  ],
};

const WRITING_RUBRIC: [string, number][] = [
  ["Viết được đoạn văn 4–5 câu đúng yêu cầu của đề, đủ ý theo gợi ý", 3],
  ["Dùng từ đúng, câu văn đúng, có ý hay", 1],
  ["Viết đúng chính tả, viết hoa đầu câu, dùng dấu câu đúng", 1],
  ["Chữ viết rõ ràng, trình bày sạch đẹp", 1],
];

export function buildTv12(c: Tv12Content, kind: ExamKind, kindLabel: string, seed: string): ExamPaper {
  const r = mulberry32(seedFrom(`tv${c.grade}|${kind}|${seed}`));
  const passage = pick(r, tv12Passages(c, kind));
  const [readMin, vietMin] = TV12_MINUTES[c.grade];
  const q = (row: GenQuestionRow, points: number): PaperQuestion => ({ row, points });
  const seen = new Set<string>(passage.questions.map((m) => m.q));

  let docHieu: PaperQuestion[];
  let vietItems: PaperQuestion[];
  let writing: ExamPaper["writing"];
  if (c.grade === 1) {
    docHieu = passage.questions.map((m) => q(mcqRow(m, r), 1));
    vietItems = fromGenerators(c.spelling[kind], 3, r, seen).map((row) => q(row, 1));
  } else {
    const l = c.ltvc![kind];
    docHieu = [
      ...passage.questions.map((m) => q(mcqRow(m, r), 0.5)),
      q(mcqRow(passage.ltvc!, r), 1),
      ...fromGenerators([pick(r, l.c6)], 1, r, seen).map((row) => q(row, 1)),
      ...fromGenerators([pick(r, l.c7)], 1, r, seen).map((row) => q(row, 1)),
      {
        row: { content: passage.open!.q, type: "short", options: [], correct_answer: "", explanation: JSON.stringify({ solution: passage.open!.hint }) },
        points: 1, work: "lines", lines: 2, open: { answerHint: passage.open!.hint },
      },
    ];
    vietItems = fromGenerators(c.spelling[kind], 2, r, seen).map((row) => q(row, 0.5));
    writing = { title: "Viết đoạn văn", prompt: pick(r, c.writing![kind]), points: 6, minutes: 25, rubric: WRITING_RUBRIC, lines: 9 };
  }

  const sections: PaperSection[] = [
    {
      title: c.grade === 1 ? "II. ĐỌC HIỂU" : "II. ĐỌC HIỂU VÀ KIẾN THỨC TIẾNG VIỆT",
      note: c.grade === 1 ? "Đọc bài trên rồi khoanh vào chữ đặt trước câu trả lời đúng." : "Đọc bài trên rồi khoanh vào chữ đặt trước câu trả lời đúng hoặc làm theo yêu cầu.",
      label: "Câu", items: docHieu,
    },
    {
      title: c.grade === 1 ? "Bài tập" : "Bài tập chính tả", part: "viet",
      note: "Khoanh vào chữ đặt trước câu trả lời đúng.",
      label: "Câu", items: vietItems,
    },
  ];

  return {
    title: `Đề kiểm tra ${kindLabel.replace(/^./, (ch) => ch.toLowerCase())} – Tiếng Việt lớp ${c.grade}`,
    subject: "Tiếng Việt", grade: c.grade, kindLabel, minutes: readMin,
    reading: { title: passage.title, text: passage.text, heading: c.grade === 1 ? "II. Đọc hiểu" : "II. Đọc hiểu và kiến thức tiếng Việt" },
    readAloudPoints: READ_ALOUD[c.grade]("", "").points,
    readAloud: READ_ALOUD[c.grade](c.speed[kind], passage.title),
    sections,
    writing,
    viet: {
      minutes: vietMin,
      dictation: {
        title: c.grade === 1 ? "Viết chính tả (nghe – viết)" : "Chính tả (nghe – viết)",
        text: passage.dictation, points: c.grade === 1 ? 7 : 3, lines: c.grade === 1 ? 5 : 6,
        rubric: DICTATION_RUBRIC[c.grade],
      },
    },
  };
}
