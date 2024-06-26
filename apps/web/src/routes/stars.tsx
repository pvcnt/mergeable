import { useCallback } from "react";
import { Button, Card, H3, Spinner } from "@blueprintjs/core";

import PullTable from "@/components/PullTable";
import { usePulls } from "../queries";
import { toggleStar, useConnections, useSections, useStars } from "../db";

import styles from "./stars.module.scss";

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
            <div className={styles.header}>
                <H3 className={styles.title}>Starred pull requests</H3>
                <Button
                    icon="refresh"
                    disabled={isFetching}
                    loading={isFetching}
                    onClick={refetchAll}/>
            </div>

            <Card>
            {isLoading 
                ? <Spinner/>
                : <PullTable pulls={pulls} isStarred={isStarred} onStar={toggleStar}/>}
            </Card>
        </>
    )
}
