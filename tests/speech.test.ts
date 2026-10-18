// Bấm "Dừng đọc" phải dừng hẳn. Trình duyệt giả lập kiểu Safari/iOS: `cancel()`
// bắn `onend` (không phải `onerror`) cho câu đang đọc — chính đường này từng làm
// chuỗi đọc nhảy sang câu sau dù nút đã đổi về "Nghe cả bài".

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { fake } from "./fakeSpeech";
import { speakSegments, stopSpeaking } from "../lib/speech";

const spoken = fake.spoken;

/** Câu đang đọc kết thúc bình thường. */
function finishCurrent() {
  const u = fake.current;
  fake.current = null;
  u?.onend?.();
}

beforeEach(() => {
  spoken.length = 0;
  fake.current = null;
});
afterEach(() => stopSpeaking());

test("đọc lần lượt từng đoạn, xong thì gọi onEnd", () => {
  let ended = 0;
  speakSegments([{ text: "Câu 1" }, { text: "Câu 2" }], { onEnd: () => ended++ });
  finishCurrent();
  finishCurrent();
  assert.deepEqual(spoken, ["Câu 1", "Câu 2"]);
  assert.equal(ended, 1);
});

test("stopSpeaking dừng hẳn, cancel() bắn onend cũng không đọc câu sau", () => {
  let ended = 0;
  speakSegments([{ text: "Câu 1" }, { text: "Câu 2" }, { text: "Câu 3" }], { onEnd: () => ended++ });
  stopSpeaking();
  assert.deepEqual(spoken, ["Câu 1"]);
  assert.equal(ended, 1);
});

test("hẹn giờ dự phòng không đọc tiếp sau khi đã dừng", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "setInterval"] });
  speakSegments([{ text: "Câu 1" }, { text: "Câu 2" }], { rate: 0.9 });
  // Câu bị huỷ mà trình duyệt không bắn sự kiện nào.
  fake.current = null;
  stopSpeaking();
  t.mock.timers.tick(60_000);
  assert.deepEqual(spoken, ["Câu 1"]);
});

test("lượt đọc mới kết thúc lượt cũ và báo onEnd cho nút cũ", () => {
  let firstEnded = 0;
  speakSegments([{ text: "A1" }, { text: "A2" }], { onEnd: () => firstEnded++ });
  speakSegments([{ text: "B1" }, { text: "B2" }]);
  finishCurrent();
  assert.deepEqual(spoken, ["A1", "B1", "B2"]);
  assert.equal(firstEnded, 1);
});
