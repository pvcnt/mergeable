import { Button, Dialog, DialogBody, DialogFooter, FormGroup, InputGroup, Intent } from "@blueprintjs/core"
import { useState } from "react"
import { Connection } from "@repo/types"


export type Props = {
    isOpen: boolean,
    onClose: () => void,
    onSubmit: (connection: Connection) => void,
}

export default function ConnectionDialog({isOpen, onClose, onSubmit}: Props) {
    const [label, setLabel] = useState("")
    const [baseUrl, setBaseUrl] = useState("")
    const [token, setToken] = useState("")

    const handleOpening = () => {
        setLabel("")
        setBaseUrl("")
        setToken("")
    }
    const handleSubmit = () => {
        if (isValid()) {
            const url = new URL(baseUrl)
            const host = (url.hostname == "api.github.com") ? "github.com" : url.hostname
            onSubmit({id: "", label: label.trim(), baseUrl, host, token})
            onClose()
        }
    }
    const isValid = () => baseUrl.startsWith("https://") && token.length > 0

    return (
        <>
            <Dialog title="New connection" isOpen={isOpen} onClose={onClose} onOpening={handleOpening}>
                <DialogBody>
                    <FormGroup label="Connection Label">
                        <InputGroup
                            value={label}
                            onChange={e => setLabel(e.target.value)} />
                    </FormGroup>
                    <FormGroup label="Base URL" labelInfo="(required)">
                        <InputGroup
                            value={baseUrl}
                            onChange={e => setBaseUrl(e.target.value)}
                            placeholder="https://api.github.com" />
                    </FormGroup>
                    <FormGroup label="Access token" labelInfo="(required)">
                        <InputGroup
                            value={token}
                            onChange={e => setToken(e.target.value)}/>
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
