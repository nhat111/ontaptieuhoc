// Link thách bạn: sai ở đây thì người nhận mở ra đề khác, hoặc tên lạ chen vào trang.

import { test } from "node:test";
import assert from "node:assert/strict";
import { challengeText, challengeUrl, cleanName, parseChallenge, verdict } from "../lib/challenge";

test("tên gọi: bỏ ký tự điều khiển và dấu < >, gộp khoảng trắng, tối đa 20 ký tự", () => {
  assert.equal(cleanName("  Minh\n  Anh <b> "), "Minh Anh b");
  assert.equal(cleanName("a".repeat(40)).length, 20);
  assert.equal(cleanName(null), "");
  // Unikey "Unicode tổ hợp" → dựng sẵn.
  assert.equal(cleanName("Ngà"), "Ngà");
});

test("đọc lời thách: đúng định dạng, điểm không vượt tổng, tổng khớp số câu", () => {
  assert.deepEqual(parseChallenge("8-10", "Minh", 10), { score: 8, total: 10, name: "Minh" });
  assert.equal(parseChallenge("8-10", "Minh", 16), null, "đề đã đổi số câu");
  assert.equal(parseChallenge("11-10", "", 10), null);
  assert.equal(parseChallenge("0-0", "", 0), null);
  assert.equal(parseChallenge("8/10", "", 10), null);
  assert.equal(parseChallenge(null, null, 10), null);
  assert.deepEqual(parseChallenge("0-5", null, 5), { score: 0, total: 5, name: "" });
});

test("link thách giữ nguyên link mở lại bộ câu (seed, lessonId) và thay lời thách cũ", () => {
  const u = new URL(challengeUrl("https://ontap.vn", "/lop/3/toan/bai-20?seed=abc123", 9, 10, "Bé Na"));
  assert.equal(u.pathname, "/lop/3/toan/bai-20");
  assert.equal(u.searchParams.get("seed"), "abc123");
  assert.equal(u.searchParams.get("thach"), "9-10");
  assert.equal(u.searchParams.get("ten"), "Bé Na");
  // Người được thách thách tiếp: điểm cũ bị thay, không chồng hai lời thách.
  const again = new URL(challengeUrl("https://ontap.vn", `${u.pathname}${u.search}`, 10, 10, ""));
  assert.deepEqual(again.searchParams.getAll("thach"), ["10-10"]);
  assert.equal(again.searchParams.get("ten"), null);
  assert.equal(new URL(challengeUrl("https://ontap.vn", "/quiz?lessonId=42", 3, 5, "")).searchParams.get("lessonId"), "42");
});

test("so điểm và lời mời", () => {
  assert.equal(verdict(9, 8), "win");
  assert.equal(verdict(8, 8), "draw");
  assert.equal(verdict(7, 8), "lose");
  assert.match(challengeText("", 7, 10, "Bài 3"), /^Mình được 7\/10 bài “Bài 3”/);
});
