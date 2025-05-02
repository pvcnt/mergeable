import { test, expect } from "vitest";
import { useRecording } from "./polly.js";
import { DefaultGitHubClient } from "../src/client";
import { CheckState, PullState } from "../src/types";

useRecording();

const endpoint = { auth: "ghp_token", baseUrl: "https://api.github.com" };

test("should return viewer", async () => {
  const client = new DefaultGitHubClient();

  const viewer = await client.getViewer(endpoint);

  expect(viewer).toEqual({
    user: {
      name: "pvcnt",
      avatarUrl: "https://avatars.githubusercontent.com/u/944506?v=4",
      bot: false,
    },
    teams: [{ name: "privamov/developers" }, { name: "graphme-app/dev" }],
  });
});

test("should search pulls", async () => {
  const client = new DefaultGitHubClient();

  const pulls = await client.searchPulls(endpoint, "repo:pvcnt/sandbox", []);

  expect(pulls).toEqual([
    {
      id: "PR_kwDOMoYZC86UfoU-",
      updatedAt: new Date("2025-04-30T19:17:30.000Z"),
    },
    {
      id: "PR_kwDOMoYZC86UYQCq",
      updatedAt: new Date("2025-04-29T16:24:02.000Z"),
    },
    {
      id: "PR_kwDOMoYZC855afun",
      updatedAt: new Date("2024-08-27T13:45:07.000Z"),
    },
  ]);
});

test("should get pull", async () => {
  const client = new DefaultGitHubClient();

  const pull = await client.getPull(endpoint, "PR_kwDOKCpCz85keYan");

  expect(pull).toEqual({
    id: "PR_kwDOKCpCz85keYan",
    repo: "pvcnt/mergeable",
    number: 13,
    title: "fix: Handle multiple connections correctly on dashboard",
    state: PullState.Merged,
    ciState: CheckState.None,
    createdAt: new Date("2024-01-18T23:00:38.000Z"),
    updatedAt: new Date("2024-01-21T05:05:16.000Z"),
    url: "https://github.com/pvcnt/mergeable/pull/13",
    additions: 2,
    deletions: 2,
    author: {
      name: "glossawy",
      avatarUrl:
        "https://avatars.githubusercontent.com/u/4606234?u=792175a6c93f239c4a8c7c0ddec008e80b9abd0d&v=4",
      bot: false,
    },
    requestedReviewers: [],
    requestedTeams: [],
    reviews: [
      {
        author: {
          name: "pvcnt",
          avatarUrl:
            "https://avatars.githubusercontent.com/u/944506?u=d5c9f112310265a0c7b3be509ecc911620eca4ed&v=4",
          bot: false,
        },
        createdAt: new Date("2024-01-19T21:17:30.000Z"),
        lgtm: true,
      },
    ],
    discussions: [
      {
        resolved: false,
        comments: [
          {
            id: "IC_kwDOKCpCz85xTyIc",
            author: {
              name: "pvcnt",
              avatarUrl:
                "https://avatars.githubusercontent.com/u/944506?u=d5c9f112310265a0c7b3be509ecc911620eca4ed&v=4",
              bot: false,
            },
            body: "I had not considered this use case. Out of curiosity, how do you use multiple connections to the same host? How would they be configured differently?",
            createdAt: new Date("2024-01-19T19:46:48.000Z"),
          },
          {
            id: "IC_kwDOKCpCz85xT7ZD",
            author: {
              name: "glossawy",
              avatarUrl:
                "https://avatars.githubusercontent.com/u/4606234?u=792175a6c93f239c4a8c7c0ddec008e80b9abd0d&v=4",
              bot: false,
            },
            body: "I provide an example in #12 but with github finer-grained tokens you grant access to a specific user/org, giving access to a user does not mean it will show all the repositories they have access to in all their orgs. So I had to create two different tokens one for the org and one for myself.\r\n\r\nBasically the only difference is the token used for the connection.",
            createdAt: new Date("2024-01-19T20:16:27.000Z"),
          },
          {
            author: {
              avatarUrl:
                "https://avatars.githubusercontent.com/u/944506?u=d5c9f112310265a0c7b3be509ecc911620eca4ed&v=4",
              bot: false,
              name: "pvcnt",
            },
            body: "That makes sense!",
            createdAt: new Date("2024-01-19T21:14:34.000Z"),
            id: "IC_kwDOKCpCz85xUNln",
          },
          {
            author: {
              avatarUrl:
                "https://avatars.githubusercontent.com/u/944506?u=d5c9f112310265a0c7b3be509ecc911620eca4ed&v=4",
              bot: false,
              name: "pvcnt",
            },
            body: "Let's move forward with this for now. It's not optimal but I cannot think of anything better at the moment. And as you say, it's all stored in the browser right now - which is an explicit goal of this project (it should work all in the browser).",
            createdAt: new Date("2024-01-19T21:17:30.000Z"),
            id: "PRR_kwDOKCpCz85tTMPW",
          },
        ],
      },
      {
        resolved: false,
        comments: [
          {
            id: "PRRC_kwDOKCpCz85XApfm",
            author: {
              name: "pvcnt",
              avatarUrl:
                "https://avatars.githubusercontent.com/u/944506?u=d5c9f112310265a0c7b3be509ecc911620eca4ed&v=4",
              bot: false,
            },
            body: "I was considering as an alternative using the connection name that you introduce in #12. But at the same time using the token is a better representation of the identity of the token (e.g., if we switch the names of two connections we should not reuse the cache of the other one).",
            createdAt: new Date("2024-01-19T21:17:30.000Z"),
          },
        ],
        file: {
          path: "src/routes/dashboard.tsx",
        },
      },
    ],
  });
});

test("should error when pull does not exist", async () => {
  const client = new DefaultGitHubClient();

  await expect(client.getPull(endpoint, "PR_none")).rejects.toThrowError();
});
