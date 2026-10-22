// Chấm điểm (lib/quizData.ts → scoreAnswer). Mã hoá correct_answer theo từng loại câu
// mà sai thì điểm sai âm thầm — các test này ghim lại từng loại.

import { test } from "node:test";
import assert from "node:assert/strict";
import { displayAnswer, scoreAnswer, shuffleQuiz, type Question } from "../lib/quizData";

const q = (type: Question["type"], correctAnswer: string, options: string[] = []): Question => ({
  id: 1, type, question: "?", options, correctAnswer,
});

test("bỏ trống luôn là sai", () => {
  for (const type of ["mcq", "multi", "short", "numeric"] as const) {
    assert.equal(scoreAnswer(q(type, "1"), null), false);
    assert.equal(scoreAnswer(q(type, "1"), ""), false);
  }
});

test("mcq: so đúng nội dung đáp án", () => {
  const m = q("mcq", "Hà Nội", ["Huế", "Hà Nội", "Đà Nẵng"]);
  assert.equal(scoreAnswer(m, "Hà Nội"), true);
  assert.equal(scoreAnswer(m, "Huế"), false);
});

test("multi: đủ và đúng các đáp án, thứ tự không quan trọng", () => {
  const m = q("multi", JSON.stringify(["A", "C"]), ["A", "B", "C"]);
  assert.equal(scoreAnswer(m, JSON.stringify(["C", "A"])), true);
  assert.equal(scoreAnswer(m, JSON.stringify(["A"])), false);
  assert.equal(scoreAnswer(m, JSON.stringify(["A", "B", "C"])), false);
  assert.equal(scoreAnswer(m, "không phải JSON"), false);
});

test("multi: chọn trùng một đáp án không được tính là đủ", () => {
  const m = q("multi", JSON.stringify(["A", "B"]), ["A", "B", "C"]);
  assert.equal(scoreAnswer(m, JSON.stringify(["A", "A"])), false);
});

test("short: nhiều cách viết, không phân biệt hoa thường, bỏ khoảng trắng hai đầu", () => {
  const s = q("short", "Hà Nội|Ha Noi");
  assert.equal(scoreAnswer(s, "  hà nội "), true);
  assert.equal(scoreAnswer(s, "HA NOI"), true);
  assert.equal(scoreAnswer(s, "Huế"), false);
});

test("short: chữ tiếng Việt gõ kiểu tổ hợp (NFD, vd Unikey 'Unicode tổ hợp') vẫn đúng", () => {
  const s = q("short", "Hà Nội");
  assert.equal(scoreAnswer(s, "Hà Nội".normalize("NFD")), true);
  // và ngược lại: đáp án lưu dạng tổ hợp, bé gõ dựng sẵn
  assert.equal(scoreAnswer(q("short", "Hà Nội".normalize("NFD")), "Hà Nội"), true);
});

test("short: gõ thừa dấu cách ở giữa vẫn đúng", () => {
  assert.equal(scoreAnswer(q("short", "Hà Nội"), "Hà  Nội"), true);
});

test("short: số có dấu chấm ngăn nghìn (đề Toán tự sinh lưu mọi cách viết)", () => {
  const s = q("short", "5.000|5000|5 000");
  for (const typed of ["5.000", "5000", "5 000"]) assert.equal(scoreAnswer(s, typed), true);
  assert.equal(scoreAnswer(s, "500"), false);
});

test("numeric: chấp nhận dấu phẩy hoặc dấu chấm thập phân", () => {
  const n = q("numeric", "3,5");
  assert.equal(scoreAnswer(n, "3.5"), true);
  assert.equal(scoreAnswer(n, "3,5"), true);
  assert.equal(scoreAnswer(n, " 3,50 "), true);
  assert.equal(scoreAnswer(n, "3"), false);
  assert.equal(scoreAnswer(n, "abc"), false);
});

test("numeric: hành vi đang có — số kèm đơn vị vẫn đọc được số", () => {
  // parseFloat bỏ phần chữ phía sau. Giữ nguyên: bé hay gõ cả đơn vị ("12 cm").
  assert.equal(scoreAnswer(q("numeric", "12"), "12 cm"), true);
});

test("shuffleQuiz không làm đổi điểm và không đụng vào mảng gốc", () => {
  const questions = [
    q("mcq", "B", ["A", "B", "C", "D"]),
    q("multi", JSON.stringify(["A", "D"]), ["A", "B", "C", "D"]),
    q("short", "x"),
  ].map((x, i) => ({ ...x, id: i }));
  const before = JSON.stringify(questions);
  for (let i = 0; i < 50; i++) {
    const mixed = shuffleQuiz(questions, { questions: true, options: true });
    assert.equal(mixed.length, 3);
    for (const m of mixed) {
      const orig = questions.find((x) => x.id === m.id)!;
      assert.deepEqual([...m.options].sort(), [...orig.options].sort());
      const right = m.type === "mcq" ? "B" : m.type === "multi" ? JSON.stringify(["D", "A"]) : "x";
      assert.equal(scoreAnswer(m, right), true);
    }
  }
  assert.equal(JSON.stringify(questions), before);
});

test("displayAnswer: đáp án hiện cho người xem, và nó được chấm là đúng", () => {
  const cases = [
    q("mcq", "B", ["A", "B"]),
    q("multi", JSON.stringify(["A", "C"]), ["A", "B", "C"]),
    q("short", "5.000|5000|5 000"),
    q("numeric", "3,5"),
  ];
  assert.deepEqual(cases.map(displayAnswer), ["B", "A; C", "5.000", "3,5"]);
  for (const c of cases) {
    if (c.type !== "multi") assert.equal(scoreAnswer(c, displayAnswer(c)), true);
  }
});
