import { TestGitHubClient } from "@repo/github";
import { afterEach, beforeEach, it, describe, expect, assert } from "vitest";
import { syncPullsOnce, syncViewersOnce } from "./instance";
import { db } from "@repo/storage";
import { mockPull, mockConnection, mockSection } from "@repo/testing";

describe("sync viewers", () => {
    let client: TestGitHubClient|undefined;

    beforeEach(async () => {
        client = new TestGitHubClient();
        await db.connections.add(mockConnection({ id: "1" }));
        await db.connections.add(mockConnection({ id: "2" }));
    })

    afterEach(async () => {
        await db.activities.clear();
        await db.connections.clear();
    })

    it("should update connections", async () => {
        assert(client !== undefined);
        await syncViewersOnce(client);

        let connection = await db.connections.get("1");
        expect(connection).toBeDefined();
        expect(connection?.viewer?.user).toEqual({ name: "test[1]", avatarUrl: "" });

        connection = await db.connections.get("2");
        expect(connection?.viewer).toBeDefined();
        expect(connection?.viewer?.user).toEqual({ name: "test[2]", avatarUrl: "" });
    })

    it("should update activity", async () => {
        assert(client !== undefined);

        let activity = await db.activities.get("syncViewers");
        expect(activity).toBeUndefined();

        await syncViewersOnce(client);

        activity = await db.activities.get("syncViewers");
        expect(activity?.running).toBeFalsy();
        expect(activity?.refreshTime.getTime()).toBeGreaterThan(0);
        expect(activity?.refreshTime.getTime()).toBeLessThanOrEqual(Date.now());
    })
})

describe("sync pulls", () => {
    let client: TestGitHubClient|undefined;

    beforeEach(async () => {
        client = new TestGitHubClient();
        await db.connections.add(mockConnection({ id: "1" }));
        await db.connections.add(mockConnection({ id: "2" }));
        await db.sections.add(mockSection({ id: "1", search: "author:@me draft:true;author:@me draft:false" }));
        await db.sections.add(mockSection({ id: "2", search: "author:@me review:approved" }));
    })

    afterEach(async () => {
        await db.activities.clear();
        await db.connections.clear();
        await db.sections.clear();
        await db.pulls.clear();
    })

    it("should update pulls", async () => {
        assert(client !== undefined);

        // GIVEN some pull requests are returned from GitHub.
        let connection = await db.connections.get("1");
        assert(connection !== undefined);
        client.setPulls(connection, "author:@me draft:true", [
            mockPull({ uid: "1:1" }),
            mockPull({ uid: "1:2" }),
        ]);
        client.setPulls(connection, "author:@me draft:false", [
            mockPull({ uid: "1:4" }),
        ]);
        client.setPulls(connection, "author:@me review:approved", [
            mockPull({ uid: "1:1" }),
            mockPull({ uid: "1:3" }),
        ]);

        connection = await db.connections.get("2");
        assert(connection !== undefined);
        client.setPulls(connection, "author:@me draft:true", [
            mockPull({ uid: "2:1" }),
        ]);
        client.setPulls(connection, "author:@me review:approved", [
            mockPull({ uid: "2:2" }),
        ]);

        // WHEN syncing pull requests.
        await syncPullsOnce(client);

        // THEN every pull request must be present in the database.
        const pks = await db.pulls.toCollection().primaryKeys();
        expect(pks.sort()).toEqual(["1:1", "1:2", "1:3", "1:4", "2:1", "2:2"]);

        // THEN every pull request must be in the correct section(s).
        let pull = await db.pulls.get("1:1");
        expect(pull?.sections).toEqual(["1", "2"]);

        pull = await db.pulls.get("1:2");
        expect(pull?.sections).toEqual(["1"]);

        pull = await db.pulls.get("1:3");
        expect(pull?.sections).toEqual(["2"]);

        pull = await db.pulls.get("1:4");
        expect(pull?.sections).toEqual(["1"]);
    })

    it("should update activity", async () => {
        assert(client !== undefined);

        let activity = await db.activities.get("syncPulls");
        expect(activity).toBeUndefined();

        await syncPullsOnce(client);

        activity = await db.activities.get("syncPulls");
        expect(activity?.running).toBeFalsy();
        expect(activity?.refreshTime.getTime()).toBeGreaterThan(0);
        expect(activity?.refreshTime.getTime()).toBeLessThanOrEqual(Date.now());
    })
})