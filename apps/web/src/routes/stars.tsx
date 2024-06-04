import { useCallback, useContext } from "react";
import { Button, Card, H3, Spinner } from "@blueprintjs/core";

import { ConfigContext } from "../config";
import DiffTable from "@repo/ui/components/DiffTable";
import { useDiffs } from "../queries";
import { getDiffUid } from "@repo/ui/utils/diff";
import { Diff } from "@repo/types";


export default function Stars() {
    const { config, setConfig } = useContext(ConfigContext)
    const results = useDiffs(config)

    const isLoading = results.some(res => res.isLoading)
    const isFetching = results.some(res => res.isFetching)

    const stars = new Set(config.stars)
    const diffs = results.flatMap(res => res.data?.diffs || []).filter(diff => stars.has(getDiffUid(diff)))

    const refetchAll = useCallback(async () => {
		await Promise.all(results.map(res => res.refetch()));
	}, [results]);

    const handleStar = (diff: Diff) => {
        const uid = getDiffUid(diff)
        setConfig(prev => prev.stars.indexOf(uid) > -1 
            ? {...prev, stars: prev.stars.filter(s => s != uid)} 
            : {...prev, stars: prev.stars.concat([uid])})
    }

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
                ? <DiffTable diffs={diffs} stars={stars} onStar={handleStar}/>
                : <p className="no-results">No results</p>}
            </Card>
        </>
    )
}
