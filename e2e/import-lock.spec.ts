// Khu soạn đề phải khoá khi có IMPORT_PASSWORD (playwright.config.ts đặt sẵn). Khoá nằm ở
// app/import/layout.tsx, không phải proxy.ts, vì proxy không chạy khi deploy (CLAUDE.md).
import { expect, test } from "@playwright/test";

test("khu soạn đề chuyển sang trang khoá, sai mật khẩu bị từ chối, đúng thì vào được", async ({ page }) => {
  await page.goto("/import");
  await expect(page).toHaveURL(/\/import-khoa/);

  const pw = page.getByPlaceholder("Mật khẩu");
  await pw.fill("sai-roi");
  await page.getByRole("button", { name: "Truy cập" }).click();
  await expect(page.getByText("Mật khẩu không đúng.")).toBeVisible();

  await pw.fill("e2e-mat-khau");
  await page.getByRole("button", { name: "Truy cập" }).click();
  await expect(page).toHaveURL(/\/import$/);
});

test("API ghi từ chối khi chưa mở khoá", async ({ request }) => {
  const res = await request.get("/api/fetch-exam?url=https://example.com");
  expect(res.status()).toBe(401);
});
