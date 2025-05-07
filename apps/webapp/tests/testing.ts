import {
  Endpoint,
  GitHubClient,
  Profile,
  PullProps,
  type Pull,
} from "@repo/github";
import { type Section, type Connection } from "../src/lib/types";

export function mockPull(props?: Omit<Partial<Pull>, "uid" | "url">): Pull {
  const id = props?.id ?? "PR_1";
  const repo = props?.repo ?? "pvcnt/mergeable";
  const number = props?.number ?? 1;
  const host = props?.host ?? "github.com";
  const connection = props?.connection ?? "1";
  return {
    id,
    repo,
    number,
    title: "Pull request",
    body: "",
    state: "pending",
    checkState: "pending",
    createdAt: "2024-08-05T15:57:00Z",
    updatedAt: "2024-08-05T15:57:00Z",
    url: `https://${host}/${repo}/${number}`,
    locked: false,
    additions: 0,
    deletions: 0,
    author: { id: "u1", name: "pvcnt", avatarUrl: "", bot: false },
    requestedReviewers: [],
    requestedTeams: [],
    reviews: [],
    discussions: [],
    checks: [],
    labels: [],
    uid: `${connection}:${id}`,
    host,
    sections: [],
    connection,
    ...props,
  };
}

export function mockSection(props?: Partial<Section>): Section {
  return {
    id: "",
    label: "Section",
    search: "author:@me",
    position: 0,
    attention: true,
    ...props,
  };
}

export function mockConnection(props?: Partial<Connection>): Connection {
  return {
    id: "",
    label: "",
    baseUrl: "https://api.github.com",
    host: "github.com",
    auth: "ghp_xxx",
    orgs: [],
    ...props,
  };
}

export class TestGitHubClient implements GitHubClient {
  private pullsBySearch: Record<string, PullProps[]> = {};

  getViewer(endpoint: Endpoint): Promise<Profile> {
    return Promise.resolve({
      user: {
        id: "u1",
        name: `test[${endpoint.baseUrl}]`,
        avatarUrl: "",
        bot: false,
      },
      teams: [{ id: "t1", name: "test" }],
    });
  }

  searchPulls(endpoint: Endpoint, search: string): Promise<PullProps[]> {
    const pulls =
      this.pullsBySearch[`${endpoint.baseUrl}:${endpoint.auth}:${search}`] ||
      [];
    return Promise.resolve(pulls);
  }

  setPullsBySearch(endpoint: Endpoint, search: string, pulls: PullProps[]) {
    this.pullsBySearch[`${endpoint.baseUrl}:${endpoint.auth}:${search}`] =
      pulls;
  }

  clear(): void {
    this.pullsBySearch = {};
  }
}
