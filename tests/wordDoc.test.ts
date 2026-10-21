// File Word có hình: sai mã hoá ở đây thì Word mở ra lỗi font tiếng Việt hoặc mất ảnh mà không ai báo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMhtml, imageSrc, quotedPrintable } from "../lib/wordDoc";

// Giải quoted-printable để kiểm tra mã hoá đi-về.
function decodeQP(s: string): string {
  const bytes: number[] = [];
  const t = s.replace(/=\r\n/g, "");
  for (let i = 0; i < t.length; i++) {
    if (t[i] === "=") { bytes.push(parseInt(t.slice(i + 1, i + 3), 16)); i += 2; }
    else bytes.push(t.charCodeAt(i));
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

test("quoted-printable giữ nguyên tiếng Việt, dấu = và khoảng trắng cuối dòng", () => {
  const src = "Câu 1. Tính: 3 + 4 = ?  \nĐáp án: <b>7</b> " + "dài ".repeat(60);
  const qp = quotedPrintable(src);
  assert.equal(decodeQP(qp), src.replace(/\n/g, "\r\n"));
  for (const line of qp.split("\r\n")) assert.ok(line.length <= 76, line);
  assert.ok(!/[^\x20-\x7e]/.test(qp.replace(/\r\n/g, "")), "chỉ còn ký tự ASCII");
});

test("MHTML: phần HTML trước, mỗi ảnh một phần đúng Content-Location mà <img> trỏ tới", () => {
  const html = `<html><body><img src="${imageSrc("image001.png")}"/></body></html>`;
  const out = buildMhtml(html, [{ name: "image001.png", mime: "image/png", base64: "A".repeat(200) }]);
  const boundary = out.match(/boundary="([^"]+)"/)![1];
  const parts = out.split(`--${boundary}`);
  assert.equal(parts.length, 4); // mở đầu, html, ảnh, kết thúc "--"
  assert.match(parts[1], /Content-Type: text\/html; charset="utf-8"/);
  assert.match(parts[2], new RegExp(`Content-Location: ${imageSrc("image001.png").replace(/[./]/g, "\\$&")}`));
  assert.match(parts[2], /Content-Transfer-Encoding: base64/);
  assert.ok(out.trimEnd().endsWith(`--${boundary}--`));
});
