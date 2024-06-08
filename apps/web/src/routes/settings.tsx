import { Button, H3 } from "@blueprintjs/core"
import ConnectionCard from "@repo/ui/components/ConnectionCard"
import { useState } from "react"
import ConnectionDialog from "@repo/ui/components/ConnectionDialog"

import { getViewer } from "../github"
import { deleteConnection, saveConnection, useConnections } from "../db"
import { isTruthy } from "remeda"
import { Connection, ConnectionValue } from "@repo/types"


export default function Settings() {
    const [isEditing, setEditing] = useState(false)
    const connections = useConnections()

    const allowedUrls = isTruthy(import.meta.env.VITE_GITHUB_URLS) 
        ? import.meta.env.VITE_GITHUB_URLS.split(",") 
        : undefined;
    
    const getHost = (baseUrl: string) => {
        const url = new URL(baseUrl);
        return (url.hostname == "api.github.com") ? "github.com" : url.hostname;
    }
    
    const handleNew = async (value: ConnectionValue) => {
        const viewer = (await getViewer(value)).name;
        const host = getHost(value.baseUrl);
        saveConnection({...value, id: "", host, viewer});
    };

    const handleEdit = async (previous: Connection, value: ConnectionValue) => {
        // Only query for a new viewer if the token did change (or if there is no existing viewer).
        const viewer = (!isTruthy(previous.viewer) || value.auth !== previous.auth) ? (await getViewer(value)).name : previous.viewer;
        // Base URL cannot be modified, hence host cannot change either.
        saveConnection({... previous, ...value, viewer});
    };

    return (
        <div className="container-lg">
            <div className="flex mb-4">
                <H3 className="grow">Connections</H3>
                <Button text="New connection" icon="plus" onClick={() => setEditing(true)}/>
            </div>

            <ConnectionDialog
                title="New connection"
                allowedUrls={allowedUrls}
                isOpen={isEditing}
                onClose={() => setEditing(false)}
                onSubmit={v => handleNew(v)} />
            
            {connections.data.map((connection, idx) => (
                <ConnectionCard
                    key={idx}
                    className="mt-4"
                    connection={connection}
                    onSubmit={v => handleEdit(connection, v)}
                    onDelete={() => deleteConnection(connection)}/>
            ))}
        </div>
    )
}