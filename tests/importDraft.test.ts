// Khu soạn đề: sai ở đây thì đề lưu được nhưng chấm sai, và không ai báo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { draftProblems, draftToQuestion, encodeCorrectAnswer, isBlankDraft, lessonProblems, NO_ANSWER } from "../lib/importDraft";
import { scoreAnswer } from "../lib/quizData";
import type { QDraft } from "../components/import/QuestionCard";

const mcq = (over: Partial<QDraft> = {}): QDraft => ({
  id: "q", type: "mcq", content: "2 + 3 = ?", options: ["4", "5", "6", "7"],
  correctIdx: 1, correctIdxs: [], answer: "", images: [], ...over,
});

test("câu mới chưa chọn đáp án đúng thì không lưu được", () => {
  assert.deepEqual(draftProblems(mcq()), []);
  assert.deepEqual(draftProblems(mcq({ correctIdx: NO_ANSWER })), ["Chưa chọn đáp án đúng"]);
  assert.deepEqual(draftProblems(mcq({ type: "multi", correctIdxs: [] })), ["Chưa chọn đáp án đúng nào"]);
});

test("đáp án trống, thiếu, trùng nhau", () => {
  assert.deepEqual(draftProblems(mcq({ options: ["4", "", "6", "7"] })), ["Còn ô đáp án bỏ trống — điền hoặc xoá ô đó"]);
  assert.deepEqual(draftProblems(mcq({ options: ["4", ""], correctIdx: 0 })), ["Cần ít nhất 2 đáp án"]);
  // Chấm theo chữ đáp án: hai ô "5" thì chọn ô nào cũng đúng.
  assert.deepEqual(draftProblems(mcq({ options: ["5", "5 ", "6", "7"] })), ["Có hai đáp án giống nhau"]);
  assert.deepEqual(draftProblems(mcq({ content: "  " })), ["Chưa có nội dung câu hỏi"]);
});

test("điền số: 1.250 bị chặn vì máy chấm hiểu là 1,25", () => {
  const num = (answer: string) => draftProblems(mcq({ type: "numeric", options: [], answer }));
  assert.deepEqual(num("42"), []);
  assert.deepEqual(num("3,5"), []);
  assert.deepEqual(num("-7.5"), []);
  assert.equal(num("1.250").length, 1);
  assert.match(num("1.250")[0], /1250/);
  assert.equal(num("12 cái").length, 1);
  assert.deepEqual(num(" "), ["Chưa có đáp án"]);
});

test("điền chữ: chỉ có dấu | thì vẫn là chưa có đáp án", () => {
  const short = (answer: string) => draftProblems(mcq({ type: "short", options: [], answer }));
  assert.deepEqual(short("Hà Nội|Ha Noi"), []);
  assert.deepEqual(short(" | "), ["Chưa có đáp án mẫu"]);
});

test("danh sách còn thiếu: thông tin bài trước, rồi từng câu theo thứ tự", () => {
  const list = lessonProblems({
    subject: "Toán", title: "",
    questions: [mcq(), mcq({ id: "b", correctIdx: NO_ANSWER, content: "" })],
  });
  assert.deepEqual(list, [
    { index: null, text: "Chưa đặt tên bài" },
    { index: 1, id: "b", text: "Chưa có nội dung câu hỏi" },
    { index: 1, id: "b", text: "Chưa chọn đáp án đúng" },
  ]);
});

test("câu trống trơn", () => {
  assert.equal(isBlankDraft(mcq({ content: "", options: ["", "", "", ""] })), true);
  assert.equal(isBlankDraft(mcq({ content: "", options: ["", "x", "", ""] })), false);
});

test("xem như học sinh chấm đúng như trang làm bài", () => {
  const q = draftToQuestion(mcq(), 0);
  assert.equal(q.correctAnswer, "5");
  assert.ok(scoreAnswer(q, "5"));
  assert.ok(!scoreAnswer(q, "4"));
  const m = draftToQuestion(mcq({ type: "multi", correctIdxs: [1, 3] }), 1);
  assert.equal(encodeCorrectAnswer(mcq({ type: "multi", correctIdxs: [1, 3] })), JSON.stringify(["5", "7"]));
  assert.ok(scoreAnswer(m, JSON.stringify(["7", "5"])));
  const s = draftToQuestion(mcq({ type: "short", options: ["x"], answer: " Hà Nội|Ha Noi " }), 2);
  assert.deepEqual(s.options, []);
  assert.ok(scoreAnswer(s, "ha noi"));
});
