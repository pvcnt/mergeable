import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent, type UserEvent } from "@testing-library/user-event";
import ConfirmDialog from "../../src/components/ConfirmDialog";

describe("ConfirmDialog", () => {
  let user: UserEvent | undefined;

  beforeEach(() => {
    user = userEvent.setup();
  });

  const clickButton = async (name: string) => {
    await user?.click(screen.getByRole("button", { name }));
  };

  it("should render when open", () => {
    // WHEN rendering an open dialog with some content.
    render(
      <ConfirmDialog isOpen={true}>
        <>Please confirm</>
      </ConfirmDialog>,
    );

    // THEN it should render the content.
    expect(screen.queryByText("Please confirm")).toBeDefined();
  });

  it("should not render when closed", () => {
    // WHEN rendering a closed dialog with some content.
    render(
      <ConfirmDialog isOpen={false}>
        <>Please confirm</>
      </ConfirmDialog>,
    );

    // THEN it should not render the content.
    expect(screen.queryByText("Please confirm")).toBeNull();
  });

  it("should submit", async () => {
    // GIVEN an open dialog.
    const state = { closed: false, submitted: false };
    const handleSubmit = () => (state.submitted = true);
    const handleClose = () => (state.closed = true);
    render(
      <ConfirmDialog
        isOpen={true}
        onSubmit={handleSubmit}
        onClose={handleClose}
      />,
    );

    // WHEN confirming.
    await clickButton("Confirm");

    // THEN the dialog should be submitted and closed.
    expect(state.submitted).toBe(true);
    expect(state.closed).toBe(true);
  });

  it("should cancel", async () => {
    // GIVEN an open dialog.
    const state = { closed: false, submitted: false };
    const handleSubmit = () => (state.submitted = true);
    const handleClose = () => (state.closed = true);
    render(
      <ConfirmDialog
        isOpen={true}
        onSubmit={handleSubmit}
        onClose={handleClose}
      />,
    );

    // WHEN cancelling.
    await clickButton("Cancel");

    // THEN the dialog should be closed but not submitted.
    expect(state.closed).toBe(true);
    expect(state.submitted).toBe(false);
  });
});
