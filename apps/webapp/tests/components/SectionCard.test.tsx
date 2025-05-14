import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SectionCard from "../../src/components/SectionCard";
import { mockPull } from "../testing";

const sizes = [10, 30, 100, 500, 1000];

test("should display a spinner when loading", () => {
  render(<SectionCard id="1" label="Test" pulls={[]} isLoading={true} sizes={sizes} />);
  expect(screen.queryByRole("progressbar")).toBeDefined();
});

test("should display a table when loaded", () => {
  render(
    <SectionCard id="1" label="Test" pulls={[mockPull()]} isLoading={false} sizes={sizes} />,
  );
  expect(screen.queryByRole("table")).toBeDefined();
});
