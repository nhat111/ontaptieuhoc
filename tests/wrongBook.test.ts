// Sổ câu sai: sai ở đây thì câu đã thuộc vẫn nằm trong sổ mãi, hoặc câu sai không được ghi.

import { test } from "node:test";
import assert from "node:assert/strict";
import { applyAttempt, EMPTY_BOOK, entryKey, MASTER_AFTER, MAX_ENTRIES, parseBook, practiceHref, removeEntry } from "../lib/wrongBook";
import type { Question } from "../lib/quizData";

const q = (n: number, src?: string): Question => ({ id: n, type: "numeric", question: `${n} + 1 = ___`, options: [], correctAnswer: String(n + 1), ...(src ? { src, srcTitle: "Bài 5. Phép cộng" } : {}) });
const ctx = { title: "Bài 5", grade: 1, subject: "Toán" };

test("câu sai được ghi, câu bỏ trống không; cùng dạng gộp một mục", () => {
  const qs = [q(1, "kntt-toan-1-5#0"), q(2, "kntt-toan-1-5#0"), q(3), q(4)];
  const r = applyAttempt(EMPTY_BOOK, qs, ["9", "9", "0", null], ctx, 1);
  assert.equal(r.added, 2, "một dạng + một câu không dạng");
  assert.equal(r.book.entries.length, 2);
  const dang = r.book.entries.find((e) => e.src)!;
  assert.equal(dang.wrong, 1, "sai 2 câu cùng dạng trong một lần nộp = sai 1 lần");
  const again = applyAttempt(r.book, [q(9, "kntt-toan-1-5#0")], ["0"], ctx, 2);
  assert.equal(again.book.entries.find((e) => e.src)!.wrong, 2);
  assert.equal(again.added, 1);
  assert.equal(dang.title, "Bài 5. Phép cộng", "tên bài lấy từ dạng câu");
  assert.ok(r.book.entries.every((e) => e.key !== entryKey(q(4))), "bỏ trống không ghi");
});

test("đúng 2 lần liền (2 lần nộp) thì gạch; sai xen giữa thì đếm lại", () => {
  let b = applyAttempt(EMPTY_BOOK, [q(1, "a-1#0")], ["0"], ctx, 1).book;
  // 3 câu cùng dạng đúng trong một lần nộp chỉ tính một lần.
  b = applyAttempt(b, [q(5, "a-1#0"), q(6, "a-1#0"), q(7, "a-1#0")], ["6", "7", "8"], ctx, 2).book;
  assert.equal(b.entries[0].streak, 1);
  b = applyAttempt(b, [q(8, "a-1#0")], ["0"], ctx, 3).book;
  assert.equal(b.entries[0].streak, 0, "sai lại thì đếm lại");
  for (let i = 0; i < MASTER_AFTER - 1; i++) b = applyAttempt(b, [q(9, "a-1#0")], ["10"], ctx, 4 + i).book;
  const r = applyAttempt(b, [q(9, "a-1#0")], ["10"], ctx, 10);
  assert.equal(r.cleared, 1);
  assert.equal(r.book.entries.length, 0);
  assert.equal(r.book.mastered, 1);
});

test("đúng một câu không có trong sổ thì không ghi gì", () => {
  const r = applyAttempt(EMPTY_BOOK, [q(1, "a-1#0"), q(2)], ["2", "3"], ctx, 1);
  assert.deepEqual([r.added, r.cleared, r.book.entries.length], [0, 0, 0]);
});

test("giữ tối đa MAX_ENTRIES mục mới nhất; xoá tay; dữ liệu hỏng không vỡ", () => {
  let b = EMPTY_BOOK;
  for (let i = 0; i < MAX_ENTRIES + 5; i++) b = applyAttempt(b, [q(i)], ["x"], ctx, i).book;
  assert.equal(b.entries.length, MAX_ENTRIES);
  assert.equal(b.entries[0].q.question, `${MAX_ENTRIES + 4} + 1 = ___`, "mới nhất lên đầu");
  assert.equal(removeEntry(b, b.entries[0].key).entries.length, MAX_ENTRIES - 1);
  assert.deepEqual(parseBook("{hỏng"), EMPTY_BOOK);
  assert.equal(parseBook(JSON.stringify({ entries: [{ key: 1 }, null], mastered: 2 })).entries.length, 0);
});

test("link ôn: các dạng + cờ câu gốc", () => {
  const b = applyAttempt(EMPTY_BOOK, [q(1, "kntt-toan-1-5#0"), q(2)], ["0", "0"], ctx, 1).book;
  assert.equal(practiceHref(b.entries, "abc"), "/so-cau-sai/on?d=kntt-toan-1-5%230&goc=1&seed=abc");
});
