import { test, expect } from "@jest/globals";
import { db } from "./db";

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