export type PullList = {
    total: number
    hasMore: boolean
    pulls: Pull[]
}

export enum PullState {
    Draft = 1,
    Pending,
    Approved,
    ChangesRequested,
    Merged,
    Closed,
}

export type Pull = {
    host: string,
    repository: string,
    id: string,
    title: string,
    state: PullState,
    createdAt: string,
    updatedAt: string,
    url: string,
    additions: number,
    deletions: number,
    author: User,
}

export type User = {
    name: string,
    avatarUrl: string,
}