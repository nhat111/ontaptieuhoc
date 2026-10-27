// Sổ câu sai: làm sai một câu → sổ ghi dạng đó → "Làm câu tương tự" ra câu cùng dạng (sinh lại
// bằng chính seed trên link) → làm đúng → sổ đếm "đúng liền 1/2".
import { expect, test, type Page } from "@playwright/test";
import { buildSgkRows, findSgkLesson } from "../lib/sgk";
import { similarRows } from "../lib/similarRows";

async function answer(page: Page, i: number, type: string, value: string) {
  const card = page.locator(`#question-${i}`);
  if (type === "mcq") {
    const text = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    await card.getByRole("radio", { name: new RegExp(`^[A-F] ${text}$`) }).click();
  } else {
    await card.getByRole("textbox").fill(value);
  }
}

async function submit(page: Page) {
  const btn = page.getByRole("button", { name: "Nộp bài" });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(page).toHaveURL(/\/result$/);
}

test("sổ câu sai: ghi câu sai, làm câu tương tự, đếm đúng liền", async ({ page }) => {
  const first = buildSgkRows(1, findSgkLesson(1, 10)!.lesson, "e2e")[0];
  await page.goto("/lop/1/toan/bai-10?seed=e2e");
  await page.getByRole("button", { name: /Bắt đầu làm bài/ }).click();
  // Câu 1 trả lời sai, các câu khác bỏ trống (bỏ trống không bị ghi).
  const wrong = first.type === "mcq" ? first.options.find((o) => o !== first.correct_answer)! : "9999";
  await answer(page, 0, first.type, wrong);
  await submit(page);
  await expect(page.getByText(/Đã ghi\s*1 mục\s*vào Sổ câu sai/)).toBeVisible();

  await page.getByRole("link", { name: "Mở Sổ câu sai" }).click();
  await expect(page.getByText("1 mục cần ôn")).toBeVisible();
  await expect(page.getByText(/Sai 1 lần · đúng liền 0\/2/)).toBeVisible();

  await page.getByRole("button", { name: "Làm câu tương tự" }).click();
  await expect(page).toHaveURL(/\/so-cau-sai\/on\?d=/);
  const url = new URL(page.url());
  const rows = similarRows(url.searchParams.get("d")!.split(","), 5, url.searchParams.get("seed")!);
  expect(rows[0].src).toBe(first.src);

  await page.getByRole("button", { name: /Bắt đầu làm bài/ }).click();
  for (const [i, r] of rows.entries()) await answer(page, i, r.type, r.correct_answer.split("|")[0]);
  await submit(page);
  await expect(page.getByText(`${rows.length}/${rows.length}`, { exact: true })).toBeVisible();

  await page.goto("/so-cau-sai");
  await expect(page.getByText(/Sai 1 lần · đúng liền 1\/2/)).toBeVisible();
});
