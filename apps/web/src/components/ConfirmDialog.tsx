import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Intent,
} from "@blueprintjs/core";
import type { ReactNode } from "react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onSubmit?: () => void;
  children?: ReactNode;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onSubmit,
  children,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onSubmit && onSubmit();
    onClose && onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogBody>{children}</DialogBody>
      <DialogFooter
        actions={
          <>
            <Button
              intent={Intent.PRIMARY}
              text="Yes"
              onClick={handleConfirm}
              aria-label="Confirm"
            />
            <Button text="No" onClick={onClose} aria-label="Cancel" />
          </>
        }
      />
    </Dialog>
  );
}
