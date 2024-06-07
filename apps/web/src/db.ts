import { db } from "@repo/storage";
import { useLiveQuery } from "dexie-react-hooks";
import { Connection, Pull, Section } from "@repo/types";
import { omit } from "remeda"

export const useConnections = () => {
    const data = useLiveQuery(() => db.connections.toArray());
    return { isLoaded: data !== undefined, data: data || [] };
}

export const saveConnection = (value: Connection) => {
    if (value.id.length === 0) {
        db.connections.add(omit(value, ["id"])).catch(console.error);
    } else {
        db.connections.put(value).catch(console.error);
    }
}

export const deleteConnection = (value: Connection) => {
    db.connections.delete(value.id).catch(console.error)
}

const defaultSections: Section[] = [
    {
        id: "",
        label: "Needs your review",
        search: "is:open review-requested:@me -review:approved -reviewed-by:@me",
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

export const saveSection = (value: Section) => {
    if (value.id.length === 0) {
        db.sections.add(omit(value, ["id"])).catch(console.error);
    } else {
        db.sections.put(value).catch(console.error);
    }
}

export const deleteSection = (value: Section) => {
    db.sections.delete(value.id).catch(console.error);
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

export const useStars = () => {
    const data = useLiveQuery(() => db.stars.toArray());
    const uids = data !== undefined ? new Set(data.map(v => v.uid)) : new Set();
    const isStarred = (pull: Pull) => uids.has(pull.uid)
    return { isLoaded: data !== undefined, data: data || [], isStarred };
}

export const toggleStar = (pull: Pull) => {
    db.transaction("rw", db.stars, async () => {
        const star = await db.stars.get(pull.uid);
        if (star === undefined) {
            await db.stars.add({uid: pull.uid});
        } else {
            await db.stars.delete(pull.uid);
        }
    }).catch(console.error);
}