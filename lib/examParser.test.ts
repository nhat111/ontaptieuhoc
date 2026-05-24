import { describe, it, expect } from "vitest";
import { parseExamText } from "@/lib/examParser";

describe("parseExamText", () => {
  it("parses an mcq with letter answer", () => {
    const qs = parseExamText("Câu 1. 2 + 3 = ?\nA. 4\nB. 5\nC. 6\nD. 7\nĐáp án: B");
    expect(qs).toHaveLength(1);
    expect(qs[0].type).toBe("mcq");
    expect(qs[0].question).toBe("2 + 3 = ?");
    expect(qs[0].options).toEqual(["4", "5", "6", "7"]);
    expect(qs[0].correctAnswer).toBe("5");
  });

  it("parses multi when answer has ≥2 letters", () => {
    const qs = parseExamText("Câu 1. Chọn số chẵn\nA. 1\nB. 2\nC. 3\nD. 4\nĐáp án: B, D");
    expect(qs[0].type).toBe("multi");
    expect(JSON.parse(qs[0].correctAnswer!)).toEqual(["2", "4"]);
  });

  it("parses short when no options", () => {
    const qs = parseExamText("Câu 1. Thủ đô Việt Nam?\nĐáp án: Hà Nội");
    expect(qs[0].type).toBe("short");
    expect(qs[0].correctAnswer).toBe("Hà Nội");
  });

  it("parses numeric when answer is number-like and no options", () => {
    const qs = parseExamText("Câu 1. 1 + 1 = ?\nĐáp án: 2");
    expect(qs[0].type).toBe("numeric");
    expect(qs[0].correctAnswer).toBe("2");
  });

  it("handles multiple questions", () => {
    const qs = parseExamText("Câu 1. A?\nĐáp án: x\n\nCâu 2. B?\nĐáp án: y");
    expect(qs).toHaveLength(2);
    expect(qs.map((q) => q.id)).toEqual([1, 2]);
  });

  it("returns [] for text without question markers", () => {
    expect(parseExamText("just some prose without markers")).toEqual([]);
  });
});
