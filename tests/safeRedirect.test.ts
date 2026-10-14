// Chặn chuyển hướng ra trang ngoài sau đăng nhập / link email (lib/safeRedirect.ts).

import { test } from "node:test";
import assert from "node:assert/strict";
import { safeNext } from "../lib/safeRedirect";

test("nhận đường dẫn nội bộ", () => {
  for (const p of ["/", "/progress", "/quiz?lessonId=3", "/lop/1/tro-choi#a"]) assert.equal(safeNext(p), p);
});

test("trống thì về fallback", () => {
  assert.equal(safeNext(null), "/");
  assert.equal(safeNext(undefined, "/x"), "/x");
  assert.equal(safeNext(""), "/");
});

test("chặn địa chỉ ngoài và các dạng trình duyệt hiểu là tên miền khác", () => {
  for (const bad of [
    "https://trang-gia.com", "//trang-gia.com", "/\\trang-gia.com", "@trang-gia.com", "javascript:alert(1)",
  ]) assert.equal(safeNext(bad), "/", bad);
});

test("chặn ký tự tab / xuống dòng mà trình duyệt bỏ qua trong URL ('/\\t/x' thành '//x')", () => {
  for (const bad of ["/\t/trang-gia.com", "/\n/trang-gia.com", "/\r/trang-gia.com", "/\u0000/trang-gia.com"])
    assert.equal(safeNext(bad), "/", JSON.stringify(bad));
});
