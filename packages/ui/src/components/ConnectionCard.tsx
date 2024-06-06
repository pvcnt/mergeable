import { Button, Card, Intent, H4 } from "@blueprintjs/core"
import { Connection, User } from "@repo/types"
import { useState } from "react"
import ConfirmDialog from "./ConfirmDialog"
import clsx  from "clsx"

type Props = {
    connection: Connection,
    viewer?: User,
    className?: string,
    onDelete: () => void,
}

const isBlank = (value: string | null | undefined) => value == null || value === ''

export default function ConnectionCard({connection, viewer, className, onDelete}: Props) {
    const [isDeleting, setDeleting] = useState(false)
    return (
        <>
            <Card className={clsx("flex", className)}>
                <div className="grow">
                    {!isBlank(connection.label) && <H4>{connection.label}</H4>}
                    <span><b>Host:</b> <a href={`https://${connection.host}`}>{connection.host}</a></span>
                    {viewer !== undefined && <span className="ml-4"><b>Viewer: </b>{viewer.name}</span>}
                </div>
                <Button text="Delete" minimal intent={Intent.DANGER} onClick={() => setDeleting(true)}></Button>
            </Card>
            <ConfirmDialog isOpen={isDeleting} onClose={() => setDeleting(false)} onConfirm={onDelete}>
                Are you sure you want to delete connection to <em>{connection.host}</em>?
            </ConfirmDialog>
        </>
    )
}
