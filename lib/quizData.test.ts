import { describe, it, expect } from "vitest";
import { scoreAnswer, type Question } from "@/lib/quizData";

function q(partial: Partial<Question>): Question {
  return { id: 1, type: "mcq", question: "", options: [], correctAnswer: "", ...partial };
}

describe("scoreAnswer", () => {
  it("returns false for null/empty answers", () => {
    expect(scoreAnswer(q({ type: "mcq", correctAnswer: "A" }), null)).toBe(false);
    expect(scoreAnswer(q({ type: "mcq", correctAnswer: "A" }), "")).toBe(false);
  });

  it("mcq: exact text match", () => {
    const m = q({ type: "mcq", options: ["4", "5"], correctAnswer: "5" });
    expect(scoreAnswer(m, "5")).toBe(true);
    expect(scoreAnswer(m, "4")).toBe(false);
  });

  it("multi: set equality regardless of order", () => {
    const m = q({ type: "multi", correctAnswer: JSON.stringify(["A", "C"]) });
    expect(scoreAnswer(m, JSON.stringify(["C", "A"]))).toBe(true);
    expect(scoreAnswer(m, JSON.stringify(["A"]))).toBe(false);
    expect(scoreAnswer(m, JSON.stringify(["A", "B", "C"]))).toBe(false);
    expect(scoreAnswer(m, "not json")).toBe(false);
  });

  it("short: pipe-delimited, case-insensitive, trimmed", () => {
    const m = q({ type: "short", correctAnswer: "Hà Nội|Ha Noi" });
    expect(scoreAnswer(m, "  hà nội ")).toBe(true);
    expect(scoreAnswer(m, "HA NOI")).toBe(true);
    expect(scoreAnswer(m, "Sài Gòn")).toBe(false);
  });

  it("numeric: comma or dot decimal, tolerant compare", () => {
    const m = q({ type: "numeric", correctAnswer: "0.75" });
    expect(scoreAnswer(m, "0,75")).toBe(true);
    expect(scoreAnswer(m, "0.75")).toBe(true);
    expect(scoreAnswer(m, "0.7")).toBe(false);
    expect(scoreAnswer(m, "abc")).toBe(false);
  });
});
