import { useCallback, useContext } from "react";
import { Button, Card, H3, Spinner } from "@blueprintjs/core";

import { ConfigContext } from "../config";
import DiffTable from "../components/DiffTable";
import { useDiffs } from "../queries";
import { getDiffUid } from "../model";


export default function Stars() {
    const { config } = useContext(ConfigContext)
    const results = useDiffs(config)

    const isLoading = results.some(res => res.isLoading)
    const isFetching = results.some(res => res.isFetching)

    const stars = new Set(config.stars)
    const diffs = results.flatMap(res => res.data || []).filter(diff => stars.has(getDiffUid(diff)))

    const refetchAll = useCallback(async () => {
		await Promise.all(results.map(res => res.refetch()));
	}, [results]);

    return (
        <>
            <div className="flex mb-4">
                <H3 className="grow">Starred diffs</H3>
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
                : (diffs.length > 0)
                ? <DiffTable diffs={diffs}/>
                : <p className="no-results">No results</p>}
            </Card>
        </>
    )
}
