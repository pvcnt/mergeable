import { Profile } from "./user"

/**
 * Properties for a section, as provided by a user in a form or API.
 */
export type SectionProps = {
    label: string,
    search: string,
    notified: boolean,
    attention: boolean,
}

export const defaultSections: SectionProps[] = [
    {
        label: "Incoming reviews",
        search: "is:open -author:@me review-requested:@me ; is:open -author:@me involves:@me",
        notified: true,
        attention: true,
    },
    {
        label: "Outgoing reviews",
        search: "is:open author:@me draft:false",
        notified: true,
        attention: true,
    },
    {
        label: "Draft reviews",
        search: "is:open author:@me draft:true",
        notified: false,
        attention: false,
    }
];

/**
 * Split a search string into multiple GitHub search queries.
 * 
 * Multiple queries can be concatenated in a single search string by using
 * a semi-colon (";") as a delimiter. Individual queries are trimmed, and
 * empty queries are ignored.
 *
 * @param search A search string.
 * @returns A list of search queries.
 */
export function splitQueries(search: string): string[] {
    const queries: string[] = [];
    let query = "";
    let quoted = false;
    for (const c of search) {
        if (c === ';' && !quoted) {
            queries.push(query);
            query = "";
        } else if (c === '"') {
            quoted = !quoted;
        } else {
            query += c;
        }
    }
    queries.push(query);
    return queries.map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Join multiple GitHub search queries into a single search string.
 *
 * @param queries A list of search queries.
 * @returns A search string.
 */
export function joinQueries(queries: string[]): string {
    return queries.map(s => s.trim()).filter(s => s.length > 0).join(";");
}

/**
 * A section, as saved in the database.
 */
export type Section = SectionProps & {
    id: string,
    position: number,
}

/**
 * Default properties for a new section.
 */
export const defaultSectionProps: SectionProps = { label: "", search: "", notified: false, attention: true };

/**
 * Properties for a connection, as provided by a user in a form or API.
 */
export type ConnectionProps = {
    label: string,
    baseUrl: string,
    host: string,
    auth: string,
    orgs: string[],
}

/**
 * A connection, as saved in the database.
 */
export type Connection = ConnectionProps & {
    id: string
    viewer?: Profile
}

/**
 * A star, as saved in the database.
 */
export type Star = {
    uid: string
}