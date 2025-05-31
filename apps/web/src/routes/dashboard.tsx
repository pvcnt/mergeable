import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Button } from "@blueprintjs/core";
import { useDocumentTitle } from "usehooks-ts";
import SectionDialog from "../components/SectionDialog";
import DashboardSection from "../components/DashboardSection";
import {
  DEFAULT_SECTION_LIMIT,
  type SectionProps,
  type Section,
} from "../lib/types";
import { useSections, usePulls, useConnections } from "../lib/queries";
import {
  deleteSection,
  moveSectionDown,
  moveSectionUp,
  saveSection,
} from "../lib/mutations";
import Navbar from "../components/Navbar";
import SectionCard from "../components/SectionCard";
import { pullMatches } from "../lib/search";

export default function Dashboard() {
  const connections = useConnections();
  const sections = useSections();
  const pulls = usePulls({
    connections: connections.data,
    sections: sections.data,
  });

  const [search, setSearch] = useState<string>("");
  const [isEditing, setEditing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [newSection, setNewSection] = useState<SectionProps>();

  const useAttentionSet = sections.data.some((section) => section.attention);

  const pullsBySection = sections.data.map(
    (section) =>
      pulls.data?.filter(
        (pull) =>
          pullMatches(search, pull) && pull.sections.indexOf(section.id) > -1,
      ) ?? [],
  );
  const pullsWithAttention =
    useAttentionSet && pulls.data
      ? pulls.data.filter(
          (pull) => pullMatches(search, pull) && pull.attention?.set,
        )
      : [];
  // Prepend the number of pull requests in the attention set to the title.
  useDocumentTitle(
    pullsWithAttention.length > 0
      ? `(${pullsWithAttention.length}) Mergeable`
      : "Mergeable",
    {
      preserveTitleOnUnmount: false,
    },
  );

  const sizes = import.meta.env.MERGEABLE_PR_SIZES?.split(",").map((v) =>
    parseInt(v),
  );

  // Open a "New section" dialog if URL is a share link.
  useEffect(() => {
    if (searchParams.get("action") === "share") {
      const limit = searchParams.get("limit");
      setNewSection({
        label: searchParams.get("label") || "",
        search: searchParams.get("search") || "",
        limit: limit ? parseInt(limit) : DEFAULT_SECTION_LIMIT,
        attention: true,
      });
      setEditing(true);
    }
  }, [searchParams]);

  const handleSubmit = async (value: SectionProps) => {
    await saveSection({ ...value, id: "", position: sections.data.length });
    // Remove sharing parameters from URL if they were defined once the new section
    // has been created from those parameters.
    if (searchParams.get("action") === "share") {
      setSearchParams({});
      setNewSection(undefined);
    }
  };
  const handleSave = async (section: Section) => {
    await saveSection(section);
  };
  const handleDelete = async (section: Section) => {
    await deleteSection(section);
  };

  return (
    <>
      <Navbar
        search={search}
        onSearchChange={setSearch}
        onRefresh={pulls.refetch}
        isFetching={pulls.isFetching}
        refreshedAt={pulls.dataUpdatedAt}
      >
        <Button
          text="New section"
          icon="plus"
          onClick={() => setEditing(true)}
        />
      </Navbar>
      <SectionDialog
        section={newSection}
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
          sizes={sizes}
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
              sizes={sizes}
              isFirst={idx === 0}
              isLast={idx === sections.data.length - 1}
              onChange={handleSave}
              onDelete={() => handleDelete(section)}
              onMoveUp={() => moveSectionUp(section)}
              onMoveDown={() => moveSectionDown(section)}
            />
          );
        })}
    </>
  );
}
