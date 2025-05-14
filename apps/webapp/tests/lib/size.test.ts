import { describe, it, expect } from "vitest";
import { mockPull } from "../testing";
import { computeSize } from "../../src/lib/size";

describe("computeSize", () => {
  it("should return the size of a pull request", () => {
    const sizes = [10, 30, 100, 500, 1000];
    expect(computeSize(mockPull({ additions: 1 }), sizes)).toBe("XS");
    expect(computeSize(mockPull({ deletions: 30 }), sizes)).toBe("M");
    expect(computeSize(mockPull({ additions: 500, deletions: 500 }), sizes)).toBe(
      "XXL",
    );
  });
});
