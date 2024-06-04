import { Diff } from "@repo/types"

// Comes from Prow: https://github.com/kubernetes/test-infra/blob/master/prow/plugins/size/size.go
type Size = {label: string, changes: number};
const sizes: Size[] = [
    {label: "XS", changes: 0},
    {label: "S", changes: 10},
    {label: "M", changes: 30},
    {label: "L", changes: 100},
    {label: "XL", changes: 500},
    {label: "XXL", changes: 1000},
]
sizes.reverse()
  
export function computeSize(diff: Diff): string {
    const changes = diff.additions + diff.deletions;
    const size = sizes.find(s => changes >= s.changes) || sizes[sizes.length - 1];
    return size.label;
}