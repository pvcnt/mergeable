import type { Connection, Section, Star } from "@repo/types";
import Dexie, { type EntityTable } from "dexie";

export const db = new Dexie("reviewer") as Dexie & {
    connections: EntityTable<Connection, "id">;
    sections: EntityTable<Section, "id">;
    stars: EntityTable<Star, "uid">;
};

db.version(1).stores({
    connections: "++id, label, host, baseUrl, auth",
    sections: "++id, label, search, notified, position",
    stars: "uid",
});