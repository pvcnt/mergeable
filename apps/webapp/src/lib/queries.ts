import { db } from "./db";
import { useLiveQuery } from "dexie-react-hooks";
import { defaultSections } from "@repo/types";

// Defaults to populate after adding new fields.
const connectionDefaults = { orgs: [] };
const sectionDefaults = { attention: false };

export const useConnections = () => {
    const data = useLiveQuery(() => db.connections.toArray());
    return { isLoaded: data !== undefined, data: data?.map(v => ({ ...connectionDefaults, ...v})) || [] };
}

export const useActivity = (name: string) => {
    return useLiveQuery(() => db.activities.get(name));
}

export const useSections = () => {
    const data = useLiveQuery(() => db.sections.orderBy("position").toArray());
    const isLoaded = data !== undefined;

    if (isLoaded && data.length === 0) {
        // If data was successfully loaded but we have no sections, populate with
        // default sections, to avoid starting with an empty dashboard. This is
        // a one-time operation, those sections will then behave as regular sections.
        db.transaction("rw", db.sections, async () => {
            const count = await db.sections.count();
            if (count > 0) {
                return;
            }
            for (const [ idx, section ] of defaultSections.entries()) {
                await db.sections.add({ ...section, position: idx });
            }
        }).catch(console.error);
    }

    return { isLoaded, data: data?.map(v => ({...sectionDefaults, ...v})) || [] };
}

type PullQuery = {
    starred?: number,
}

export const usePulls = (q?: PullQuery) => {
    const where = (q !== undefined)
        ? Object.fromEntries(Object.entries(q).filter(kv => kv[1] !== undefined))
        : undefined;
    const data = useLiveQuery(() => {
        const coll = where !== undefined ? db.pulls.where(where) : db.pulls.toCollection();
        return coll.reverse().sortBy("updatedAt");
    });
    const isLoading = data === undefined;
    return { isLoading, data: data || [] };
}