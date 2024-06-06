import { UseQueryResult, useQueries } from "@tanstack/react-query";
import { Connection, PullList, Section } from "@repo/types";
import { getPulls, getViewer } from "./github";

export const usePulls = (sections: Section[], connections: Connection[]): UseQueryResult<PullList>[] => {
    const viewers = useQueries({
        queries: connections.map(connection => ({
            queryKey: ['viewer', connection.host],
            queryFn: () => getViewer(connection),
            staleTime: Infinity,
        })),
    })
    return useQueries({
        queries: sections.flatMap(section => {
            return connections.map((connection, idx) => ({
                queryKey: ['pulls', connection.host, connection.token, section.search],
                queryFn: () => getPulls(connection, section.search, viewers[idx].data?.name || ""),
                refetchInterval: 300_000,
                refetchIntervalInBackground: true,
                staleTime: 60_000,
                enabled: viewers[idx].data !== undefined,
            }))
        }),
    })
}