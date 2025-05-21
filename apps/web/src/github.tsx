import { type GitHubClient, DefaultGitHubClient } from "./lib/github/client";

// Expose a GitHub client as a singleton.
export const gitHubClient: GitHubClient = new DefaultGitHubClient();
