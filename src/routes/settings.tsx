import { Button, H3 } from "@blueprintjs/core"
import ConnectionCard from "../components/ConnectionCard"
import { useContext, useState } from "react"
import ConnectionDialog from "../components/ConnectionDialog"
import { ConfigContext, Connection } from "../config"
import { useQueries } from "@tanstack/react-query"
import { getViewer } from "../github"

export default function Settings() {
    const [isEditing, setEditing] = useState(false)
    const { config, setConfig } = useContext(ConfigContext)
    const viewers = useQueries({
        queries: config.connections.map(connection => ({
            queryKey: ['viewer', connection.host],
            queryFn: () => getViewer(connection),
            staleTime: Infinity,
        })),
    })

    const handleSubmit = (value: Connection) => {
        setConfig(v => ({...v, connections: [...v.connections, value]}))
    }
    const handleDelete = (idx: number) => {
        setConfig(v => ({...v, connections: [...v.connections.slice(0, idx), ...v.connections.slice(idx + 1)]}))
    }

    return (
        <div className="container-lg">
            <div className="flex mb-4">
                <H3 className="grow">Connections</H3>
                <Button text="New connection" icon="plus" onClick={() => setEditing(true)}/>
            </div>

            <ConnectionDialog isOpen={isEditing} onClose={() => setEditing(false)} onSubmit={handleSubmit} />
            
            {config.connections.map((connection, idx) => (
                <ConnectionCard key={idx} connection={connection} viewer={viewers[idx]?.data} onDelete={() => handleDelete(idx)}/>
            ))}
        </div>
    )
}