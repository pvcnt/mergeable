import { describe, expect, test, beforeAll, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent, type UserEvent } from "@testing-library/user-event";
import { db } from "../../src/lib/db";
import CommandBar from "../../src/components/CommandBar";
import { HotkeysProvider } from "@blueprintjs/core";
import { mockPull } from "../testing";

describe("command bar", () => {
  let user: UserEvent | undefined;

  beforeAll(async () => {
    user = userEvent.setup();

    await db.pulls.add(mockPull({ id: "PR_1", title: "Some title" }));
    await db.pulls.add(mockPull({ id: "PR_2", title: "Another title" }));
  });

  afterAll(async () => await db.pulls.clear());

  const typeText = async (name: string, text: string) => {
    await user?.clear(screen.getByRole("textbox", { name }));
    await user?.type(screen.getByRole("textbox", { name }), text);
  };

  const expectResults = (titles: string[]) => {
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(titles.length);
    titles.forEach((title, idx) =>
      expect(options[idx]).toHaveTextContent(title),
    );
  };

  test("search pull requests", async () => {
    // GIVEN an open command bar.
    render(
      <HotkeysProvider>
        <CommandBar initialOpen={true} />
      </HotkeysProvider>,
    );

    // WHEN typing a search query that matches both pull requests.
    await typeText("Search pull requests", "title");

    // THEN it should return both pull requests.
    expectResults(["Another title", "Some title"]);

    // WHEN typing a search query that matches a single pull request.
    await typeText("Search pull requests", "Some");

    // THEN it should return the pull request.
    expectResults(["Some title"]);
  });

  test("search pull requests when no results", async () => {
    // GIVEN an open command bar.
    render(
      <HotkeysProvider>
        <CommandBar initialOpen={true} />
      </HotkeysProvider>,
    );

    // WHEN typing a search query that matches no pull requests.
    await typeText("Search pull requests", "foo");

    // THEN it should return an informative message.
    expectResults(["No results."]);
  });

  test("search pull requests is case insensitive", async () => {
    // GIVEN an open command bar.
    render(
      <HotkeysProvider>
        <CommandBar initialOpen={true} />
      </HotkeysProvider>,
    );

    // WHEN typing a search query that matches a single pull request.
    await typeText("Search pull requests", "some");

    // THEN it should return the pull request.
    expectResults(["Some title"]);
  });
});
