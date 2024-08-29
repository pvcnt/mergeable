import { TestGitHubClient } from "@repo/github";
import { afterEach, beforeEach, it, describe, expect, assert, vi } from "vitest";
import { syncPullsOnce, syncViewersOnce, sendTelemetry } from "../../src/worker/instance.js";
import { db } from "../../src/lib/db.js";
import { mockPull, mockConnection, mockSection } from "@repo/testing";
import nock from "nock";

describe("sync viewers", () => {
    beforeEach(async () => {
        await db.connections.add(mockConnection({ id: "1" }));
        await db.connections.add(mockConnection({ id: "2" }));
    })

    afterEach(async () => {
        await db.activities.clear();
        await db.connections.clear();
    })

    it("should update connections", async () => {
        let activity = await db.activities.get("syncViewers");
        expect(activity).toBeUndefined();

        const client = new TestGitHubClient();
        await syncViewersOnce(client);

        let connection = await db.connections.get("1");
        expect(connection?.viewer).toBeDefined();
        expect(connection?.viewer?.user).toEqual({ name: "test[1]", avatarUrl: "", bot: false });

        connection = await db.connections.get("2");
        expect(connection?.viewer).toBeDefined();
        expect(connection?.viewer?.user).toEqual({ name: "test[2]", avatarUrl: "", bot: false });

        activity = await db.activities.get("syncViewers");
        expect(activity?.running).toBeFalsy();
        expect(activity?.refreshTime.getTime()).toBeGreaterThan(0);
        expect(activity?.refreshTime.getTime()).toBeLessThanOrEqual(Date.now());
    })

    it("should not update connections if recently completed", async () => {
        await db.activities.add({ name: "syncViewers", running: false, refreshTime: new Date() });

        const client = new TestGitHubClient();
        await syncViewersOnce(client);

        const connection = await db.connections.get("1");
        expect(connection?.viewer).toBeUndefined();
    })
})

describe("sync pulls", () => {
    beforeEach(async () => {
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
        let activity = await db.activities.get("syncPulls");
        expect(activity).toBeUndefined();

        // GIVEN some pull requests are returned from GitHub.
        let connection = await db.connections.get("1");
        assert(connection !== undefined);

        const client = new TestGitHubClient();
        client.setPullsBySearch(connection, "author:@me draft:true", [
            mockPull({ id: "PR_1", connection: connection.id }),
            mockPull({ id: "PR_2", connection: connection.id }),
        ]);
        client.setPullsBySearch(connection, "author:@me draft:false", [
            mockPull({ id: "PR_4", connection: connection.id }),
        ]);
        client.setPullsBySearch(connection, "author:@me review:approved", [
            mockPull({ id: "PR_1", connection: connection.id }),
            mockPull({ id: "PR_3", connection: connection.id }),
        ]);

        connection = await db.connections.get("2");
        assert(connection !== undefined);
        client.setPullsBySearch(connection, "author:@me draft:true", [
            mockPull({ id: "PR_1", connection: connection.id }),
        ]);
        client.setPullsBySearch(connection, "author:@me review:approved", [
            mockPull({ id: "PR_2", connection: connection.id }),
        ]);

        // WHEN syncing pull requests.
        await syncPullsOnce(client);

        // THEN every pull request must be present in the database.
        const pks = await db.pulls.toCollection().primaryKeys();
        expect(pks.sort()).toEqual(["1:PR_1", "1:PR_2", "1:PR_3", "1:PR_4", "2:PR_1", "2:PR_2"]);

        // THEN every pull request must be in the correct section(s).
        let pull = await db.pulls.get("1:PR_1");
        expect(pull).toBeDefined();
        expect(pull?.sections).toEqual(["1", "2"]);

        pull = await db.pulls.get("1:PR_2");
        expect(pull).toBeDefined();
        expect(pull?.sections).toEqual(["1"]);

        pull = await db.pulls.get("1:PR_3");
        expect(pull).toBeDefined();
        expect(pull?.sections).toEqual(["2"]);

        pull = await db.pulls.get("1:PR_4");
        expect(pull).toBeDefined();
        expect(pull?.sections).toEqual(["1"]);

        // THEN the activity should have been updated.
        activity = await db.activities.get("syncPulls");
        expect(activity?.running).toBeFalsy();
        expect(activity?.refreshTime.getTime()).toBeGreaterThan(0);
        expect(activity?.refreshTime.getTime()).toBeLessThanOrEqual(Date.now());
    })

    it("should not update pulls if recently completed", async () => {
        await db.activities.add({ name: "syncPulls", running: false, refreshTime: new Date() });

        const client = new TestGitHubClient();
        await syncPullsOnce(client);

        expect(await db.pulls.count()).toBe(0);
    })
})

describe("send telemetry", () => {
    beforeEach(() => {
        nock.disableNetConnect();
    })

    afterEach(async () => {
        vi.unstubAllEnvs();
        nock.enableNetConnect();
        await db.activities.clear();
    })

    it("should send telemetry", async () => {
        let activity = await db.activities.get("sendTelemetry");
        expect(activity).toBeUndefined();

        // WHEN sending telemetry.
        nock("https://mergeable-telemetry.pvcnt.workers.dev")
            .post("/api/v1/sample")
            .reply(200);
        await sendTelemetry();

        // THEN the activity should have been updated.
        activity = await db.activities.get("sendTelemetry");
        expect(activity?.running).toBeFalsy();
        expect(activity?.refreshTime.getTime()).toBeGreaterThan(0);
        expect(activity?.refreshTime.getTime()).toBeLessThanOrEqual(Date.now());
    })

    it("should not send telemetry if recently completed", async () => {
        await db.activities.add({ name: "sendTelemetry", running: false, refreshTime: new Date() });

        await sendTelemetry();
    })
})