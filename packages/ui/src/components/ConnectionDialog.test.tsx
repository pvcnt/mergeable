/**
 * @jest-environment jsdom
 */
import { describe, test, expect, beforeEach } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { userEvent, type UserEvent } from "@testing-library/user-event";
import ConnectionDialog from "./ConnectionDialog";
import { AppToaster } from "../utils/toaster";

describe("connection dialog", () => {
    const connection = {
        id: "1",
        label: "Label",
        baseUrl: "https://api.github.com",
        host: "github.com",
        auth: "ghp_foo",
        viewer: "pvcnt"
    };
    let user: UserEvent|undefined;

    beforeEach(() => {
        user = userEvent.setup();
    })

    test("submit button is disabled before base URL input and token are filled", async () => {
        // GIVEN an empty dialog.
        render(<ConnectionDialog title="New connection" isOpen={true}/>);

        const submitButton = screen.getByRole("button", { name: "Submit" });
        const baseURLInput = screen.getByRole("textbox", { name: "Base URL" });
        const tokenInput = screen.getByRole("textbox", { name: "Access token" });
    
        // THEN the submit button must be disabled.
        expect(submitButton.getAttribute("disabled")).toBe("");
    
        // WHEN the user types a URL and a token.
        await user?.type(baseURLInput, "https://api.github.com");
        await user?.type(tokenInput, "ghp_foo");
        
        // THEN the submit button must be enabled.
        expect(submitButton.getAttribute("disabled")).toBeNull();
    });
    
    test("submit button is disabled before base URL option and token are filled", async () => {
        // GIVEN an empty dialog with a set of allowed URLs.
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
        await user?.type(tokenInput, "ghp_foo");
        
        // THEN the submit button must be enabled (since the first option is selected).
        // expect(baseURLInput).toHaveV
        expect(submitButton.getAttribute("disabled")).toBeNull();

        // WHEN the user selects another option.
        await user?.selectOptions(baseURLInput, "https://github.corp.com/api/v3")

        // THEN the submit button must still be enabled.
        expect(submitButton.getAttribute("disabled")).toBeNull();
    });

    test("should be closed after successful submission", async () => {
        // GIVEN a pre-filled dialog.
        const state = {closed: false};
        const handleSubmit = () => Promise.resolve();
        const handleClose = () => state.closed = true;
        render(
            <ConnectionDialog
            title="Edit connection"
            isOpen={true}
            connection={connection}
            onSubmit={handleSubmit}
            onClose={handleClose}/>
        );

        const submitButton = screen.getByRole("button", { name: "Submit" });

        // WHEN clicking on the submit button.
        await user?.click(submitButton);

        // THEN it should close the dialog.
        expect(state.closed).toBe(true);
    });

    test("should not closed with a toast after failed submission", async () => {
        // GIVEN a pre-filled dialog that will fail to submit.
        const state = {closed: false};
        const handleSubmit = () => Promise.reject({message: "Bad credentials"});
        const handleClose = () => state.closed = true;
        render(
            <ConnectionDialog
            title="Edit connection"
            isOpen={true}
            connection={connection}
            onSubmit={handleSubmit}
            onClose={handleClose}/>
        );

        const submitButton = screen.getByRole("button", { name: "Submit" });

        // WHEN clicking on the submit button.
        await user?.click(submitButton);

        // THEN it should display a toast.
        expect((await AppToaster).getToasts()).toHaveLength(1);

        // THEN it should not close the dialog.
        expect(state.closed).toBe(false);
    });
});