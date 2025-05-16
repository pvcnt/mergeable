import { describe, it, expect } from "vitest";
import { mockPull } from "../testing";
import { pullMatches } from "../../src/lib/search";

describe("pullMatches", () => {
  it("should match pull requests", () => {
    expect(pullMatches("", mockPull({ title: "Foo" }))).toBe(true);

    expect(pullMatches("Foo", mockPull({ title: "Foo" }))).toBe(true);
    expect(pullMatches("FOO", mockPull({ title: "Foo" }))).toBe(true);
    expect(pullMatches("foo", mockPull({ title: "Foo" }))).toBe(true);

    expect(pullMatches("Foo", mockPull({ title: "Foo Bar" }))).toBe(true);
    expect(pullMatches("Bar", mockPull({ title: "Foo Bar" }))).toBe(true);
    expect(pullMatches("Foo Bar", mockPull({ title: "Foo Bar" }))).toBe(true);
    expect(pullMatches("Bar Foo", mockPull({ title: "Foo Bar" }))).toBe(true);

    expect(pullMatches("Bar", mockPull({ title: "Foo" }))).toBe(false);
    expect(pullMatches("Foo Bar", mockPull({ title: "Foo" }))).toBe(false);
  });
});
