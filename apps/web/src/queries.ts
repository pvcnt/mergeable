import { UseQueryResult, useQueries } from "@tanstack/react-query";
import { Config, PullList } from "@repo/types";
import { getPulls, getViewer } from "./github";

export const usePulls = (config: Config): UseQueryResult<PullList>[] => {
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
                queryKey: ['pulls', connection.host, connection.auth, section.search],
                queryFn: () => getPulls(connection, section.search, viewers[idx].data?.name || ""),
                refetchInterval: 300_000,
                refetchIntervalInBackground: true,
                staleTime: 60_000,
                enabled: viewers[idx].data !== undefined,
            }))
        }),
    })
}