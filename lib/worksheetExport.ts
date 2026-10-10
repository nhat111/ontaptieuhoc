// lib/worksheetExport.ts
// Dựng phiếu bài tập in được (Word .doc hoặc in ra PDF) từ câu hỏi tự sinh (lib/mathGen).
//
// Khác buildExamHtml (lib/exportLesson.ts) ở chỗ đây là phiếu để giáo viên/phụ huynh
// phát cho bé: có dòng họ tên, chia Phần 1 trắc nghiệm / Phần 2 tự luận, bài có lời văn
// có chỗ viết "Bài giải", nhiều đề trong một file (mỗi đề một trang) và đáp án + lời giải
// tách riêng ở trang cuối.
//
// Bố cục chỉ dùng bảng và khối thường, không dùng CSS grid/flex: Word mở file .doc dạng
// HTML nhưng bỏ qua grid/flex, các đáp án A B C D sẽ dồn thành một cột.

import type { GenQuestionRow } from "./mathGen";
import { escapeHtml, latexToPlain } from "./exportLesson";

export type AnswerMode = "none" | "key" | "solutions";

export interface WorksheetVersion {
  /** "Đề 1", "Đề 2"… — rỗng khi chỉ có một đề. */
  label: string;
  rows: GenQuestionRow[];
}

export interface WorksheetOptions {
  title: string;          // VD "Phiếu bài tập Toán lớp 3"
  topics: string[];       // tên các chủ đề
  grade: number;
  answers: AnswerMode;
  /** Chèn script gọi window.print() sau khi tải xong (dùng cho nút PDF). */
  autoPrint?: boolean;
}

const LETTERS = "ABCDEF";
const DOTS = "……………………………………………………………………………………";
const BLANK = "……";

type Parsed = {
  row: GenQuestionRow;
  /** Đề bài đã thay "___" bằng chỗ chấm; với bài lời văn thì bỏ phần "Trả lời: ___ …". */
  text: string;
  /** Bài toán có lời văn → in thêm "Bài giải" và dòng kẻ chấm. */
  wordProblem: boolean;
  images: string[];
  solution: string;
};

function parse(row: GenQuestionRow): Parsed {
  let solution = "";
  let images: string[] = [];
  try {
    const exp = JSON.parse(row.explanation) as { solution?: string; images?: { url: string }[] };
    solution = exp.solution ?? "";
    images = (exp.images ?? []).map((im) => im.url);
  } catch { /* lời giải không đọc được thì bỏ qua, phiếu vẫn in */ }

  const content = latexToPlain(row.content);
  // "… Hỏi …? Trả lời: ___ bông hoa." → giữ đề tới dấu "?", phần trả lời để bé tự viết.
  const m = content.match(/^(.*\?)\s*Trả lời: ___ .+\.$/);
  if (m) return { row, text: m[1], wordProblem: true, images, solution };
  return { row, text: content.replace(/___/g, BLANK), wordProblem: false, images, solution };
}

/** Đáp án ngắn để in ở trang đáp án. */
export function answerText(row: GenQuestionRow): string {
  if (row.type === "mcq") {
    const i = row.options.indexOf(row.correct_answer);
    return i >= 0 ? `${LETTERS[i]}. ${latexToPlain(row.correct_answer)}` : latexToPlain(row.correct_answer);
  }
  // short: "5.000|5000|5 000" → in cách viết đầu tiên; numeric: chính là số.
  return latexToPlain(row.correct_answer.split("|")[0]);
}

function optionsTable(options: string[]): string {
  const longest = Math.max(...options.map((o) => latexToPlain(o).length));
  const perRow = longest <= 14 ? 4 : 2;
  const cells = options.map((o, i) => `<td>${LETTERS[i]}. ${escapeHtml(latexToPlain(o))}</td>`);
  const trs: string[] = [];
  for (let i = 0; i < cells.length; i += perRow) trs.push(`<tr>${cells.slice(i, i + perRow).join("")}</tr>`);
  return `<table class="opts"><colgroup>${`<col width="${Math.floor(100 / perRow)}%"/>`.repeat(perRow)}</colgroup>${trs.join("")}</table>`;
}

const img = (url: string) => `<p class="img"><img src="${escapeHtml(url)}" alt="" width="140" height="140"/></p>`;

function versionHtml(v: WorksheetVersion, o: WorksheetOptions, first: boolean): string {
  const items = v.rows.map(parse);
  const mcq = items.filter((p) => p.row.type === "mcq");
  const open = items.filter((p) => p.row.type !== "mcq");

  const header =
    `<div class="${first ? "" : "pb"}">` +
    `<h1>${escapeHtml(o.title.toUpperCase())}${v.label ? ` – ${escapeHtml(v.label.toUpperCase())}` : ""}</h1>` +
    `<p class="meta">Chủ đề: ${escapeHtml(o.topics.join("; "))}</p>` +
    `<p class="who">Họ và tên: ………………………………………………… Lớp: ${o.grade}……</p>` +
    `</div>`;

  const p1 = mcq.length
    ? `<h2>Phần 1. Trắc nghiệm</h2><p class="note">Khoanh vào chữ đặt trước câu trả lời đúng.</p>` +
      mcq.map((p, i) =>
        p.images.map(img).join("") +
        `<p class="q"><b>Câu ${i + 1}.</b> ${escapeHtml(p.text)}</p>` +
        optionsTable(p.row.options),
      ).join("")
    : "";

  const p2 = open.length
    ? `<h2>${mcq.length ? "Phần 2. " : ""}Tự luận</h2>` +
      open.map((p, i) =>
        p.images.map(img).join("") +
        `<p class="q"><b>Bài ${i + 1}.</b> ${escapeHtml(p.text)}</p>` +
        (p.wordProblem
          ? `<p class="sol">Bài giải</p>` + `<p class="line">${DOTS}</p>`.repeat(3)
          : ""),
      ).join("")
    : "";

  return header + p1 + p2;
}

function answersHtml(versions: WorksheetVersion[], mode: AnswerMode): string {
  if (mode === "none") return "";
  const blocks = versions.map((v) => {
    const items = v.rows.map(parse);
    const mcq = items.filter((p) => p.row.type === "mcq");
    const open = items.filter((p) => p.row.type !== "mcq");
    const line = (label: string, p: Parsed) =>
      `<p class="ans"><b>${label}:</b> ${escapeHtml(answerText(p.row))}` +
      (mode === "solutions" && p.solution ? `<br/><span class="exp">${escapeHtml(latexToPlain(p.solution))}</span>` : "") +
      `</p>`;
    return (
      (v.label ? `<h3>${escapeHtml(v.label)}</h3>` : "") +
      mcq.map((p, i) => line(`Câu ${i + 1}`, p)).join("") +
      open.map((p, i) => line(`Bài ${i + 1}`, p)).join("")
    );
  });
  return `<div class="pb"><h1>ĐÁP ÁN${mode === "solutions" ? " VÀ LỜI GIẢI" : ""}</h1><p class="meta">(Dành cho giáo viên, phụ huynh)</p>${blocks.join("")}</div>`;
}

/** Một file HTML gồm mọi đề (mỗi đề sang trang mới) và trang đáp án ở cuối. */
export function buildWorksheetHtml(versions: WorksheetVersion[], o: WorksheetOptions): string {
  const body = versions.map((v, i) => versionHtml(v, o, i === 0)).join("") + answersHtml(versions, o.answers);
  return `<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"/>
<title>${escapeHtml(o.title)}</title>
<style>
  body { font-family: "Times New Roman", Times, serif; font-size: 14pt; color: #000; padding: 24px; max-width: 760px; margin: 0 auto; }
  h1 { font-size: 15pt; text-align: center; margin: 0 0 4px; }
  h2 { font-size: 14pt; margin: 16px 0 4px; }
  h3 { font-size: 13pt; margin: 14px 0 4px; }
  .meta { text-align: center; font-size: 12pt; font-style: italic; margin: 0 0 10px; }
  .who { margin: 8px 0 12px; }
  .note { font-style: italic; margin: 0 0 6px; }
  .q { margin: 10px 0 2px; }
  .opts { width: 100%; border-collapse: collapse; margin: 0 0 4px 18px; }
  .opts td { padding: 1px 4px; vertical-align: top; }
  .sol { margin: 4px 0 0 18px; text-decoration: underline; }
  .line { margin: 6px 0 0 18px; color: #555; }
  .img { margin: 6px 0 0 18px; }
  .ans { margin: 4px 0; font-size: 13pt; }
  .exp { font-size: 12pt; color: #333; }
  .pb { page-break-before: always; }
  @media print { body { padding: 0; } }
</style></head>
<body>
${body}
${o.autoPrint ? `<script>window.addEventListener("load",function(){setTimeout(function(){window.focus();window.print();},200);});</script>` : ""}
</body></html>`;
}
