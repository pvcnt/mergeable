import type { PullProps } from "@repo/github";

const labels = ["XS", "S", "M", "L", "XL", "XXL"];

export function computeSize(pull: PullProps, sizes: number[]): string {
  const changes = pull.additions + pull.deletions;
  const idx = sizes.toReversed().findIndex((v) => changes >= v);
  return idx > -1 ? labels[labels.length - idx - 1] : labels[0];
}
