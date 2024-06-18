/**
 * @jest-environment jsdom
 */
import { test, expect } from "@jest/globals";
import { render } from "@testing-library/react";
import Footer from "./Footer";

test("Footer renders a link to the commit", () => {
    const { getByRole } = render(<Footer commit="abcdef"/>);
    const link = getByRole("link", { name: "abcdef" });
    expect(link.getAttribute("href")).toBe("https://github.com/pvcnt/mergeable/commit/abcdef");
});