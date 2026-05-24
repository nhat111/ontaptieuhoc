import { describe, it, expect } from "vitest";
import { normalizeMath } from "@/lib/mathNormalizer";

describe("normalizeMath", () => {
  it("converts bare fractions to LaTeX", () => {
    expect(normalizeMath("1/2")).toBe("$\\frac{1}{2}$");
  });

  it("converts sqrt(x) to LaTeX", () => {
    expect(normalizeMath("sqrt(16)")).toBe("$\\sqrt{16}$");
  });

  it("leaves content already inside $...$ untouched", () => {
    const input = "Tính $\\frac{1}{2}$ rồi cộng";
    expect(normalizeMath(input)).toBe(input);
  });

  it("does not touch text inside \\(...\\) delimiters", () => {
    const input = "\\(3/4\\)";
    expect(normalizeMath(input)).toBe(input);
  });

  it("leaves plain prose unchanged", () => {
    expect(normalizeMath("Thủ đô của Việt Nam")).toBe("Thủ đô của Việt Nam");
  });
});
