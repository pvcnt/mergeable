export enum DiffState {
    Draft = 1,
    Pending,
    Approved,
    ChangesRequested,
    Merged,
    Closed,
}

export type Diff = {
    uid: string,
    host: string,
    id: string,
    repository: string,
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
  
export function computeSize(diff: Diff): string {
    const changes = diff.additions + diff.deletions
    const size = sizes.find(s => changes >= s.changes)
    return size === undefined ? sizes[sizes.length - 1].label : size.label
}