import { test, expect } from "@jest/globals";
import { db } from "./db";
import { PullState } from "@repo/types";

test("db should save a connection", async () => {
    const connection = {
        id: "",
        label: "Connection",
        baseUrl: "https://api.github.com",
        host: "github.com",
        auth: "ghp_xxx",
        viewer: "pvcnt",
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
    const star = { uid: "github.com,pvcnt/mergeable,1" };
    const id = await db.stars.add(star);
    await expect(db.stars.get(id)).resolves.toEqual(star);
});

test("db should save a pull", async () => {
    const pull = {
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
        author: {name: "pvcnt", avatarUrl: ""},
        comments: 0,

        uid: "github.com,pvcnt/mergeable,1",
        fetchedAt: new Date(),
        starred: 0,
        sections: ["1", "2"],
    };
    const id = await db.pulls.add(pull);
    await expect(db.pulls.get(id)).resolves.toEqual(pull);
});