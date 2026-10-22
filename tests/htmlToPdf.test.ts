// Ngắt trang PDF: sai ở đây thì dòng chữ, hình hay hàng bảng bị cắt đôi giữa hai trang.

import { test } from "node:test";
import assert from "node:assert/strict";
import { isEmptyImage, pageBreaks, renderWithFallback } from "../lib/htmlToPdf";

const lines = (n: number, h: number) => Array.from({ length: n }, (_, i) => ({ top: i * h, bottom: i * h + h }));

test("vừa một trang thì không ngắt", () => {
  assert.deepEqual(pageBreaks(lines(5, 20), [], 100, 1000), []);
});

test("ngắt ở ranh giới khối, không cắt ngang dòng", () => {
  // Dòng cao 30: trang 100 px phải ngắt ở 90, 180, 270.
  assert.deepEqual(pageBreaks(lines(10, 30), [], 300, 100), [90, 180, 270]);
});

test("khối nằm trong khối khác (dòng trong hàng bảng) không bị cắt", () => {
  const boxes = [{ top: 0, bottom: 60 }, { top: 60, bottom: 140 }, { top: 70, bottom: 90 }, { top: 140, bottom: 180 }];
  assert.deepEqual(pageBreaks(boxes, [], 180, 100), [60, 140]);
});

test("khối cao hơn một trang thì đành cắt ở mép trang", () => {
  assert.deepEqual(pageBreaks([{ top: 0, bottom: 250 }], [], 250, 100), [100, 200]);
});

test("page-break-before luôn sang trang mới, kể cả khi còn chỗ", () => {
  assert.deepEqual(pageBreaks(lines(6, 10), [30], 60, 1000), [30]);
});

// iOS hết bộ nhớ canvas thì toDataURL trả "data:," mà không báo lỗi; jsPDF nhận luôn và ra file trắng.
test("ảnh trang rỗng bị nhận ra", () => {
  assert.equal(isEmptyImage("data:,"), true);
  assert.equal(isEmptyImage("data:image/jpeg;base64,"), true);
  assert.equal(isEmptyImage("data:image/jpeg;base64," + "A".repeat(5000)), false);
});

test("ảnh rỗng thì chụp lại ở độ nét thấp hơn", async () => {
  const tried: number[] = [];
  const url = await renderWithFallback(async (s) => { tried.push(s); return s === 1 ? "data:image/jpeg;base64," + "A".repeat(5000) : "data:,"; });
  assert.deepEqual(tried, [2, 1.5, 1]);
  assert.ok(url.startsWith("data:image/jpeg"));
});

test("hết cách thì báo lỗi, không đưa ra file PDF trắng", async () => {
  await assert.rejects(renderWithFallback(async () => "data:,"));
});
