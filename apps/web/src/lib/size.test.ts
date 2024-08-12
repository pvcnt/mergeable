import { test, expect } from "vitest";
import { mockPull } from "../../../../packages/testing/src";
import { computeSize } from "./size";

test("computeSize returns size of a pull request", () => {
    expect(computeSize(mockPull({ additions: 1 }))).toBe("XS");
    expect(computeSize(mockPull({ deletions: 30}))).toBe("M");
    expect(computeSize(mockPull({ additions: 500, deletions: 500}))).toBe("XXL");
});