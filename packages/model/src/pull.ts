import type { Team, User } from "./user.js";

export type PullResult = {
    id: string
    updatedAt: Date
}

export enum PullState {
    Draft,
    Pending,
    Approved,
    Merged,
    Closed,
}

export enum CheckState {
    None,
    Pending,
    Error,
    Failure,
    Success,
}

export type Review = {
    author?: User
    createdAt: Date
    lgtm: boolean
}

export type Comment = {
    id: string
    author?: User
    body: string
    createdAt: Date
}

export type Discussion = {
    resolved: boolean
    comments: Comment[]
    file?: {
        path: string
    }
}

export type PullProps = {
    id: string
    repo: string
    number: number
    title: string
    state: PullState
    ciState: CheckState
    createdAt: Date
    updatedAt: Date
    url: string
    additions: number
    deletions: number
    author: User
    requestedReviewers: User[]
    requestedTeams: Team[]
    reviews: Review[]
    discussions: Discussion[]
}

export type Attention = {
    set: boolean
    reason?: string
}

export type Pull = PullProps & {
    uid: string
    host: string
    starred: number // boolean is not indexable.
    sections: string[]
    attention?: Attention
    connection: string
}