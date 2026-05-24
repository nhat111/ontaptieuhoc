import { describe, it, expect } from "vitest";
import { parseLoigiaihay, looksLikeLoigiaihay } from "@/lib/loigiaihayParser";

describe("looksLikeLoigiaihay", () => {
  it("detects solution pages", () => {
    expect(looksLikeLoigiaihay("Giải Bài 1 trang 5 ...")).toBe(true);
    expect(looksLikeLoigiaihay("foo\nLời giải chi tiết:\nbar")).toBe(true);
    expect(looksLikeLoigiaihay("Câu 1. A?")).toBe(false);
  });
});

describe("parseLoigiaihay", () => {
  it("splits a compound a/b question into separate MCQs with correct answers", () => {
    const text = [
      "Giải Bài 1 trang 5 VBT Toán 5 tập 1 – Kết nối tri thức",
      "Khoanh vào chữ đặt trước câu trả lời đúng.",
      "a) Giá trị của chữ số 8 trong số 478 062 là:",
      "A. 8 | B. 80",
      "C. 800 | D. 8 000",
      "b) Số bé nhất là:",
      "A. 431 200 | B. 398 801",
      "C. 389 999 | D. 399 000",
      "Phương pháp giải:",
      "Xác định hàng của chữ số.",
      "Lời giải chi tiết:",
      "a) ... Chọn D",
      "b) ... Chọn C",
    ].join("\n");

    const qs = parseLoigiaihay(text);
    expect(qs).toHaveLength(2);
    expect(qs[0].type).toBe("mcq");
    expect(qs[0].options).toEqual(["8", "80", "800", "8 000"]);
    expect(qs[0].correctAnswer).toBe("8 000");
    expect(qs[1].correctAnswer).toBe("389 999");
  });

  it("parses a single MCQ block", () => {
    const text = [
      "Giải Bài 4 trang 6 VBT Toán 5 tập 1",
      "Chiếc mũ viết số nào?",
      "A. 2 015 | B. 2 021 | C. 2 027",
      "Lời giải chi tiết:",
      "Số trên mũ là 2021. Chọn B",
    ].join("\n");
    const qs = parseLoigiaihay(text);
    expect(qs).toHaveLength(1);
    expect(qs[0].type).toBe("mcq");
    expect(qs[0].correctAnswer).toBe("2 021");
    expect(qs[0].solution).toContain("2021");
  });

  it("parses an open-ended block as short with the solution as answer", () => {
    const text = [
      "Giải Bài 2 trang 5 VBT Toán 5 tập 1",
      "Viết số thích hợp vào chỗ chấm",
      "Lời giải chi tiết:",
      "603 172 = 600 000 + 3 000 + 100 + 70 + 2",
    ].join("\n");
    const qs = parseLoigiaihay(text);
    expect(qs).toHaveLength(1);
    expect(qs[0].type).toBe("short");
    expect(qs[0].solution).toContain("603 172");
  });

  it("returns [] when there is no 'Giải Bài N' header", () => {
    expect(parseLoigiaihay("Câu 1. 2+3?\nA. 4\nB. 5")).toEqual([]);
  });
});
