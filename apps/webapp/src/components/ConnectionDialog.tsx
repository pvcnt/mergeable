import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Intent,
} from "@blueprintjs/core";
import { useState } from "react";
import { isTruthy } from "remeda";
import ConfirmDialog from "./ConfirmDialog";
import type { ConnectionProps } from "../lib/types";
import { useToaster } from "../lib/toaster";
import OrgSelector from "./OrgSelector";

type Props = {
  title: string;
  isOpen: boolean;
  connection?: ConnectionProps;
  onClose?: () => void;
  onSubmit?: (v: ConnectionProps) => Promise<void>;
  onDelete?: () => void;
  allowedUrls?: string[];
};

function getHost(baseUrl: string) {
  if (!baseUrl.startsWith("https://") && !baseUrl.startsWith("http://")) {
    throw new Error("Invalid URL");
  }
  const url = new URL(baseUrl);
  // Special case to identify github.com's host. For GHE instances, the
  // API is mounted under /api and not under a subdomain.
  return url.hostname == "api.github.com" ? "github.com" : url.hostname;
}

export default function ConnectionDialog({
  title,
  isOpen,
  connection,
  onClose,
  onSubmit,
  onDelete,
  allowedUrls,
}: Props) {
  const [label, setLabel] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [auth, setAuth] = useState("");
  const [orgs, setOrgs] = useState<string[]>([]);
  const [isDeleting, setDeleting] = useState(false);
  const [isDisabled, setDisabled] = useState(false);
  const toaster = useToaster();

  const handleOpening = () => {
    setDisabled(false);
    setLabel(connection ? connection.label : "");
    setBaseUrl(
      connection ? connection.baseUrl : allowedUrls ? allowedUrls[0] : "",
    );
    setAuth(connection ? connection.auth : "");
    setOrgs(connection ? connection.orgs : []);
  };
  const handleSubmit = async () => {
    if (isFilled()) {
      setDisabled(true);
      const host = getHost(baseUrl);
      try {
        onSubmit && (await onSubmit({ label, baseUrl, auth, orgs, host }));
        onClose && onClose();
      } catch (e) {
        const message = `Something went wrong: ${(e as Error).message}`;
        toaster?.show({ message, intent: Intent.DANGER });
      }
    }
  };
  const handleDelete = () => {
    onDelete && onDelete();
    onClose && onClose();
  };
  const isFilled = () => baseUrl.length > 0 && auth.length > 0;

  return (
    <>
      <Dialog
        title={title}
        isOpen={isOpen}
        onClose={onClose}
        onOpening={handleOpening}
      >
        <DialogBody>
          <FormGroup label="Connection label">
            <InputGroup
              value={label}
              aria-label="Connection label"
              onChange={(e) => setLabel(e.currentTarget.value)}
            />
          </FormGroup>
          <FormGroup label="Base URL" labelInfo="(required)">
            {allowedUrls ? (
              <HTMLSelect
                options={allowedUrls}
                value={baseUrl}
                aria-label="Base URL"
                disabled={isTruthy(connection)}
                onChange={(e) => setBaseUrl(e.currentTarget.value)}
              />
            ) : (
              <InputGroup
                value={baseUrl}
                aria-label="Base URL"
                disabled={isTruthy(connection)}
                onChange={(e) => setBaseUrl(e.currentTarget.value)}
                placeholder="https://api.github.com"
              />
            )}
          </FormGroup>
          <FormGroup
            label="Access token"
            labelInfo="(required)"
            helperText="Required scopes: read:org, repo, user"
          >
            <InputGroup
              value={auth}
              aria-label="Access token"
              onChange={(e) => setAuth(e.currentTarget.value)}
            />
          </FormGroup>
          <FormGroup
            label="Filter organizations"
            helperText="Only pull requests from selected organizations will be considered."
          >
            <OrgSelector selected={orgs} onChange={setOrgs} />
          </FormGroup>
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <Button
                intent={Intent.PRIMARY}
                aria-label="Submit"
                text="Submit"
                onClick={handleSubmit}
                disabled={!isFilled() || isDisabled}
              />
              <Button
                text="Cancel"
                aria-label="Cancel"
                onClick={onClose}
                disabled={isDisabled}
              />
            </>
          }
        >
          {connection && (
            <Button
              intent={Intent.DANGER}
              text="Delete"
              aria-label="Delete"
              variant="minimal"
              onClick={() => setDeleting(true)}
            />
          )}
        </DialogFooter>
      </Dialog>
      {connection && (
        <ConfirmDialog
          isOpen={isDeleting}
          onClose={() => setDeleting(false)}
          onSubmit={handleDelete}
        >
          Are you sure you want to delete connection{" "}
          <em>{connection.label || connection.host}</em>?
        </ConfirmDialog>
      )}
    </>
  );
}
