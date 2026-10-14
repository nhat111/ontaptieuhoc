// Các hàm nhỏ nhưng lỗi thì im lặng: tên file giọng đọc → số câu, dọn chữ OCR, ai được nghe đọc.

import { test } from "node:test";
import assert from "node:assert/strict";
import { questionIndexFromFileName } from "../lib/audioFileName";
import { cleanOcrText } from "../lib/ocrText";
import { readAloudEnabled, canAttachVoice } from "../lib/readAloud";
import { parseExamText } from "../lib/examParser";

test("tên file giọng đọc → số câu (lấy số cuối, bỏ đuôi file)", () => {
  assert.equal(questionIndexFromFileName("wav_3.wav"), 2);
  assert.equal(questionIndexFromFileName("cau-01.m4a"), 0);
  assert.equal(questionIndexFromFileName("2024-06-01_cau3.mp3"), 2);
  assert.equal(questionIndexFromFileName("bai2_cau5.wav"), 4);
  assert.equal(questionIndexFromFileName("khong-co-so.mp3"), null);
  assert.equal(questionIndexFromFileName("cau0.mp3"), null);
});

test("OCR: tách dòng đáp án ngang, sửa 'Cc', thêm dấu cách sau mốc", () => {
  assert.equal(cleanOcrText("Câu 1. 2 + 2 = ?\nA. 4 B.5 Cc.6"), "Câu 1. 2 + 2 = ?\nA. 4\nB. 5\nC. 6");
  // "a) … b) …" là ý nhỏ của câu tự luận — giữ nguyên
  assert.equal(cleanOcrText("Bài 2. a) 5 + 3 b) 7 - 2"), "Bài 2. a) 5 + 3 b) 7 - 2");
});

test("OCR rồi dán đề: ra đúng câu trắc nghiệm", () => {
  const [c] = parseExamText(cleanOcrText("Câu 1. 3 x 3 = ?\nA. 6 B. 9 C. 12 D. 33\nĐáp án: B"));
  assert.deepEqual(c.options, ["6", "9", "12", "33"]);
  assert.equal(c.correctAnswer, "9");
});

test("nghe đọc: lớp 1–2, Tiếng Anh, hoặc đề đã gắn giọng", () => {
  assert.equal(readAloudEnabled(1, "Toán"), true);
  assert.equal(readAloudEnabled(2, "Tiếng Việt"), true);
  assert.equal(readAloudEnabled(3, "Toán"), false);
  assert.equal(readAloudEnabled(5, "Tiếng Anh"), true);
  assert.equal(readAloudEnabled(4, "Toán", true), true);
  assert.equal(readAloudEnabled(null, "Toán"), true, "không rõ lớp thì vẫn hiện như trước");
  assert.equal(canAttachVoice("Tiếng Anh"), true);
  assert.equal(canAttachVoice("Toán"), false);
});
