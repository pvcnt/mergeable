import { Button, Dialog, DialogBody, DialogFooter, Intent } from "@blueprintjs/core";
import { PropsWithChildren } from "react";


export type Props = {
    isOpen: boolean,
    onClose: () => void,
    onConfirm: () => void,
}

export default function ConfirmDialog({isOpen, onClose, onConfirm, children}: PropsWithChildren<Props>) {    
    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <DialogBody>
                {children}
            </DialogBody>
            <DialogFooter actions={
                <>
                    <Button intent={Intent.PRIMARY} text="Yes" onClick={handleConfirm}/>
                    <Button text="No" onClick={onClose} />
                </>
            } />
        </Dialog>
    )
}