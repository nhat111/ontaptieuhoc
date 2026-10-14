// Dán đề (lib/examParser.ts): đoán loại câu và mã hoá đáp án theo đúng quy ước chấm điểm.

import { test } from "node:test";
import assert from "node:assert/strict";
import { parseExamText } from "../lib/examParser";
import { scoreAnswer } from "../lib/quizData";

test("câu trắc nghiệm một đáp án, mỗi đáp án một dòng", () => {
  const [c] = parseExamText("Câu 1. 2 + 3 = ?\nA. 4\nB. 5\nC. 6\nĐáp án: B");
  assert.equal(c.type, "mcq");
  assert.equal(c.question, "2 + 3 = ?");
  assert.deepEqual(c.options, ["4", "5", "6"]);
  assert.equal(c.correctAnswer, "5");
});

test("hai đáp án trên một dòng (cách nhau từ 2 dấu cách)", () => {
  const [c] = parseExamText("Câu 2: Chọn số chẵn\nA. 3   B. 8\nC. 5   D. 7\nChọn B");
  assert.deepEqual(c.options, ["3", "8", "5", "7"]);
  assert.equal(c.correctAnswer, "8");
});

test("nhiều đáp án đúng → multi, mã hoá JSON chấm được", () => {
  const [c] = parseExamText("Câu 3. Số nào lớn hơn 5?\nA. 2\nB. 7\nC. 9\nĐáp án: B, C");
  assert.equal(c.type, "multi");
  assert.equal(c.correctAnswer, JSON.stringify(["7", "9"]));
  assert.equal(scoreAnswer({ id: 1, type: "multi", question: "", options: c.options, correctAnswer: c.correctAnswer! }, JSON.stringify(["9", "7"])), true);
});

test("không có đáp án lựa chọn: số → numeric, chữ → short", () => {
  const [a, b] = parseExamText("Câu 1. 12 : 4 = ?\nĐáp án: 3\nCâu 2. Thủ đô nước ta?\nĐáp án: Hà Nội");
  assert.equal(a.type, "numeric");
  assert.equal(a.correctAnswer, "3");
  assert.equal(b.type, "short");
  assert.equal(b.correctAnswer, "Hà Nội");
});

test("số có dấu chấm ngăn nghìn kiểu Việt Nam không bị đọc thành số thập phân", () => {
  // "1.250" ở đề Việt Nam là một nghìn hai trăm năm mươi. Lưu numeric thì parseFloat đọc thành 1,25.
  const [c] = parseExamText("Câu 1. 1000 + 250 = ?\nĐáp án: 1.250");
  const asQuestion = { id: 1, type: c.type, question: c.question, options: c.options, correctAnswer: c.correctAnswer! };
  assert.equal(scoreAnswer(asQuestion, "1250"), true);
  assert.equal(scoreAnswer(asQuestion, "1.250"), true);
  assert.equal(scoreAnswer(asQuestion, "1,25"), false);
});

test("số thập phân dấu phẩy vẫn là numeric", () => {
  const [c] = parseExamText("Câu 1. 1,5 + 2 = ?\nĐáp án: 3,5");
  assert.equal(c.type, "numeric");
  assert.equal(scoreAnswer({ id: 1, type: c.type, question: "", options: [], correctAnswer: c.correctAnswer! }, "3.5"), true);
});

test("dòng tiếp theo nối vào câu hỏi; dòng chỉ có số trang không mở câu mới", () => {
  const qs = parseExamText("Câu 1. Bạn Lan có 5 quả cam,\nmẹ cho thêm 3 quả.\n12\nA. 7\nB. 8\nĐáp án: B");
  assert.equal(qs.length, 1);
  assert.equal(qs[0].question, "Bạn Lan có 5 quả cam, mẹ cho thêm 3 quả. 12");
  assert.equal(qs[0].correctAnswer, "8");
});

test("không có dòng đáp án thì correctAnswer = null", () => {
  const [c] = parseExamText("Question 1. Choose\nA. cat\nB. dog");
  assert.equal(c.type, "mcq");
  assert.equal(c.correctAnswer, null);
});
