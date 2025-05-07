import { test, expect } from "vitest";
import { Activity, db } from "../../src/lib/db";
import type { Star } from "../../src/lib/types";
import { mockConnection, mockSection } from "../testing";

test("should save a connection", async () => {
  const connection = mockConnection({
    viewer: {
      user: { id: "u1", name: "pvcnt", avatarUrl: "", bot: false },
      teams: [{ id: "t1", name: "test" }],
    },
    orgs: ["apache", "kubernetes"],
  });
  const id = await db.connections.add(connection);
  await expect(db.connections.get(id)).resolves.toEqual(connection);
});

test("should save a section", async () => {
  const section = mockSection();
  const id = await db.sections.add(section);
  await expect(db.sections.get(id)).resolves.toEqual(section);
});

test("should save a star", async () => {
  const star: Star = { uid: "github.com,pvcnt/mergeable,1" };
  const id = await db.stars.add(star);
  await expect(db.stars.get(id)).resolves.toEqual(star);
});

test("should save an activity", async () => {
  const activity: Activity = {
    name: "syncViewers",
    running: false,
    refreshTime: new Date(),
  };
  const id = await db.activities.add(activity);
  await expect(db.activities.get(id)).resolves.toEqual(activity);
});
