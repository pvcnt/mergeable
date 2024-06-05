import { useCallback, useContext } from "react";
import { Button, Card, H3, Spinner } from "@blueprintjs/core";

import { ConfigContext } from "../config";
import PullTable from "@repo/ui/components/PullTable";
import { usePulls } from "../queries";
import { getPullUid } from "@repo/ui/utils/pull";
import { Pull } from "@repo/types";


export default function Stars() {
    const { config, setConfig } = useContext(ConfigContext)
    const results = usePulls(config)

    const isLoading = results.some(res => res.isLoading)
    const isFetching = results.some(res => res.isFetching)

    const stars = new Set(config.stars)
    const pulls = results.flatMap(res => res.data?.pulls || []).filter(pull => stars.has(getPullUid(pull)))

    const refetchAll = useCallback(async () => {
		await Promise.all(results.map(res => res.refetch()));
	}, [results]);

    const handleStar = (pull: Pull) => {
        const uid = getPullUid(pull)
        setConfig(prev => prev.stars.indexOf(uid) > -1 
            ? {...prev, stars: prev.stars.filter(s => s != uid)} 
            : {...prev, stars: prev.stars.concat([uid])})
    }

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
                ? <PullTable pulls={pulls} stars={stars} onStar={handleStar}/>
                : <p className="no-results">No results</p>}
            </Card>
        </>
    )
}
