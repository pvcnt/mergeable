import type { Connection, Section } from "@repo/types";
import Dexie, { type EntityTable } from "dexie";

export const db = new Dexie("reviewer") as Dexie & {
    connections: EntityTable<Connection, "id">;
    sections: EntityTable<Section, "id">;
};

db.version(1).stores({
    connections: "++id, label, host, baseUrl, token",
    sections: "++id, label, search, notified",
});