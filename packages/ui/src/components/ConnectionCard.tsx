import { Button, Card, Intent, H4 } from "@blueprintjs/core"
import { Connection, User } from "@repo/types"
import { useState } from "react"
import ConfirmDialog from "./ConfirmDialog"

type Props = {
    connection: Connection,
    user?: User,
    onDelete: () => void,
}

const isBlank = (value: string | null | undefined) => value == null || value === ''

export default function ConnectionCard({connection, user, onDelete}: Props) {
    const [isDeleting, setDeleting] = useState(false)
    return (
        <>
            <Card className="flex">
                <div className="grow">
                    {!isBlank(connection.name) && (
                        <H4>{connection.name}</H4>
                    )}
                    <span><b>Host:</b> <a href={`https://${connection.host}`}>{connection.host}</a></span>
                    {user !== undefined && <span className="ml-4"><b>User: </b>{user.name}</span>}
                </div>
                <Button text="Delete" minimal intent={Intent.DANGER} onClick={() => setDeleting(true)}></Button>
            </Card>
            <ConfirmDialog isOpen={isDeleting} onClose={() => setDeleting(false)} onConfirm={onDelete}>
                Are you sure you want to delete connection to <em>{connection.host}</em>?
            </ConfirmDialog>
        </>
    )
}
