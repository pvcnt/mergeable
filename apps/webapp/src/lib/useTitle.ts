import type { Pull } from "@repo/github";
import { useEffect } from "react";

/**
 * Change the window's title to include the number of pull requests in the attention set.
 */
export function useTitle(pulls: Pull[]) {
  const count = pulls.filter((pull) => pull.attention?.set).length;
  useEffect(() => {
    if (count > 0) {
      document.title = `(${count}) Mergeable`;
    } else {
      document.title = "Mergeable";
    }
  }, [count]);
}
