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
import { data } from "react-router";
import { pullMatches } from "../lib/search";
import { env } from "../lib/env.server";
import type { Route } from "./+types/stars";
import { isTruthy } from "remeda";

export function loader() {
  const sizes = isTruthy(env.MERGEABLE_PR_SIZES)
    ? env.MERGEABLE_PR_SIZES.split(",").map((v) => parseInt(v))
    : undefined;
  return data({ sizes });
}

export default function Stars({ loaderData }: Route.ComponentProps) {
  const { sizes } = loaderData;
  const [search, setSearch] = useState<string>("");
  const connections = useConnections();
  const sections = useSections();
  const pulls = usePulls({
    connections: connections.data,
    sections: sections.data,
  });
  const stars = useStars();
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
            sizes={sizes}
          />
        )}
      </Card>
    </>
  );
}
