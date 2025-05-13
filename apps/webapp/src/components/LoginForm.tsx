import {
  Button,
  FormGroup,
  InputGroup,
  Intent,
} from "@blueprintjs/core";
import { useState } from "react";
import { ConnectionProps } from "../lib/types";
import { AppToaster } from "../lib/toaster";

export interface LoginFormProps {
  githubUrl?: string;
  onSubmit: (v: ConnectionProps) => Promise<void>;
}

function normalizeBaseUrl(s: string): string {
  try {
    const url = new URL(s);
    // Remove any query string parameters.
    url.search = "";

    // Normalize hostname.
    if (url.host === "github.com") {
      // github.com URL must point to the API root.
      url.host = "api.github.com";
      url.pathname = "";
    } else if (!url.host.endsWith("github.com")) {
      // GitHub Enterprise URL must point to the API root.
      url.pathname = "/api/v3";
    }

    // Remove trailing slash.
    s = url.toString();
    if (s.endsWith("/")) {
      s = s.substring(0, s.length - 1);
    }
    return s;
  } catch {
    // Likely an invalid URL...
    return s;
  }
}

export default function LoginForm({ onSubmit, githubUrl }: LoginFormProps) {
  const [url, setUrl] = useState(githubUrl ?? "");
  const [auth, setAuth] = useState("");
  const [isDisabled, setDisabled] = useState(false);

  const handleSubmit = async () => {
    if (isFilled()) {
      setDisabled(true);
      const baseUrl = normalizeBaseUrl(url);
      try {
        await onSubmit({ baseUrl, auth, host: new URL(url).host, orgs: [] });
      } catch (e) {
        const message = `Something went wrong: ${(e as Error).message}`;
        (await AppToaster).show({ message, intent: Intent.DANGER });
      } finally {
        setDisabled(false);
      }
    }
  };
  const isFilled = () => url.length > 0 && auth.length > 0;

  return (
    <div>
      <FormGroup label="Base URL" labelInfo="(required)">
          <InputGroup
            value={url}
            aria-label="Base URL"
          onChange={(e) => setUrl(e.currentTarget.value)}
          disabled={githubUrl !== undefined}
          />
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
      <Button
        intent={Intent.PRIMARY}
        aria-label="Submit"
        text="Submit"
        onClick={handleSubmit}
        disabled={!isFilled() || isDisabled}
      />
    </div>
  );
}
