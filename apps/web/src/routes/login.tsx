import { redirect, useNavigate } from "react-router";
import { AnchorButton, Card } from "@blueprintjs/core";
import { db } from "../lib/db";
import type { Route } from "./+types/login";
import { gitHubClient } from "../github";
import { createConnection } from "../lib/mutations";
import type { ConnectionProps } from "../lib/types";
import LoginForm from "../components/LoginForm";
import classes from "./login.module.scss";
import { normalizeBaseUrl } from "../lib/github/client";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  // If an "auth" query parameter if provided, and no connections are defined, then
  // save a new connection for github.com. This allows to login using an OAuth app.
  const isConnected = (await db.connections.count()) > 0;
  if (isConnected) {
    // Skip login page if already logged in.
    return redirect("/inbox");
  }
  const url = new URL(request.url);
  const auth = url.searchParams.get("auth");
  if (auth && !isConnected) {
    const props = {
      baseUrl: "https://api.github.com",
      label: "",
      auth,
      orgs: [],
    };
    const viewer = await gitHubClient.getViewer(props);
    await createConnection(props, viewer);
    return redirect("/inbox");
  }
  return null;
}

export default function Login() {
  const navigate = useNavigate();
  const handleSubmit = async (props: ConnectionProps) => {
    const baseUrl = normalizeBaseUrl(props.baseUrl);
    const viewer = await gitHubClient.getViewer({ ...props, baseUrl });
    await createConnection({ ...props, baseUrl }, viewer);
    await navigate("/inbox");
  };
  return (
    <div className={classes.container}>
      <h1 className={classes.title}>
        <img src="/logo.svg" alt="Logo" />
        <span>Welcome to Mergeable!</span>
      </h1>
      {import.meta.env.MERGEABLE_API_URL && (
        <Card className={classes.card}>
          <p>You may connect to GitHub by authorizing the Mergeable app.</p>
          <AnchorButton
            href={`${import.meta.env.MERGEABLE_API_URL}/auth/github`}
            className={classes.button}
            size="large"
            fill
          >
            <img src="/github-mark.svg" alt="" />
            <span>Login to GitHub</span>
          </AnchorButton>
          <p className={classes.help}>
            Your GitHub credentials will <em>not</em> be stored on our servers.
          </p>
        </Card>
      )}
      <Card className={classes.card}>
        <p>
          You may connect to GitHub using a{" "}
          <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens">
            Personal Access Token
          </a>
          .
        </p>
        <LoginForm onSubmit={handleSubmit} />
        <p className={classes.help}>
          This option is preferred for even stronger privacy guarantees, or to
          connect to a self-hosted GitHub Enterprise instance.
        </p>
      </Card>
    </div>
  );
}
