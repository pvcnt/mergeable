import type { Pull } from "../lib/github/types";

export function pullMatches(search: string, pull: Pull) {
  if (search.length === 0) {
    return true;
  }
  const normalizedTitle = pull.title.toLowerCase();
  const normalizedQuery = search.toLowerCase();
  const tokens = normalizedQuery
    .split(" ")
    .map((tok) => tok.trim())
    .filter((tok) => tok.length > 0);
  return tokens.every((tok) => normalizedTitle.indexOf(tok) > -1);
}
