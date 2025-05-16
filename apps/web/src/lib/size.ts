import type { PullProps } from "@repo/github";

// https://github.com/kubernetes-sigs/prow/blob/main/pkg/plugins/size/size.go
const defaultSizes = [10, 30, 100, 500, 1000];
const labels = ["XS", "S", "M", "L", "XL", "XXL"];

export function computeSize(pull: PullProps, sizes?: number[]): string {
  const changes = pull.additions + pull.deletions;
  const idx = (sizes ?? defaultSizes)
    .toReversed()
    .findIndex((v) => changes >= v);
  return idx > -1 ? labels[labels.length - idx - 1] : labels[0];
}
