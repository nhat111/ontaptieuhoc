import { describe, it, expect } from "vitest";
import { latexToPlain, buildExamHtml } from "@/lib/exportLesson";
import type { Question, LessonMeta } from "@/lib/quizData";

describe("latexToPlain", () => {
  it("converts plain fractions", () => {
    expect(latexToPlain("$\\frac{3}{4}$")).toBe("3/4");
  });

  it("keeps mixed numbers spaced", () => {
    expect(latexToPlain("\\(2\\frac{17}{100}\\)")).toBe("2 17/100");
  });

  it("converts sqrt and operators", () => {
    expect(latexToPlain("$\\sqrt{16}$")).toBe("√(16)");
    expect(latexToPlain("$3 \\times 4$")).toBe("3 × 4");
  });

  it("strips delimiters from mixed text", () => {
    expect(latexToPlain("Tính $\\frac{1}{2}$ + 1")).toBe("Tính 1/2 + 1");
  });

  it("handles empty input", () => {
    expect(latexToPlain("")).toBe("");
  });
});

describe("buildExamHtml", () => {
  const meta: LessonMeta = { id: 1, title: "Đề thử", grade: 5, subjectName: "Toán", durationMinutes: 20 };
  const questions: Question[] = [
    { id: 1, type: "mcq", question: "2+3=?", options: ["4", "5"], correctAnswer: "5" },
    { id: 2, type: "short", question: "Thủ đô?", options: [], correctAnswer: "Hà Nội" },
  ];

  it("includes title, meta and questions", () => {
    const html = buildExamHtml(meta, questions);
    expect(html).toContain("Đề thử");
    expect(html).toContain("Toán");
    expect(html).toContain("Câu 1.");
    expect(html).toContain("Câu 2.");
    expect(html).toContain("A. 4");
  });

  it("omits answer key by default and includes it when requested", () => {
    expect(buildExamHtml(meta, questions)).not.toContain("ĐÁP ÁN");
    const withKey = buildExamHtml(meta, questions, { withAnswers: true });
    expect(withKey).toContain("ĐÁP ÁN");
    expect(withKey).toContain("Hà Nội");
  });

  it("injects autoPrint script only when asked", () => {
    expect(buildExamHtml(meta, questions, { autoPrint: true })).toContain("window.print()");
    expect(buildExamHtml(meta, questions)).not.toContain("window.print()");
  });
});
