import { describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent, type UserEvent } from "@testing-library/user-event";
import ConnectionDialog from "./ConnectionDialog";
import { AppToaster } from "../lib/toaster";
import { type ConnectionProps } from "@repo/types";
import { mockConnection } from "../../../../packages/testing/src";

describe("connection dialog", () => {
    let user: UserEvent|undefined;

    beforeEach(() => {
        user = userEvent.setup();
    })

    const typeText = async (name: string, text: string) => {
        await user?.type(screen.getByRole("textbox", { name }), text);
    }
    const selectOptions = async (name: string, value: string|string[]) => {
        await user?.selectOptions(screen.getByRole("combobox", { name }), value);
    }
    const clickButton = async (name: string) => {
        await user?.click(screen.getByRole("button", { name }));
    }

    test("be submitted", async () => {
        // GIVEN an empty dialog.
        const state: {submitted?: ConnectionProps} = {submitted: undefined};
        const handleSubmit = (v: ConnectionProps) => {
            state.submitted = v;
            return Promise.resolve();
        }
        render(
            <ConnectionDialog
            title="New connection"
            isOpen={true}
            onSubmit={handleSubmit}/>
        );

        // WHEN filling the form and submitting it.
        await typeText("Base URL", "https://api.github.com");
        await typeText("Access token", "ghp_foo");
        await typeText("Connection label", "Some label");        
        await clickButton("Submit");

        // THEN the form should be submitted with its current values.
        expect(state.submitted).toEqual({label: "Some label", baseUrl: "https://api.github.com", host: "github.com", auth: "ghp_foo", orgs: []});
    });

    test("submit button is disabled before base URL input and token are filled", async () => {
        // GIVEN an empty dialog.
        render(<ConnectionDialog title="New connection" isOpen={true}/>);
    
        // THEN the submit button must be disabled.
        const submitButton = screen.getByRole("button", { name: "Submit" });
        expect(submitButton.getAttribute("disabled")).toBe("");
    
        // WHEN the user types a URL and a token.
        await typeText("Base URL", "https://api.github.com");
        await typeText("Access token", "ghp_foo");
        
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
    
        // THEN the submit button must be disabled.
        const submitButton = screen.getByRole("button", { name: "Submit" });
        expect(submitButton.getAttribute("disabled")).toBe("");
    
        // WHEN the user types a token.
        await typeText("Access token", "ghp_foo");
        
        // THEN the submit button must be enabled (since the first option is selected).
        // expect(baseURLInput).toHaveV
        expect(submitButton.getAttribute("disabled")).toBeNull();

        // WHEN the user selects another option.
        await selectOptions("Base URL", "https://github.corp.com/api/v3")

        // THEN the submit button must still be enabled.
        expect(submitButton.getAttribute("disabled")).toBeNull();
    });

    test("should be closed after successful submission", async () => {
        // GIVEN a pre-filled dialog.
        const state = {closed: false};
        const connection = mockConnection();
        const handleClose = () => state.closed = true;
        render(
            <ConnectionDialog
            title="Edit connection"
            isOpen={true}
            connection={connection}
            onClose={handleClose}/>
        );

        // WHEN clicking on the submit button.
        await clickButton("Submit");

        // THEN it should close the dialog.
        expect(state.closed).toBe(true);
    });

    test("should not closed with a toast after failed submission", async () => {
        // GIVEN a pre-filled dialog that will fail to submit.
        const state = {closed: false};
        const connection = mockConnection();
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

        // WHEN clicking on the submit button.
        await clickButton("Submit");

        // THEN it should display a toast.
        expect((await AppToaster).getToasts()).toHaveLength(1);

        // THEN it should not close the dialog.
        expect(state.closed).toBe(false);
    });
});