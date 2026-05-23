import type { DraftQuestion } from "./examParser";

// Parser for loigiaihay.com / vietjack-style "giải bài tập" pages, which use
// "Bài N" sections with a "Phương pháp giải" + "Lời giải chi tiết" layout
// rather than the "Câu N. + A./B./C. + Đáp án:" format parseExamText expects.
//
// Each block becomes one question:
//   - If the problem contains an "A. … | B. … | C. …" line → mcq, and the
//     correct option is whichever text appears in the solution.
//   - Otherwise → short, with the solution text as the (loosely-gradeable)
//     answer. These act more as show-the-answer study cards.

const SOLVE_HEADER = /^giải\s+bài\s+\d+/i;
const METHOD_MARK = /^phương\s*pháp\s*giải/i;
const SOLUTION_MARK = /^lời\s*giải\s*chi\s*tiết/i;
const STOP_MARK = /^(bài tiếp theo|bài trước|bài khác|danh sách bình luận|bình luận|>>|xem thêm|các bài kh)/i;

function parseOptionLine(line: string): string[] {
  // "A. 2 015 | B. 2 021 | C. 2 027"  or  "A. x   B. y   C. z"
  const opts: string[] = [];
  const re = /([A-F])[.)]\s*(.+?)(?=\s*\|\s*[A-F][.)]|\s{2,}[A-F][.)]|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    const text = m[2].replace(/\s*\|\s*$/, "").trim();
    if (text) opts.push(text);
  }
  return opts;
}

function isOptionLine(line: string): boolean {
  const letters = line.match(/(?:^|\s|\|)[A-F][.)]\s/g);
  return !!letters && letters.length >= 2;
}

export function parseLoigiaihay(text: string): DraftQuestion[] {
  const all = text.split("\n").map((l) => l.replace(/\s+/g, " ").trim());

  // Truncate footer noise (related lessons, comment form, etc.).
  const stopIdx = all.findIndex((l) => STOP_MARK.test(l));
  const lines = (stopIdx >= 0 ? all.slice(0, stopIdx) : all).filter(Boolean);

  const headerIdxs: number[] = [];
  lines.forEach((l, i) => {
    if (SOLVE_HEADER.test(l)) headerIdxs.push(i);
  });
  if (headerIdxs.length === 0) return [];

  const out: DraftQuestion[] = [];
  for (let b = 0; b < headerIdxs.length; b++) {
    const start = headerIdxs[b];
    const end = b + 1 < headerIdxs.length ? headerIdxs[b + 1] : lines.length;
    const block = lines.slice(start, end);

    const methodIdx = block.findIndex((l) => METHOD_MARK.test(l));
    const solIdx = block.findIndex((l) => SOLUTION_MARK.test(l));

    const problemEnd = methodIdx >= 0 ? methodIdx : solIdx >= 0 ? solIdx : block.length;
    const problemLines = block.slice(1, problemEnd).filter(Boolean);
    if (problemLines.length === 0) continue;

    const answerLines = solIdx >= 0 ? block.slice(solIdx + 1).filter(Boolean) : [];
    const answerText = answerLines.join(" ").trim();

    const optLineIdx = problemLines.findIndex(isOptionLine);
    if (optLineIdx >= 0) {
      const options = parseOptionLine(problemLines[optLineIdx]);
      const stem = problemLines.slice(0, optLineIdx).join("\n").trim();
      let correct: string | null = null;
      if (answerText) {
        const aNorm = answerText.replace(/\s+/g, "");
        for (const opt of options) {
          if (aNorm.includes(opt.replace(/\s+/g, ""))) { correct = opt; break; }
        }
      }
      out.push({
        id: out.length + 1,
        type: "mcq",
        question: stem || problemLines.join("\n"),
        options,
        correctAnswer: correct,
      });
    } else {
      out.push({
        id: out.length + 1,
        type: "short",
        question: problemLines.join("\n"),
        options: [],
        correctAnswer: answerLines.join("\n") || null,
      });
    }
  }
  return out;
}

// Heuristic: does this text look like a loigiaihay-style solution page?
export function looksLikeLoigiaihay(text: string): boolean {
  return /(?:^|\n)\s*giải\s+bài\s+\d+/i.test(text) || /lời\s*giải\s*chi\s*tiết/i.test(text);
}
