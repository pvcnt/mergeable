export type Config = {
    sections: Section[],
    connections: Connection[],
    stars: string[],
}

export type Section = {
    label: string,
    search: string,
    notified: boolean,
}

export type Connection = {
    name?: string,
    host: string,
    baseUrl: string,
    auth: string,
}