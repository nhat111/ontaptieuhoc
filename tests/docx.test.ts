// File Word (.docx): sai ở đây thì Word / LibreOffice báo file hỏng hoặc mất hình mà không ai báo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { strFromU8, unzipSync } from "fflate";
import { documentXml, packDocx, xmlEscape, type DocxBlock, type DocxCell } from "../lib/docx";

const cell = (text: string, width: number, span = 1): DocxCell => ({
  blocks: [{ kind: "p", runs: [{ text }] }],
  span, width, borders: { top: { width: 1.5, color: "000000" } }, padding: { top: 0, right: 0, bottom: 0, left: 0 },
});

test("escape XML và bỏ ký tự điều khiển (Word báo hỏng file nếu có)", () => {
  assert.equal(xmlEscape(`a < b & "c" > d\u0001`), "a &lt; b &amp; &quot;c&quot; &gt; d");
  assert.equal(xmlEscape("Câu 1. Đúng"), "Câu 1. Đúng");
});

test("gói docx có đủ các phần, mỗi ảnh một file và một quan hệ trỏ đúng", () => {
  const blocks: DocxBlock[] = [{ kind: "p", runs: [{ text: "Phiếu" }, { image: { index: 0, w: 60, h: 60 } }, { image: { index: 1, w: 30, h: 30 } }] }];
  const zip = unzipSync(packDocx(blocks, [{ mime: "image/png", data: new Uint8Array([1]) }, { mime: "image/jpeg", data: new Uint8Array([2]) }]));
  for (const f of ["[Content_Types].xml", "_rels/.rels", "word/document.xml", "word/_rels/document.xml.rels", "word/styles.xml", "word/media/hinh1.png", "word/media/hinh2.jpg"]) {
    assert.ok(zip[f], `thiếu ${f}`);
  }
  const rels = strFromU8(zip["word/_rels/document.xml.rels"]);
  const doc = strFromU8(zip["word/document.xml"]);
  for (const id of doc.match(/r:embed="([^"]+)"/g)!.map((m) => m.slice(9, -1))) {
    assert.match(rels, new RegExp(`Id="${id}"[^>]*Target="media/hinh\\d\\.(png|jpg)"`));
  }
  // 60 px = 571500 EMU; mỗi hình một docPr id riêng.
  assert.match(doc, /cx="571500" cy="571500"/);
  assert.deepEqual(doc.match(/wp:docPr id="(\d+)"/g), ['wp:docPr id="1"', 'wp:docPr id="2"']);
});

test("bảng: lưới cột, gộp cột, ô kết thúc bằng đoạn văn, hai bảng liền nhau có đoạn ngăn", () => {
  const table = (): DocxBlock => ({
    kind: "table", grid: [100, 200], indent: 0,
    rows: [{ height: 28, cells: [cell("A", 100), cell("B", 200)] }, { height: 0, cells: [cell("gộp", 300, 2)] }],
  });
  const doc = documentXml([table(), table()]);
  assert.match(doc, /<w:gridCol w:w="1500"\/><w:gridCol w:w="3000"\/>/);
  assert.match(doc, /<w:gridSpan w:val="2"\/>/);
  assert.match(doc, /<w:trHeight w:val="420" w:hRule="atLeast"\/>/);
  assert.ok(!/<\/w:tbl><w:tbl>/.test(doc), "hai bảng sát nhau thì Word gộp làm một");
  assert.ok(!/<\/w:tbl><\/w:tc>/.test(doc), "ô bảng phải kết thúc bằng đoạn văn");
  assert.match(doc, /<w:top w:val="single" w:sz="9"/);
  assert.match(doc, /<w:bottom w:val="nil"\/>/);
});

test("ngắt trang, căn giữa, thụt lề, kiểu chữ ra đúng thẻ", () => {
  const doc = documentXml([
    { kind: "p", runs: [{ text: "TIÊU ĐỀ", bold: true, color: "b91c1c", size: 20 }], align: "center", pageBreakBefore: true, indent: 18 },
    { kind: "p", runs: [{ text: "  hai  khoảng  " }, { br: true }] },
  ]);
  assert.match(doc, /<w:pageBreakBefore\/>/);
  assert.match(doc, /<w:jc w:val="center"\/>/);
  assert.match(doc, /<w:ind w:left="270"\/>/);
  assert.match(doc, /<w:b\/><w:bCs\/><w:color w:val="b91c1c"\/><w:sz w:val="30"\/>/);
  assert.match(doc, /<w:t xml:space="preserve">  hai  khoảng  <\/w:t>/);
  assert.match(doc, /<w:br\/>/);
  // Khổ A4, sectPr ở cuối body.
  assert.match(doc, /<w:pgSz w:w="11906" w:h="16838"\/>.*<\/w:sectPr><\/w:body>/);
});
