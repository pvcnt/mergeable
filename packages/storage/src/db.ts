import type { Connection, Pull, Section, Star } from "@repo/types";
import Dexie, { type EntityTable } from "dexie";

export type Activity = {
    method: string
    refreshTime: Date
}

export const db = new Dexie("webapp") as Dexie & {
    // Config.
    connections: EntityTable<Connection, "id">;
    sections: EntityTable<Section, "id">;
    stars: EntityTable<Star, "uid">;

    // Cache.
    pulls: EntityTable<Pull, "uid">,
    activities: EntityTable<Activity, "method">,
};

db.version(1).stores({
    // Config.
    connections: "++id",
    sections: "++id, position",
    stars: "uid",

    // Cache.
    pulls: "uid, host, repo, number, starred, *sections",
    activities: "method",
});