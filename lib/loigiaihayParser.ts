import type { DraftQuestion } from "./examParser";

// Parser for loigiaihay.com / vietjack-style "giải bài tập" pages, which use
// "Bài N" sections with a "Phương pháp giải" + "Lời giải chi tiết" layout
// rather than the "Câu N. + A./B./C. + Đáp án:" format parseExamText expects.
//
// A block ("Bài N") can be either:
//   • a compound MCQ with sub-parts a) b) c) d), each its own multiple-choice
//     question — emitted as one mcq per sub-part, correct letter taken from
//     the "Chọn X" marker in the matching solution sub-part; or
//   • a single MCQ ("A. … | B. … | C. …") → one mcq; or
//   • an open-ended exercise → one short, with the solution as a loosely-
//     gradeable answer (show-the-answer study card).

const SOLVE_HEADER = /^giải\s+bài\s+\d+/i;
const METHOD_MARK = /^phương\s*pháp\s*giải/i;
const SOLUTION_MARK = /^lời\s*giải\s*chi\s*tiết/i;
const STOP_MARK = /^(bài tiếp theo|bài trước|bài khác|danh sách bình luận|bình luận|>>|xem thêm|các bài kh)/i;
const SUBPART = /^([a-d])\)\s*(.*)$/i;

type Opt = { letter: string; text: string };

// Pull "A. x" / "B. y" tokens out of one or more lines. Handles 2-column
// rows joined by " | " as well as one-option-per-line layouts.
function extractOptions(lines: string[]): Opt[] {
  const opts: Opt[] = [];
  for (const raw of lines) {
    for (const part of raw.split(/\s*\|\s*/)) {
      const m = part.match(/^\s*([A-F])[.)]\s*(.+)$/);
      if (m && m[2].trim()) opts.push({ letter: m[1].toUpperCase(), text: m[2].trim() });
    }
  }
  return opts;
}

function startsWithOption(line: string): boolean {
  return /^\s*[A-F][.)]\s/.test(line) || /\s\|\s*[A-F][.)]\s/.test(line);
}

function isOptionLine(line: string): boolean {
  const letters = line.match(/(?:^|\s|\|)[A-F][.)]\s/g);
  return !!letters && letters.length >= 2;
}

// From the solution section, map sub-part letter → chosen option letter
// (via "Chọn X") and → the full answer text for that sub-part.
function answerMaps(answerLines: string[]): {
  letterMap: Map<string, string>;
  textMap: Map<string, string>;
} {
  const letterMap = new Map<string, string>();
  const textMap = new Map<string, string>();
  let cur: string | null = null;
  for (const line of answerLines) {
    const sm = line.match(SUBPART);
    if (sm) {
      cur = sm[1].toLowerCase();
      textMap.set(cur, sm[2] || "");
    } else if (cur) {
      textMap.set(cur, [textMap.get(cur), line].filter(Boolean).join("\n"));
    }
    const cm = line.match(/\bchọn\s+([A-F])\b/i);
    if (cm && cur) letterMap.set(cur, cm[1].toUpperCase());
  }
  return { letterMap, textMap };
}

export function parseLoigiaihay(text: string): DraftQuestion[] {
  const all = text
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    // Drop standalone "Bài N" box labels — the real header is "Giải Bài N".
    .filter((l) => !/^bài\s+\d+$/i.test(l));

  const stopIdx = all.findIndex((l) => STOP_MARK.test(l));
  const lines = (stopIdx >= 0 ? all.slice(0, stopIdx) : all).filter(Boolean);

  const headerIdxs: number[] = [];
  lines.forEach((l, i) => {
    if (SOLVE_HEADER.test(l)) headerIdxs.push(i);
  });
  if (headerIdxs.length === 0) return [];

  const out: DraftQuestion[] = [];
  const push = (q: Omit<DraftQuestion, "id">) => out.push({ id: out.length + 1, ...q });

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

    // Group problem lines into sub-parts a) b) c) … if present.
    const subStarts = problemLines
      .map((l, i) => (SUBPART.test(l) ? i : -1))
      .filter((i) => i >= 0);

    if (subStarts.length >= 2) {
      const { letterMap, textMap } = answerMaps(answerLines);
      for (let s = 0; s < subStarts.length; s++) {
        const from = subStarts[s];
        const to = s + 1 < subStarts.length ? subStarts[s + 1] : problemLines.length;
        const sm = problemLines[from].match(SUBPART)!;
        const letter = sm[1].toLowerCase();
        const seg = [sm[2], ...problemLines.slice(from + 1, to)].filter(Boolean);

        const optStart = seg.findIndex(startsWithOption);
        if (optStart >= 0) {
          const stem = seg.slice(0, optStart).join("\n").trim();
          const options = extractOptions(seg.slice(optStart));
          const correctLetter = letterMap.get(letter);
          const correct = correctLetter
            ? options.find((o) => o.letter === correctLetter)?.text ?? null
            : null;
          push({
            type: "mcq",
            question: stem || `Ý ${letter})`,
            options: options.map((o) => o.text),
            correctAnswer: correct,
            solution: textMap.get(letter) || undefined,
          });
        } else {
          // Open-ended sub-part → short, answer from matching solution sub-part.
          const sol = textMap.get(letter) || null;
          push({
            type: "short",
            question: seg.join("\n"),
            options: [],
            correctAnswer: sol,
            solution: sol || undefined,
          });
        }
      }
      continue;
    }

    // No sub-parts: single MCQ or open-ended.
    const optStart = problemLines.findIndex(startsWithOption);
    if (optStart >= 0 && isOptionLine(problemLines[optStart])) {
      const stem = problemLines.slice(0, optStart).join("\n").trim();
      const options = extractOptions(problemLines.slice(optStart));
      const answerText = answerLines.join(" ").replace(/\s+/g, "");
      let correct: string | null = null;
      const chosen = answerLines.join(" ").match(/\bchọn\s+([A-F])\b/i);
      if (chosen) {
        correct = options.find((o) => o.letter === chosen[1].toUpperCase())?.text ?? null;
      }
      if (!correct && answerText) {
        for (const o of options) {
          if (answerText.includes(o.text.replace(/\s+/g, ""))) { correct = o.text; break; }
        }
      }
      push({
        type: "mcq",
        question: stem || problemLines.join("\n"),
        options: options.map((o) => o.text),
        correctAnswer: correct,
        solution: answerLines.join("\n") || undefined,
      });
    } else {
      const sol = answerLines.join("\n") || null;
      push({
        type: "short",
        question: problemLines.join("\n"),
        options: [],
        correctAnswer: sol,
        solution: sol || undefined,
      });
    }
  }
  return out;
}

// Heuristic: does this text look like a loigiaihay-style solution page?
export function looksLikeLoigiaihay(text: string): boolean {
  return /(?:^|\n)\s*giải\s+bài\s+\d+/i.test(text) || /lời\s*giải\s*chi\s*tiết/i.test(text);
}
