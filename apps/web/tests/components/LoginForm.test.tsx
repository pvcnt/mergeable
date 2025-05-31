import { describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent, type UserEvent } from "@testing-library/user-event";
import LoginForm from "../../src/components/LoginForm.js";
import type { ConnectionProps } from "../../src/lib/types";

describe("login form", () => {
  let user: UserEvent | undefined;

  beforeEach(() => {
    user = userEvent.setup();
  });

  const typeText = async (name: string, text: string) => {
    const el = screen.getByRole("textbox", { name });
    await user?.clear(el);
    await user?.type(el, text);
  };
  const clickButton = async (name: string) => {
    await user?.click(screen.getByRole("button", { name }));
  };

  test("be submitted", async () => {
    // GIVEN an empty dialog.
    const state: { submitted?: ConnectionProps } = { submitted: undefined };
    const handleSubmit = (v: ConnectionProps) => {
      state.submitted = v;
      return Promise.resolve();
    };
    render(<LoginForm onSubmit={handleSubmit} />);

    // WHEN filling the form and submitting it.
    await typeText("Base URL", "https://github.com");
    await typeText("Access token", "ghp_foo");
    await clickButton("Submit");

    // THEN the form should be submitted with its current values.
    expect(state.submitted).toEqual({
      baseUrl: "https://github.com",
      label: "",
      auth: "ghp_foo",
      orgs: [],
    });
  });

  test("submit button is disabled before base URL input and token are filled", async () => {
    // GIVEN an empty dialog.
    render(<LoginForm onSubmit={() => Promise.resolve()} />);

    // THEN the submit button must be disabled.
    const submitButton = screen.getByRole("button", { name: "Submit" });
    expect(submitButton.getAttribute("disabled")).toBe("");

    // WHEN the user types a URL and a token.
    await typeText("Base URL", "https://api.github.com");
    await typeText("Access token", "ghp_foo");

    // THEN the submit button must be enabled.
    expect(submitButton.getAttribute("disabled")).toBeNull();
  });
});
