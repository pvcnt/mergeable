import type { Team, User } from "./user.js"

export enum PullState {
    Draft,
    Pending,
    Approved,
    Merged,
    Closed,
}

export enum CheckState {
    Pending,
    Error,
    Failure,
    Success,
}

export type PullProps = {
    uid: string,
    host: string,
    repo: string,
    number: number,
    title: string,
    state: PullState,
    ciState?: CheckState,
    createdAt: string,
    updatedAt: string,
    url: string,
    additions: number,
    deletions: number,
    comments: number,
    author: User,
    requestedReviewers: User[],
    requestedTeams: Team[],
    reviewers: User[],
}

export type Attention = {
    set: boolean
    reason?: string
}

export type Pull = PullProps & {
    starred: number, // boolean is not indexable.
    sections: string[],
    attention?: Attention,
}