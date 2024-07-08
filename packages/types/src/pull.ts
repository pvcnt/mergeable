export type PullList = {
    total: number
    hasMore: boolean
    pulls: Pull[]
}

export enum PullState {
    Draft,
    Pending,
    Approved,
    Merged,
    Closed,
}

export type PullValue = {
    host: string,
    repo: string,
    number: number,
    title: string,
    state: PullState,
    createdAt: string,
    updatedAt: string,
    url: string,
    additions: number,
    deletions: number,
    comments: number,
    author: User,
}

export type User = {
    name: string,
    avatarUrl: string,
}

export type Pull = PullValue & {
    uid: string,
    fetchedAt: Date,
    starred: number,  // boolean is not indexable.
    sections: string[],
}