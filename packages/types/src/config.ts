export type Config = {
    connections: LegacyConnection[],
    stars: string[],
}

export type Section = {
    id: string,
    label: string,
    search: string,
    notified: boolean,
}

export type LegacyConnection = {
    name?: string,
    host: string,
    baseUrl: string,
    auth: string,
}

export type Connection = {
    id: string,
    label: string,
    host: string,
    baseUrl: string,
    token: string,
}