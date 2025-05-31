import { test, expect } from "vitest";
import { setupRecording } from "./polly.js";
import {
  DefaultGitHubClient,
  normalizeBaseUrl,
} from "../../../src/lib/github/client";

setupRecording();

const endpoint = {
  auth: "ghp_token",
  baseUrl: "https://api.github.com",
};

test("should normalize base URL", () => {
  expect(normalizeBaseUrl("https://github.com")).toEqual(
    "https://api.github.com",
  );
  expect(normalizeBaseUrl("https://api.github.com")).toEqual(
    "https://api.github.com",
  );
  expect(normalizeBaseUrl("https://git.acme.com")).toEqual(
    "https://git.acme.com/api/v3",
  );
  expect(normalizeBaseUrl("https://git.acme.com/api/v3")).toEqual(
    "https://git.acme.com/api/v3",
  );
});

test("should return viewer", async () => {
  const client = new DefaultGitHubClient();

  const viewer = await client.getViewer(endpoint);

  expect(viewer).toEqual({
    user: {
      id: "MDQ6VXNlcjk0NDUwNg==",
      name: "pvcnt",
      avatarUrl: "https://avatars.githubusercontent.com/u/944506?v=4",
      bot: false,
    },
    teams: [
      { id: "MDQ6VGVhbTIyMTM2Mzg=", name: "privamov/developers" },
      { id: "T_kwDOBxsAps4Anop0", name: "graphme-app/dev" },
    ],
  });
});

test("should search pulls", async () => {
  const client = new DefaultGitHubClient();

  const pulls = await client.searchPulls(
    endpoint,
    "repo:pvcnt/mergeable 'multiple connections'",
    [],
    50,
  );

  expect(pulls).toEqual([
    {
      id: "PR_kwDOKCpCz85keYan",
      repo: "pvcnt/mergeable",
      number: 13,
      title: "fix: Handle multiple connections correctly on dashboard",
      body: "`react-query`'s built-in memoization was causing connections to the same domain to clobber each other. You would have a race condition on which set of data gets shown and it would show up twice.\r\n\r\nThe goal here is to allow multiple connections to be used and have the sum of all of their PR requests be shown in the dashboard. Since we are already storing the key plain in `localStorage` I don't immediately see an issue with utilizing the token as part of the react query key. \r\n\r\nThough technically it does expose the access token to more libraries. If that's a concern we could hash the token.",
      state: "merged",
      checkState: "pending",
      queueState: undefined,
      createdAt: "2024-01-18T23:00:38Z",
      updatedAt: "2024-01-21T05:05:16Z",
      enqueuedAt: undefined,
      closedAt: "2024-01-20T14:05:39Z",
      labels: [],
      locked: false,
      mergedAt: "2024-01-20T14:05:39Z",
      url: "https://github.com/pvcnt/mergeable/pull/13",
      additions: 2,
      deletions: 2,
      author: {
        id: "MDQ6VXNlcjQ2MDYyMzQ=",
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
            id: "MDQ6VXNlcjk0NDUwNg==",
            name: "pvcnt",
            avatarUrl:
              "https://avatars.githubusercontent.com/u/944506?u=d5c9f112310265a0c7b3be509ecc911620eca4ed&v=4",
            bot: false,
          },
          approved: true,
          collaborator: true,
        },
      ],
      discussions: [
        {
          resolved: false,
          numComments: 4,
          participants: [
            {
              user: {
                id: "MDQ6VXNlcjk0NDUwNg==",
                name: "pvcnt",
                avatarUrl:
                  "https://avatars.githubusercontent.com/u/944506?u=d5c9f112310265a0c7b3be509ecc911620eca4ed&v=4",
                bot: false,
              },
              lastActiveAt: "2024-01-19T21:17:30Z",
              numComments: 3,
            },
            {
              user: {
                id: "MDQ6VXNlcjQ2MDYyMzQ=",
                name: "glossawy",
                avatarUrl:
                  "https://avatars.githubusercontent.com/u/4606234?u=792175a6c93f239c4a8c7c0ddec008e80b9abd0d&v=4",
                bot: false,
              },
              lastActiveAt: "2024-01-19T20:16:27Z",
              numComments: 1,
            },
          ],
        },
        {
          resolved: false,
          numComments: 1,
          participants: [
            {
              user: {
                id: "MDQ6VXNlcjk0NDUwNg==",
                name: "pvcnt",
                avatarUrl:
                  "https://avatars.githubusercontent.com/u/944506?u=d5c9f112310265a0c7b3be509ecc911620eca4ed&v=4",
                bot: false,
              },
              lastActiveAt: "2024-01-19T21:18:48Z",
              numComments: 1,
            },
          ],
          file: {
            path: "src/routes/dashboard.tsx",
            line: 33,
          },
        },
      ],
      checks: [],
    },
  ]);
});
