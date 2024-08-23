import { Button, Checkbox, Dialog, DialogBody, DialogFooter, FormGroup, InputGroup, Intent, TextArea } from "@blueprintjs/core";
import { useState } from "react";
import { AppToaster } from "../lib/toaster"
import ConfirmDialog from "./ConfirmDialog";
import { type SectionProps, defaultSectionProps } from "@repo/model";

type Props = {
    title: string,
    isOpen: boolean,
    section?: SectionProps,
    newSection?: SectionProps,
    onClose: () => void,
    onSubmit: (v: SectionProps) => void,
    onDelete?: () => void,
}

export default function SectionDialog({title, section, newSection, isOpen, onClose, onSubmit, onDelete}: Props) {    
    const [label, setLabel] = useState("");
    const [search, setSearch] = useState("");
    const [notified, setNotified] = useState(false);
    const [attention, setAttention] = useState(true);
    const [isDeleting, setDeleting] = useState(false);

    const handleOpening = () => {
        setLabel(section ? section.label : newSection ? newSection.label : defaultSectionProps.label);
        setSearch(section ? section.search : newSection ? newSection.search : defaultSectionProps.search);
        setNotified(section ? section.notified : newSection ? newSection.notified : defaultSectionProps.notified);
        setAttention(section ? section.attention : newSection ? newSection.attention : defaultSectionProps.attention);
    }
    const handleSubmit = () => {
        if (isValid()) {
            onSubmit({ label, search, notified, attention });
            onClose();
        }
    }
    const handleDelete = () => {
        onDelete && onDelete();
        onClose()
    }
    const handleShare = async () => {
        const params = new URLSearchParams();
        params.set('action', 'share');
        params.set('label', label);
        params.set('search', search);
        await navigator.clipboard.writeText(`${window.location.origin}/inbox?${params.toString()}`);;
        (await AppToaster).show({message: "Share URL has been copied to clipboard.", intent: Intent.SUCCESS});
    }

    const isValid = () => label.trim().length > 0 && search.trim().length > 0;

    return (
        <>
            <Dialog title={title} isOpen={isOpen} onClose={onClose} onOpening={handleOpening}>
                <DialogBody>
                    <FormGroup label="Section label" labelInfo="(required)">
                        <InputGroup value={label} onChange={e => setLabel(e.target.value)} />
                    </FormGroup>
                    <FormGroup
                        label="Search query"
                        labelInfo="(required)"
                        helperText={<a href="https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests" target="_blank">Documentation on search syntax</a>}
                    >
                        <TextArea value={search} onChange={e => setSearch(e.target.value)} fill/>
                    </FormGroup>
                    <Checkbox
                        checked={notified}
                        label="Pull requests in this section add to the badge count"
                        onChange={e => setNotified(e.currentTarget.checked)}
                        />
                    <Checkbox
                        checked={attention}
                        label="Pull requests in this section are included in the attention set"
                        onChange={e => setAttention(e.currentTarget.checked)}
                        />
                </DialogBody>
                <DialogFooter actions={
                    <>
                        <Button intent={Intent.PRIMARY} text="Submit" onClick={handleSubmit} disabled={!isValid()} />
                        <Button text="Cancel" onClick={onClose} />
                    </>
                }>
                    {section && <Button intent={Intent.DANGER} text="Delete" minimal onClick={() => setDeleting(true)} />}
                    {section && <Button text="Share" onClick={handleShare} minimal />}
                </DialogFooter>
            </Dialog>

            {section && <ConfirmDialog isOpen={isDeleting} onClose={() => setDeleting(false)} onSubmit={handleDelete}>
                Are you sure you want to delete section <em>{section.label}</em>?
            </ConfirmDialog>}
        </>
    )
}