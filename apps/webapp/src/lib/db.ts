import Dexie, { type EntityTable } from "dexie";
import type { Connection, Section, Star } from "../lib/types";

export const db = new Dexie("webapp") as Dexie & {
  connections: EntityTable<Connection, "id">;
  sections: EntityTable<Section, "id">;
  stars: EntityTable<Star, "uid">;
};

db.version(1).stores({
  connections: "++id",
  sections: "++id, position",
  stars: "uid",
});
