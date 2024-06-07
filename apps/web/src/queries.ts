import { UseQueryResult, useQueries } from "@tanstack/react-query";
import { Connection, PullList, Section } from "@repo/types";
import { getPulls } from "./github";

export const usePulls = (sections: Section[], connections: Connection[]): UseQueryResult<PullList>[] => {
    return useQueries({
        queries: sections.flatMap(section => {
            return connections.map(connection => ({
                queryKey: ['pulls', connection.host, connection.auth, section.search],
                queryFn: () => getPulls(connection, section.search),
                refetchInterval: 300_000,
                refetchIntervalInBackground: true,
                staleTime: 60_000,
            }))
        }),
    })
}