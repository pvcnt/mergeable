import { describe, it, expect } from "vitest";
import { mockPull } from "../testing";
import { computeSize } from "../../src/lib/size";

describe("computeSize", () => {
  it("should return the size of a pull request", () => {
    expect(computeSize(mockPull({ additions: 1 }))).toBe("XS");
    expect(computeSize(mockPull({ deletions: 30 }))).toBe("M");
    expect(computeSize(mockPull({ additions: 500, deletions: 500 }))).toBe(
      "XXL",
    );
  });

  it("should return the size of a pull request with custom sizes", () => {
    const sizes = [10, 20, 30, 40, 50];
    expect(computeSize(mockPull({ additions: 1 }), sizes)).toBe("XS");
    expect(computeSize(mockPull({ additions: 10 }), sizes)).toBe("S");
    expect(computeSize(mockPull({ additions: 11 }), sizes)).toBe("S");
    expect(computeSize(mockPull({ additions: 20 }), sizes)).toBe("M");
    expect(computeSize(mockPull({ additions: 100 }), sizes)).toBe("XXL");
  });
});
