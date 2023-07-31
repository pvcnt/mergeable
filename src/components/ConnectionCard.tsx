import { Button, Card, Intent } from "@blueprintjs/core"
import { Connection } from "../config"
import { useState } from "react"
import ConfirmDialog from "./ConfirmDialog"
import { User } from "../model"

type Props = {
    connection: Connection,
    viewer?: User,
    onDelete: () => void,
}

export default function ConnectionCard({connection, viewer, onDelete}: Props) {
    const [isDeleting, setDeleting] = useState(false)
    return (
        <>  
            <Card className="flex">
                <div className="grow">
                    <span><b>Host:</b> <a href={`https://${connection.host}`}>{connection.host}</a></span>
                    {viewer !== undefined && <span className="ml-4"><b>User: </b>{viewer.login}</span>}
                </div>
                <Button text="Delete" minimal intent={Intent.DANGER} onClick={() => setDeleting(true)}></Button>
            </Card>
            <ConfirmDialog isOpen={isDeleting} onClose={() => setDeleting(false)} onConfirm={onDelete}>
                Are you sure you want to delete connection to <em>{connection.host}</em>?
            </ConfirmDialog>
        </>
    )
}