import Dexie, { type EntityTable } from "dexie";
import type { Connection, Section, Star } from "../lib/types";
import { Pull } from "@repo/github";

export type Activity = {
  name: string;
  running: boolean;
  refreshTime: Date;
};

export const db = new Dexie("webapp") as Dexie & {
  // Config.
  connections: EntityTable<Connection, "id">;
  sections: EntityTable<Section, "id">;
  stars: EntityTable<Star, "uid">;

  // Cache.
  pulls: EntityTable<Pull, "uid">;
  activities: EntityTable<Activity, "name">;
};

db.version(1).stores({
  // Config.
  connections: "++id",
  sections: "++id, position",
  stars: "uid",

  // Cache.
  pulls: "uid, host, repo, number, starred, *sections",
  activities: "name",
});
