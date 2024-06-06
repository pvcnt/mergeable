import { Button, H3 } from "@blueprintjs/core"
import ConnectionCard from "@repo/ui/components/ConnectionCard"
import { useState } from "react"
import ConnectionDialog from "@repo/ui/components/ConnectionDialog"
import { useQueries } from "@tanstack/react-query"

import { getViewer } from "../github"
import { deleteConnection, saveConnection, useConnections } from "../db"


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

    return (
        <div className="container-lg">
            <div className="flex mb-4">
                <H3 className="grow">Connections</H3>
                <Button text="New connection" icon="plus" onClick={() => setEditing(true)}/>
            </div>

            <ConnectionDialog isOpen={isEditing} onClose={() => setEditing(false)} onSubmit={saveConnection} />
            
            {connections.data.map((connection, idx) => (
                <ConnectionCard
                    key={idx}
                    className="mt-4"
                    connection={connection}
                    viewer={viewers[idx]?.data}
                    onDelete={deleteConnection}/>
            ))}
        </div>
    )
}