import { db } from "./db";
import { useLiveQuery } from "dexie-react-hooks";
import {
  type Connection,
  DEFAULT_SECTION_LIMIT,
  defaultSections,
  MAX_SECTION_LIMIT,
  type Section,
} from "../lib/types";
import { useQuery } from "@tanstack/react-query";
import { isInAttentionSet } from "../lib/github/attention";
import { splitQueries } from "../lib/github/search";
import type { Pull } from "../lib/github/types";
import { groupBy, indexBy, prop, unique } from "remeda";
import { gitHubClient } from "../github";

// Defaults to populate after adding new fields.
const connectionDefaults = { orgs: [] };
const sectionDefaults = { attention: false };

export const useConnections = () => {
  const data = useLiveQuery(() => db.connections.toArray());
  return {
    isLoaded: data !== undefined,
    data: data?.map((v) => ({ ...connectionDefaults, ...v })) || [],
  };
};

export const useSections = () => {
  const data = useLiveQuery(() => db.sections.orderBy("position").toArray());
  const isLoaded = data !== undefined;

  if (isLoaded && data.length === 0) {
    // If data was successfully loaded but we have no sections, populate with
    // default sections, to avoid starting with an empty dashboard. This is
    // a one-time operation, those sections will then behave as regular sections.
    db.transaction("rw", db.sections, async () => {
      const count = await db.sections.count();
      if (count > 0) {
        return;
      }
      for (const [idx, section] of defaultSections.entries()) {
        await db.sections.add({ ...section, position: idx });
      }
    }).catch(console.error);
  }

  return {
    isLoaded,
    data: data?.map((v) => ({ ...sectionDefaults, ...v })) || [],
  };
};

export const useStars = () => {
  const data = useLiveQuery(() => db.stars.toArray());
  return new Set(data?.map((v) => v.uid) || []);
};

export const usePulls = ({
  connections,
  sections,
}: {
  connections: Connection[];
  sections: Section[];
}) => {
  // Embed all metadata in the query key that, if changed, should trigger a refresh.
  const queryKey = [
    "pulls",
    ...connections.map((v) => `${v.auth}|${v.orgs.join(",")}`).toSorted(),
    ...sections.map((v) => `${v.search}|${v.limit ?? ""}`).toSorted(),
  ];

  return useQuery({
    enabled: connections.length > 0 && sections.length > 0,
    queryKey,
    queryFn: async () => {
      // Search for pull requests for every section and every connection.
      // Every request returns node IDs for matching pull requests, and
      // the date at which each pull request was last updated.
      const rawResults = (
        await Promise.all(
          sections.flatMap((section) => {
            return connections.flatMap((connection) => {
              const queries = splitQueries(section.search);
              return queries.flatMap(async (query) => {
                const pulls = await gitHubClient.searchPulls(
                  connection,
                  query,
                  connection.orgs,
                  Math.min(
                    MAX_SECTION_LIMIT,
                    section.limit ?? DEFAULT_SECTION_LIMIT,
                  ),
                );
                return pulls.map((res) => ({
                  ...res,
                  uid: `${connection.id}:${res.id}`,
                  sections: [section.id],
                  connection: connection.id,
                }));
              });
            });
          }),
        )
      ).flat();

      // Deduplicate pull requests present in multiple sections.
      const results = Object.values(
        groupBy(rawResults, (pull) => pull.uid),
      ).map((vs) => ({
        ...vs[0],
        sections: vs.flatMap((v) => unique(v.sections)),
      }));

      // For every unique pull request, fetch information about it.
      const stars = new Set((await db.stars.toArray()).map((star) => star.uid));
      const connectionsById = indexBy(connections, prop("id"));
      const sectionsInAttentionSet = new Set(
        sections.filter((v) => v.attention).map((v) => v.id),
      );
      const pulls: Pull[] = await Promise.all(
        results.map((res) => {
          const connection = connectionsById[res.connection];
          const mayBeInAttentionSet = res.sections.some((v) =>
            sectionsInAttentionSet.has(v),
          );
          return {
            ...res,
            host: connection.host,
            schemaVersion: "",
            starred: stars.has(res.uid),
            attention:
              mayBeInAttentionSet && connection.viewer
                ? isInAttentionSet(connection.viewer, res)
                : undefined,
          };
        }),
      );
      return pulls;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
