// Tải Word phải ra .docx thật (gói zip có word/document.xml) — file MHTML cũ LibreOffice không mở được.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { strFromU8, unzipSync } from "fflate";

test("phiếu bài tập: Tải Word ra file .docx có chữ và hình", async ({ page }) => {
  await page.goto("/phieu-bai-tap");
  await page.getByRole("button", { name: /Tạo phiếu/ }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /Tải Word/ }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.docx$/);
  const zip = unzipSync(new Uint8Array(readFileSync((await download.path())!)));
  const doc = strFromU8(zip["word/document.xml"]);
  expect(doc).toContain("PHIẾU BÀI TẬP");
  expect(doc).toContain("Phần 1. Trắc nghiệm");
  // Hình trang trí (bật sẵn) được vẽ lại thành PNG và nhúng vào file.
  expect(Object.keys(zip).some((f) => f.startsWith("word/media/"))).toBe(true);
});
