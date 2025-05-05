import { Button } from "@blueprintjs/core";
import { useState } from "react";
import type { Pull } from "@repo/github";
import type { Section } from "../lib/types";
import SectionDialog from "./SectionDialog";
import SectionCard from "./SectionCard";

export type Props = {
  section: Section;
  isFirst: boolean;
  isLast: boolean;
  isLoading: boolean;
  pulls: Pull[];
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChange: (v: Section) => void;
  onDelete: () => void;
};

export default function DashboardSection({
  isLoading,
  section,
  isFirst,
  isLast,
  pulls,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: Props) {
  const [isEditing, setEditing] = useState(false);
  return (
    <>
      <SectionCard
        label={section.label}
        pulls={pulls}
        isLoading={isLoading}
        actions={
          <>
            <Button
              icon="symbol-triangle-up"
              minimal
              disabled={isFirst}
              onClick={onMoveUp}
            />
            <Button
              icon="symbol-triangle-down"
              minimal
              disabled={isLast}
              onClick={onMoveDown}
            />
            <Button icon="edit" minimal onClick={() => setEditing(true)} />
          </>
        }
      />
      <SectionDialog
        section={section}
        title="Edit section"
        isOpen={isEditing}
        onClose={() => setEditing(false)}
        onSubmit={(v) => onChange({ ...section, ...v })}
        onDelete={onDelete}
      />
    </>
  );
}
