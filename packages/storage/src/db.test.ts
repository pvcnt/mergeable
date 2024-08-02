import { test, expect } from "vitest";
import { Activity, db } from "./db";
import { Connection, Pull, PullState, Star } from "@repo/types";

test("db should save a connection", async () => {
    const connection: Connection = {
        id: "",
        label: "Connection",
        baseUrl: "https://api.github.com",
        host: "github.com",
        auth: "ghp_xxx",
        viewer: {
            user: { uid: "1:1", name: "pvcnt", avatarUrl: "" },
            teams: [{ uid: "1:1", name: "test" }],
        },
        orgs: ["apache", "kubernetes"],
    };
    const id = await db.connections.add(connection);
    await expect(db.connections.get(id)).resolves.toEqual(connection);
});

test("db should save a section", async () => {
    const section = {
        id: "",
        label: "label",
        search: "author:@me",
        notified: false,
        position: 0,
    };
    const id = await db.sections.add(section);
    await expect(db.sections.get(id)).resolves.toEqual(section);
});

test("db should save a star", async () => {
    const star: Star = { uid: "github.com,pvcnt/mergeable,1" };
    const id = await db.stars.add(star);
    await expect(db.stars.get(id)).resolves.toEqual(star);
});

test("db should save a pull", async () => {
    const pull: Pull = {
        uid: "1:1",
        host: "github.com",
        repo: "pvcnt/mergeable",
        number: 1,
        title: "Title",
        state: PullState.Approved,
        createdAt: "now",
        updatedAt: "now",
        url: "https://github.com/pvcnt/mergeable/1",
        additions: 0,
        deletions: 0,
        author: { uid: "1:1", name: "pvcnt", avatarUrl: "" },
        comments: 0,
        starred: 0,
        sections: ["1", "2"],
    };
    const id = await db.pulls.add(pull);
    await expect(db.pulls.get(id)).resolves.toEqual(pull);
});

test("db should save an activity", async () => {
    const activity: Activity = { name: "syncViewers", running: false, refreshTime: new Date() };
    const id = await db.activities.add(activity);
    await expect(db.activities.get(id)).resolves.toEqual(activity);
});