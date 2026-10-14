// Tách "câu hỏi + A/B/C/D" dán vào một ô (lib/optionSplitter.ts): chỉ tách khi chắc.

import { test } from "node:test";
import assert from "node:assert/strict";
import { splitOptions } from "../lib/optionSplitter";

test("tách câu hỏi và đáp án, đọc được dòng đáp án đúng", () => {
  const r = splitOptions("Số nào lớn nhất?\nA. 12\nB. 21\nC. 9\nĐáp án: B");
  assert.deepEqual(r, { stem: "Số nào lớn nhất?", options: ["12", "21", "9"], correctIdx: 1 });
});

test("đáp án nằm cùng dòng", () => {
  const r = splitOptions("2 + 2 = ? A. 3 B. 4 C. 5 D. 6");
  assert.equal(r?.stem, "2 + 2 = ?");
  assert.deepEqual(r?.options, ["3", "4", "5", "6"]);
  assert.equal(r?.correctIdx, null);
});

test("không tách khi không chắc", () => {
  assert.equal(splitOptions(""), null);
  assert.equal(splitOptions("Chỉ có câu hỏi thôi"), null);
  assert.equal(splitOptions("A. 3\nB. 4"), null, "không có phần câu hỏi");
  assert.equal(splitOptions("Câu hỏi\nA. 3"), null, "chỉ một nhãn");
  assert.equal(splitOptions("Câu hỏi\nB. 3\nC. 4"), null, "không bắt đầu từ A");
});

test("chữ 'A.' lạc trong lời dẫn không làm lệch thứ tự", () => {
  const r = splitOptions("Lớp 3A. Bạn nào cao nhất?\nA. Lan\nB. Minh");
  assert.ok(r);
  assert.deepEqual(r.options.length >= 2, true);
  assert.equal(r.options[r.options.length - 1], "Minh");
});
