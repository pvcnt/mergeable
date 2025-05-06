import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Button } from "@blueprintjs/core";
import SectionDialog from "../components/SectionDialog";
import DashboardSection from "../components/DashboardSection";
import {
  type Section,
  type SectionProps,
  defaultSectionProps,
} from "../lib/types";
import { useSections, usePulls } from "../lib/queries";
import {
  deleteSection,
  moveSectionDown,
  moveSectionUp,
  saveSection,
} from "../lib/mutations";
import Navbar from "../components/Navbar";
import { getWorker } from "../worker/client";
import SectionCard from "../components/SectionCard";

export default function Dashboard() {
  const sections = useSections();
  const pulls = usePulls();

  const [isEditing, setEditing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [newSection, setNewSection] = useState(defaultSectionProps);

  const useAttentionSet = sections.data.some((section) => section.attention);

  const pullsBySection = sections.data.map((section) =>
    pulls.data.filter((pull) => pull.sections.indexOf(section.id) > -1),
  );
  const pullsWithAttention = useAttentionSet
    ? pulls.data.filter((pull) => pull.attention?.set)
    : [];

  // Open a "New section" dialog if URL is a share link.
  useEffect(() => {
    if (searchParams.get("action") === "share") {
      setNewSection({
        label: searchParams.get("label") || "",
        search: searchParams.get("search") || "",
        attention: defaultSectionProps.attention,
      });
      setEditing(true);
    }
  }, [searchParams]);

  const worker = getWorker();

  const handleSubmit = async (value: SectionProps) => {
    await saveSection({ ...value, id: "", position: sections.data.length });
    // Remove sharing parameters from URL if they were defined once the new section
    // has been created from those parameters.
    if (searchParams.get("action") === "share") {
      setSearchParams({});
    }
    worker.refreshPulls().catch(console.error);
  };
  const handleChange = async (value: Section) => {
    await saveSection(value);
    worker.refreshPulls().catch(console.error);
  };
  const handleDelete = async (value: Section) => {
    await deleteSection(value);
    worker.refreshPulls().catch(console.error);
  };

  return (
    <>
      <Navbar>
        <Button
          text="New section"
          icon="plus"
          minimal
          onClick={() => setEditing(true)}
        />
      </Navbar>
      <SectionDialog
        newSection={newSection}
        title="New section"
        isOpen={sections.isLoaded && isEditing}
        onClose={() => setEditing(false)}
        onSubmit={handleSubmit}
      />

      {useAttentionSet && (
        <SectionCard
          id="attention"
          label="Needs attention"
          isLoading={pulls.isLoading}
          pulls={pullsWithAttention}
        />
      )}

      {sections.isLoaded &&
        sections.data.map((section, idx) => {
          return (
            <DashboardSection
              key={idx}
              section={section}
              isLoading={pulls.isLoading}
              pulls={pullsBySection[idx]}
              isFirst={idx === 0}
              isLast={idx === sections.data.length - 1}
              onChange={handleChange}
              onDelete={() => handleDelete(section)}
              onMoveUp={() => moveSectionUp(section)}
              onMoveDown={() => moveSectionDown(section)}
            />
          );
        })}
    </>
  );
}
