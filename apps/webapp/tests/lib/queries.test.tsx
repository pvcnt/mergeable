import { TestGitHubClient } from "../testing";
import { it, describe, expect, vi } from "vitest";
import { mockPull, mockConnection, mockSection } from "../testing";
import { usePulls } from "../../src/lib/queries";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as github from "../../src/github";
import { ReactNode } from "react";

const connections = [
  mockConnection({ id: "1", auth: "ghp_xxx" }),
  mockConnection({ id: "2", auth: "ghp_yyy" }),
];
const sections = [
  mockSection({
    id: "1",
    search: "author:@me draft:true;author:@me draft:false",
  }),

  mockSection({ id: "2", search: "author:@me review:approved" }),
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity,
    },
  },
});
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("usePulls", () => {
  it("should return pull requests", async () => {
    // GIVEN some pull requests are returned from GitHub.
    const githubClient = new TestGitHubClient();
    vi.spyOn(github, "gitHubClient", "get").mockReturnValue(githubClient);
    githubClient.setPullsBySearch(connections[0], "author:@me draft:true", [
      mockPull({ id: "PR_1", connection: "1" }),
      mockPull({ id: "PR_2", connection: "1" }),
    ]);
    githubClient.setPullsBySearch(connections[0], "author:@me draft:false", [
      mockPull({ id: "PR_4", connection: "1" }),
    ]);
    githubClient.setPullsBySearch(
      connections[0],
      "author:@me review:approved",
      [
        mockPull({ id: "PR_1", connection: "1" }),
        mockPull({ id: "PR_3", connection: "1" }),
      ],
    );

    githubClient.setPullsBySearch(connections[1], "author:@me draft:true", [
      mockPull({ id: "PR_1", connection: "2" }),
    ]);
    githubClient.setPullsBySearch(
      connections[1],
      "author:@me review:approved",
      [mockPull({ id: "PR_2", connection: "2" })],
    );

    // WHEN syncing pull requests.
    const { result } = renderHook(() => usePulls({ connections, sections }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // THEN all pull requests must be returned.
    const uids = result.current.data?.map((pull) => pull.uid).toSorted() ?? [];
    expect(uids).toEqual([
      "1:PR_1",
      "1:PR_2",
      "1:PR_3",
      "1:PR_4",
      "2:PR_1",
      "2:PR_2",
    ]);

    // THEN pull requests must be in the correct section(s).
    let pull = result.current.data?.find((pull) => pull.uid === "1:PR_1");
    expect(pull).toBeDefined();
    expect(pull?.sections).toEqual(["1", "2"]);

    pull = result.current.data?.find((pull) => pull.uid === "1:PR_2");
    expect(pull).toBeDefined();
    expect(pull?.sections).toEqual(["1"]);

    pull = result.current.data?.find((pull) => pull.uid === "1:PR_3");
    expect(pull).toBeDefined();
    expect(pull?.sections).toEqual(["2"]);

    pull = result.current.data?.find((pull) => pull.uid === "1:PR_4");
    expect(pull).toBeDefined();
    expect(pull?.sections).toEqual(["1"]);
  });
});
