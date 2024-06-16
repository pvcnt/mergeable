/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import ConnectionDialog from "./ConnectionDialog";

describe("Connection dialog", () => {
    describe("Submit button", () => {
        it("enabled when base URL input and token are filled", async () => {
            // GIVEN an empty connection dialog.
            const user = userEvent.setup();
            render(<ConnectionDialog title="New connection" isOpen={true}/>);

            const submitButton = screen.getByRole("button", { name: "Submit" });
            const baseURLInput = screen.getByRole("textbox", { name: "Base URL" });
            const tokenInput = screen.getByRole("textbox", { name: "Access token" });
        
            // THEN the submit button must be disabled.
            expect(submitButton.getAttribute("disabled")).toBe("");
        
            // WHEN the user types a URL and a token.
            await user.type(baseURLInput, "https://api.github.com");
            await user.type(tokenInput, "ghp_foo");
            
            // THEN the submit button must be enabled.
            expect(submitButton.getAttribute("disabled")).toBeNull();
        });
        
        it("enabled when base URL option and token are filled", async () => {
            // GIVEN an empty connection dialog with a set of allowed URLs.
            const user = userEvent.setup();
            render(
                <ConnectionDialog
                title="New connection"
                isOpen={true}
                allowedUrls={["https://api.github.com", "https://github.corp.com/api/v3"]}/>
            );
        
            const submitButton = screen.getByRole("button", { name: "Submit" });
            const baseURLInput = screen.getByRole("combobox", { name: "Base URL" });
            const tokenInput = screen.getByRole("textbox", { name: "Access token" });
        
            // THEN the submit button must be disabled.
            expect(submitButton.getAttribute("disabled")).toBe("");
        
            // WHEN the user types a token.
            await user.type(tokenInput, "ghp_foo");
            
            // THEN the submit button must be enabled (since the first option is selected).
            // expect(baseURLInput).toHaveV
            expect(submitButton.getAttribute("disabled")).toBeNull();

            // WHEN the user selects another option.
            await user.selectOptions(baseURLInput, "https://github.corp.com/api/v3")

            // THEN the submit button must still be enabled.
            expect(submitButton.getAttribute("disabled")).toBeNull();
        });
    });
});