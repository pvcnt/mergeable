import Dexie, { type EntityTable } from "dexie";
import type { Connection, Section, Star } from "../lib/types";

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
  activities: EntityTable<Activity, "name">;
};

db.version(1).stores({
  // Config.
  connections: "++id",
  sections: "++id, position",
  stars: "uid",

  // Cache.
  activities: "name",
});
