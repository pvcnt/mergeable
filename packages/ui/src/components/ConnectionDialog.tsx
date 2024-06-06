import { Button, Dialog, DialogBody, DialogFooter, FormGroup, HTMLSelect, InputGroup, Intent } from "@blueprintjs/core"
import { useState } from "react"
import { Connection } from "@repo/types"


export type Props = {
    isOpen: boolean,
    onClose: () => void,
    onSubmit: (connection: Connection) => void,
    allowedUrls?: string[],
}

export default function ConnectionDialog({isOpen, onClose, onSubmit, allowedUrls}: Props) {
    const [label, setLabel] = useState("")
    const [baseUrl, setBaseUrl] = useState("")
    const [auth, setAuth] = useState("")

    const handleOpening = () => {
        setLabel("")
        setBaseUrl("")
        setAuth("")
    }
    const handleSubmit = () => {
        if (isValid()) {
            const url = new URL(baseUrl)
            const host = (url.hostname == "api.github.com") ? "github.com" : url.hostname
            onSubmit({id: "", label, baseUrl, host, auth})
            onClose()
        }
    }
    const isValid = () => baseUrl.startsWith("https://") && auth.length > 0

    return (
        <>
            <Dialog title="New connection" isOpen={isOpen} onClose={onClose} onOpening={handleOpening}>
                <DialogBody>
                    <FormGroup label="Connection Label">
                        <InputGroup
                            value={label}
                            onChange={e => setLabel(e.currentTarget.value)} />
                    </FormGroup>
                    <FormGroup label="Base URL" labelInfo="(required)">
                        {allowedUrls
                            ? <HTMLSelect
                                  options={allowedUrls}
                                  value={baseUrl}
                                  onChange={e => setBaseUrl(e.currentTarget.value)}/>
                            : <InputGroup
                                  value={baseUrl}
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
                } />
            </Dialog>
        </>
    )
}
