import { expect, describe, it } from "vitest";
import { render } from "@testing-library/react";
import Footer from "../../src/components/Footer";

describe("Footer", () => {
  it("should render a link to the commit", () => {
    const { getByRole } = render(<Footer commit="abcdef" />);
    const link = getByRole("link", { name: "abcdef" });
    expect(link.getAttribute("href")).toBe(
      "https://github.com/pvcnt/mergeable/commit/abcdef",
    );
  });
});
