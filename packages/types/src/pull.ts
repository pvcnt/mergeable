import { User } from "./user"

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

export type PullProps = {
    uid: string,
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

export type Pull = PullProps & {
    starred: number,  // boolean is not indexable.
    sections: string[],
}