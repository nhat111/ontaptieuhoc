// Bấm "Dừng đọc" phải dừng hẳn. Trình duyệt giả lập kiểu Safari/iOS: `cancel()`
// bắn `onend` (không phải `onerror`) cho câu đang đọc — chính đường này từng làm
// chuỗi đọc nhảy sang câu sau dù nút đã đổi về "Nghe cả bài".

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { fake } from "./fakeSpeech";
import { detectLang, missingVoice, speakSegments, stopSpeaking } from "../lib/speech";

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

test("detectLang nhận chữ Việt gõ kiểu Unicode tổ hợp (NFD)", () => {
  assert.equal(detectLang("Con mèo".normalize("NFD")), "vi-VN");
  assert.equal(detectLang("Bạn ăn gì?".normalize("NFD")), "vi-VN");
  assert.equal(detectLang("What is this?"), "en-US");
});

test("chưa biết danh sách giọng thì vẫn đọc tiếng Việt như cũ", () => {
  assert.equal(missingVoice("vi-VN"), false);
  speakSegments([{ text: "Con mèo" }]);
  assert.deepEqual(spoken, ["Con mèo"]);
});

// Hai test cuối đổi danh sách giọng của máy giả — giữ ở cuối file.
test("máy không có giọng Việt: bỏ đoạn tiếng Việt, không để giọng Anh đọc sai dấu", () => {
  fake.voices = [{ name: "Samantha", lang: "en-US", voiceURI: "sam" }];
  let ended = 0;
  speakSegments(
    [{ text: "Câu 1", lang: "vi-VN" }, { text: "What is this?" }, { text: "Con mèo" }],
    { onEnd: () => ended++ }
  );
  finishCurrent();
  assert.equal(missingVoice("vi-VN"), true);
  assert.equal(missingVoice("en-US"), false);
  assert.deepEqual(spoken, ["What is this?"]);
  assert.equal(ended, 1);
});

test("máy có giọng Việt (lang viết vi_VN) thì đọc bình thường", () => {
  fake.voices = [
    { name: "Samantha", lang: "en-US", voiceURI: "sam" },
    { name: "Linh", lang: "vi_VN", voiceURI: "linh" },
  ];
  speakSegments([{ text: "Con mèo" }]);
  assert.equal(missingVoice("vi-VN"), false);
  assert.deepEqual(spoken, ["Con mèo"]);
});
