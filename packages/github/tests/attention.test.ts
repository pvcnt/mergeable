import { test, expect } from "vitest";
import { isInAttentionSet } from "../src/attention.js";
import { mockConnection, mockPull } from "@repo/testing";
import { CheckState, PullState } from "@repo/model";

const me =  { name: "test", avatarUrl: "", bot: false };
const user1 =  { name: "test1", avatarUrl: "", bot: false };
const user2 =  { name: "test2", avatarUrl: "", bot: false };
const user3 =  { name: "test3", avatarUrl: "", bot: false };
const user4 =  { name: "test4", avatarUrl: "", bot: true };
const connection = mockConnection({ viewer: { user: me, teams: []}});

test("should contain the author when pull is approved", () => {
    const pull = mockPull({ state: PullState.Approved, author: me });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: true, reason: "Pull request is approved" });
})

test("should contain only the author when pull is approved", () => {
    const pull = mockPull({ state: PullState.Approved });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: false });
})

test("should contain the author when CI is failing", () => {
    const pull = mockPull({ author: me, ciState: CheckState.Failure });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: true, reason: "CI is failing" });
})

test("should contain only the author when CI is failing", () => {
    const pull = mockPull({ ciState: CheckState.Failure });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: false });
})

test("should contain a requested reviewer when pull is not approved", () => {
    const pull = mockPull({ state: PullState.Pending, requestedReviewers: [me] });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: true, reason: "Review is requested" });
})

test("should be empty when pull is draft", () => {
    const pull = mockPull({ state: PullState.Draft, author: me });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: false });
})

test("should be empty when pull is merged", () => {
    const pull = mockPull({ state: PullState.Merged, author: me });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: false });
})

test("should be empty when pull is closed", () => {
    const pull = mockPull({ state: PullState.Closed, author: me });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: false });
})

test("should contain the author when a user replied", () => {
    const pull = mockPull({
        state: PullState.Pending,
        author: me,
        discussions: [
            {
                resolved: false,
                comments: [
                    { id: "1", author: me, createdAt: new Date(0), body: "" },
                    { id: "2", author: user1, createdAt: new Date(1), body: "" },
                ],
            },
        ],
    });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: true, reason: "test1 left a comment" });
})

test("should contain the author when two users replied", () => {
    const pull = mockPull({
        state: PullState.Pending,
        author: me,
        discussions: [
            {
                resolved: false,
                comments: [
                    { id: "1", author: me, createdAt: new Date(0), body: "" },
                    { id: "2", author: user1, createdAt: new Date(1), body: "" },
                    { id: "3", author: user2, createdAt: new Date(2), body: "" },
                ],
            }
        ]
    });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: true, reason: "test1 and 1 other left a comment" });
})

test("should contain the author when three users replied", () => {
    const pull = mockPull({
        state: PullState.Pending,
        author: me,
        discussions: [
            {
                resolved: false,
                comments: [
                    { id: "1", author: me, createdAt: new Date(0), body: "" },
                    { id: "2", author: user1, createdAt: new Date(1), body: "" },
                    { id: "3", author: user2, createdAt: new Date(2), body: "" },
                    { id: "4", author: user1, createdAt: new Date(3), body: "" },
                    { id: "5", author: user3, createdAt: new Date(4), body: "" },
                ],
            }
        ]
    });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: true, reason: "test1 and 2 others left a comment" });
})

test("should not contain the author when a user replied in a resolved discussion", () => {
    const pull = mockPull({
        state: PullState.Pending,
        author: me,
        discussions: [
            {
                resolved: true,
                comments: [
                    { id: "1", author: me, createdAt: new Date(0), body: "" },
                    { id: "2", author: user1, createdAt: new Date(1), body: "" },
                ],
            },
        ],
    });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: false });
})

test("should not contain the author when a bot replied to the top-level discussion", () => {
    const pull = mockPull({
        state: PullState.Pending,
        author: me,
        discussions: [
            {
                resolved: false,
                comments: [
                    { id: "1", author: me, createdAt: new Date(0), body: "" },
                    { id: "2", author: user4, createdAt: new Date(1), body: "" },
                ],
            },
        ],
    });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: false });
})

test("should contain a reviewer when a user replied", () => {
    const pull = mockPull({
        state: PullState.Pending,
        author: user1,
        reviews: [
            { author: me, createdAt: new Date(0), lgtm: false },
        ],
        discussions: [
            {
                resolved: false,
                comments: [
                    { id: "1", author: me, createdAt: new Date(0), body: "" },
                    { id: "2", author: user2, createdAt: new Date(1), body: "" },
                ],
            },
        ],
    });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: true, reason: "test2 left a comment" });
})

test("should not contain the author when nobody replied", () => {
    const pull = mockPull({
        state: PullState.Pending,
        author: me,
        discussions: [
            {
                resolved: false,
                comments: [
                    { id: "1", author: me, createdAt: new Date(0), body: "" },
                    { id: "2", author: user1, createdAt: new Date(1), body: "" },
                    { id: "3", author: me, createdAt: new Date(2), body: "" },
                ],
            }
        ]
    });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: false });
})

test("should contain the author when a reviewer left a comment", () => {
    const pull = mockPull({
        state: PullState.Pending,
        author: me,
        reviews: [{ author: user1, createdAt: new Date(0), lgtm: false }],
        discussions: [
            {
                resolved: false,
                comments: [
                    { id: "1", author: user1, createdAt: new Date(0), body: "" },
                ],
            }
        ]
    });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: true, reason: "test1 left a comment" });
})

test("should not contain the author when a non-reviewer left a comment", () => {
    const pull = mockPull({
        state: PullState.Pending,
        author: me,
        discussions: [
            {
                resolved: false,
                comments: [
                    { id: "1", author: user1, createdAt: new Date(0), body: "" },
                ],
            }
        ]
    });
    const attention = isInAttentionSet(connection, pull);
    expect(attention).toEqual({ set: false });
})