import { describe, it, expect } from "vitest";
import { cn, formatCurrency } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("handles falsy values", () => {
    expect(cn(undefined, null, "foo", false)).toBe("foo");
  });

  it("merges conditional classes", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });
});

describe("formatCurrency", () => {
  it("formats whole numbers in EUR", () => {
    const result = formatCurrency(50);
    expect(result).toContain("50");
    expect(result).toContain("€");
  });

  it("formats decimal amounts", () => {
    const result = formatCurrency(65.5);
    expect(result).toContain("65");
    expect(result).toContain("€");
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
    expect(result).toContain("€");
  });
});
