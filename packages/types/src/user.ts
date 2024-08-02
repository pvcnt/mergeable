export type User = {
    uid: string
    name: string
    avatarUrl: string
}

export type Team = {
    uid: string
    name: string
}

export type Profile = {
    user: User
    teams: Team[]
}