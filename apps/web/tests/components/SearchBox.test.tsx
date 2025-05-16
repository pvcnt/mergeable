import { describe, expect, it, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent, type UserEvent } from "@testing-library/user-event";
import { SearchBox } from "../../src/components/SearchBox";
import { HotkeysProvider } from "@blueprintjs/core";

describe("SearchBox", () => {
  let user: UserEvent | undefined;

  beforeAll(() => {
    user = userEvent.setup();
  });

  it("should have keyboard shortcuts", async () => {
    // GIVEN a search box.
    render(
      <HotkeysProvider>
        <SearchBox value="" onChange={() => {}} />
      </HotkeysProvider>,
    );

    // THEN the displayed keyboard shortcut must be "S".
    expect(screen.queryByText("S")).toBeTruthy();

    // WHEN hitting the "S" key.
    await user?.keyboard("s");

    // THEN the search box must get focus.
    expect(
      screen.queryByRole("searchbox", { name: "Search pulls" }),
    ).toHaveFocus();

    // THEN the displayed  keyboard shortcut must be "Esc".
    expect(screen.queryByText("Esc")).toBeTruthy();

    // WHEN hitting the "Esc" key.
    await user?.keyboard("[Escape]");

    // THEN the search box must lose focus.
    expect(document.body).toHaveFocus();
  });
});
