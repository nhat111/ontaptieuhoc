// lib/exam5/tiengAnh.ts
// Đề kiểm tra Tiếng Anh tiểu học theo sách Tiếng Anh Global Success (Kết nối tri thức), 10 điểm:
//   PART 1. LISTENING (2 điểm): 4 câu × 0,5 — người lớn đọc lời (in ở hướng dẫn chấm), bé khoanh
//           trên giấy. Hội thoại nào có file nghe làm sẵn (lib/enListenClips.ts) thì làm được cả trên
//           máy: bé bấm “Nghe hội thoại”; hội thoại chưa có file vẫn chỉ in (giọng máy đọc câu sẽ
//           không đọc lời thoại, bé không có gì để nghe).
//   PART 2. READING (3 điểm): chọn từ khác loại 2 × 0,5; đọc đoạn văn, chọn True / False 4 × 0,5.
//   PART 3. WRITING (3 điểm): chọn đáp án đúng 4 × 0,5; chọn câu đúng thứ tự từ 2 × 0,5.
//   PART 4. SPEAKING (2 điểm): giáo viên hỏi 4 câu, chấm theo biểu điểm.
// Nội dung VIẾT TAY theo từng Unit (./enContent5.ts …), không chép sách: hội thoại, nhóm từ, câu
// ngữ pháp, bài đọc. Phạm vi mỗi kì là các Unit đã học (sách 20 Unit, 10 Unit mỗi tập).

import { mulberry32, pick, seedFrom, shuffle, type Rng } from "../mathGen/core";
import type { GenQuestionRow } from "../mathGen";
import type { ExamKind } from "../quickExam";
import { itemRng } from "../tvGen/core";
import type { ExamPaper, PaperQuestion, PaperSection } from "./paper";
import { EN_LISTEN_CLIPS } from "../enListenClips";

/** Một lượt hội thoại: `a` chứa nguyên văn `key`; `wrong` là hai đáp án nhiễu cùng loại. */
export interface EnQa { q: string; a: string; key: string; wrong: [string, string] }

/** Câu chọn đáp án đúng: `q` có một chỗ trống "___", ba lựa chọn, đúng một đáp án. */
export interface EnGram { q: string; options: [string, string, string]; answer: string; explain: string }

export interface EnUnit {
  n: number;
  title: string;
  qa: EnQa[];
  /** Nhóm từ cùng loại (để chọn từ khác loại): tên nhóm → các từ. Hai nhóm không chung từ nào. */
  groups: Record<string, string[]>;
  gram: EnGram[];
  /** Câu mẫu thêm cho bài sắp xếp từ, khi câu trả lời của hội thoại quá ngắn (lớp 3). */
  sentences?: string[];
}

export interface EnPassage {
  id: string;
  kinds: ExamKind[];
  title: string;
  text: string;
  /** Bốn câu True / False; `explain` trích câu trong bài. */
  tf: { s: string; answer: "True" | "False"; explain: string }[];
}

export interface EnContent {
  grade: number;
  book: string;
  units: EnUnit[];
  passages: EnPassage[];
  /** Độ dài bài đọc (số từ), scripts/tieng-anh-check.ts soát. */
  words: [number, number];
  /** Cặp nhóm gần nghĩa nhau, không lấy từ nhóm này làm từ khác loại của nhóm kia. */
  apart?: [string, string][];
}

/** Các Unit vào đề theo kì: giữa kì là nửa đầu của tập, cuối kì là cả tập. */
export const EN_UNITS: Record<ExamKind, [number, number]> = {
  "giua-hk1": [1, 5], "cuoi-hk1": [1, 10], "giua-hk2": [11, 15], "cuoi-hk2": [11, 20],
};

export const unitsFor = (c: EnContent, kind: ExamKind) => {
  const [a, b] = EN_UNITS[kind];
  return c.units.filter((u) => u.n >= a && u.n <= b);
};
export const enPassages = (c: EnContent, kind: ExamKind) => c.passages.filter((p) => p.kinds.includes(kind));

const row = (content: string, options: string[], answer: string, solution: string): GenQuestionRow => ({
  content, type: "mcq", options, correct_answer: answer, explanation: JSON.stringify({ solution }),
});

/** Từ đầu câu viết thường lại được khi đổi chỗ (tên riêng, "I" thì giữ nguyên chữ hoa). */
const LOWER_FIRST = /^(it|it's|they|they're|they'd|they'll|she|she's|she'd|she'll|he|he's|he'd|he'll|we|we're|we'd|we'll|you|you're|you'd|you'll|my|our|his|her|their|the|there|because|go|let's|what|where|how)$/i;

/** Bỏ dấu câu cuối, tách từ; từ đầu câu về chữ thường nếu không phải tên riêng. */
export const tokens = (s: string) => {
  const ws = s.replace(/[.?!]$/, "").split(" ");
  if (LOWER_FIRST.test(ws[0])) ws[0] = ws[0].toLowerCase();
  return ws;
};
const sentence = (ws: string[], end: string) => {
  const t = ws.join(" ");
  return t.charAt(0).toUpperCase() + t.slice(1) + end;
};
/** Trạng từ đổi chỗ vẫn có thể đúng ngữ pháp — không dùng làm chỗ đổi để ra câu sai. */
// Trợ động từ, động từ khuyết thiếu: đổi chỗ với chủ ngữ là ra câu hỏi đúng ("Should you …").
const MOVABLE = new Set([
  "always", "usually", "often", "sometimes", "never", "today", "yesterday", "also", "too", "really", "very",
  "should", "can", "will", "would", "could", "do", "does", "did", "is", "are", "am", "was", "were",
]);

/** Hai câu sai thứ tự: đổi chỗ hai từ liền nhau (không đụng trạng từ). */
export function wrongOrders(s: string): string[] {
  const ws = tokens(s);
  const end = s.match(/[.?!]$/)?.[0] ?? ".";
  const right = sentence(ws, end);
  const out: string[] = [];
  const spots = shuffle(itemRng("reorder", s), ws.slice(0, -1).map((_, i) => i))
    .filter((i) => !MOVABLE.has(ws[i].toLowerCase()) && !MOVABLE.has(ws[i + 1].toLowerCase()) && ws[i] !== ws[i + 1])
    // Không đổi chỗ trong tên riêng (Hoan Kiem, City Museum): đó là đố tên, không phải đố tiếng Anh.
    .filter((i) => !(i > 0 && /^[A-Z]/.test(ws[i])) && !/^[A-Z]/.test(ws[i + 1]));
  for (const i of spots) {
    const w = [...ws];
    [w[i], w[i + 1]] = [w[i + 1], w[i]];
    const cand = sentence(w, end);
    if (cand !== right && !out.includes(cand)) out.push(cand);
    if (out.length === 2) break;
  }
  return out;
}

/** Lời đọc của một câu nghe: in ở hướng dẫn chấm, và là khoá của file nghe trong lib/enListenClips.ts. */
export const listenScript = (x: EnQa) => `A: ${x.q}  B: ${x.a}`;

/** Câu sắp xếp được: 4–9 từ, không có dấu phẩy, có hai cách đổi chỗ ra câu sai. */
export const reorderable = (s: string) =>
  !/[,“”"]/.test(s) && !/[.?!] /.test(s) && tokens(s).length >= 4 && tokens(s).length <= 9 && wrongOrders(s).length === 2;

const SPEAKING_RUBRIC: [string, number][] = [
  ["Hiểu câu hỏi, trả lời đúng nội dung", 1],
  ["Phát âm rõ ràng, tương đối chính xác", 0.5],
  ["Nói trôi chảy, tự tin, trả lời bằng câu đầy đủ", 0.5],
];

export function buildTiengAnh(c: EnContent, kind: ExamKind, kindLabel: string, seed: string): ExamPaper {
  const r: Rng = mulberry32(seedFrom(`en${c.grade}|${kind}|${seed}`));
  const units = unitsFor(c, kind);
  const qas = shuffle(r, units.flatMap((u) => u.qa));
  const q = (rw: GenQuestionRow, points: number, extra: Partial<PaperQuestion> = {}): PaperQuestion => ({ row: rw, points, ...extra });

  // Listening: 4 hội thoại (mỗi câu của một Unit khác nhau nếu được).
  const listenQa: EnQa[] = [];
  for (const x of qas) if (listenQa.length < 4 && !listenQa.some((y) => y.q === x.q)) listenQa.push(x);
  const listening = listenQa.map((x) => {
    const shown = x.a.replace(x.key, "___");
    const script = listenScript(x);
    // Lời giải để trống: hướng dẫn chấm đã in lời đọc (script) ngay dưới đáp án.
    const rw = row(`${x.q} – ${shown}`, shuffle(r, [x.key, ...x.wrong]), x.key, "");
    // Có file nghe thì câu vào cả bài làm trên máy. Không gọi thêm r(): đề in và link đã chia
    // sẻ giữ nguyên, chỉ bài làm trên máy có thêm câu nghe.
    const url = EN_LISTEN_CLIPS[script];
    if (url) rw.explanation = JSON.stringify({ ...JSON.parse(rw.explanation), listen: { url, script } });
    return q(rw, 0.5, { printOnly: !url, script });
  });

  // Reading 1: chọn từ khác loại — 3 từ một nhóm + 1 từ nhóm khác (cùng phạm vi kì).
  const groups = units.flatMap((u) => Object.entries(u.groups).map(([name, words]) => ({ name, words })));
  const odd: PaperQuestion[] = [];
  for (const g of shuffle(r, groups.filter((x) => x.words.length >= 3))) {
    if (odd.length === 2) break;
    const near = (c.apart ?? []).flatMap(([a, b]) => (a === g.name ? [b] : b === g.name ? [a] : []));
    const others = groups.filter((x) => x.name !== g.name && !near.includes(x.name)).flatMap((x) => x.words).filter((w) => !g.words.includes(w));
    const three = shuffle(r, g.words).slice(0, 3);
    const out = pick(r, others);
    odd.push(q(row("Choose the word that is different from the others.", shuffle(r, [...three, out]), out,
      `“${three.join("”, “")}” đều là ${g.name}; “${out}” thì không.`), 0.5));
  }

  // Reading 2: bài đọc + True / False.
  const passage = pick(r, enPassages(c, kind));
  const tf = passage.tf.map((t) => q(row(t.s, ["True", "False"], t.answer, t.explain), 0.5));

  // Writing 1: chọn đáp án đúng.
  const gram = shuffle(r, units.flatMap((u) => u.gram)).slice(0, 4)
    .map((g) => q(row(g.q, shuffle(r, g.options), g.answer, g.explain), 0.5));

  // Writing 2: câu đúng thứ tự — lấy câu trả lời của hội thoại chưa dùng ở phần nghe.
  // Thiếu câu (lớp 3: câu trả lời ngắn) mới lấy thêm câu mẫu — đề lớp 5 đã chia sẻ giữ nguyên.
  let pool = qas.filter((x) => !listenQa.includes(x) && reorderable(x.a));
  if (pool.length < 2) {
    const more = shuffle(r, units.flatMap((u) => u.sentences ?? []).filter(reorderable));
    pool = [...pool, ...more.map((a) => ({ q: "", a, key: "", wrong: ["", ""] as [string, string] }))];
  }
  const reo = pool.slice(0, 2).map((x) => {
    // Tên riêng nhiều tiếng (Nha Trang, City Museum) giữ thành một thẻ.
    const parts = shuffle(itemRng("parts", x.a), tokens(x.a).reduce<string[]>((acc, w, i, ws) => {
      if (i > 1 && /^[A-Z]/.test(w) && /^[A-Z]/.test(ws[i - 1])) acc[acc.length - 1] += ` ${w}`;
      else acc.push(w);
      return acc;
    }, []));
    return q(row(`Put the words in the correct order: ${parts.join(" / ")}`, shuffle(r, [x.a, ...wrongOrders(x.a)]), x.a,
      `Câu đúng: “${x.a}”`), 0.5);
  });

  // Speaking: 4 câu hỏi khác các câu đã dùng.
  const used = new Set([...listenQa, ...qas.filter((x) => reo.some((p) => p.row.correct_answer === x.a))].map((x) => x.q));
  const speak: string[] = [];
  const personal = (x: EnQa) => /\byour?\b/i.test(x.q) && !/\bthere\b/.test(x.q);
  // "What's your hobby, Mai?" và "What's your hobby?" là một câu hỏi.
  const bare = (q: string) => q.replace(/, [A-Z][a-z]+\?$/, "?");
  const fresh = (q: string) => !speak.some((y) => bare(y) === bare(q));
  for (const x of qas) if (speak.length < 4 && !used.has(x.q) && fresh(x.q) && personal(x)) speak.push(bare(x.q));
  // Ít câu hỏi về bản thân (lớp 4 giữa kì): hỏi lại câu đã dùng ở phần nghe — bé trả lời về mình.
  for (const x of qas) if (speak.length < 4 && fresh(x.q) && personal(x)) speak.push(bare(x.q));

  const sections: PaperSection[] = [
    { title: "PART 1. LISTENING", note: "Listen and choose A, B or C. (Người lớn đọc lời ở trang hướng dẫn chấm, mỗi câu hai lần.)", label: "Question", items: listening },
    { title: "PART 2. READING – Task 1", note: "Choose the odd one out.", label: "Question", items: odd },
    { title: "PART 2. READING – Task 2", note: "Read the passage and choose True or False.", label: "Question", items: tf, passage: { title: passage.title, text: passage.text } },
    { title: "PART 3. WRITING – Task 1", note: "Choose the correct answer A, B or C.", label: "Question", items: gram },
    { title: "PART 3. WRITING – Task 2", note: "Choose the sentence with the correct word order.", label: "Question", items: reo },
  ];

  return {
    title: `Đề kiểm tra ${kindLabel.replace(/^./, (ch) => ch.toLowerCase())} – Tiếng Anh lớp ${c.grade}`,
    subject: "Tiếng Anh", grade: c.grade, kindLabel, minutes: 35,
    sections,
    speaking: { title: "PART 4. SPEAKING", points: 2, questions: speak, rubric: SPEAKING_RUBRIC },
  };
}
