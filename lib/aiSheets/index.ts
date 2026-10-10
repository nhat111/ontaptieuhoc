// lib/aiSheets/index.ts — Phiếu hoạt động AI (12 tiết cốt lõi / lớp / năm học).
//
// Bám Quyết định 2422/QĐ-BGDĐT (khung nội dung giáo dục trí tuệ nhân tạo) và
// Công văn 5588/BGDĐT-GDPT (học liệu dùng chung phải in được / dùng không cần mạng).
// Mỗi phiếu = 1 tiết = 1 trang A4 cho học sinh (+ 1 trang cho thầy cô nếu chọn).
// Mọi hoạt động làm trên giấy, không cần máy.
//
// Nội dung soạn tay (lib/aiSheets/lop4.ts, lop5.ts…), không sinh bằng code. Tên chủ đề và mã
// yêu cầu cần đạt lấy theo Quyết định 2422 — sửa thì đối chiếu lại văn bản gốc.
// scripts/ai-sheet-check.ts kiểm tra đủ mã cốt lõi, đủ đáp án, HTML không lỗi.
//
// Bố cục chỉ dùng bảng (Word bỏ qua CSS grid/flex khi mở .doc dạng HTML).

import { escapeHtml } from "../exportLesson";
import { LOP4 } from "./lop4";
import { LOP5 } from "./lop5";

export type Activity = {
  /** Lời dặn, VD "Nối mỗi việc với lĩnh vực phù hợp." */
  title: string;
  /** Đoạn dẫn / câu chuyện đặt trước bài (tuỳ chọn). */
  intro?: string;
  /** Đáp án hoặc gợi ý đáp án — chỉ in ở trang thầy cô. */
  answer?: string;
} & (
  /** Nối cột trái (đánh số) với cột phải (đánh chữ). */
  | { kind: "match"; left: string[]; right: string[] }
  /** Bảng: mỗi dòng một câu, mỗi cột một ô để đánh dấu ✓ (Đúng/Sai, Nên/Không nên…). */
  | { kind: "tick"; columns: string[]; rows: string[]; reason?: boolean }
  /** Đánh dấu vào ô trước các mục đúng yêu cầu. */
  | { kind: "check"; items: string[] }
  /** Viết chữ cái của từng mục vào cột phù hợp. */
  | { kind: "sort"; items: string[]; columns: string[] }
  /** Đánh số thứ tự các bước. */
  | { kind: "order"; steps: string[] }
  /** Bảng có ô trống (null) để điền. */
  | { kind: "table"; headers: string[]; rows: (string | null)[][]; widths?: number[] }
  /** Dòng kẻ chấm để viết hoặc vẽ. */
  | { kind: "write"; lines: number; draw?: boolean }
);

export interface AiSheet {
  no: number;                 // tiết 1–12
  title: string;              // tên chủ đề theo khung
  codes: string[];            // mã yêu cầu cần đạt, VD ["4.A1.2", "4.A1.MR1"]
  strand: string;             // "A. Tư duy lấy con người làm trung tâm"
  activities: Activity[];
  /** Câu hỏi "Em nghĩ gì?" cuối phiếu. */
  think: string;
  teacher: {
    goals: string[];          // mục tiêu (diễn giải yêu cầu cần đạt)
    prepare?: string;         // chuẩn bị
    steps: string[];          // tiến trình gợi ý
    extend?: string;          // mở rộng (nội dung MR, nếu trường có máy)
  };
}

export interface AiGrade {
  grade: number;
  sheets: AiSheet[];
  /** Mã yêu cầu cần đạt CỐT LÕI của khối (không MR) — để kiểm tra phủ đủ. */
  coreCodes: string[];
}

/** Các khối đã soạn. Khối chưa có thì giao diện hiện "đang soạn". */
export const AI_GRADES: AiGrade[] = [LOP4, LOP5];
export const aiGrade = (g: number) => AI_GRADES.find((x) => x.grade === g);

/* ═══════════════ Xuất HTML (Word .doc / in PDF) ═══════════════ */

const LETTERS = "ABCDEFGHIJ";
const LINE = "……………………………………………………………………………………………";
const e = escapeHtml;

function activityHtml(a: Activity, n: number): string {
  const head =
    `<p class="at"><b>${n}.</b> ${e(a.title)}</p>` + (a.intro ? `<p class="intro">${e(a.intro)}</p>` : "");
  switch (a.kind) {
    case "match": {
      const rows = Math.max(a.left.length, a.right.length);
      const trs = Array.from({ length: rows }, (_, i) =>
        `<tr><td class="ml">${a.left[i] ? `${i + 1}. ${e(a.left[i])}` : ""}</td><td class="dot">${a.left[i] ? "●" : ""}</td>` +
        `<td class="gap"></td><td class="dot">${a.right[i] ? "●" : ""}</td><td class="mr">${a.right[i] ? `${LETTERS[i]}. ${e(a.right[i])}` : ""}</td></tr>`,
      ).join("");
      return head + `<table class="match">${trs}</table>`;
    }
    case "tick": {
      const cols = a.columns.map((c) => `<th class="tc">${e(c)}</th>`).join("") + (a.reason ? `<th>Vì sao?</th>` : "");
      const trs = a.rows.map((r, i) =>
        `<tr><td>${String.fromCharCode(97 + i)}) ${e(r)}</td>${a.columns.map(() => `<td class="tc"><span class="box">&nbsp;</span></td>`).join("")}` +
        (a.reason ? `<td class="why"></td>` : "") + `</tr>`,
      ).join("");
      return head + `<table class="grid"><tr><th></th>${cols}</tr>${trs}</table>`;
    }
    case "check":
      return head + `<table class="chk">${pairs(a.items.map((it) => `<span class="box">&nbsp;</span> ${e(it)}`))}</table>`;
    case "sort": {
      const items = `<table class="chk">${pairs(a.items.map((it, i) => `<b>${LETTERS[i]}.</b> ${e(it)}`))}</table>`;
      const w = Math.floor(100 / a.columns.length);
      const cols = `<table class="grid sort"><tr>${a.columns.map((c) => `<th width="${w}%">${e(c)}</th>`).join("")}</tr>` +
        `<tr>${a.columns.map(() => `<td class="tall"></td>`).join("")}</tr></table>`;
      return head + items + cols;
    }
    case "order":
      return head + `<table class="chk">${a.steps.map((s) => `<tr><td><span class="box">&nbsp;</span> ${e(s)}</td></tr>`).join("")}</table>`;
    case "table":
      // Độ rộng cột cố định (%): trình duyệt tự chia theo chữ sẽ bóp hẹp cột để trống cho học sinh viết.
      return head + `<table class="grid"><tr>${a.headers.map((h, i) => `<th${a.widths ? ` width="${a.widths[i]}%"` : ""}>${e(h)}</th>`).join("")}</tr>` +
        a.rows.map((r) => `<tr>${r.map((c) => (c === null ? `<td class="blank"></td>` : `<td>${e(c)}</td>`)).join("")}</tr>`).join("") +
        `</table>`;
    case "write":
      return head + (a.draw ? `<div class="drawbox"></div>` : `<p class="line">${LINE}</p>`.repeat(a.lines));
  }
}

/** Xếp danh sách thành bảng 2 cột (gọn trên 1 trang A4). */
function pairs(cells: string[]): string {
  const out: string[] = [];
  for (let i = 0; i < cells.length; i += 2)
    out.push(`<tr><td width="50%">${cells[i]}</td><td width="50%">${cells[i + 1] ?? ""}</td></tr>`);
  return out.join("");
}

function studentHtml(s: AiSheet, grade: number, first: boolean): string {
  return (
    `<div class="${first ? "" : "pb"}">` +
    `<p class="kicker">HOẠT ĐỘNG AI · LỚP ${grade} · TIẾT ${s.no}</p>` +
    `<h1>${e(s.title)}</h1>` +
    `<p class="who">Họ và tên: ………………………………………… Lớp: ${grade}…… Ngày: ……/……</p>` +
    s.activities.map((a, i) => activityHtml(a, i + 1)).join("") +
    `<p class="at"><b>Em nghĩ gì?</b> ${e(s.think)}</p>` +
    `<p class="line">${LINE}</p><p class="line">${LINE}</p>` +
    `</div>`
  );
}

function teacherHtml(s: AiSheet, grade: number): string {
  const answers = s.activities
    .map((a, i) => (a.answer ? `<li><b>Hoạt động ${i + 1}:</b> ${e(a.answer)}</li>` : ""))
    .join("");
  return (
    `<div class="pb teacher">` +
    `<p class="kicker">DÀNH CHO THẦY CÔ · LỚP ${grade} · TIẾT ${s.no}</p>` +
    `<h1>${e(s.title)}</h1>` +
    `<p class="meta">Mạch ${e(s.strand)} · Yêu cầu cần đạt: ${e(s.codes.join(", "))} (QĐ 2422/QĐ-BGDĐT)</p>` +
    `<h2>Mục tiêu</h2><ul>${s.teacher.goals.map((g) => `<li>${e(g)}</li>`).join("")}</ul>` +
    (s.teacher.prepare ? `<h2>Chuẩn bị</h2><p>${e(s.teacher.prepare)}</p>` : "") +
    `<h2>Tiến trình gợi ý (35 phút)</h2><ol>${s.teacher.steps.map((t) => `<li>${e(t)}</li>`).join("")}</ol>` +
    (answers ? `<h2>Đáp án / gợi ý</h2><ul>${answers}</ul>` : "") +
    (s.teacher.extend ? `<h2>Mở rộng</h2><p>${e(s.teacher.extend)}</p>` : "") +
    `</div>`
  );
}

export interface AiHtmlOptions {
  withTeacher: boolean;
  autoPrint?: boolean;
  footer?: string;
}

export function buildAiSheetHtml(grade: number, sheets: AiSheet[], o: AiHtmlOptions): string {
  const foot = o.footer ? `<p class="ft">${e(o.footer)}</p>` : "";
  const body = sheets
    .map((s, i) => studentHtml(s, grade, i === 0) + foot + (o.withTeacher ? teacherHtml(s, grade) : ""))
    .join("");
  return `<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"/>
<title>Hoạt động AI lớp ${grade}</title>
<style>
  body { font-family: "Times New Roman", Times, serif; font-size: 15pt; color: #000; padding: 20px; max-width: 780px; margin: 0 auto; }
  .kicker { margin: 0; font-size: 10pt; letter-spacing: 1px; color: #1d4ed8; font-weight: bold; }
  h1 { font-size: 17pt; margin: 2px 0 6px; color: #1e3a8a; }
  h2 { font-size: 13pt; margin: 12px 0 4px; color: #1e3a8a; }
  .who { margin: 2px 0 8px; }
  .meta { font-style: italic; font-size: 11pt; margin: 0 0 6px; }
  .at { margin: 10px 0 4px; }
  .intro { margin: 0 0 4px 16px; font-style: italic; }
  table { border-collapse: collapse; }
  .grid { width: 100%; margin: 2px 0; }
  .grid th, .grid td { border: 1px solid #555; padding: 3px 6px; vertical-align: top; font-size: 14pt; }
  .grid th { background: #eef2ff; }
  .grid .tc { width: 64px; text-align: center; }
  .grid .why { width: 34%; }
  .grid .blank { height: 38px; }
  .sort .tall { height: 100px; }
  .chk { width: 100%; margin: 0 0 4px; }
  .chk td { padding: 3px 6px; vertical-align: top; font-size: 14pt; }
  .box { display: inline-block; border: 1.2px solid #000; width: 17px; height: 17px; line-height: 17px; vertical-align: middle; }
  .match { width: 100%; }
  .match td { padding: 5px 4px; font-size: 14pt; vertical-align: middle; }
  .match .ml { width: 46%; } .match .mr { width: 36%; }
  .match .dot { width: 14px; text-align: center; font-size: 9pt; }
  .match .gap { width: 8%; }
  .line { margin: 12px 0 0 16px; color: #555; }
  .drawbox { border: 1px dashed #777; height: 230px; margin: 4px 0 0 16px; }
  .teacher ul, .teacher ol { margin: 0 0 4px; padding-left: 22px; }
  .teacher li { margin: 3px 0; font-size: 13.5pt; }
  .ft { margin-top: 10px; text-align: center; font-size: 9.5pt; color: #777; }
  .pb { page-break-before: always; }
  @media print { body { padding: 0; } }
</style></head>
<body>
${body}
${o.autoPrint ? `<script>window.addEventListener("load",function(){setTimeout(function(){window.focus();window.print();},200);});</script>` : ""}
</body></html>`;
}
