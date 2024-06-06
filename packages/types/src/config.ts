export type Section = {
    id: string,
    label: string,
    search: string,
    notified: boolean,
    position: number,
}

export type Connection = {
    id: string,
    label: string,
    host: string,
    baseUrl: string,
    token: string,
}

export type Star = {
    uid: string,
}