/**
 * Values for a section, as provided by a user in a form or API.
 */
export type SectionValue = {
    label: string,
    search: string,
    notified: boolean,
}

export type Section = SectionValue & {
    id: string,
    position: number,
}

/**
 * Values for a connection, as provided by a user in a form or API.
 */
export type ConnectionValue = {
    label: string,
    baseUrl: string,
    auth: string,
    orgs: string[],
}

export type Connection = ConnectionValue & {
    id: string,
    host: string,
    viewer: string,
}

export type Star = {
    uid: string,
}