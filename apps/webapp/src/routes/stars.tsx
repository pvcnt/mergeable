import { Card, Spinner } from "@blueprintjs/core";
import {
  useConnections,
  usePulls,
  useSections,
  useStars,
} from "../lib/queries";
import Navbar from "../components/Navbar";
import PullTable from "../components/PullTable";
import { useState } from "react";
import { pullMatches } from "../lib/search";
import { useTitle } from "../lib/useTitle";

export default function Stars() {
  const [search, setSearch] = useState<string>("");
  const connections = useConnections();
  const sections = useSections();
  const pulls = usePulls({
    connections: connections.data,
    sections: sections.data,
  });
  const stars = useStars();
  useTitle(pulls.data ?? []);
  return (
    <>
      <Navbar
        search={search}
        onSearchChange={setSearch}
        onRefresh={pulls.refetch}
        isFetching={pulls.isFetching}
        refreshedAt={pulls.dataUpdatedAt}
      />
      <Card>
        {pulls.data === undefined ? (
          <Spinner />
        ) : (
          <PullTable
            pulls={pulls.data.filter(
              (pull) => stars.has(pull.uid) && pullMatches(search, pull),
            )}
          />
        )}
      </Card>
    </>
  );
}
