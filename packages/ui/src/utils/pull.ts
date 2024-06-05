import { Pull } from "@repo/types";

export function getPullUid(pull: Pull) {
    return `${pull.host}\\${pull.repository}\\${pull.id}`
}