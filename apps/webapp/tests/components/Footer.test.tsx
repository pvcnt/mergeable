import { test, expect } from "vitest";
import { render } from "@testing-library/react";
import Footer from "../../src/components/Footer.js";

test("Footer renders a link to the commit", () => {
  const { getByRole } = render(<Footer commit="abcdef" />);
  const link = getByRole("link", { name: "abcdef" });
  expect(link.getAttribute("href")).toBe(
    "https://github.com/pvcnt/mergeable/commit/abcdef",
  );
});
