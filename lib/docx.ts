// lib/docx.ts
// File Word thật (.docx) từ HTML in của đề / phiếu — mở được cả bằng Microsoft Word lẫn LibreOffice.
//
// Vì sao không còn MHTML (.doc "trang web một tệp"): LibreOffice không đọc MHTML, mở ra chỉ thấy
// mã MIME. Vì sao không dùng thư viện html → docx: thư viện đã thử bỏ qua khối <style>, mất viền
// bảng và cỡ chữ. Ở đây HTML được dựng trong một iframe ẩn rộng đúng vùng in A4 (giống bản PDF),
// rồi đọc kiểu chữ, căn lề, viền ô, bề rộng cột, cỡ hình THEO CÁCH TRÌNH DUYỆT ĐÃ VẼ
// (getComputedStyle, getBoundingClientRect) — CSS viết kiểu gì cũng ra đúng.
//
// Hai phần: dựng XML + nén ZIP (thuần, có test ở tests/docx.test.ts) và đọc DOM (chỉ chạy
// trong trình duyệt). Hình (SVG tự vẽ, ảnh tải lên) được vẽ lại thành PNG/JPEG vì Word không
// đọc SVG trong docx kiểu cũ.

import { zipSync, strToU8 } from "fflate";

/* ═══════════════ Mô hình tài liệu ═══════════════ */

export interface DocxRun {
  text?: string;
  br?: boolean;
  /** Chỉ số ảnh trong danh sách `images` của packDocx. */
  image?: { index: number; w: number; h: number }; // px
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string; // "b91c1c"
  size?: number;  // px
  font?: string;
}

export interface DocxPara {
  kind: "p";
  runs: DocxRun[];
  align?: "left" | "center" | "right" | "both";
  before?: number; // px
  after?: number;  // px
  indent?: number; // px
  pageBreakBefore?: boolean;
  keepNext?: boolean;
  /** Cỡ chữ của đoạn rỗng (giữ chiều cao dòng). */
  size?: number;
}

export interface DocxBorder { width: number; color: string } // px

export interface DocxCell {
  blocks: DocxBlock[];
  span: number;
  width: number; // px
  borders: { top?: DocxBorder; right?: DocxBorder; bottom?: DocxBorder; left?: DocxBorder };
  padding: { top: number; right: number; bottom: number; left: number }; // px
  vAlign?: "top" | "center" | "bottom";
  fill?: string;
}

export interface DocxTable {
  kind: "table";
  grid: number[]; // px
  rows: { cells: DocxCell[]; height: number }[];
  indent: number; // px
  pageBreakBefore?: boolean;
}

export type DocxBlock = DocxPara | DocxTable;

export interface DocxImage { mime: string; data: Uint8Array }

/* ═══════════════ XML ═══════════════ */

const TW = 15;      // px → twip (1 px = 1/96 in = 15/1440 in)
const EMU = 9525;   // px → EMU
// A4 = 11906 × 16838 twip; lề 720 twip (12,7 mm, như bản PDF ở lib/htmlToPdf.ts) → vùng in
// 10466 twip ≈ 697 px. Cùng lề với PDF thì phiếu "một trang A4" vẫn vừa một trang.
const PAGE = { w: 11906, h: 16838, margin: 720 };
export const DOCX_CONTENT_PX = Math.floor((PAGE.w - 2 * PAGE.margin) / TW);

/** Bỏ ký tự XML không cho phép rồi escape. */
export function xmlEscape(s: string): string {
  return s
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g, "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const tw = (px: number) => Math.max(0, Math.round(px * TW));

function runXml(r: DocxRun, imageRid: (i: number) => string, docPr: () => number): string {
  const pr =
    (r.font ? `<w:rFonts w:ascii="${xmlEscape(r.font)}" w:hAnsi="${xmlEscape(r.font)}" w:cs="${xmlEscape(r.font)}"/>` : "") +
    (r.bold ? "<w:b/><w:bCs/>" : "") +
    (r.italic ? "<w:i/><w:iCs/>" : "") +
    (r.underline ? `<w:u w:val="single"/>` : "") +
    (r.color ? `<w:color w:val="${r.color}"/>` : "") +
    (r.size ? `<w:sz w:val="${Math.round(r.size * 1.5)}"/><w:szCs w:val="${Math.round(r.size * 1.5)}"/>` : "");
  const rPr = pr ? `<w:rPr>${pr}</w:rPr>` : "";
  if (r.br) return `<w:r>${rPr}<w:br/></w:r>`;
  if (r.image) {
    const id = docPr();
    const cx = Math.round(r.image.w * EMU), cy = Math.round(r.image.h * EMU);
    return (
      `<w:r>${rPr}<w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">` +
      `<wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${id}" name="Hinh ${id}"/>` +
      `<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
      `<pic:pic><pic:nvPicPr><pic:cNvPr id="${id}" name="hinh${id}"/><pic:cNvPicPr/></pic:nvPicPr>` +
      `<pic:blipFill><a:blip r:embed="${imageRid(r.image.index)}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
      `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>` +
      `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`
    );
  }
  return `<w:r>${rPr}<w:t xml:space="preserve">${xmlEscape(r.text ?? "")}</w:t></w:r>`;
}

function paraXml(p: DocxPara, imageRid: (i: number) => string, docPr: () => number): string {
  const pPr =
    (p.keepNext ? "<w:keepNext/>" : "") +
    (p.pageBreakBefore ? "<w:pageBreakBefore/>" : "") +
    `<w:spacing w:before="${tw(p.before ?? 0)}" w:after="${tw(p.after ?? 0)}" w:line="240" w:lineRule="auto"/>` +
    (p.indent ? `<w:ind w:left="${tw(p.indent)}"/>` : "") +
    (p.align && p.align !== "left" ? `<w:jc w:val="${p.align}"/>` : "") +
    (p.size ? `<w:rPr><w:sz w:val="${Math.round(p.size * 1.5)}"/></w:rPr>` : "");
  return `<w:p><w:pPr>${pPr}</w:pPr>${p.runs.map((r) => runXml(r, imageRid, docPr)).join("")}</w:p>`;
}

const borderXml = (side: string, b?: DocxBorder) =>
  b && b.width > 0
    ? `<w:${side} w:val="single" w:sz="${Math.max(2, Math.round(b.width * 6))}" w:space="0" w:color="${b.color}"/>`
    : `<w:${side} w:val="nil"/>`;

// Đoạn rỗng thật nhỏ: ô bảng phải kết thúc bằng một đoạn, và hai bảng sát nhau thì Word gộp làm một.
const SPACER: DocxPara = { kind: "p", runs: [], size: 1 };

function blocksXml(blocks: DocxBlock[], imageRid: (i: number) => string, docPr: () => number, inCell: boolean): string {
  let out = "";
  blocks.forEach((b, i) => {
    if (b.kind === "p") { out += paraXml(b, imageRid, docPr); return; }
    if (b.pageBreakBefore) out += paraXml({ ...SPACER, pageBreakBefore: true }, imageRid, docPr);
    else if (i > 0 && blocks[i - 1].kind === "table") out += paraXml(SPACER, imageRid, docPr);
    out += tableXml(b, imageRid, docPr);
  });
  if (inCell && (!blocks.length || blocks[blocks.length - 1].kind === "table")) out += paraXml(SPACER, imageRid, docPr);
  return out;
}

function tableXml(t: DocxTable, imageRid: (i: number) => string, docPr: () => number): string {
  const total = t.grid.reduce((s, w) => s + tw(w), 0);
  const rows = t.rows.map((row) => {
    const cells = row.cells.map((c) => {
      const tcPr =
        `<w:tcW w:w="${tw(c.width)}" w:type="dxa"/>` +
        (c.span > 1 ? `<w:gridSpan w:val="${c.span}"/>` : "") +
        `<w:tcBorders>${borderXml("top", c.borders.top)}${borderXml("left", c.borders.left)}${borderXml("bottom", c.borders.bottom)}${borderXml("right", c.borders.right)}</w:tcBorders>` +
        (c.fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${c.fill}"/>` : "") +
        `<w:tcMar><w:top w:w="${tw(c.padding.top)}" w:type="dxa"/><w:left w:w="${tw(c.padding.left)}" w:type="dxa"/>` +
        `<w:bottom w:w="${tw(c.padding.bottom)}" w:type="dxa"/><w:right w:w="${tw(c.padding.right)}" w:type="dxa"/></w:tcMar>` +
        (c.vAlign && c.vAlign !== "top" ? `<w:vAlign w:val="${c.vAlign}"/>` : "");
      return `<w:tc><w:tcPr>${tcPr}</w:tcPr>${blocksXml(c.blocks, imageRid, docPr, true)}</w:tc>`;
    });
    const trPr = row.height > 0 ? `<w:trPr><w:cantSplit/><w:trHeight w:val="${tw(row.height)}" w:hRule="atLeast"/></w:trPr>` : "<w:trPr><w:cantSplit/></w:trPr>";
    return `<w:tr>${trPr}${cells.join("")}</w:tr>`;
  });
  return (
    `<w:tbl><w:tblPr><w:tblW w:w="${total}" w:type="dxa"/>` +
    (t.indent > 0 ? `<w:tblInd w:w="${tw(t.indent)}" w:type="dxa"/>` : "") +
    `<w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr>` +
    `<w:tblGrid>${t.grid.map((w) => `<w:gridCol w:w="${tw(w)}"/>`).join("")}</w:tblGrid>` +
    rows.join("") +
    `</w:tbl>`
  );
}

const NS =
  `xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ` +
  `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ` +
  `xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" ` +
  `xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ` +
  `xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"`;

/** word/document.xml */
export function documentXml(blocks: DocxBlock[]): string {
  let id = 0;
  const body = blocksXml(blocks, (i) => `rIdImg${i + 1}`, () => ++id, false);
  const sect =
    `<w:sectPr><w:pgSz w:w="${PAGE.w}" w:h="${PAGE.h}"/>` +
    `<w:pgMar w:top="${PAGE.margin}" w:right="${PAGE.margin}" w:bottom="${PAGE.margin}" w:left="${PAGE.margin}" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document ${NS}><w:body>${body}${sect}</w:body></w:document>`;
}

const ext = (mime: string) => (mime === "image/jpeg" ? "jpg" : "png");

/** Nén thành gói .docx (các phần tối thiểu Word và LibreOffice cần). */
export function packDocx(blocks: DocxBlock[], images: DocxImage[], font = "Times New Roman"): Uint8Array {
  const f = xmlEscape(font);
  const files: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
      `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
      `<Default Extension="xml" ContentType="application/xml"/>` +
      `<Default Extension="png" ContentType="image/png"/><Default Extension="jpg" ContentType="image/jpeg"/>` +
      `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
      `<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>` +
      `</Types>`,
    ),
    "_rels/.rels": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
      `</Relationships>`,
    ),
    "word/_rels/document.xml.rels": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      `<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
      images.map((im, i) =>
        `<Relationship Id="rIdImg${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/hinh${i + 1}.${ext(im.mime)}"/>`,
      ).join("") +
      `</Relationships>`,
    ),
    "word/styles.xml": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
      `<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${f}" w:hAnsi="${f}" w:cs="${f}" w:eastAsia="${f}"/>` +
      `<w:sz w:val="28"/><w:szCs w:val="28"/><w:lang w:val="vi-VN"/></w:rPr></w:rPrDefault>` +
      `<w:pPrDefault><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>` +
      `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>` +
      `</w:styles>`,
    ),
    "word/document.xml": strToU8(documentXml(blocks)),
  };
  images.forEach((im, i) => { files[`word/media/hinh${i + 1}.${ext(im.mime)}`] = im.data; });
  return zipSync(files, { level: 6 });
}

export const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/* ═══════════════ Đọc DOM đã vẽ (chỉ chạy trong trình duyệt) ═══════════════ */

const SKIP = new Set(["SCRIPT", "STYLE", "TITLE", "HEAD", "META", "LINK", "COLGROUP", "COL"]);

function hex(color: string): string | undefined {
  const m = color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
  if (!m || (m[4] !== undefined && Number(m[4]) === 0)) return undefined;
  return [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("");
}

const px = (v: string) => parseFloat(v) || 0;

interface Walk {
  win: Window;
  images: Map<string, number>; // src → chỉ số ảnh
  breakNext: boolean;
}

function runStyle(st: CSSStyleDeclaration): Omit<DocxRun, "text" | "br" | "image"> {
  const color = hex(st.color);
  return {
    bold: Number(st.fontWeight) >= 600 || st.fontWeight === "bold",
    italic: st.fontStyle === "italic",
    underline: (st.textDecorationLine || st.textDecoration).includes("underline"),
    color: color && color !== "000000" ? color : undefined,
    size: px(st.fontSize),
    font: st.fontFamily.split(",")[0].replace(/["']/g, "").trim() || undefined,
  };
}

function isBlock(el: Element, st: CSSStyleDeclaration): boolean {
  if (el.tagName === "TABLE") return true;
  return ["block", "list-item", "table", "flex", "grid", "flow-root"].includes(st.display);
}

/** Đoạn văn của một phần tử khối: gom các con nội dòng, gặp con khối thì cắt đoạn. */
function walkBlock(el: Element, frameLeft: number, w: Walk, out: DocxBlock[]): void {
  const st = w.win.getComputedStyle(el);
  if (st.display === "none") return;
  if (st.breakBefore === "page" || (st as unknown as { pageBreakBefore?: string }).pageBreakBefore === "always") w.breakNext = true;
  if (el.tagName === "TABLE") { out.push(walkTable(el as HTMLTableElement, frameLeft, w)); return; }
  if (sideBySide(el, st)) { out.push(walkLayout(el, st, frameLeft, w)); return; }

  const rect = el.getBoundingClientRect();
  const align = st.textAlign === "center" ? "center" : st.textAlign === "right" || st.textAlign === "end" ? "right" : st.textAlign === "justify" ? "both" : "left";
  const pre = st.whiteSpace.startsWith("pre");
  const explicit = /^(P|H[1-6]|LI)$/.test(el.tagName);
  let runs: DocxRun[] = [];
  let first = true;
  const flush = (last: boolean) => {
    // Bỏ khoảng trắng đầu/cuối đoạn như trình duyệt.
    while (runs.length && runs[0].text !== undefined && !runs[0].text.trim()) runs.shift();
    while (runs.length && runs[runs.length - 1].text !== undefined && !runs[runs.length - 1].text!.trim()) runs.pop();
    if (runs[0]?.text) runs[0] = { ...runs[0], text: runs[0].text.replace(/^\s+/, "") };
    const z = runs.length - 1;
    if (runs[z]?.text) runs[z] = { ...runs[z], text: runs[z].text!.replace(/\s+$/, "") };
    if (runs.length || (explicit && first && last)) {
      out.push({
        kind: "p", runs, align,
        before: first ? px(st.marginTop) + px(st.paddingTop) : 0,
        after: last ? px(st.marginBottom) + px(st.paddingBottom) : 0,
        indent: Math.max(0, rect.left + px(st.paddingLeft) - frameLeft),
        pageBreakBefore: w.breakNext || undefined,
        keepNext: /^H[1-6]$/.test(el.tagName) || undefined,
        size: px(st.fontSize),
      });
      w.breakNext = false;
      first = false;
    }
    runs = [];
  };

  if (el.tagName === "LI") {
    const list = el.parentElement;
    if (list?.tagName === "OL") {
      const n = [...list.children].filter((c) => c.tagName === "LI").indexOf(el) + ((list as HTMLOListElement).start || 1);
      runs.push({ text: `${n}. `, ...runStyle(st) });
    } else if (st.listStyleType !== "none") runs.push({ text: "• ", ...runStyle(st) });
  }

  const inline = (node: Node) => {
    if (node.nodeType === 3) {
      const parent = node.parentElement!;
      let text = node.textContent ?? "";
      if (!pre) text = text.replace(/\s+/g, " ");
      if (!text) return;
      const s = runStyle(w.win.getComputedStyle(parent));
      if (pre && text.includes("\n")) {
        text.split("\n").forEach((part, i) => { if (i) runs.push({ br: true }); if (part) runs.push({ text: part, ...s }); });
      } else {
        // Hai khoảng trắng liền nhau giữa các phần tử → một.
        const prev = runs[runs.length - 1];
        if (!pre && text.startsWith(" ") && prev?.text?.endsWith(" ")) text = text.slice(1);
        if (text) runs.push({ text, ...s });
      }
      return;
    }
    if (node.nodeType !== 1) return;
    const child = node as Element;
    if (SKIP.has(child.tagName)) return;
    const cst = w.win.getComputedStyle(child);
    if (cst.display === "none") return;
    if (isBlock(child, cst)) {
      flush(false);
      walkBlock(child, frameLeft, w, out);
      return;
    }
    if (child.tagName === "BR") { runs.push({ br: true }); return; }
    if (child.tagName === "IMG") {
      const img = child as HTMLImageElement;
      const index = w.images.get(img.getAttribute("src") ?? "");
      const r = img.getBoundingClientRect();
      if (index !== undefined && r.width > 0) runs.push({ image: { index, w: r.width, h: r.height } });
      return;
    }
    child.childNodes.forEach(inline);
  };
  el.childNodes.forEach(inline);
  flush(true);
}

/** Grid / flex theo hàng có ô nằm cạnh nhau (VD đáp án A B hai cột): Word không có kiểu này. */
function sideBySide(el: Element, st: CSSStyleDeclaration): boolean {
  if (!(st.display === "grid" || (st.display === "flex" && !st.flexDirection.startsWith("column")))) return false;
  const kids = [...el.children].filter((c) => c.getBoundingClientRect().width > 0);
  const tops = kids.map((c) => Math.round(c.getBoundingClientRect().top));
  return kids.length > 1 && new Set(tops).size < kids.length;
}

/** Dựng bố cục grid / flex thành bảng không viền: các ô cùng mép trên là một hàng. */
function walkLayout(el: Element, st: CSSStyleDeclaration, frameLeft: number, w: Walk): DocxTable {
  const pageBreakBefore = w.breakNext || undefined;
  w.breakNext = false;
  const box = el.getBoundingClientRect();
  const left = box.left + px(st.borderLeftWidth) + px(st.paddingLeft);
  const right = box.right - px(st.borderRightWidth) - px(st.paddingRight);
  const kids = [...el.children].filter((c) => c.getBoundingClientRect().width > 0);
  const rowsOf = new Map<number, Element[]>();
  for (const k of kids) {
    const top = Math.round(k.getBoundingClientRect().top);
    const key = [...rowsOf.keys()].find((t) => Math.abs(t - top) <= 2) ?? top;
    rowsOf.set(key, [...(rowsOf.get(key) ?? []), k]);
  }
  // Mỗi ô kéo từ mép trái của nó tới mép trái ô kế (khoảng cách cột nằm trong ô), ô cuối tới mép phải.
  const spans = [...rowsOf.entries()].sort((a, b) => a[0] - b[0]).map(([, cells]) => {
    cells.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    return cells.map((c, i) => ({
      el: c,
      from: Math.round(i === 0 ? left : c.getBoundingClientRect().left),
      to: Math.round(i + 1 < cells.length ? cells[i + 1].getBoundingClientRect().left : right),
    }));
  });
  const xs = [...new Set(spans.flat().flatMap((c) => [c.from, c.to]))].sort((a, b) => a - b);
  const none = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    kind: "table",
    grid: xs.slice(1).map((x, i) => x - xs[i]),
    indent: Math.max(0, Math.round(left) - frameLeft),
    pageBreakBefore,
    rows: spans.map((cells) => ({
      height: 0,
      cells: cells.map((c): DocxCell => {
        const blocks: DocxBlock[] = [];
        walkBlock(c.el, c.el.getBoundingClientRect().left, { ...w, breakNext: false }, blocks);
        return { blocks, span: xs.indexOf(c.to) - xs.indexOf(c.from), width: c.to - c.from, borders: {}, padding: none };
      }),
    })),
  };
}

function walkTable(table: HTMLTableElement, frameLeft: number, w: Walk): DocxTable {
  const pageBreakBefore = w.breakNext || undefined;
  w.breakNext = false;
  const trect = table.getBoundingClientRect();
  const cells = [...table.rows].flatMap((r) => [...r.cells]);
  // Lưới cột = mọi mép trái/phải của các ô (làm tròn), nên ô gộp cột (colspan) tự ra gridSpan.
  const xs = [...new Set(cells.flatMap((c) => { const r = c.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)]; }))].sort((a, b) => a - b);
  const grid = xs.slice(1).map((x, i) => x - xs[i]).filter((d) => d > 0);
  const edges = xs.filter((x, i) => i === 0 || x - xs[i - 1] > 0);
  const rows = [...table.rows].map((tr) => ({
    height: tr.getBoundingClientRect().height,
    cells: [...tr.cells].map((td): DocxCell => {
      const r = td.getBoundingClientRect();
      const st = w.win.getComputedStyle(td);
      const l = edges.indexOf(Math.round(r.left)), rr = edges.indexOf(Math.round(r.right));
      const side = (s: "Top" | "Right" | "Bottom" | "Left"): DocxBorder | undefined => {
        const width = px(st.getPropertyValue(`border-${s.toLowerCase()}-width`));
        const style = st.getPropertyValue(`border-${s.toLowerCase()}-style`);
        return width > 0 && style !== "none" && style !== "hidden" ? { width, color: hex(st.getPropertyValue(`border-${s.toLowerCase()}-color`)) ?? "000000" } : undefined;
      };
      const blocks: DocxBlock[] = [];
      walkBlock(td, r.left + px(st.borderLeftWidth) + px(st.paddingLeft), { ...w, breakNext: false }, blocks);
      // Đoạn đầu/cuối trong ô: lề trên/dưới đã nằm trong padding của ô.
      return {
        blocks,
        span: Math.max(1, rr - l),
        width: r.width,
        borders: { top: side("Top"), right: side("Right"), bottom: side("Bottom"), left: side("Left") },
        padding: { top: px(st.paddingTop), right: px(st.paddingRight), bottom: px(st.paddingBottom), left: px(st.paddingLeft) },
        vAlign: st.verticalAlign === "middle" ? "center" : st.verticalAlign === "bottom" ? "bottom" : "top",
        fill: hex(st.backgroundColor),
      };
    }),
  }));
  // Ô td cũng là khối: walkBlock(td) dùng padding làm lề trước/sau — đã có trong tcMar nên bỏ.
  for (const row of rows) for (const c of row.cells) {
    const p0 = c.blocks[0], pn = c.blocks[c.blocks.length - 1];
    if (p0?.kind === "p") p0.before = Math.max(0, (p0.before ?? 0) - c.padding.top);
    if (pn?.kind === "p") pn.after = Math.max(0, (pn.after ?? 0) - c.padding.bottom);
  }
  return { kind: "table", grid, rows, indent: Math.max(0, trect.left - frameLeft), pageBreakBefore };
}

interface Raster { mime: string; data: Uint8Array }

async function rasterize(img: HTMLImageElement): Promise<Raster | null> {
  try {
    if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; });
    const w = img.naturalWidth || 300, h = img.naturalHeight || 150;
    const src = img.getAttribute("src") ?? "";
    const isSvg = /^data:image\/svg|\.svg(\?|$)/i.test(src);
    const jpeg = /^data:image\/jpe?g|\.jpe?g(\?|$)/i.test(src);
    const k = isSvg ? 2 : 1; // hình vẽ SVG: vẽ gấp đôi cho nét in sắc
    const c = document.createElement("canvas");
    c.width = Math.round(w * k);
    c.height = Math.round(h * k);
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const mime = jpeg ? "image/jpeg" : "image/png";
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, mime, 0.9));
    return blob ? { mime, data: new Uint8Array(await blob.arrayBuffer()) } : null;
  } catch {
    return null; // ảnh lỗi / chặn CORS: bỏ hình đó, file vẫn tải được
  }
}

/** HTML in (đề, phiếu) → Blob .docx. */
export async function htmlToDocx(html: string): Promise<Blob> {
  const frame = document.createElement("iframe");
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${DOCX_CONTENT_PX}px;height:1200px;border:0;visibility:hidden;`;
  // Bỏ script tự in và ép body đúng bề rộng vùng in A4, như bản PDF.
  const fixed = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/head>/i, `<style>html,body{background:#fff!important;}body{margin:0!important;padding:0!important;max-width:none!important;width:${DOCX_CONTENT_PX}px!important;}</style></head>`);
  document.body.appendChild(frame);
  try {
    await new Promise<void>((resolve) => { frame.onload = () => resolve(); frame.srcdoc = fixed; });
    const doc = frame.contentDocument!;
    const win = frame.contentWindow!;
    // Hình có thể dùng crossOrigin: tải lại ảnh ngoài để vẽ được lên canvas.
    for (const im of doc.images) if (/^https?:/i.test(im.src) && !im.crossOrigin) { im.crossOrigin = "anonymous"; im.src = im.src; }
    await Promise.race([
      Promise.all([...doc.images].map((im) => (im.complete ? null : new Promise((r) => { im.onload = im.onerror = r; })))),
      new Promise((r) => setTimeout(r, 8000)),
    ]);

    const images: DocxImage[] = [];
    const index = new Map<string, number>();
    for (const im of doc.images) {
      const src = im.getAttribute("src") ?? "";
      if (index.has(src)) continue;
      const r = await rasterize(im);
      if (!r) continue;
      index.set(src, images.length);
      images.push(r);
    }

    const blocks: DocxBlock[] = [];
    walkBlock(doc.body, doc.body.getBoundingClientRect().left, { win: win as unknown as Window, images: index, breakNext: false }, blocks);
    const font = win.getComputedStyle(doc.body).fontFamily.split(",")[0].replace(/["']/g, "").trim() || undefined;
    return new Blob([packDocx(blocks, images, font) as BlobPart], { type: DOCX_MIME });
  } finally {
    frame.remove();
  }
}
