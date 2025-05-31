import { Button, FormGroup, InputGroup, Intent } from "@blueprintjs/core";
import { useState } from "react";
import type { ConnectionProps } from "../lib/types";
import { useToaster } from "../lib/toaster";

export interface LoginFormProps {
  onSubmit: (v: ConnectionProps) => Promise<void>;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [value, setValue] = useState<ConnectionProps>({
    baseUrl: "",
    auth: "",
    label: "",
    orgs: [],
  });
  const [isDisabled, setDisabled] = useState(false);
  const toaster = useToaster();
  const isFilled = value.baseUrl.length > 0 && value.auth.length > 0;
  const handleSubmit = async () => {
    if (isFilled) {
      setDisabled(true);
      try {
        await onSubmit(value);
      } catch (e) {
        const message = `Something went wrong: ${(e as Error).message}`;
        toaster?.show({ message, intent: Intent.DANGER });
      } finally {
        setDisabled(false);
      }
    }
  };
  return (
    <div>
      <FormGroup label="Base URL" labelInfo="(required)">
        <InputGroup
          aria-label="Base URL"
          placeholder="https://github.com"
          value={value.baseUrl}
          onValueChange={(v) => setValue((prev) => ({ ...prev, baseUrl: v }))}
        />
      </FormGroup>
      <FormGroup
        label="Access token"
        labelInfo="(required)"
        helperText="Required scopes: read:org, repo, user"
      >
        <InputGroup
          aria-label="Access token"
          value={value.auth}
          onValueChange={(v) => setValue((prev) => ({ ...prev, auth: v }))}
        />
      </FormGroup>
      <Button
        intent={Intent.PRIMARY}
        aria-label="Submit"
        text="Submit"
        onClick={handleSubmit}
        disabled={!isFilled || isDisabled}
      />
    </div>
  );
}
