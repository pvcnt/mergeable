import { Button, Dialog, DialogBody, DialogFooter, FormGroup, InputGroup, Intent, TextArea } from "@blueprintjs/core";
import { useState } from "react";
import { Section } from "../config";
import ConfirmDialog from "./ConfirmDialog";


export type Props = {
    section: Section,
    title: string,
    isOpen: boolean,
    isDeleteButtonShown?: boolean;
    onClose: () => void,
    onSubmit: (value: Section) => void,
    onDelete?: () => void,
}

export default function EditSectionDialog({title, section, isOpen, isDeleteButtonShown = false, onClose, onSubmit, onDelete}: Props) {    
    const [label, setLabel] = useState(section.label)
    const [search, setSearch] = useState(section.search)
    const [isDeleting, setDeleting] = useState(false)

    const handleOpening = () => {
        setLabel(section.label)
        setSearch(section.search)
    }
    const handleSubmit = () => {
        if (isValid()) {
            onSubmit({label, search})
            onClose()
        }
    }
    const handleDelete = () => {
        if (onDelete !== undefined) {
            onDelete()
        }
        onClose()
    }
    const isValid = () => label.trim().length > 0 && search.trim().length > 0

    return (
        <>
            <Dialog title={title} isOpen={isOpen} onClose={onClose} onOpening={handleOpening}>
                <DialogBody>
                    <FormGroup label="Label" labelInfo="(required)">
                        <InputGroup value={label} onChange={e => setLabel(e.target.value)} />
                    </FormGroup>
                    <FormGroup
                        label="Search query"
                        labelInfo="(required)"
                        helperText={<a href="https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests" target="_blank">Documentation on search syntax</a>}
                    >
                        <TextArea value={search} onChange={e => setSearch(e.target.value)} className="w-full" />
                    </FormGroup>
                </DialogBody>
                <DialogFooter actions={
                    <>
                        <Button intent={Intent.PRIMARY} text="Submit" onClick={handleSubmit} disabled={!isValid()} />
                        {isDeleteButtonShown && <Button intent={Intent.DANGER}  text="Delete" onClick={() => setDeleting(true)} />}
                        <Button text="Cancel" onClick={onClose} />
                    </>
                } />
            </Dialog>

            <ConfirmDialog isOpen={isDeleting} onClose={() => setDeleting(false)} onConfirm={handleDelete}>
                Are you sure you want to delete section <em>{section.label}</em>?
            </ConfirmDialog>
        </>
    )
}