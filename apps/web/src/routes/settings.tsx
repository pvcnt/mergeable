import { Button, Card, H3 } from "@blueprintjs/core"
import { useState } from "react"
import ConnectionDialog from "../components/ConnectionDialog"
import ConnectionTable from "../components/ConnectionTable"
import { getWorker } from "../worker/client"
import { deleteConnection, saveConnection, useConnections } from "../db"
import { isTruthy } from "remeda"
import { Connection, ConnectionProps } from "@repo/types"

import styles from "./settings.module.scss";

export default function Settings() {
    const [isEditing, setEditing] = useState(false);
    const connections = useConnections();

    const allowedUrls = isTruthy(import.meta.env.VITE_GITHUB_URLS) 
        ? import.meta.env.VITE_GITHUB_URLS.split(",") 
        : undefined;
    
    const worker = getWorker();

    const handleNew = async (props: ConnectionProps) => {
        await saveConnection({ id: "", ...props });
        await worker.refreshViewers();
    };
    const handleEdit = async (previous: Connection, props: ConnectionProps) => {
        await saveConnection({ ...previous, ...props });
        await worker.refreshViewers();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <H3 className={styles.title}>Connections</H3>
                <Button text="New connection" icon="plus" onClick={() => setEditing(true)}/>
            </div>

            <ConnectionDialog
                title="New connection"
                allowedUrls={allowedUrls}
                isOpen={isEditing}
                onClose={() => setEditing(false)}
                onSubmit={handleNew} />
            
            <Card>
                <ConnectionTable
                    connections={connections.data}
                    onSubmit={handleEdit}
                    onDelete={deleteConnection}/>
            </Card>
        </div>
    )
}