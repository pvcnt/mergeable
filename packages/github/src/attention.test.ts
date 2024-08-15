import { describe, it, expect, beforeEach } from "vitest";
import { isInAttentionSet } from "./attention";
import { TestGitHubClient } from "./client";
import { mockConnection, mockPull } from "@repo/testing";
import { PullState } from "@repo/types";

describe("attention set", () => {
    const client = new TestGitHubClient();
    const me =  { name: "test", avatarUrl: "" };
    const user1 =  { name: "test1", avatarUrl: "" };
    const user2 =  { name: "test2", avatarUrl: "" };
    const user3 =  { name: "test3", avatarUrl: "" };
    const connection = mockConnection({ viewer: { user: me, teams: []}});

    beforeEach(() => {
        client.clear();
    })

    it("should contain the author when pull is approved", async () => {
        const pull = mockPull({ state: PullState.Approved, author: me });
        const attention = await isInAttentionSet(client, connection, pull);
        expect(attention).toEqual({ set: true, reason: "Pull request is approved" });
    })

    it("should contain only the author when pull is approved", async () => {
        const pull = mockPull({ state: PullState.Approved });
        const attention = await isInAttentionSet(client, connection, pull);
        expect(attention).toEqual({ set: false });
    })

    it("should contain a requested reviewer when pull is not approved", async () => {
        const pull = mockPull({ state: PullState.Pending, requestedReviewers: [me] });
        const attention = await isInAttentionSet(client, connection, pull);
        expect(attention).toEqual({ set: true, reason: "Review is requested" });
    })

    it("should be empty when pull is draft", async () => {
        const pull = mockPull({ state: PullState.Draft, author: me });
        const attention = await isInAttentionSet(client, connection, pull);
        expect(attention).toEqual({ set: false });
    })

    it("should be empty when pull is merged", async () => {
        const pull = mockPull({ state: PullState.Merged, author: me });
        const attention = await isInAttentionSet(client, connection, pull);
        expect(attention).toEqual({ set: false });
    })

    it("should be empty when pull is closed", async () => {
        const pull = mockPull({ state: PullState.Closed, author: me });
        const attention = await isInAttentionSet(client, connection, pull);
        expect(attention).toEqual({ set: false });
    })

    it("should contain the author when a user replied", async () => {
        const pull = mockPull({ state: PullState.Pending, author: me });
        const comments = [
            { uid: "1", author: me, createdAt: new Date(0) },
            { uid: "2", inReplyTo: "1", author: user1, createdAt: new Date(1) },
        ];
        client.setComments(connection, pull.repo, pull.number, comments);
        const attention = await isInAttentionSet(client, connection, pull);
        expect(attention).toEqual({ set: true, reason: "test1 left a comment" });
    })

    it("should contain the author when two users replied", async () => {
        const pull = mockPull({ state: PullState.Pending, author: me });
        const comments = [
            { uid: "1", author: me, createdAt: new Date(0) },
            { uid: "2", inReplyTo: "1", author: user1, createdAt: new Date(1) },
            { uid: "3", inReplyTo: "1", author: user2, createdAt: new Date(2) },
        ];
        client.setComments(connection, pull.repo, pull.number, comments);
        const attention = await isInAttentionSet(client, connection, pull);
        expect(attention).toEqual({ set: true, reason: "test1 and 1 other left a comment" });
    })

    it("should contain the author when three users replied", async () => {
        const pull = mockPull({ state: PullState.Pending, author: me });
        const comments = [
            { uid: "1", author: me, createdAt: new Date(0) },
            { uid: "2", inReplyTo: "1", author: user1, createdAt: new Date(1) },
            { uid: "3", inReplyTo: "1", author: user2, createdAt: new Date(2) },
            { uid: "4", inReplyTo: "1", author: user1, createdAt: new Date(3) },
            { uid: "5", inReplyTo: "1", author: user3, createdAt: new Date(4) },
        ];
        client.setComments(connection, pull.repo, pull.number, comments);
        const attention = await isInAttentionSet(client, connection, pull);
        expect(attention).toEqual({ set: true, reason: "test1 and 2 others left a comment" });
    })

    it("should contain a reviewer when a user replied", async () => {
        const pull = mockPull({ state: PullState.Pending, author: user1, reviewers: [me] });
        const comments = [
            { uid: "1", author: me, createdAt: new Date(0) },
            { uid: "2", inReplyTo: "1", author: user2, createdAt: new Date(1) },
        ];
        client.setComments(connection, pull.repo, pull.number, comments);
        const attention = await isInAttentionSet(client, connection, pull);
        expect(attention).toEqual({ set: true, reason: "test2 left a comment" });
    })

    it("should not contain the author when nobody replied", async () => {
        const pull = mockPull({ state: PullState.Pending, author: me });
        const comments = [
            { uid: "1", author: me, createdAt: new Date(0) },
            { uid: "2", inReplyTo: "1", author: user1, createdAt: new Date(1) },
            { uid: "3", inReplyTo: "1", author: me, createdAt: new Date(3) },
        ];
        client.setComments(connection, pull.repo, pull.number, comments);
        const attention = await isInAttentionSet(client, connection, pull);
        expect(attention).toEqual({ set: false });
    })

    it("should contain the author when a reviewer left a comment", async () => {
        const pull = mockPull({ state: PullState.Pending, author: me, reviewers: [user1] });
        const comments = [
            { uid: "1", author: user1, createdAt: new Date(0) },
        ];
        client.setComments(connection, pull.repo, pull.number, comments);
        const attention = await isInAttentionSet(client, connection, pull);
        expect(attention).toEqual({ set: true, reason: "test1 left a comment" });
    })

    it("should not contain the author when a non-reviewer left a comment", async () => {
        const pull = mockPull({ state: PullState.Pending, author: me });
        const comments = [
            { uid: "1", author: user1, createdAt: new Date(0) },
        ];
        client.setComments(connection, pull.repo, pull.number, comments);
        const attention = await isInAttentionSet(client, connection, pull);
        expect(attention).toEqual({ set: false });
    })
})