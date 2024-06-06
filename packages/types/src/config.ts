export type Config = {
    stars: string[],
}

export type Section = {
    id: string,
    label: string,
    search: string,
    notified: boolean,
}

export type Connection = {
    id: string,
    label: string,
    host: string,
    baseUrl: string,
    token: string,
}