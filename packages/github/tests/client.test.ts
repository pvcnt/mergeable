import { test, expect, } from "vitest";
import { DefaultGitHubClient } from "../src/client.js";
import { mockConnection } from "@repo/testing";
import { useRecording } from "./polly.js";

useRecording();

test("should return viewer", async () => {
    const client = new DefaultGitHubClient();
    const connection = mockConnection({ auth: "ghp_token" });

    const viewer = await client.getViewer(connection);

    expect(viewer).toEqual({
        user: {
            name: "pvcnt",
            avatarUrl: "https://avatars.githubusercontent.com/u/944506?v=4",
        },
        teams: [
            { name: "privamov/developers" },
            { name: "graphme-app/dev" }
        ]
    });
})

test("should search pulls", async () => {
    const client = new DefaultGitHubClient();
    const connection = mockConnection({ auth: "ghp_token" });

    const pulls = await client.getPulls(connection, "repo:pvcnt/sandbox");

    expect(pulls).toEqual([
        {
            uid: ":PR_kwDOMoYZC855afun",
            host: "github.com",
            repo: "pvcnt/sandbox",
            number: 1,
            title: "Update README.md",
            state: 1,
            ciState: undefined,
            createdAt: "2024-08-26T09:21:33Z",
            updatedAt: "2024-08-26T10:05:52Z",
            url: "https://github.com/pvcnt/sandbox/pull/1",
            additions: 1,
            deletions: 1,
            comments: 8,
            author: {
                name: "pvcnt",
                avatarUrl: "https://avatars.githubusercontent.com/u/944506?u=d5c9f112310265a0c7b3be509ecc911620eca4ed&v=4"
            },
            requestedReviewers: [],
            requestedTeams: [],
            reviewers: []
        }
    ]);
})