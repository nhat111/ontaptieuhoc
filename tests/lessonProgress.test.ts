// Tiến độ bài trên máy: sai ở đây thì nút "Học ngay / Tiếp tục / Làm lại" hiện nhầm mà không ai báo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { addAttempt, lessonState, parseProgress, DONE_PERCENT } from "../lib/lessonProgress";

test("trạng thái bài: chưa làm → đang dở → xong từ mức Giỏi", () => {
  assert.equal(lessonState(undefined), "new");
  assert.equal(lessonState({ best: 0, last: 0, attempts: 0 }), "new");
  assert.equal(lessonState({ best: DONE_PERCENT - 1, last: 10, attempts: 2 }), "doing");
  assert.equal(lessonState({ best: DONE_PERCENT, last: 10, attempts: 2 }), "done");
});

test("gộp lần làm: giữ điểm tốt nhất, đếm lượt, kẹp điểm lạ", () => {
  const a = addAttempt(undefined, 7, 10);
  assert.deepEqual(a, { best: 70, last: 70, attempts: 1 });
  const b = addAttempt(a, 3, 10);
  assert.deepEqual(b, { best: 70, last: 30, attempts: 2 });
  assert.deepEqual(addAttempt(undefined, 12, 10), { best: 100, last: 100, attempts: 1 });
  assert.deepEqual(addAttempt(undefined, 0, 0), { best: 0, last: 0, attempts: 1 });
});

test("đọc localStorage hỏng không vỡ trang, bỏ từng mục hỏng", () => {
  assert.deepEqual(parseProgress(null), {});
  assert.deepEqual(parseProgress("{không phải json"), {});
  assert.deepEqual(parseProgress("[1,2]"), {});
  assert.deepEqual(
    parseProgress(JSON.stringify({ 5: { best: 90, last: 90, attempts: 1 }, 6: { best: "x" }, 7: null })),
    { 5: { best: 90, last: 90, attempts: 1 } },
  );
});
