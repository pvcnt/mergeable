import { describe, it, expect, afterEach } from "vitest";
import { mockSection } from "../testing";
import {
  saveSection,
  resetSections,
  createConnection,
  deleteConnections,
} from "../../src/lib/mutations";
import { db } from "../../src/lib/db";

const viewer = {
  user: { id: "u1", name: "pvcnt", avatarUrl: "", bot: false },
  teams: [],
};

describe("mutations", () => {
  afterEach(async () => {
    await db.connections.clear();
    await db.sections.clear();
  });

  it("should save sections", async () => {
    const section = mockSection();
    const id = await saveSection(section);
    await expect(db.sections.count()).resolves.toEqual(1);
    await expect(db.sections.get(id)).resolves.toEqual({ ...section, id });
  });

  it("should reset sections", async () => {
    await saveSection(mockSection());
    await resetSections();
    await expect(db.sections.count()).resolves.toEqual(3);
  });

  it("should create a connection", async () => {
    const props = {
      label: "Label",
      auth: "ghp_token",
      orgs: [],
    };
    const id = await createConnection(
      { ...props, baseUrl: "https://api.github.com" },
      viewer,
    );
    await expect(db.connections.get(id)).resolves.toEqual({
      id: 1,
      ...props,
      baseUrl: "https://api.github.com",
      host: "github.com",
      viewer,
    });
  });

  it("should delete all connections", async () => {
    await createConnection(
      { baseUrl: "https://github.com", auth: "", label: "", orgs: [] },
      viewer,
    );
    await createConnection(
      { baseUrl: "https://github.com", auth: "", label: "", orgs: [] },
      viewer,
    );
    await expect(db.connections.count()).resolves.toEqual(2);
    await deleteConnections();
    await expect(db.connections.count()).resolves.toEqual(0);
  });
});
