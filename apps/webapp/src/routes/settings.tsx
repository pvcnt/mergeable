import { Button, Card, H3 } from "@blueprintjs/core";
import { useState } from "react";
import ConnectionDialog from "../components/ConnectionDialog"
import ConnectionTable from "../components/ConnectionTable"
import ConfirmDialog from "../components/ConfirmDialog";
import { getWorker } from "../worker/client";
import { useConnections } from "../lib/queries";
import { deleteConnection, resetSections, saveConnection } from "../lib/mutations";
import { isTruthy } from "remeda";
import type { Connection, ConnectionProps } from "@repo/types"
import styles from "./settings.module.scss";
import { AppToaster } from "../lib/toaster";
import { useNavigate } from "react-router-dom";

export default function Settings() {
    const [ isEditing, setEditing ] = useState(false);
    const [ isResetting, setResetting ] = useState(false);
    const connections = useConnections();
    const navigate = useNavigate();

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
    const handleReset = async () => {
        await resetSections();
        await worker.refreshPulls();
        (await AppToaster).show({message: "Configuration has been reset to factory settings", intent: "success"});
        navigate("/inbox");
    };

    return (
        <>
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

                <div className={styles.header}>
                    <H3 className={styles.title}>Danger zone</H3>
                </div>

                <Card>
                    <p>
                        Resetting to factory settings will erase the current configuration and
                        replace it with the default configuration, as provided to new users.
                        It does <i>not</i> affect connections and stars.
                    </p>
                    <Button text="Reset to factory settings" intent="danger" outlined onClick={() => setResetting(true)} />
                </Card>
            </div>
            <ConfirmDialog isOpen={isResetting} onClose={() => setResetting(false)} onSubmit={handleReset}>
                Are you sure you want to reset configuration to factory settings?
            </ConfirmDialog>
        </>
    )
}