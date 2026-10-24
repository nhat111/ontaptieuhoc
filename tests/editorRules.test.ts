// Quyền soạn đề: sai ở đây thì người này sửa được bài của người kia mà không ai hay.

import { test } from "node:test";
import assert from "node:assert/strict";
import { canEditLesson, normalizeEmail, ownerForNewLesson, parseEmailList, type Editor } from "../lib/editorRules";

const admin: Editor = { role: "admin" };
const lan: Editor = { role: "teacher", userId: "u-lan", email: "lan@x.vn" };

test("quản trị sửa được mọi bài, người soạn chỉ bài của mình", () => {
  assert.ok(canEditLesson(admin, null));
  assert.ok(canEditLesson(admin, "u-khac"));
  assert.ok(canEditLesson(lan, "u-lan"));
  assert.ok(!canEditLesson(lan, "u-khac"));
  // Bài cũ (chưa có chủ) là của quản trị — người soạn không đụng được.
  assert.ok(!canEditLesson(lan, null));
  assert.ok(!canEditLesson(lan, undefined));
  assert.ok(!canEditLesson(lan, ""));
  assert.ok(!canEditLesson(null, null));
});

test("chủ của bài mới", () => {
  assert.equal(ownerForNewLesson(lan), "u-lan");
  assert.equal(ownerForNewLesson(admin), null);
});

test("danh sách email dán từ Zalo / Excel", () => {
  assert.equal(normalizeEmail("  Co.Lan@Gmail.COM "), "co.lan@gmail.com");
  const r = parseEmailList("co.lan@gmail.com, Thay.Binh@yahoo.com;\nco.lan@gmail.com  sai-email\n");
  assert.deepEqual(r.emails, ["co.lan@gmail.com", "thay.binh@yahoo.com"]);
  assert.deepEqual(r.invalid, ["sai-email"]);
  assert.deepEqual(parseEmailList("  \n "), { emails: [], invalid: [] });
});
