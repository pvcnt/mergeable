export type Pull = {
    number: number,
    title: string,
    state: string,
    author: User,
    createdAt: string,
    updatedAt: string,
    url: string,
    additions: number,
    deletions: number,
    repository: {
        nameWithOwner: string,
    },
    isDraft: boolean,
    merged: boolean,
    closed: boolean,
    reviewDecision?: string,
}

export type PullList = {
    host: string,
    pulls: Pull[],
}

export type User = {
    name: string,
    login: string,
    avatarUrl: string,
}

// Comes from Prow: https://github.com/kubernetes/test-infra/blob/master/prow/plugins/size/size.go
const sizes: {label: string, changes: number}[] = [
    {label: "XS", changes: 0},
    {label: "S", changes: 10},
    {label: "M", changes: 30},
    {label: "L", changes: 100},
    {label: "XL", changes: 500},
    {label: "XXL", changes: 1000},
]
sizes.reverse()
  
export function computeSize(pull: Pull): string {
    const changes = pull.additions + pull.deletions
    const size = sizes.find(s => changes >= s.changes)
    return size === undefined ? sizes[sizes.length - 1].label : size.label
}