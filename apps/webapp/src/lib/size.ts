import { reverse, zip } from "remeda";
import type { PullProps } from "@repo/github";

// Defaults come from Prow:
// https://github.com/kubernetes/test-infra/blob/master/prow/plugins/size/size.go
const thresholds = import.meta.env.MERGEABLE_PR_SIZES
  ? import.meta.env.MERGEABLE_PR_SIZES.split(",").map((v) => parseInt(v))
  : [10, 30, 100, 500, 1000];
const labels = ["XS", "S", "M", "L", "XL", "XXL"];

const sizes = reverse(
  zip(labels, [0].concat(thresholds)).map((v) => ({
    label: v[0],
    changes: v[1],
  })),
);

export function computeSize(pull: PullProps): string {
  const changes = pull.additions + pull.deletions;
  const size =
    sizes.find((s) => changes >= s.changes) || sizes[sizes.length - 1];
  return size.label;
}
