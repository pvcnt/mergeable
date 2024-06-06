import { Button, H3 } from "@blueprintjs/core"
import ConnectionCard from "@repo/ui/components/ConnectionCard"
import { useState } from "react"
import ConnectionDialog from "@repo/ui/components/ConnectionDialog"
import { useQueries } from "@tanstack/react-query"
import * as R from "remeda"

import { getViewer } from "../github"
import { Connection } from "@repo/types"
import { db } from "@repo/storage"
import { useConnections } from "../db"


export default function Settings() {
    const [isEditing, setEditing] = useState(false)
    const connections = useConnections()
    const viewers = useQueries({
        queries: connections.data.map(connection => ({
            queryKey: ['viewer', connection.host],
            queryFn: () => getViewer(connection),
            staleTime: Infinity,
        })),
    })

    const handleSubmit = (value: Connection) => {
        const doc = R.omit(value, ["id"]);
        if (value.id.length === 0) {
            db.connections.add(doc).catch(console.error);
        } else {
            db.connections.update(value.id, doc).catch(console.error);
        }
    }
    const handleDelete = (value: Connection) => {
        db.connections.delete(value.id).catch(console.error)
    }

    return (
        <div className="container-lg">
            <div className="flex mb-4">
                <H3 className="grow">Connections</H3>
                <Button text="New connection" icon="plus" onClick={() => setEditing(true)}/>
            </div>

            <ConnectionDialog isOpen={isEditing} onClose={() => setEditing(false)} onSubmit={handleSubmit} />
            
            {connections.data.map((connection, idx) => (
                <ConnectionCard
                    key={idx}
                    className="mt-4"
                    connection={connection}
                    viewer={viewers[idx]?.data}
                    onDelete={() => handleDelete(connection)}/>
            ))}
        </div>
    )
}