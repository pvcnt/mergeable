import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SectionCard from "../../src/components/SectionCard.js";
import { mockPull } from "@repo/testing";

test("should display a spinner when loading", () => {
    render(<SectionCard label="Test" pulls={[]} isLoading={true}/>);
    expect(screen.queryByRole("progressbar")).toBeDefined();
})

test("should display a table when loaded", () => {
    render(<SectionCard label="Test" pulls={[mockPull()]} isLoading={false}/>);
    expect(screen.queryByRole("table")).toBeDefined();
})