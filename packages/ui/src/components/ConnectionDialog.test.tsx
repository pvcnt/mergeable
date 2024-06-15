/**
 * @jest-environment jsdom
 */
import { test, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import ConnectionDialog from "./ConnectionDialog";

test("Submit button is disabled when base URL and token are empty", () => {
    const handleClose = () => null;
    const handleSubmit = () => null;
    render(<ConnectionDialog title="New connection" isOpen={true} onSubmit={handleSubmit} onClose={handleClose}/>);
    const submitButton = screen.getByRole("button", { name: "Submit" });
    expect(submitButton.getAttribute("disabled")).toBe("");
});