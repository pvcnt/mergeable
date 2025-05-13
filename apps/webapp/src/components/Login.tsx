import { type ConnectionProps } from "../lib/types";
import LoginForm from "./LoginForm";
import { createConnection } from "../lib/mutations";
import { DefaultGitHubClient } from "@repo/github";
import { AnchorButton, Card } from "@blueprintjs/core";
import classes from "./Login.module.scss";
const githubMark = "../assets/github-mark.svg?url";

export default function Login() {
  const handleSubmit = async (props: ConnectionProps) => {
    const client = new DefaultGitHubClient();
    const viewer = await client.getViewer(props);
    await createConnection({ ...props, viewer });
  };

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>
        <img src="/logo.svg" alt="Logo" />
        <span>Welcome to Mergeable!</span>
      </h1>
      {import.meta.env.MERGEABLE_BACKEND_URL && (
        <Card>
          <p>You may connect to github.com by authorizing the Mergeable app:</p>
          <AnchorButton
            href={`${import.meta.env.MERGEABLE_BACKEND_URL}/auth/github`}
            className={classes.button}
            size="large"
            fill
          >
            <img src={githubMark} alt="" />
            <span>Login to GitHub</span>
          </AnchorButton>
        </Card>
      )}
      <Card>
        <p>
          You may connect to github.com or a GitHub Enterprise instance with a
          Personal Access Token:
        </p>
        <LoginForm onSubmit={handleSubmit} githubUrl={import.meta.env.MERGEABLE_GITHUB_URL} />
      </Card>
    </div>
  );
}
