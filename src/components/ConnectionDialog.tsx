import { Button, Dialog, DialogBody, DialogFooter, FormGroup, InputGroup, Intent } from "@blueprintjs/core"
import { useState } from "react"
import { Connection } from "../config"


export type Props = {
    isOpen: boolean,
    onClose: () => void,
    onSubmit: (connection: Connection) => void,
}

export default function ConnectionDialog({isOpen, onClose, onSubmit}: Props) {
    const [name, setName] = useState<string | undefined>(undefined)
    const [baseUrl, setBaseUrl] = useState("")
    const [auth, setAuth] = useState("")

    const handleOpening = () => {
        setName(undefined)
        setBaseUrl("")
        setAuth("")
    }
    const handleSubmit = () => {
        if (isValid()) {
            const url = new URL(baseUrl)
            const host = (url.hostname == "api.github.com") ? "github.com" : url.hostname
            onSubmit({name, baseUrl, host, auth})
            onClose()
        }
    }
    const isValid = () => baseUrl.trim().length > 0 && baseUrl.startsWith("https://") && auth.length > 0

    return (
        <>
            <Dialog title="New connection" isOpen={isOpen} onClose={onClose} onOpening={handleOpening}>
                <DialogBody>
                    <FormGroup label="Connection Name">
                        <InputGroup
                            value={name ?? ""}
                            onChange={e => setName(e.target.value)} />
                    </FormGroup>
                    <FormGroup label="Base URL" labelInfo="(required)">
                        <InputGroup
                            value={baseUrl}
                            onChange={e => setBaseUrl(e.target.value)}
                            placeholder="https://api.github.com" />
                    </FormGroup>
                    <FormGroup label="Access token" labelInfo="(required)">
                        <InputGroup
                            value={auth}
                            onChange={e => setAuth(e.target.value)}/>
                    </FormGroup>
                </DialogBody>
                <DialogFooter actions={
                    <>
                        <Button intent={Intent.PRIMARY} text="Submit" onClick={handleSubmit} disabled={!isValid()} />
                        <Button text="Cancel" onClick={onClose} />
                    </>
                } />
            </Dialog>
        </>
    )
}
