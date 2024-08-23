export type User = {
    name: string
    avatarUrl: string
}

export type Team = {
    name: string
}

export type Profile = {
    user: User
    teams: Team[]
}