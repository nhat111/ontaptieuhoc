import type { Question, LessonMeta } from "./quizData";

// Best-effort LaTeX → readable plain text for export documents. Primary-school
// content is mostly fractions, powers and a few operators, so we don't need a
// full TeX engine — just make it human-readable in Word/PDF.
export function latexToPlain(input: string): string {
  if (!input) return "";
  let s = input;
  // Pull text out of $...$, \(...\), \[...\] delimiters.
  s = s.replace(/\$\$([\s\S]+?)\$\$/g, "$1").replace(/\$([^$]+)\$/g, "$1");
  s = s.replace(/\\\(([\s\S]+?)\\\)/g, "$1").replace(/\\\[([\s\S]+?)\\\]/g, "$1");
  // Mixed numbers "2\frac{17}{100}" → "2 17/100" (keep the space).
  s = s.replace(/(\d)\s*\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "$1 $2/$3");
  // Plain fractions.
  s = s.replace(/\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "$1/$2");
  s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, "√($1)");
  s = s.replace(/\\times/g, "×").replace(/\\div/g, ":").replace(/\\cdot/g, "·");
  s = s.replace(/\\le(?:q)?\b/g, "≤").replace(/\\ge(?:q)?\b/g, "≥").replace(/\\ne(?:q)?\b/g, "≠");
  s = s.replace(/\\(?:pm)\b/g, "±").replace(/\\(?:approx)\b/g, "≈");
  // x^{2} / x^2 → x^2 (drop braces); a_{1} → a_1.
  s = s.replace(/\^\{([^{}]*)\}/g, "^$1").replace(/_\{([^{}]*)\}/g, "_$1");
  // Strip any remaining backslash commands and stray braces.
  s = s.replace(/\\[a-zA-Z]+/g, "").replace(/[{}]/g, "");
  return s.replace(/\s+/g, " ").trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const LETTERS = "ABCDEFGH";

function answerLabel(q: Question): string {
  if (q.type === "mcq") {
    const i = q.options.indexOf(q.correctAnswer);
    return i >= 0 ? `${LETTERS[i]}. ${latexToPlain(q.correctAnswer)}` : latexToPlain(q.correctAnswer);
  }
  if (q.type === "multi") {
    try {
      const picks = JSON.parse(q.correctAnswer) as string[];
      const letters = picks
        .map((p) => q.options.indexOf(p))
        .filter((i) => i >= 0)
        .sort((a, b) => a - b)
        .map((i) => LETTERS[i]);
      return letters.join(", ");
    } catch {
      return latexToPlain(q.correctAnswer);
    }
  }
  // short (pipe-delimited accepted answers) / numeric
  return q.correctAnswer.split("|").map((a) => latexToPlain(a.trim())).join(" / ");
}

export interface BuildExamOptions {
  withAnswers?: boolean;
}

// Build a self-contained HTML document for the exam, usable both as a Word
// download (.doc) and as the source for browser print-to-PDF.
export function buildExamHtml(
  meta: LessonMeta,
  questions: Question[],
  opts: BuildExamOptions = {},
): string {
  const metaBits = [
    meta.subjectName ? escapeHtml(meta.subjectName) : null,
    meta.grade ? `Lớp ${meta.grade}` : null,
    `${questions.length} câu`,
    meta.durationMinutes ? `${meta.durationMinutes} phút` : null,
  ].filter(Boolean);

  const qHtml = questions
    .map((q, i) => {
      const num = `<p class="q"><b>Câu ${i + 1}.</b> ${escapeHtml(latexToPlain(q.question)).replace(/\n/g, "<br/>")}</p>`;
      let opts = "";
      if ((q.type === "mcq" || q.type === "multi") && q.options.length) {
        opts =
          `<div class="opts">` +
          q.options
            .map((o, oi) => `<div class="opt">${LETTERS[oi]}. ${escapeHtml(latexToPlain(o))}</div>`)
            .join("") +
          `</div>`;
      } else {
        opts = `<p class="blank">…………………………………………………………………</p>`;
      }
      return num + opts;
    })
    .join("\n");

  const answersHtml = opts.withAnswers
    ? `<h2 class="ak">ĐÁP ÁN</h2><div class="answers">` +
      questions.map((q, i) => `<span class="ans"><b>${i + 1}.</b> ${escapeHtml(answerLabel(q))}</span>`).join("") +
      `</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"/>
<title>${escapeHtml(meta.title)}</title>
<style>
  body { font-family: "Times New Roman", Times, serif; font-size: 13pt; color: #000; padding: 24px; max-width: 760px; margin: 0 auto; }
  h1 { font-size: 16pt; text-align: center; margin: 0 0 4px; }
  .meta { text-align: center; color: #444; font-size: 11pt; margin-bottom: 18px; }
  .q { margin: 12px 0 4px; }
  .opts { margin: 0 0 6px 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 2px 16px; }
  .opt { }
  .blank { margin: 2px 0 8px 18px; color: #555; letter-spacing: 1px; }
  .ak { font-size: 14pt; margin-top: 28px; border-top: 1px solid #999; padding-top: 12px; }
  .answers { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px 12px; }
  .ans { font-size: 12pt; }
  @media print { body { padding: 0; } }
</style></head>
<body>
<h1>${escapeHtml(meta.title)}</h1>
<div class="meta">${metaBits.join(" · ")}</div>
${qHtml}
${answersHtml}
</body></html>`;
}
