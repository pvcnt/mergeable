import { useCallback, useContext } from "react";
import { Button, Card, H3, Spinner } from "@blueprintjs/core";

import { ConfigContext } from "../config";
import PullTable from "../components/PullTable";
import { usePullRequests } from "../queries";


export default function Stars() {
    const { config } = useContext(ConfigContext)
    const results = usePullRequests(config)

    const stars = new Set(config.stars)

    const isLoading = results.some(res => res.isLoading)
    const isFetching = results.some(res => res.isFetching)

    const data = config.connections.map((connection, idx) => ({
        host: connection.host,
        pulls: config.sections.flatMap((_, idx2) => results[idx + config.connections.length * idx2].data || []).filter(v => stars.has(v.number))
    }))
    const count = data.map(res => res.pulls.length).reduce((acc, v) => acc + v, 0)

    const refetchAll = useCallback(async () => {
		await Promise.all(results.map(res => res.refetch()));
	}, [results]);

    return (
        <>
            <div className="flex mb-4">
                <H3 className="grow">Starred pull requests</H3>
                <Button
                    icon="refresh"
                    disabled={isFetching}
                    loading={isFetching}
                    className="ml-4"
                    onClick={refetchAll}/>
            </div>

            <Card className="mt-4">
            {isLoading 
                ? <Spinner/>
                : count > 0
                ? <PullTable data={data}/>
                : <p className="no-results">No results</p>}
            </Card>
        </>
    )
}
