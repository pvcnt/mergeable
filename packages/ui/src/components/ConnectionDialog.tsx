import { Button, Dialog, DialogBody, DialogFooter, FormGroup, HTMLSelect, InputGroup, Intent } from "@blueprintjs/core"
import { useState } from "react"
import ConfirmDialog from "./ConfirmDialog"
import type { Connection, ConnectionValue } from "@repo/types";
import { isTruthy } from "remeda";
import { AppToaster } from "../utils/toaster";

import OrgSelector from "./OrgSelector";

type Props = {
    title: string,
    isOpen: boolean,
    connection?: Connection,
    onClose?: () => void,
    onSubmit?: (v: ConnectionValue) => Promise<void>,
    onDelete?: () => void,
    allowedUrls?: string[],
}

export default function ConnectionDialog({title, isOpen, connection, onClose, onSubmit, onDelete, allowedUrls}: Props) {
    const [label, setLabel] = useState("");
    const [baseUrl, setBaseUrl] = useState("");
    const [auth, setAuth] = useState("");
    const [orgs, setOrgs] = useState<string[]>([]);
    const [isDeleting, setDeleting] = useState(false);

    const handleOpening = () => {
        setLabel(connection ? connection.label : "");
        setBaseUrl(connection ? connection.baseUrl : allowedUrls ? allowedUrls[0] : "");
        setAuth(connection ? connection.auth : "");
        setOrgs(connection ? connection.orgs : []);
    };
    const handleSubmit = async () => {
        if (isFilled()) {
            try {
                onSubmit && await onSubmit({label, baseUrl, auth, orgs: orgs});
                onClose && onClose();
            } catch (e) {
                const message = `Something went wrong: ${(e as Error).message}`;
                (await AppToaster).show({message, intent: Intent.DANGER})
            }
        }
    }
    const handleDelete = () => {
        onDelete && onDelete();
        onClose && onClose();
    }
    const isFilled = () => baseUrl.length> 0  && auth.length > 0;

    return (
        <>
            <Dialog title={title} isOpen={isOpen} onClose={onClose} onOpening={handleOpening}>
                <DialogBody>
                    <FormGroup label="Connection label">
                        <InputGroup
                            value={label}
                            aria-label="Connection label"
                            onChange={e => setLabel(e.currentTarget.value)} />
                    </FormGroup>
                    <FormGroup label="Base URL" labelInfo="(required)">
                        {allowedUrls
                            ? <HTMLSelect
                                  options={allowedUrls}
                                  value={baseUrl}
                                  aria-label="Base URL"
                                  disabled={isTruthy(connection)}
                                  onChange={e => setBaseUrl(e.currentTarget.value)}/>
                            : <InputGroup
                                  value={baseUrl}
                                  aria-label="Base URL"
                                  disabled={isTruthy(connection)}
                                  onChange={e => setBaseUrl(e.currentTarget.value)}
                                  placeholder="https://api.github.com" />}
                    </FormGroup>
                    <FormGroup label="Access token" labelInfo="(required)">
                        <InputGroup
                            value={auth}
                            aria-label="Access token"
                            onChange={e => setAuth(e.currentTarget.value)}/>
                    </FormGroup>
                    <FormGroup label="Filter organizations" subLabel="Only pull requests from selected organizations will be considered.">
                        <OrgSelector selected={orgs} onChange={setOrgs}/>
                    </FormGroup>
                </DialogBody>
                <DialogFooter actions={
                    <>
                        <Button intent={Intent.PRIMARY} aria-label="Submit" text="Submit" onClick={handleSubmit} disabled={!isFilled()} />
                        <Button text="Cancel" aria-label="Cancel" onClick={onClose} />
                    </>
                }>
                    {connection && <Button intent={Intent.DANGER} text="Delete" aria-label="Delete" minimal onClick={() => setDeleting(true)} />}
                </DialogFooter>
            </Dialog>
            {connection && <ConfirmDialog isOpen={isDeleting} onClose={() => setDeleting(false)} onConfirm={handleDelete}>
                Are you sure you want to delete connection <em>{connection.label || connection.host}</em>?
            </ConfirmDialog>}
        </>
    )
}