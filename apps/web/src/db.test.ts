import { describe, it, expect, afterEach } from "vitest";
import { saveSection, resetSections } from "./db";
import { mockSection } from "@repo/testing";
import { db } from "@repo/storage";

describe("db", () => {
    afterEach(async () => {
        await db.connections.clear();
    })

    it("should save sections", async () => {
        const section = mockSection();
        const id = await saveSection(section);
        await expect(db.sections.count()).resolves.toEqual(1);
        await expect(db.sections.get(id)).resolves.toEqual({ ...section, id });
    })

    it("should reset sections", async () => {
        await saveSection(mockSection());
        await resetSections();
        await expect(db.sections.count()).resolves.toEqual(3);
    })
})