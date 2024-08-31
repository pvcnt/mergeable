import { type GitHubClient, DefaultGitHubClient } from "@repo/github";

// Expose a GitHub client as a singleton.
export const gitHubClient: GitHubClient = new DefaultGitHubClient();
