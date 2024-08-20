import { Button, Dialog, DialogBody, DialogFooter, Intent } from "@blueprintjs/core";
import { PropsWithChildren } from "react";


export type Props = {
    isOpen: boolean,
    onClose?: () => void,
    onSubmit?: () => void,
}

export default function ConfirmDialog({isOpen, onClose, onSubmit, children}: PropsWithChildren<Props>) {    
    const handleConfirm = () => {
        onSubmit && onSubmit();
        onClose && onClose();
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <DialogBody>
                {children}
            </DialogBody>
            <DialogFooter actions={
                <>
                    <Button intent={Intent.PRIMARY} text="Yes" onClick={handleConfirm} aria-label="Confirm" />
                    <Button text="No" onClick={onClose} aria-label="Cancel" />
                </>
            } />
        </Dialog>
    )
}