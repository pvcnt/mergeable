import { HTMLTable, Icon } from "@blueprintjs/core";
import type { Pull } from "../lib/github/types";
import IconWithTooltip from "./IconWithTooltip";
import PullRow from "./PullRow";
import styles from "./PullTable.module.scss";
import { useState } from "react";
import { prop, sortBy } from "remeda";
import { useLocalStorage } from "usehooks-ts";

export interface PullTableProps {
  pulls: Pull[];
  sizes?: number[];
}

type Sort = {
  field: "updatedAt" | "title";
  order: "asc" | "desc";
};

export default function PullTable({ pulls, sizes }: PullTableProps) {
  const [sort, saveSort] = useLocalStorage<Sort>("table:sort", {
    field: "updatedAt",
    order: "desc",
  });
  const handleSort = (field: Sort["field"]) => {
    saveSort((prev) => {
      if (prev.field === field) {
        // Toggle sort order.
        return { ...prev, order: prev.order === "asc" ? "desc" : "asc" };
      } else {
        return { field, order: "asc" };
      }
    });
  };
  if (pulls.length === 0) {
    return <p className={styles.empty}>No results</p>;
  }
  return (
    <HTMLTable interactive className={styles.table}>
      <thead>
        <tr>
          <th>&nbsp;</th>
          <th>&nbsp;</th>
          <th>Author</th>
          <th>
            <IconWithTooltip title="Status" icon="git-pull" />
          </th>
          <th>
            <IconWithTooltip title="CI Status" icon="tick-circle" />
          </th>
          <th
            className={styles.sortable}
            onClick={() => handleSort("updatedAt")}
          >
            Last Action
            {sort.field === "updatedAt" && (
              <Icon
                icon={sort.order === "asc" ? "sort-asc" : "sort-desc"}
                size={12}
              />
            )}
          </th>
          <th>Size</th>
          <th className={styles.sortable} onClick={() => handleSort("title")}>
            Title
            {sort.field === "title" && (
              <Icon
                icon={
                  sort.order === "asc"
                    ? "sort-alphabetical"
                    : "sort-alphabetical-desc"
                }
                size={12}
              />
            )}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortBy(pulls, [prop(sort.field), sort.order]).map((pull, idx) => (
          <PullRow key={idx} pull={pull} sizes={sizes} />
        ))}
      </tbody>
    </HTMLTable>
  );
}
