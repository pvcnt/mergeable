import { HTMLTable } from "@blueprintjs/core";
import type { Pull } from "@repo/github";
import IconWithTooltip from "./IconWithTooltip";
import PullRow from "./PullRow";
import styles from "./PullTable.module.scss";

export type Props = {
  pulls: Pull[];
};

export default function PullTable({ pulls }: Props) {
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
          <th>Last Action</th>
          <th>Size</th>
          <th>Title</th>
        </tr>
      </thead>
      <tbody>
        {pulls.map((pull, idx) => (
          <PullRow key={idx} pull={pull} />
        ))}
      </tbody>
    </HTMLTable>
  );
}
