import type { Profile } from "./user.js"

/**
 * Properties for a section, as provided by a user in a form or API.
 */
export type SectionProps = {
    label: string,
    search: string,
    attention: boolean,
}

export const defaultSections: SectionProps[] = [
    {
        label: "Incoming reviews",
        search: "is:open -author:@me review-requested:@me ; is:open -author:@me involves:@me",
        attention: true,
    },
    {
        label: "Outgoing reviews",
        search: "is:open author:@me draft:false",
        attention: true,
    },
    {
        label: "Draft reviews",
        search: "is:open author:@me draft:true",
        attention: true,
    }
];

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
export const defaultSectionProps: SectionProps = { label: "", search: "", attention: true };

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