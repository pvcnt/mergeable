import type { User } from "./user.js"

export type Comment = {
    uid: string
    inReplyTo?: string
    author: User
    createdAt: Date
}