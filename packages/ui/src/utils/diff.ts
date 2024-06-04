import { Diff } from "@repo/types";

export function getDiffUid(diff: Diff) {
    return `${diff.host}\\${diff.repository}\\${diff.id}`
}