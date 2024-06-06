import { db } from "@repo/storage";
import { useLiveQuery } from "dexie-react-hooks";
import { defaultSections } from "./config";

export const useConnections = () => {
    const data = useLiveQuery(() => db.connections.toArray());
    return { isLoaded: data !== undefined, data: data || [] };
}

export const useSections = () => {
    const data = useLiveQuery(() => db.sections.toArray());
    const isLoaded = data !== undefined;
    return { isLoaded, data: (isLoaded && data.length > 0) ? data : defaultSections };
}