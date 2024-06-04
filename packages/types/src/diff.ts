export type DiffList = {
    total: number
    hasMore: boolean
    diffs: Diff[]
}

export enum DiffState {
    Draft = 1,
    Pending,
    Approved,
    ChangesRequested,
    Merged,
    Closed,
}

export type Diff = {
    host: string,
    repository: string,
    id: string,
    title: string,
    state: DiffState,
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