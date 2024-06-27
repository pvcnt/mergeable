import { Button, Card, H3 } from "@blueprintjs/core"
import { useState } from "react"
import ConnectionDialog from "@/components/ConnectionDialog"
import ConnectionTable from "@/components/ConnectionTable"
import { getViewer } from "@repo/github"

import { deleteConnection, saveConnection, useConnections } from "../db"
import { isTruthy } from "remeda"
import { Connection, ConnectionValue } from "@repo/types"

import styles from "./settings.module.scss";

export default function Settings() {
    const [isEditing, setEditing] = useState(false);
    const connections = useConnections();

    const allowedUrls = isTruthy(import.meta.env.VITE_GITHUB_URLS) 
        ? import.meta.env.VITE_GITHUB_URLS.split(",") 
        : undefined;
    
    const getHost = (baseUrl: string) => {
        if (!baseUrl.startsWith("https://") && !baseUrl.startsWith("http://")) {
            throw new Error("Invalid URL");
        }
        const url = new URL(baseUrl);
        // Special case to identify github.com's host. For GHE instances, the
        // API is mounted under /api and not under a subdomain.
        return (url.hostname == "api.github.com") ? "github.com" : url.hostname;
    }

    const handleNew = async (value: ConnectionValue) => {
        const host = getHost(value.baseUrl);
        const viewer = (await getViewer(value)).name;
        saveConnection({...value, id: "", host, viewer});
    };

    const handleEdit = async (previous: Connection, value: ConnectionValue) => {
        // Only query for a new viewer if the token did change (or if there is no existing viewer).
        const viewer = (!isTruthy(previous.viewer) || value.auth !== previous.auth) ? (await getViewer(value)).name : previous.viewer;
        // Base URL cannot be modified, hence host cannot change either.
        saveConnection({... previous, ...value, viewer});
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
                onSubmit={v => handleNew(v)} />
            
            <Card>
                <ConnectionTable
                    connections={connections.data}
                    onSubmit={handleEdit}
                    onDelete={deleteConnection}/>
            </Card>
        </div>
    )
}