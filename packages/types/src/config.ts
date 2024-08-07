import { Profile } from "./user"

/**
 * Properties for a section, as provided by a user in a form or API.
 */
export type SectionProps = {
    label: string,
    search: string,
    notified: boolean,
}

/**
 * A section, as saved in the database.
 */
export type Section = SectionProps & {
    id: string,
    position: number,
}

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