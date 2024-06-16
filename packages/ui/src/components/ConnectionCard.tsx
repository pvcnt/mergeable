import { Button, Card, H4 } from "@blueprintjs/core"
import { useState } from "react"
import { isTruthy } from "remeda"
import clsx from "clsx"

import { ConnectionValue, Connection } from "@repo/types"
import ConnectionDialog from "./ConnectionDialog"

type Props = {
    connection: Connection,
    className?: string,
    onSubmit: (v: ConnectionValue) => Promise<void>,
    onDelete: () => void,
}

export default function ConnectionCard({connection, className, onSubmit, onDelete}: Props) {
    const [isOpen, setOpen] = useState(false);
    return (
        <>
            <Card className={clsx("flex", className)}>
                <div className="grow">
                    {isTruthy(connection.label) && <H4>{connection.label}</H4>}
                    <span><b>Host:</b> <a href={`https://${connection.host}`}>{connection.host}</a></span>
                    {isTruthy(connection.viewer) && <span className="ml-4"><b>Viewer: </b>{connection.viewer}</span>}
                </div>
                <Button text="Edit" minimal onClick={() => setOpen(true)}></Button>
            </Card>
            <ConnectionDialog
                connection={connection}
                title="Edit connection"
                isOpen={isOpen}
                onClose={() => setOpen(false)}
                onSubmit={onSubmit}
                onDelete={onDelete}/>
        </>
    )
}
