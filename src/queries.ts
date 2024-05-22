import { UseQueryResult, useQueries } from "@tanstack/react-query";
import { Config } from "./config";
import { getDiffs, getViewer } from "./github";
import { DiffList } from "./model";

export const useDiffs = (config: Config): UseQueryResult<DiffList>[] => {
    const viewers = useQueries({
        queries: config.connections.map(connection => ({
            queryKey: ['viewer', connection.host],
            queryFn: () => getViewer(connection),
            staleTime: Infinity,
        })),
    })
    return useQueries({
        queries: config.sections.flatMap(section => {
            return config.connections.map((connection, idx) => ({
                queryKey: ['diffs', connection.host, connection.auth, section.search],
                queryFn: () => getDiffs(connection, section.search, viewers[idx].data?.name || ""),
                refetchInterval: 300_000,
                refetchIntervalInBackground: true,
                staleTime: 60_000,
                enabled: viewers[idx].data !== undefined,
            }))
        }),
    })
}