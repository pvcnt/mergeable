import { Card, Spinner } from "@blueprintjs/core";
import { usePulls } from "../lib/queries";
import Navbar from "../components/Navbar";
import PullTable from "../components/PullTable";
import { useState } from "react";
import { pullMatches } from "../lib/search";

export default function Stars() {
  const [search, setSearch] = useState<string>("");
  const pulls = usePulls({ starred: 1 });
  return (
    <>
      <Navbar search={search} onSearchChange={setSearch} />
      <Card>
        {pulls.isLoading ? (
          <Spinner />
        ) : (
          <PullTable
            pulls={pulls.data.filter((pull) => pullMatches(search, pull))}
          />
        )}
      </Card>
    </>
  );
}
