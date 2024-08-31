import { test, expect } from "vitest";
import { DefaultGitHubClient } from "../src/client.js";
import { mockConnection } from "@repo/testing";
import { useRecording } from "./polly.js";
import { CheckState, PullState } from "@repo/model";

useRecording();

test("should return viewer", async () => {
  const client = new DefaultGitHubClient();
  const connection = mockConnection({ auth: "ghp_token" });

  const viewer = await client.getViewer(connection);

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
  const connection = mockConnection({ auth: "ghp_token" });

  const pulls = await client.searchPulls(connection, "repo:pvcnt/sandbox");

  expect(pulls).toEqual([
    {
      id: "PR_kwDOMoYZC855afun",
      updatedAt: new Date("2024-08-27T13:45:07.000Z"),
    },
  ]);
});

test("should get pull", async () => {
  const client = new DefaultGitHubClient();
  const connection = mockConnection({ auth: "ghp_token" });

  const pull = await client.getPull(connection, "PR_kwDOFFj3yM53-IjI");

  expect(pull).toEqual({
    id: "PR_kwDOFFj3yM53-IjI",
    repo: "apache/solr",
    number: 2632,
    title: "remove deprecated (DocValues,Norms)FieldExistsQuery use",
    state: PullState.Pending,
    ciState: CheckState.Success,
    createdAt: new Date("2024-08-09T17:18:47.000Z"),
    updatedAt: new Date("2024-08-23T19:12:59.000Z"),
    url: "https://github.com/apache/solr/pull/2632",
    additions: 25,
    deletions: 29,
    author: {
      name: "cpoerschke",
      avatarUrl:
        "https://avatars.githubusercontent.com/u/6458642?u=8ccfc26ce7209695b2fcca628a59baca42cff00f&v=4",
      bot: false,
    },
    requestedReviewers: [
      {
        name: "HoustonPutman",
        avatarUrl:
          "https://avatars.githubusercontent.com/u/3376422?u=323311c61ac2b04e5deac436faaa4f4309fe7beb&v=4",
        bot: false,
      },
    ],
    requestedTeams: [],
    reviews: [
      {
        author: {
          name: "dsmiley",
          avatarUrl:
            "https://avatars.githubusercontent.com/u/377295?u=85f6ade89e5b34f001267475e806da2a52b2755a&v=4",
          bot: false,
        },
        createdAt: new Date("2024-08-23T19:07:24.000Z"),
        lgtm: false,
      },
    ],
    discussions: [
      {
        resolved: false,
        comments: [
          {
            id: "PRR_kwDOFFj3yM6GlVVP",
            author: {
              name: "dsmiley",
              avatarUrl:
                "https://avatars.githubusercontent.com/u/377295?u=85f6ade89e5b34f001267475e806da2a52b2755a&v=4",
              bot: false,
            },
            body: "As there is now FieldExistsQuery covering a range of cases (not just even docValues & norms), this probably obsoletes complexity inside FieldType.getExistenceQuery.  Can we just call that and remove getSpecializedExistenceQuery as needless in lieu of subtypes overriding getExistenceQuery?\r\n\r\nCC @HoustonPutman as you worked on this method",
            createdAt: new Date("2024-08-23T19:07:24.000Z"),
          },
        ],
      },
      {
        resolved: false,
        comments: [
          {
            id: "PRRC_kwDOFFj3yM5nFK8J",
            author: {
              name: "dsmiley",
              avatarUrl:
                "https://avatars.githubusercontent.com/u/377295?u=85f6ade89e5b34f001267475e806da2a52b2755a&v=4",
              bot: false,
            },
            body: "I suspect this code pre-dated FieldType.getExistenceQuery -- just call that.",
            createdAt: new Date("2024-08-23T19:07:24.000Z"),
          },
        ],
        file: {
          path: "solr/core/src/java/org/apache/solr/search/facet/MissingAgg.java",
        },
      },
    ],
  });
});

test("should error when pull does not exist", async () => {
  const client = new DefaultGitHubClient();
  const connection = mockConnection({ auth: "ghp_token" });

  await expect(client.getPull(connection, "PR_none")).rejects.toThrowError();
});
