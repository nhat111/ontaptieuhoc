import type { QType } from "@/lib/quizData";

export type DraftQuestion = {
  id: number;
  type: QType;
  question: string;
  options: string[];
  // mcq: single string matching one option
  // multi: JSON.stringify(string[]) of correct option texts
  // short: pipe-delimited accepted answers
  // numeric: number as string
  // null if no answer marker was found (UI can prompt user to set it)
  correctAnswer: string | null;
  // optional worked solution ("lời giải") captured from the source
  solution?: string;
};

const Q_START = /^Câu\s*\d+[:.]/i;
const OPT_ONE = /^([A-F])[.)]\s*(.+)/i;
const OPT_TWO = /^([A-F])[.)]\s*(.+?)\s{2,}([A-F])[.)]\s*(.+)/i;
// Unified answer marker — captures rest-of-line. Letter vs free text decided at commit time
// based on whether we collected options.
const ANSWER_MARK = /^(?:(?:Đáp án|ĐÁP ÁN|Answer)\s*[:\s]+|Chọn\s+)(.+)$/i;

function extractLetters(raw: string): string[] {
  return [...raw.toUpperCase().matchAll(/[A-F]/g)].map((m) => m[0]);
}

export function parseExamText(text: string): DraftQuestion[] {
  const lines = text.split("\n").map((l) => l.trim());
  const questions: DraftQuestion[] = [];

  type Draft = {
    text: string;
    options: string[];
    answerRaw: string | null;
  };
  let draft: Draft | null = null;

  function commit() {
    if (!draft || !draft.text.trim()) return;

    let type: QType;
    let correctAnswer: string | null = null;
    const raw = draft.answerRaw?.trim() ?? "";

    if (draft.options.length >= 2) {
      // mcq or multi — interpret raw as letter list
      const letters = raw ? extractLetters(raw) : [];
      if (letters.length >= 2) {
        type = "multi";
        const picks = letters
          .map((L) => draft!.options["ABCDEF".indexOf(L)])
          .filter(Boolean);
        correctAnswer = picks.length ? JSON.stringify(picks) : null;
      } else {
        type = "mcq";
        const L = letters[0];
        const idx = L ? "ABCDEF".indexOf(L) : -1;
        correctAnswer = idx >= 0 ? draft.options[idx] ?? null : null;
      }
    } else if (raw) {
      // No options → free-text/numeric answer
      // Some questions still write "Đáp án: B" as a typed letter answer with no options;
      // we treat that as short to preserve the literal text.
      const numericLike = /^-?[\d.,\s]+$/.test(raw) && !Number.isNaN(parseFloat(raw.replace(",", ".")));
      type = numericLike ? "numeric" : "short";
      correctAnswer = raw;
    } else {
      type = "short";
      correctAnswer = null;
    }

    questions.push({
      id: questions.length + 1,
      type,
      question: draft.text.trim(),
      options: draft.options,
      correctAnswer,
    });
    draft = null;
  }

  for (const line of lines) {
    if (!line) continue;

    if (Q_START.test(line)) {
      commit();
      draft = {
        text: line.replace(/^Câu\s*\d+[:.]\s*/i, "").trim(),
        options: [],
        answerRaw: null,
      };
      continue;
    }

    if (!draft) continue;

    // Answer marker: store the rest-of-line. Letter vs free is decided at commit time
    // based on whether we collected options.
    const ans = line.match(ANSWER_MARK);
    if (ans) {
      draft.answerRaw = ans[1].trim();
      continue;
    }

    // Two options on one line
    const two = line.match(OPT_TWO);
    if (two) {
      draft.options.push(two[2].trim(), two[4].trim());
      continue;
    }

    // Single option
    const one = line.match(OPT_ONE);
    if (one) {
      draft.options.push(one[2].trim());
      continue;
    }

    // Continuation of question text (before options start)
    if (draft.options.length === 0) draft.text += " " + line;
  }

  commit();
  return questions;
}
