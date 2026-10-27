// Nhiệm vụ mỗi ngày và thách bạn: hai luồng chạy hoàn toàn trên máy (localStorage, link),
// nên test cả chuỗi ngày / album sau khi nộp và việc link thách mở lại đúng bộ câu.
import { expect, test } from "@playwright/test";
import { buildMissionRows } from "../lib/missionRows";
import { buildSgkRows, findSgkLesson } from "../lib/sgk";

async function submit(page: import("@playwright/test").Page) {
  const btn = page.getByRole("button", { name: "Nộp bài" });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(page).toHaveURL(/\/result$/);
}

test("nhiệm vụ: chọn lớp, làm đúng hết 5 câu → chuỗi 1 ngày và mở sticker", async ({ page }) => {
  await page.goto("/nhiem-vu");
  await page.getByRole("group", { name: "Con học lớp mấy?" }).getByRole("button", { name: "3", exact: true }).click();
  const go = page.getByRole("link", { name: /Làm nhiệm vụ$/ });
  const href = (await go.getAttribute("href"))!;
  const url = new URL(href, "http://x");
  const x = buildMissionRows(3, Number(url.searchParams.get("bai")), url.searchParams.get("ngay")!)!;
  expect(x.rows).toHaveLength(5);

  await go.click();
  await page.getByRole("button", { name: /Bắt đầu làm bài/ }).click();
  for (const [i, r] of x.rows.entries()) {
    const card = page.locator(`#question-${i}`);
    if (r.type === "mcq") {
      const text = r.correct_answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      await card.getByRole("radio", { name: new RegExp(`^[A-F] ${text}$`) }).click();
    } else {
      await card.getByRole("textbox").fill(r.correct_answer.split("|")[0]);
    }
  }
  await submit(page);
  await expect(page.getByText("5/5", { exact: true })).toBeVisible();
  await expect(page.getByText(/Xong nhiệm vụ! Chuỗi 1 ngày liên tục/)).toBeVisible();

  await page.getByRole("link", { name: "Xem album" }).click();
  await expect(page.getByText("1 ngày liên tục")).toBeVisible();
  await expect(page.getByText(/Xong hôm nay/)).toBeVisible();
  // 5/5 = 3 sao → mở "Ngôi sao" (1 sao) và "Ông mặt trời" (3 sao).
  await expect(page.getByText("2/20", { exact: true })).toBeVisible();
  await expect(page.getByText("Ông mặt trời")).toBeVisible();
});

test("thách bạn: link mở đúng bộ câu, có lời thách, nộp xong so điểm và gửi lại lời thách", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const found = findSgkLesson(1, 10)!;
  const first = buildSgkRows(1, found.lesson, "e2e")[0];

  await page.goto("/lop/1/toan/bai-10?seed=e2e&thach=7-10&ten=Minh");
  await expect(page.getByText(/Minh\s*thách bạn làm bài này và được\s*7\/10/)).toBeVisible();
  await page.getByRole("button", { name: /Bắt đầu làm bài/ }).click();
  // Đúng bộ câu của seed: câu 1 trùng với câu sinh từ cùng seed.
  await expect(page.locator("#question-0")).toContainText(first.content.replace(/\$[^$]*\$/g, "").slice(0, 12).trim());
  await submit(page);
  await expect(page.getByText(/Minh hơn bạn 7 câu/)).toBeVisible();

  await page.getByLabel("Tên gọi của bạn").fill("Bé Na");
  await page.getByRole("button", { name: "Gửi lời thách" }).click();
  await expect(page.getByRole("status")).toContainText("Đã chép");
  const text = await page.evaluate(() => navigator.clipboard.readText());
  const link = new URL(text.split("\n").pop()!);
  expect(link.pathname).toBe("/lop/1/toan/bai-10");
  expect(link.searchParams.get("seed")).toBe("e2e");
  expect(link.searchParams.get("thach")).toBe("0-10");
  expect(link.searchParams.get("ten")).toBe("Bé Na");
});
