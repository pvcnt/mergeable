import { UseQueryResult, useQueries } from "@tanstack/react-query";
import { Config } from "./config";
import { getPulls, getViewer } from "./github";
import { Pull } from "./model";

export const usePullRequests = (config: Config): UseQueryResult<Pull[]>[] => {
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
                queryFn: () => getPulls(connection, section.search, viewers[idx].data?.login || ""),
                refetchInterval: 300_000,
                refetchIntervalInBackground: true,
                // refetchOnWindowFocus: false,
                staleTime: 60_000,
                enabled: viewers[idx].data !== undefined,
            }))
        }),
    })
}