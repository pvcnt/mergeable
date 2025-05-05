import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  InputGroup,
  Intent,
  NumericInput,
  TextArea,
} from "@blueprintjs/core";
import { useState } from "react";
import { AppToaster } from "../lib/toaster";
import ConfirmDialog from "./ConfirmDialog";
import {
  MAX_SECTION_LIMIT,
  type SectionProps,
  emptySection,
} from "../lib/types";

type Props = {
  title: string;
  isOpen: boolean;
  section?: SectionProps;
  onClose: () => void;
  onSubmit: (v: SectionProps) => void;
  onDelete?: () => void;
};

export default function SectionDialog({
  title,
  section,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const [data, setData] = useState<SectionProps>(emptySection);
  const [isDeleting, setDeleting] = useState(false);

  const handleOpening = () => {
    if (section) {
      setData(section);
    } else {
      // Reset dialog after a section has been created.
      setData(emptySection);
    }
  };
  const handleSubmit = () => {
    if (isValid()) {
      onSubmit(data);
      onClose();
    }
  };
  const handleDelete = () => {
    onDelete && onDelete();
    onClose();
  };
  const handleShare = async () => {
    const params = new URLSearchParams();
    params.set("action", "share");
    params.set("label", data.label);
    params.set("search", data.search);
    params.set("limit", `${data.limit}`);
    await navigator.clipboard.writeText(
      `${window.location.origin}/inbox?${params.toString()}`,
    );
    (await AppToaster).show({
      message: "Share URL has been copied to clipboard.",
      intent: Intent.SUCCESS,
    });
  };

  const isValid = () =>
    data.label.trim().length > 0 && data.search.trim().length > 0;

  return (
    <>
      <Dialog
        title={title}
        isOpen={isOpen}
        onClose={onClose}
        onOpening={handleOpening}
      >
        <DialogBody>
          <FormGroup label="Section label" labelInfo="(required)">
            <InputGroup
              value={data.label}
              onValueChange={(v) => setData((prev) => ({ ...prev, label: v }))}
            />
          </FormGroup>
          <FormGroup
            label="Search query"
            labelInfo="(required)"
            helperText={
              <a
                href="https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests"
                target="_blank"
              >
                Documentation on search syntax
              </a>
            }
          >
            <TextArea
              value={data.search}
              onChange={(e) =>
                setData((prev) => ({ ...prev, search: e.target.value }))
              }
              fill
            />
          </FormGroup>
          <FormGroup
            label="Maximum number of pull requests"
            labelInfo="(required)"
          >
            <NumericInput
              value={data.limit}
              min={1}
              max={MAX_SECTION_LIMIT}
              onValueChange={(v) => setData((prev) => ({ ...prev, limit: v }))}
            />
          </FormGroup>
          <Checkbox
            checked={data.attention}
            label="Pull requests in this section can be in the attention set"
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                attention: e.currentTarget.checked,
              }))
            }
          />
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <Button
                intent={Intent.PRIMARY}
                text="Submit"
                onClick={handleSubmit}
                disabled={!isValid()}
              />
              <Button text="Cancel" onClick={onClose} />
            </>
          }
        >
          {section && (
            <Button
              intent={Intent.DANGER}
              text="Delete"
              minimal
              onClick={() => setDeleting(true)}
            />
          )}
          {section && <Button text="Share" onClick={handleShare} minimal />}
        </DialogFooter>
      </Dialog>

      {section && (
        <ConfirmDialog
          isOpen={isDeleting}
          onClose={() => setDeleting(false)}
          onSubmit={handleDelete}
        >
          Are you sure you want to delete section <em>{section.label}</em>?
        </ConfirmDialog>
      )}
    </>
  );
}
