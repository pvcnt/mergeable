import { Button } from "@blueprintjs/core";
import { useState } from "react";
import type { Pull } from "../lib/github/types";
import type { Section } from "../lib/types";
import SectionDialog from "./SectionDialog";
import SectionCard from "./SectionCard";

export type Props = {
  section: Section;
  isFirst: boolean;
  isLast: boolean;
  isLoading: boolean;
  pulls: Pull[];
  sizes?: number[];
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
  sizes,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: Props) {
  const [isEditing, setEditing] = useState(false);
  return (
    <>
      <SectionCard
        id={section.id}
        label={section.label}
        pulls={pulls}
        sizes={sizes}
        isLoading={isLoading}
        actions={
          <>
            <Button
              icon="symbol-triangle-up"
              variant="minimal"
              disabled={isFirst}
              onClick={onMoveUp}
            />
            <Button
              icon="symbol-triangle-down"
              variant="minimal"
              disabled={isLast}
              onClick={onMoveDown}
            />
            <Button
              icon="edit"
              variant="minimal"
              onClick={() => setEditing(true)}
            />
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
