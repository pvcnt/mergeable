import { useState } from "react";
import { Button, Card, H3, Spinner } from "@blueprintjs/core";
import PullTable from "@/components/PullTable";
import { toggleStar, usePulls } from "@/db";
import { getWorker } from "@/worker/client";

import styles from "./stars.module.scss";

export default function Stars() {
    const [ isRefreshing, setRefreshing ] = useState(false);
    const pulls = usePulls({starred: 1});
    const worker = getWorker();

    const handleRefresh = () => {
        setRefreshing(true);
        worker.refresh()
            .then(() => setRefreshing(false))
            .catch(console.error);
    }
    return (
        <>
            <div className={styles.header}>
                <H3 className={styles.title}>Starred pull requests</H3>
                <Button
                    icon="refresh"
                    disabled={isRefreshing}
                    loading={isRefreshing}
                    onClick={handleRefresh}/>
            </div>

            <Card>
            {pulls.isLoading 
                ? <Spinner/>
                : <PullTable pulls={pulls.data} onStar={toggleStar}/>}
            </Card>
        </>
    )
}
