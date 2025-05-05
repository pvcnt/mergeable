import { Card, Collapse, H5, Icon, Spinner, Tag } from "@blueprintjs/core";
import { ReactNode } from "react";
import type { Pull } from "@repo/github";
import PullTable from "./PullTable";
import styles from "./SectionCard.module.scss";
import { useLocalStorage } from "usehooks-ts";

export type Props = {
  id: string;
  label: string;
  isLoading: boolean;
  pulls: Pull[];
  actions?: ReactNode;
};

export default function SectionCard({
  id,
  label,
  isLoading,
  pulls,
  actions,
}: Props) {
  // Collapsed state is persisted in local storage to survive page reloads.
  const [collapsed, saveCollapsed] = useLocalStorage(
    `section:${id}:collapsed`,
    false,
    // Avoids "Prop `className` did not match" when a section is collapsed by default.
    { initializeWithValue: false },
  );
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    saveCollapsed((v) => !v);
  };
  return (
    <Card className={styles.section}>
      <div className={styles.header}>
        <H5 onClick={(e) => handleClick(e)} className={styles.title}>
          <Icon icon={collapsed ? "chevron-down" : "chevron-up"} color="text" />
          <span>{label}</span>
          {pulls.length > 0 && (
            <Tag round minimal>
              {pulls.length}
            </Tag>
          )}
        </H5>
        <div className={styles.actions}>{actions}</div>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <Collapse isOpen={!collapsed}>
          <PullTable pulls={pulls} />
        </Collapse>
      )}
    </Card>
  );
}
