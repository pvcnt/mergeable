import { db } from "./db";
import type { Pull } from "../lib/github/types";
import { defaultSections, type Connection, type Section } from "../lib/types";
import { omit } from "remeda";

export async function saveConnection(value: Connection): Promise<void> {
  if (value.id.length === 0) {
    await db.connections.add(omit(value, ["id"]));
  } else {
    await db.connections.put(value);
  }
}

export async function deleteConnection(value: Connection): Promise<void> {
  await db.connections.delete(value.id);
}

export async function deleteConnections(): Promise<void> {
  await db.connections.clear();
}

export async function saveSection(value: Section): Promise<string> {
  if (value.id.length === 0) {
    return await db.sections.add(omit(value, ["id"]));
  } else {
    await db.sections.put(value);
    return value.id;
  }
}

export async function deleteSection(value: Section): Promise<void> {
  await db.sections.delete(value.id);
}

export const moveSectionUp = (value: Section) => {
  db.transaction("rw", db.sections, async () => {
    const above = await db.sections
      .where("position")
      .equals(value.position - 1)
      .first();
    if (above === undefined) {
      // Already the top section.
      return;
    }
    await db.sections.update(above, { position: value.position });
    await db.sections.update(value, { position: above.position });
  }).catch(console.error);
};

export const moveSectionDown = (value: Section) => {
  db.transaction("rw", db.sections, async () => {
    const below = await db.sections
      .where("position")
      .equals(value.position + 1)
      .first();
    if (below === undefined) {
      // Already the bottom section.
      return;
    }
    await db.sections.update(below, { position: value.position });
    await db.sections.update(value, { position: below.position });
  }).catch(console.error);
};

export async function resetSections(): Promise<void> {
  await db.transaction("rw", db.sections, async () => {
    await db.sections.clear();
    for (const [idx, section] of defaultSections.entries()) {
      await db.sections.add({ ...section, position: idx });
    }
  });
}

export const toggleStar = async (pull: Pull) => {
  await db.transaction("rw", db.stars, async () => {
    const star = await db.stars.get(pull.uid);
    if (star) {
      await db.stars.delete(pull.uid);
    } else {
      await db.stars.add({ uid: pull.uid });
    }
  });
};
