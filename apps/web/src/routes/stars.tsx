import { useCallback } from "react";
import { Button, Card, H3, Spinner } from "@blueprintjs/core";

import PullTable from "@repo/ui/components/PullTable";
import { usePulls } from "../queries";
import { toggleStar, useConnections, useSections, useStars } from "../db";


export default function Stars() {
    const connections = useConnections()
    const sections = useSections()
    const { isStarred } = useStars()
    const results = usePulls(sections.data, connections.data)

    const isLoading = results.some(res => res.isLoading)
    const isFetching = results.some(res => res.isFetching)

    const pulls = results.flatMap(res => res.data?.pulls || []).filter(pull => isStarred(pull))

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
                : (pulls.length > 0)
                ? <PullTable pulls={pulls} isStarred={isStarred} onStar={toggleStar}/>
                : <p className="no-results">No results</p>}
            </Card>
        </>
    )
}
