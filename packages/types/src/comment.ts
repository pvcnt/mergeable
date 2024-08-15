import { User } from "./user"

export type Comment = {
    uid: string
    inReplyTo?: string
    author: User
    createdAt: Date
}