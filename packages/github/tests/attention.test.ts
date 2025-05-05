import { test, expect } from "vitest";
import { isInAttentionSet } from "../src/attention";
import { type Pull } from "../src/types";

const me = { id: "99", name: "test", avatarUrl: "", bot: false };
const user1 = { id: "1", name: "test1", avatarUrl: "", bot: false };
const user2 = { id: "2", name: "test2", avatarUrl: "", bot: false };
const bot = { id: "4", name: "test4", avatarUrl: "", bot: true };
const viewer = { user: me, teams: [] };

test("should contain the author when pull is approved", () => {
  const pull = mockPull({ state: "approved", author: me });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: true, reason: "Pull request is approved" });
});

test("should contain only the author when pull is approved", () => {
  const pull = mockPull({ state: "approved" });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: false });
});

test("should contain the author when CI is failing", () => {
  const pull = mockPull({ author: me, checkState: "failure" });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: true, reason: "CI is failing" });
});

test("should contain only the author when CI is failing", () => {
  const pull = mockPull({ checkState: "failure" });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: false });
});

test("should contain the author when unmergeable", () => {
  const pull = mockPull({
    author: me,
    state: "enqueued",
    queueState: "unmergeable",
  });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({
    set: true,
    reason: "Pull request is unmergeable",
  });
});

test("should contain only the author when unmergeable", () => {
  const pull = mockPull({ state: "enqueued", queueState: "unmergeable" });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: false });
});

test("should contain a requested reviewer when pull is not approved", () => {
  const pull = mockPull({ state: "pending", requestedReviewers: [me] });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: true, reason: "Review is requested" });
});

test("should be empty when pull is draft", () => {
  const pull = mockPull({ state: "draft", author: me });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: false });
});

test("should be empty when pull is merged", () => {
  const pull = mockPull({ state: "merged", author: me });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: false });
});

test("should be empty when pull is closed", () => {
  const pull = mockPull({ state: "closed", author: me });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: false });
});

test("should contain the author when somebody replied", () => {
  const pull = mockPull({
    state: "pending",
    author: me,
    discussions: [
      {
        resolved: false,
        numComments: 2,
        participants: [
          { user: me, numComments: 1, lastActiveAt: "2025-05-05T10:30:00Z" },
          { user: user1, numComments: 1, lastActiveAt: "2025-05-05T10:40:00Z" },
        ],
      },
    ],
  });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: true, reason: "1 unread discussion" });
});

test("should contain the author when somebody left a comment", () => {
  const pull = mockPull({
    state: "pending",
    author: me,
    discussions: [
      {
        resolved: false,
        numComments: 2,
        participants: [
          { user: user1, numComments: 1, lastActiveAt: "2025-05-05T10:40:00Z" },
        ],
      },
    ],
  });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: true, reason: "1 unread discussion" });
});

test("should contain the author when somebody left a comment and somebody replied in different discussions", () => {
  const pull = mockPull({
    state: "pending",
    author: me,
    discussions: [
      {
        resolved: false,
        numComments: 2,
        participants: [
          { user: user2, numComments: 1, lastActiveAt: "2025-05-05T10:50:00Z" },
        ],
      },
      {
        resolved: false,
        numComments: 2,
        participants: [
          { user: me, numComments: 1, lastActiveAt: "2025-05-05T10:30:00Z" },
          { user: user1, numComments: 1, lastActiveAt: "2025-05-05T10:40:00Z" },
        ],
      },
    ],
  });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: true, reason: "2 unread discussions" });
});

test("should not contain the author when a user replied in a resolved discussion", () => {
  const pull = mockPull({
    state: "pending",
    author: me,
    discussions: [
      {
        resolved: true,
        numComments: 2,
        participants: [
          { user: me, numComments: 1, lastActiveAt: "2025-05-05T10:30:00Z" },
          { user: user1, numComments: 1, lastActiveAt: "2025-05-05T10:40:00Z" },
        ],
      },
    ],
  });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: false });
});

test("should contain the author when only bots replied", () => {
  const pull = mockPull({
    state: "pending",
    author: me,
    discussions: [
      {
        resolved: false,
        numComments: 2,
        file: { path: "README.md" },
        participants: [
          { user: me, numComments: 1, lastActiveAt: "2025-05-05T10:30:00Z" },
          { user: bot, numComments: 1, lastActiveAt: "2025-05-05T10:40:00Z" },
        ],
      },
    ],
  });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: true, reason: "1 unread discussion" });
});

test("should not contain the author when only bots replied to the top-level discussion", () => {
  const pull = mockPull({
    state: "pending",
    author: me,
    discussions: [
      {
        resolved: false,
        numComments: 2,
        participants: [
          { user: me, numComments: 1, lastActiveAt: "2025-05-05T10:30:00Z" },
          { user: bot, numComments: 1, lastActiveAt: "2025-05-05T10:40:00Z" },
        ],
      },
    ],
  });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: false });
});

test("should not contain the author when only the author posted", () => {
  const pull = mockPull({
    state: "pending",
    author: me,
    discussions: [
      {
        resolved: false,
        numComments: 2,
        participants: [
          { user: me, numComments: 2, lastActiveAt: "2025-05-05T10:30:00Z" },
        ],
      },
    ],
  });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: false });
});

test("should contain a reviewer when somebody replied", () => {
  const pull = mockPull({
    state: "pending",
    author: user1,
    reviews: [{ author: me, collaborator: true, approved: false }],
    discussions: [
      {
        resolved: false,
        numComments: 2,
        participants: [
          { user: me, numComments: 1, lastActiveAt: "2025-05-05T10:30:00Z" },
          { user: user1, numComments: 1, lastActiveAt: "2025-05-05T10:40:00Z" },
        ],
      },
    ],
  });
  const attention = isInAttentionSet(viewer, pull);
  expect(attention).toEqual({ set: true, reason: "1 unread discussion" });
});

function mockPull(props?: Omit<Partial<Pull>, "uid" | "url">): Pull {
  return {
    id: "1",
    repo: "pvcnt/mergeable",
    number: 1,
    title: "Pull request",
    body: "",
    state: "pending",
    checkState: "pending",
    createdAt: "2024-08-05T15:57:00Z",
    updatedAt: "2024-08-05T15:57:00Z",
    locked: false,
    url: "https://github.com/pvncnt/mergeable/pull/1",
    additions: 0,
    deletions: 0,
    author: { id: "1", name: "pvcnt", avatarUrl: "", bot: false },
    requestedReviewers: [],
    requestedTeams: [],
    reviews: [],
    discussions: [],
    checks: [],
    labels: [],
    uid: `1:1`,
    host: "github.com",
    starred: 0,
    sections: [],
    connection: "1",
    ...props,
  };
}
