// Hình trang trí phiếu in: chỉ thêm vào HTML, không được đổi câu hỏi, không lọt vào trang đáp án.

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDailySheets, buildDailySheetHtml } from "../lib/dailySheet";
import { buildWorksheetHtml } from "../lib/worksheetExport";
import { MATH_LESSONS, buildWorksheetQuestions } from "../lib/mathGen";
import { ART } from "../lib/sheetArt";

const strip = (html: string) => html.replace(/<img class="(art|bul)"[^>]*\/>/g, "");

test("hình trang trí là SVG có cỡ gốc (Word cần cỡ để vẽ lại thành PNG)", () => {
  for (const u of Object.values(ART)) {
    const svg = decodeURIComponent(u.slice(u.indexOf(",") + 1));
    assert.match(svg, /^<svg [^>]*width="100" height="100"/);
  }
});

test("phiếu hằng ngày: tắt trang trí thì không có hình; bật thì chỉ trang phiếu có, trang đáp án không", () => {
  const sheets = buildDailySheets({ subject: "toan", range: 10, blockIds: ["bond", "calc"], count: 2, seed: "t" });
  const off = buildDailySheetHtml(sheets, { title: "Phiếu", withAnswers: true });
  const on = buildDailySheetHtml(sheets, { title: "Phiếu", withAnswers: true, decor: true });
  assert.ok(!off.includes("data:image/svg"));
  assert.ok(on.includes("data:image/svg"));
  assert.ok(!on.slice(on.indexOf("ĐÁP ÁN")).includes("data:image/svg"));
  // Bỏ hình đi thì các ô số, phép tính y hệt bản không trang trí.
  const body = (h: string) => h.slice(h.indexOf("<body>"));
  assert.equal(strip(body(on)).replace(/<table class="hd">.*?<td class="hd-mid">(.*?)<\/td>.*?<\/table>/g, "$1"), body(off));
});

test("phiếu theo chủ đề: bật trang trí không đổi câu hỏi", () => {
  const specs = MATH_LESSONS.filter((l) => l.grade === 1).slice(0, 1);
  const versions = [{ label: "", rows: buildWorksheetQuestions(specs, 10, "t") }];
  const o = { title: "Phiếu", topics: ["x"], grade: 1, answers: "key" as const };
  const off = buildWorksheetHtml(versions, o);
  const on = buildWorksheetHtml(versions, { ...o, decor: true });
  assert.ok(!/class="(art|bul)"/.test(off));
  const qs = (h: string) => [...h.matchAll(/<p class="q">(.*?)<\/p>/g)].map((m) => m[1]);
  assert.deepEqual(qs(on), qs(off));
  assert.ok(/class="bul"/.test(on));
});
