// Luồng chính của phụ huynh: mở bài, làm, nộp, xem điểm. Đáp án dựng lại từ cùng generator
// và cùng seed với trang, nên "trả lời đúng hết → 10/10" kiểm cả phần chấm điểm thật.
import { expect, test, type Page } from "@playwright/test";
import { buildSgkRows, findSgkLesson } from "../lib/sgk";

const SEED = "e2e";
// Toán 1, bài 10 “Phép cộng trong phạm vi 10”: có ô điền số và câu Đúng/Sai.
const GRADE = 1;
const BAI = 10;

function rows() {
  const found = findSgkLesson(GRADE, BAI);
  if (!found) throw new Error(`Không có Toán ${GRADE} bài ${BAI}`);
  return buildSgkRows(GRADE, found.lesson, SEED);
}

async function answer(page: Page, i: number, type: string, value: string) {
  const card = page.locator(`#question-${i}`);
  if (type === "mcq" || type === "multi") {
    // Phương án là radio tên "A Đúng", "B Sai"…: chữ cái rồi đến nội dung.
    const text = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    await card.getByRole("radio", { name: new RegExp(`^[A-F] ${text}$`) }).click();
  } else {
    await card.getByRole("textbox").fill(value);
  }
}

async function submit(page: Page) {
  // Trên điện thoại bảng câu hỏi nằm cuối trang; cuộn tới rồi bấm.
  const btn = page.getByRole("button", { name: "Nộp bài" });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByRole("heading", { name: "Kết quả bài làm" })).toBeVisible();
}

test("Toán theo sách: trả lời đúng hết thì được 10/10", async ({ page }) => {
  const list = rows();
  expect(list).toHaveLength(10);

  await page.goto(`/lop/${GRADE}/toan/bai-${BAI}?seed=${SEED}`);
  await page.getByRole("button", { name: /Bắt đầu làm bài/ }).click();

  for (const [i, r] of list.entries()) await answer(page, i, r.type, r.correct_answer);
  await submit(page);

  await expect(page.getByText(`10/10`, { exact: true })).toBeVisible();
});

test("Toán theo sách: Kiểm tra báo sai, câu bỏ trống không được tính đúng", async ({ page }) => {
  const list = rows();
  const numeric = list.findIndex((r) => r.type === "numeric");
  expect(numeric).toBeGreaterThanOrEqual(0);

  await page.goto(`/lop/${GRADE}/toan/bai-${BAI}?seed=${SEED}`);
  await page.getByRole("button", { name: /Bắt đầu làm bài/ }).click();

  const wrong = String(Number(list[numeric].correct_answer) + 1);
  await answer(page, numeric, "numeric", wrong);
  const card = page.locator(`#question-${numeric}`);
  await card.getByRole("button", { name: "Kiểm tra" }).click();
  await expect(card.getByText("Chưa đúng")).toBeVisible();
  // Đã kiểm tra thì câu bị khoá, không sửa được nữa.
  await expect(card.getByRole("textbox")).toHaveAttribute("readonly", "");

  await submit(page);
  await expect(page.getByText(`0/10`, { exact: true })).toBeVisible();
});

test("Tạo đề nhanh: tạo đề Toán 3 rồi mở làm trên máy", async ({ page }) => {
  await page.goto(`/tao-de?lop=3&loai=giua-hk1&mon=${encodeURIComponent("Toán")}`);
  await page.getByRole("button", { name: "Tạo đề" }).click();
  await page.getByRole("link", { name: /Làm bài trên máy/ }).click();
  await expect(page).toHaveURL(/\/quiz\?de=toan-3-giua-hk1&seed=/);
  await expect(page.getByRole("button", { name: /Bắt đầu làm bài/ })).toBeVisible();
});

test("Tạo đề nhanh Tiếng Anh: câu nghe có nút Nghe hội thoại và phát được file", async ({ page }) => {
  await page.goto("/quiz?de=tieng-anh-5-giua-hk1&seed=e2e");
  await page.getByRole("button", { name: /Bắt đầu làm bài/ }).click();

  const buttons = page.getByRole("button", { name: /Nghe hội thoại/ });
  await expect(buttons).toHaveCount(4);

  // Bấm nghe thì trình duyệt phải tải được đúng file mp3 của câu đó.
  const mp3 = page.waitForResponse((r) => r.url().includes("/audio/tieng-anh/") && r.url().endsWith(".mp3"));
  await buttons.first().click();
  const res = await mp3;
  expect(res.status()).toBeLessThan(400);
});
