import { db } from "@repo/storage";
import { useLiveQuery } from "dexie-react-hooks";
import type { Connection, Pull, Section } from "@repo/types";
import { omit } from "remeda";

// Defaults to populate after adding new fields.
const connectionDefaults = { orgs: [] };

export const useConnections = () => {
    const data = useLiveQuery(() => db.connections.toArray());
    return { isLoaded: data !== undefined, data: data?.map(v => ({...connectionDefaults, ...v})) || [] };
}

export async function saveConnection (value: Connection): Promise<void> {
    if (value.id.length === 0) {
        return db.connections.add(omit(value, ["id"]))
            .then(() => {})
            .catch(console.error);
    } else {
        return db.connections.put(value)
            .then(() => {})
            .catch(console.error);
    }
}

export async function deleteConnection(value: Connection): Promise<void> {
    await db.connections.delete(value.id).catch(console.error)
}

export const useRefreshTime = (method: string) => {
    const data = useLiveQuery(() => db.activities.get(method));
    return data && data.refreshTime;
}

const defaultSections: Section[] = [
    {
        id: "",
        label: "Needs your review",
        search: "is:open review-requested:@me -review:approved -reviewed-by:@me draft:false",
        notified: true,
        position: 0,
    },
    {
        id: "",
        label: "Changes requested",
        search: "is:open author:@me review:changes_requested",
        notified: true,
        position: 1,
    },
    {
        id: "",
        label: "Approved",
        search: "is:open author:@me review:approved",
        notified: false,
        position: 2,
    },
    {
        id: "",
        label: "Waiting for reviewers",
        search: "is:open author:@me review:none draft:false",
        notified: false,
        position: 3,
    },
    {
        id: "",
        label: "Waiting for the author",
        search: "is:open review-requested:@me review:changes_requested",
        notified: false,
        position: 4,
    },
    {
        id: "",
        label: "Draft",
        search: "is:open author:@me draft:true",
        notified: false,
        position: 5,
    }
];

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
            for (const section of defaultSections) {
                await db.sections.add(omit(section, ["id"]));
            }
        }).catch(console.error);
    }

    return { isLoaded, data: data || [] };
}

export async function saveSection(value: Section): Promise<void> {
    if (value.id.length === 0) {
        await db.sections.add(omit(value, ["id"]));
    } else {
        await db.sections.put(value);
    }
}

export async function deleteSection(value: Section): Promise<void> {
    await db.sections.delete(value.id);
}

export const moveSectionUp = (value: Section) => {
    db.transaction("rw", db.sections, async () => {
        const above = await db.sections.where("position").equals(value.position - 1).first();
        if (above === undefined) {
            // Already the top section.
            return;
        }
        await db.sections.update(above, {"position": value.position});
        await db.sections.update(value, {"position": above.position});
    }).catch(console.error);
}

export const moveSectionDown = (value: Section) => {
    db.transaction("rw", db.sections, async () => {
        const below = await db.sections.where("position").equals(value.position + 1).first();
        if (below === undefined) {
            // Already the bottom section.
            return;
        }
        await db.sections.update(below, {"position": value.position});
        await db.sections.update(value, {"position": below.position});
    }).catch(console.error);
}

export const toggleStar = async (pull: Pull) => {
    if (pull.starred) {
        await db.stars.delete(pull.uid).catch(console.error);
        await db.pulls.update(pull.uid, {starred: 0});
    } else {
        await db.stars.add({uid: pull.uid});
        await db.pulls.update(pull.uid, {starred: 1});
    };
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