import { Button, Dialog, DialogBody, DialogFooter, FormGroup, HTMLSelect, InputGroup, Intent } from "@blueprintjs/core"
import { useState } from "react"
import ConfirmDialog from "./ConfirmDialog"
import { Connection, ConnectionValue } from "@repo/types";
import { isTruthy } from "remeda";

type Props = {
    title: string,
    isOpen: boolean,
    connection?: Connection,
    onClose: () => void,
    onSubmit: (connection: ConnectionValue) => void,
    onDelete?: () => void,
    allowedUrls?: string[],
}

export default function ConnectionDialog({title, isOpen, connection, onClose, onSubmit, onDelete, allowedUrls}: Props) {
    const [label, setLabel] = useState("");
    const [baseUrl, setBaseUrl] = useState("");
    const [auth, setAuth] = useState("");
    const [isDeleting, setDeleting] = useState(false);

    const handleOpening = () => {
        setLabel(connection ? connection.label : "");
        setBaseUrl(connection ? connection.baseUrl : "");
        setAuth(connection ? connection.auth : "");
    };
    const handleSubmit = () => {
        if (isValid()) {
            onSubmit({label, baseUrl, auth});
            onClose();
        }
    }
    const handleDelete = () => {
        onDelete && onDelete();
        onClose();
    }
    const isValid = () => baseUrl.startsWith("https://") && auth.length > 0;

    return (
        <>
            <Dialog title={title} isOpen={isOpen} onClose={onClose} onOpening={handleOpening}>
                <DialogBody>
                    <FormGroup label="Connection label">
                        <InputGroup
                            value={label}
                            onChange={e => setLabel(e.currentTarget.value)} />
                    </FormGroup>
                    <FormGroup label="Base URL" labelInfo="(required)">
                        {allowedUrls
                            ? <HTMLSelect
                                  options={allowedUrls}
                                  value={baseUrl}
                                  disabled={isTruthy(connection)}
                                  onChange={e => setBaseUrl(e.currentTarget.value)}/>
                            : <InputGroup
                                  value={baseUrl}
                                  disabled={isTruthy(connection)}
                                  onChange={e => setBaseUrl(e.currentTarget.value)}
                                  placeholder="https://api.github.com" />}
                    </FormGroup>
                    <FormGroup label="Access token" labelInfo="(required)">
                        <InputGroup
                            value={auth}
                            onChange={e => setAuth(e.currentTarget.value)}/>
                    </FormGroup>
                </DialogBody>
                <DialogFooter actions={
                    <>
                        <Button intent={Intent.PRIMARY} text="Submit" onClick={handleSubmit} disabled={!isValid()} />
                        <Button text="Cancel" onClick={onClose} />
                    </>
                }>
                    {connection && <Button intent={Intent.DANGER} text="Delete" minimal onClick={() => setDeleting(true)} />}
                </DialogFooter>
            </Dialog>
            {connection && <ConfirmDialog isOpen={isDeleting} onClose={() => setDeleting(false)} onConfirm={handleDelete}>
                Are you sure you want to delete connection <em>{connection.label || connection.host}</em>?
            </ConfirmDialog>}
        </>
    )
}
