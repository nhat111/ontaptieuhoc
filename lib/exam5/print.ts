// lib/exam5/print.ts
// In tờ đề trông như đề kiểm tra thật của trường: ô trường/họ tên/lớp bên trái, tên đề và
// năm học bên phải, khung Điểm – Nhận xét của giáo viên, điểm ghi sau từng câu, chỗ đặt
// tính, "Bài giải" có dòng kẻ chấm; Tiếng Việt có khung bài đọc và phần Kiểm tra viết.
// Trang cuối là hướng dẫn chấm (đáp án, biểu điểm, lời giải nếu chọn).
//
// Như lib/worksheetExport.ts: chỉ dùng bảng và khối thường — Word mở file .doc dạng HTML
// nhưng bỏ qua grid/flex. Phân số: bản PDF vẽ dạng đứng (tử trên, mẫu dưới) như đề in;
// bản Word ghi a/b vì Word không dựng được phân số từ HTML.

import { escapeHtml, latexToPlain } from "../exportLesson";
import type { AnswerMode } from "../worksheetExport";
import {
  type ExamPaper, type PaperItem, type PaperQuestion, isGroup, pointsText, questionsOf,
} from "./paper";

export interface PrintOptions {
  answers: AnswerMode;
  /** "2026 – 2027" */
  schoolYear: string;
  forWord?: boolean;
  autoPrint?: boolean;
  /** Thay ảnh (SVG → PNG cho Word). */
  imageFor?: (url: string) => string;
}

const LETTERS = "ABCDEF";
const DOTS = "…".repeat(46);

/**
 * Chữ thường + phân số TeX → HTML. Phân số `$\frac{a}{b}$`, `$2\frac{a}{b}$` vẽ dạng đứng
 * (PDF) hoặc ghi a/b (Word). Nội dung đề tự sinh không có TeX nào khác ngoài phân số.
 */
function rich(s: string, o: PrintOptions): string {
  return s.split(/(\$\d*\\frac\{[\d.]+\}\{[\d.]+\}\$)/).map((part) => {
    const m = part.match(/^\$(\d*)\\frac\{([\d.]+)\}\{([\d.]+)\}\$$/);
    if (!m) return escapeHtml(part);
    const [, w, n, d] = m;
    return o.forWord
      ? `${w ? `${w} ` : ""}${n}/${d}`
      : `${w}<span class="fr"><span class="fn">${n}</span><span class="fd">${d}</span></span>`;
  }).join("");
}

const solutionOf = (q: PaperQuestion) => {
  try { return (JSON.parse(q.row.explanation) as { solution?: string }).solution ?? ""; } catch { return ""; }
};
const imagesOf = (q: PaperQuestion) => {
  try { return ((JSON.parse(q.row.explanation) as { images?: { url: string }[] }).images ?? []).map((i) => i.url); } catch { return []; }
};

/** Bỏ phần chỉ dành cho bài làm trên máy: "= ___", "Vậy x = ___", "Trả lời: ___ kg." */
function printable(content: string, work: PaperQuestion["work"]): string {
  let s = content.replace(/\s*Trả lời: ___.*$/, "");
  s = s.replace(/\.\s*Vậy x = ___$/, "");
  if (work === "dat-tinh") s = s.replace(/\s*=\s*___$/, "");
  return s.replace(/___/g, "……");
}

const img = (url: string, o: PrintOptions) => `<p class="img"><img src="${escapeHtml(o.imageFor ? o.imageFor(url) : url)}" alt=""/></p>`;

function optionsTable(options: string[], o: PrintOptions): string {
  const longest = Math.max(...options.map((x) => latexToPlain(x).length));
  const perRow = longest <= 14 ? 4 : longest <= 32 ? 2 : 1;
  const cells = options.map((x, i) => `<td>${LETTERS[i]}. ${rich(x, o)}</td>`);
  const trs: string[] = [];
  for (let i = 0; i < cells.length; i += perRow) trs.push(`<tr>${cells.slice(i, i + perRow).join("")}</tr>`);
  return `<table class="opts"><colgroup>${`<col width="${Math.floor(100 / perRow)}%"/>`.repeat(perRow)}</colgroup>${trs.join("")}</table>`;
}

const lines = (n: number) => `<p class="line">${DOTS}</p>`.repeat(n);

function workHtml(q: PaperQuestion): string {
  if (q.work === "bai-giai") return `<p class="bg">Bài giải</p>${lines(q.lines ?? 5)}`;
  if (q.work === "lines") return lines(q.lines ?? 2);
  return "";
}

function itemHtml(it: PaperItem, label: string, o: PrintOptions): string {
  if (isGroup(it)) {
    const total = it.parts.reduce((s, p) => s + p.points, 0);
    const head = `<p class="q"><b>${label}.</b> <i>(${pointsText(total)})</i> ${escapeHtml(it.prompt)}</p>`;
    const parts = it.parts.map((p, i) => `${"abcdef"[i]}) ${rich(printable(p.row.content, it.work), o)}`);
    if (it.work === "dat-tinh") {
      // Bốn phép tính một hàng, chừa khoảng trống bên dưới để đặt tính như đề thật.
      return head + `<table class="dt"><tr>${parts.map((p) => `<td>${p}</td>`).join("")}</tr>` +
        `<tr>${parts.map(() => `<td class="space">&nbsp;</td>`).join("")}</tr></table>`;
    }
    if (it.work === "none") {
      // Tính nhẩm, "Số?": điền ngay vào chỗ chấm, hai ý một hàng.
      const trs: string[] = [];
      for (let i = 0; i < parts.length; i += 2) trs.push(`<tr>${parts.slice(i, i + 2).map((p) => `<td>${p}</td>`).join("")}</tr>`);
      return head + `<table class="inl"><colgroup><col width="50%"/><col width="50%"/></colgroup>${trs.join("")}</table>`;
    }
    return head + parts.map((p) => `<p class="part">${p}</p>${lines(2)}`).join("");
  }
  const imgs = imagesOf(it).map((u) => img(u, o)).join("");
  const text = rich(printable(it.row.content, it.work), o);
  return `<p class="q"><b>${label}.</b> <i>(${pointsText(it.points)})</i> ${text}</p>` + imgs +
    (it.row.type === "mcq" ? optionsTable(it.row.options, o) : workHtml(it));
}

function header(p: ExamPaper, o: PrintOptions): string {
  return `<table class="hd"><tr>` +
    `<td width="44%" class="hl">TRƯỜNG TIỂU HỌC ……………………<br/>Họ và tên: ………………………………<br/>Lớp: ${p.grade}……</td>` +
    `<td width="56%" class="hr"><b>ĐỀ KIỂM TRA ${escapeHtml(p.kindLabel.toUpperCase())}</b><br/><b>NĂM HỌC ${escapeHtml(o.schoolYear)}</b><br/>` +
    `Môn: ${escapeHtml(p.subject)} – Lớp ${p.grade}<br/><i>Thời gian làm bài: ${p.writing ? `${p.minutes} phút (đọc hiểu) + ${p.writing.minutes} phút (viết)` : `${p.minutes} phút`}</i></td>` +
    `</tr></table>` +
    `<table class="score"><tr><th width="22%">Điểm</th><th>Nhận xét của giáo viên</th></tr>` +
    `<tr><td class="sc">&nbsp;</td><td>${DOTS.slice(0, 36)}<br/>${DOTS.slice(0, 36)}</td></tr></table>`;
}

function readingHtml(p: ExamPaper, o: PrintOptions): string {
  if (!p.reading) return "";
  const paras = p.reading.text.split(/\n\s*\n/).map((t) => `<p class="rp">${rich(t.trim(), o)}</p>`).join("");
  return `<h2>A. KIỂM TRA ĐỌC (10 điểm)</h2>` +
    `<p class="sub"><b>I. Đọc thành tiếng (${p.readAloudPoints ?? 3} điểm)</b> – <i>giáo viên kiểm tra riêng từng học sinh.</i></p>` +
    `<p class="sub"><b>II. Đọc hiểu và kiến thức tiếng Việt (7 điểm)</b> – <i>${p.minutes} phút</i></p>` +
    `<p class="note">Đọc thầm bài văn sau:</p>` +
    `<table class="read"><tr><td><p class="rt">${escapeHtml(p.reading.title.toUpperCase())}</p>${paras}</td></tr></table>`;
}

function writingHtml(p: ExamPaper): string {
  if (!p.writing) return "";
  return `<div class="pb"><h2>${escapeHtml(p.writing.title)} (${p.writing.points} điểm) – ${p.writing.minutes} phút</h2>` +
    `<p class="q"><b>Đề bài:</b> ${escapeHtml(p.writing.prompt)}</p><p class="bg">Bài làm</p>${lines(22)}</div>`;
}

/* ───────────── Hướng dẫn chấm ───────────── */

function keyOf(q: PaperQuestion, o: PrintOptions): string {
  if (q.open) return escapeHtml(q.open.answerHint);
  if (q.row.type === "mcq") {
    const i = q.row.options.indexOf(q.row.correct_answer);
    return `<b>${LETTERS[i]}</b>. ${rich(q.row.correct_answer, o)}`;
  }
  return rich(q.row.correct_answer.split("|")[0], o);
}

function answersHtml(p: ExamPaper, o: PrintOptions): string {
  if (o.answers === "none") return "";
  const withSol = o.answers === "solutions";
  let html = `<div class="pb"><h1>HƯỚNG DẪN CHẤM VÀ ĐÁP ÁN</h1><p class="meta">${escapeHtml(p.title)} (dành cho giáo viên, phụ huynh)</p>`;

  if (p.readAloudPoints) {
    html += `<h3>A. KIỂM TRA ĐỌC (10 điểm)</h3><p><b>I. Đọc thành tiếng (${p.readAloudPoints} điểm):</b> học sinh đọc một đoạn khoảng 110–120 tiếng trong bài đọc trên (hoặc bài đã học) và trả lời một câu hỏi về nội dung đoạn đọc.</p>` +
      `<ul><li>Đọc vừa đủ nghe, rõ ràng; tốc độ khoảng 100–120 tiếng/phút: 1 điểm.</li><li>Đọc đúng tiếng, đúng từ: 1 điểm.</li>` +
      `<li>Ngắt nghỉ hơi đúng ở dấu câu, giọng đọc có biểu cảm: 0,5 điểm.</li><li>Trả lời đúng câu hỏi về nội dung đoạn đọc: 0,5 điểm.</li></ul>` +
      `<p><b>II. Đọc hiểu và kiến thức tiếng Việt (7 điểm)</b></p>`;
  }

  for (const sec of p.sections) {
    if (!p.readAloudPoints) html += `<h3>${escapeHtml(sec.title)} (${pointsText(sec.items.flatMap(questionsOf).reduce((s, q) => s + q.points, 0))})</h3>`;
    const rows = sec.items.map((it, i) => {
      const label = `${sec.label} ${i + 1}`;
      const qs = questionsOf(it);
      const pts = qs.reduce((s, q) => s + q.points, 0);
      const ans = isGroup(it)
        ? qs.map((q, k) => `${"abcdef"[k]}) ${keyOf(q, o)}${withSol && solutionOf(q) ? ` <span class="exp">— ${rich(solutionOf(q), o)}</span>` : ""}`).join("<br/>") +
          (qs.length > 1 ? `<br/><i>Mỗi ý đúng ${pointsText(qs[0].points)}.</i>` : "")
        : keyOf(it, o) + (withSol && !it.open && solutionOf(it) ? `<br/><span class="exp">${rich(solutionOf(it), o)}</span>` : "");
      return `<tr><td class="c">${label}</td><td>${ans}</td><td class="c">${pointsText(pts).replace(" điểm", "")}</td></tr>`;
    });
    html += `<table class="key"><tr><th width="13%">Câu/Bài</th><th>Đáp án</th><th width="11%">Điểm</th></tr>${rows.join("")}</table>`;
    if (!p.readAloudPoints && sec.items.some((it) => !isGroup(it) && (it as PaperQuestion).work === "bai-giai")) {
      html += `<p class="note">Bài toán có lời văn: lời giải đúng, phép tính đúng, đáp số đúng mới cho điểm tối đa; thiếu hoặc sai đơn vị trừ 0,25 điểm.</p>`;
    }
  }

  if (p.writing) {
    html += `<h3>B. KIỂM TRA VIẾT (${p.writing.points} điểm)</h3>` +
      `<p>Gợi ý biểu điểm: Mở bài đúng yêu cầu 1,5 điểm; Thân bài đủ ý, có trình tự, có hình ảnh và cảm xúc 5 điểm; ` +
      `Kết bài 1,5 điểm; Chữ viết rõ ràng, đúng chính tả 0,5 điểm; Dùng từ, đặt câu đúng 0,5 điểm; Bài viết có sáng tạo 1 điểm.</p>`;
  }
  return html + `</div>`;
}

export function buildPaperHtml(p: ExamPaper, o: PrintOptions): string {
  const body =
    header(p, o) +
    readingHtml(p, o) +
    p.sections.map((sec) => {
      const pts = sec.items.flatMap(questionsOf).reduce((s, q) => s + q.points, 0);
      // Đề Tiếng Việt: tiêu đề "II. Đọc hiểu…" đã in ngay trên bài đọc, không lặp lại.
      return (p.reading ? "" : `<h2>${escapeHtml(sec.title)} (${pointsText(pts)})</h2>`) +
        (sec.note ? `<p class="note">${escapeHtml(sec.note)}</p>` : "") +
        sec.items.map((it, i) => itemHtml(it, `${sec.label} ${i + 1}`, o)).join("");
    }).join("") +
    writingHtml(p) +
    answersHtml(p, o);

  return `<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"/>
<title>${escapeHtml(p.title)}</title>
<style>
  body { font-family: "Times New Roman", Times, serif; font-size: 14pt; color: #000; padding: 24px; max-width: 780px; margin: 0 auto; line-height: 1.4; }
  h1 { font-size: 15pt; text-align: center; margin: 0 0 4px; }
  h2 { font-size: 14pt; margin: 16px 0 4px; }
  h3 { font-size: 13pt; margin: 14px 0 4px; }
  table { border-collapse: collapse; }
  .hd { width: 100%; margin-bottom: 10px; }
  .hd td { vertical-align: top; padding: 2px 4px; }
  .hl { line-height: 1.8; }
  .hr { text-align: center; }
  .score { width: 100%; margin: 6px 0 12px; }
  .score th, .score td { border: 1px solid #000; padding: 4px 6px; font-size: 13pt; }
  .score td.sc { height: 64px; }
  .meta { text-align: center; font-size: 12pt; font-style: italic; margin: 0 0 10px; }
  .sub { margin: 4px 0; }
  .note { font-style: italic; margin: 0 0 6px; }
  .q { margin: 12px 0 3px; }
  .part { margin: 6px 0 0 18px; }
  .opts { width: 100%; margin: 0 0 4px 18px; }
  .opts td { padding: 1px 4px; vertical-align: top; }
  .dt { width: 100%; margin: 4px 0 0 18px; }
  .dt td { width: 25%; vertical-align: top; padding: 2px 4px; }
  .dt td.space { height: 130px; }
  .inl { width: 100%; margin: 4px 0 0 18px; }
  .inl td { padding: 5px 4px; vertical-align: top; }
  .bg { margin: 6px 0 0; text-align: center; text-decoration: underline; font-weight: bold; }
  .line { margin: 8px 0 0 18px; color: #444; white-space: nowrap; overflow: hidden; }
  .img { margin: 6px 0 4px 18px; }
  .read { width: 100%; margin: 4px 0 10px; }
  .read td { border: 1px solid #000; padding: 8px 12px; }
  .rt { text-align: center; font-weight: bold; margin: 0 0 6px; }
  .rp { text-indent: 24px; margin: 0 0 6px; text-align: justify; }
  .key { width: 100%; margin: 4px 0 10px; }
  .key th, .key td { border: 1px solid #000; padding: 4px 6px; font-size: 12.5pt; vertical-align: top; }
  .key td.c { text-align: center; }
  .exp { font-size: 12pt; color: #333; }
  .fr { display: inline-block; vertical-align: middle; text-align: center; font-size: 0.92em; line-height: 1.1; margin: 0 2px; }
  .fr .fn { display: block; border-bottom: 1px solid #000; padding: 0 2px; }
  .fr .fd { display: block; padding: 0 2px; }
  .pb { page-break-before: always; }
  @media print { body { padding: 0; } }
</style></head>
<body>
${body}
${o.autoPrint ? `<script>window.addEventListener("load",function(){setTimeout(function(){window.focus();window.print();},250);});</script>` : ""}
</body></html>`;
}

/** Năm học hiện tại: từ tháng 8 tính là năm học mới. */
export function schoolYearOf(d: Date): string {
  const y = d.getFullYear();
  return d.getMonth() >= 7 ? `${y} – ${y + 1}` : `${y - 1} – ${y}`;
}
