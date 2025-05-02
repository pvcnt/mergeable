import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";
import {
  type Comment,
  PullState,
  type PullProps,
  type Team,
  type User,
  type Profile,
  CheckState,
  type PullResult,
  type Discussion,
  Review,
} from "./types";
import { prepareQuery } from "./search";
import { isNonNull, isNonNullish } from "remeda";
import {
  PullDocument,
  type PullQuery,
  PullRequestReviewDecision,
  StatusState,
  PullRequestReviewState,
} from "../generated/gql/graphql";

const MAX_PULLS_TO_FETCH = 50;

const MyOctokit = Octokit.plugin(throttling);

const anonymousUser = {
  name: "Anonymous",
  avatarUrl: "/anonymous-32px.png",
  bot: false,
};

export type Endpoint = {
  auth: string;
  baseUrl: string;
};

export interface GitHubClient {
  getViewer(endpoint: Endpoint): Promise<Profile>;
  searchPulls(
    endpoint: Endpoint,
    search: string,
    orgs: string[],
  ): Promise<PullResult[]>;
  getPull(endpoint: Endpoint, repo: string, number: number): Promise<PullProps>;
}

export class DefaultGitHubClient implements GitHubClient {
  private octokits: Record<string, Octokit> = {};

  async getViewer(endpoint: Endpoint): Promise<Profile> {
    const octokit = this.getOctokit(endpoint);
    const userResponse = await octokit.rest.users.getAuthenticated();
    const user: User = {
      name: userResponse.data.login,
      avatarUrl: userResponse.data.avatar_url,
      bot: false,
    };
    const teamsResponse = await octokit.paginate("GET /user/teams", {
      per_page: 100,
    });
    const teams: Team[] = teamsResponse.map((obj) => ({
      name: `${obj.organization.login}/${obj.slug}`,
    }));
    return { user, teams };
  }

  async searchPulls(
    endpoint: Endpoint,
    search: string,
    orgs: string[],
  ): Promise<PullResult[]> {
    const q = prepareQuery(search, orgs);

    const octokit = this.getOctokit(endpoint);
    const response = await octokit.rest.search.issuesAndPullRequests({
      q,
      sort: "updated",
      per_page: MAX_PULLS_TO_FETCH,
    });
    return response.data.items.map((obj) => {
      const url = new URL(obj.html_url);
      const [owner, repoName] = url.pathname.slice(1).split("/").slice(0, 2);
      return {
        id: obj.node_id,
        repo: `${owner}/${repoName}`,
        number: obj.number,
        updatedAt: new Date(obj.updated_at),
      }
    });
  }

  async getPull(endpoint: Endpoint, repo: string, number: number): Promise<PullProps> {
    const query = PullDocument.toString() as string;
    const [owner, repoName] = repo.split("/");
    const octokit = this.getOctokit(endpoint);
    const data = await octokit.graphql<PullQuery>(query, { owner, repo: repoName, number });
    const root = data.repository?.pullRequest;
    if (!root) {
      return Promise.reject(new Error("Not Found"));
    }
    const reviews: Review[] =
      root.reviews?.nodes
        ?.filter(isNonNull)
        .filter((n) => n.authorCanPushToRepository)
        .map((n) => ({
          author: this.makeUser(n.author),
          createdAt: this.toDate(n.createdAt),
          lgtm: n.state === PullRequestReviewState.Approved,
        })) ?? [];

    const topLevelComments: Comment[] = [];
    root.comments?.nodes?.filter(isNonNull).forEach((n) =>
      topLevelComments.push({
        id: n.id,
        author: this.makeUser(n.author),
        createdAt: this.toDate(n.createdAt),
        body: n.body,
      }),
    );
    root.reviews?.nodes?.filter(isNonNull).forEach((n) =>
      topLevelComments.push({
        id: n.id,
        author: this.makeUser(n.author),
        createdAt: this.toDate(n.createdAt),
        body: n.body,
      }),
    );
    topLevelComments.sort((a, b) =>
      a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0,
    );

    const discussions: Discussion[] = [
      {
        resolved: false,
        comments: topLevelComments,
      },
    ];
    root.reviewThreads.nodes?.filter(isNonNull).forEach((n) => {
      discussions.push({
        resolved: n.isResolved,
        comments:
          n.comments.nodes?.filter(isNonNull).map((nn) => ({
            id: nn.id,
            author: this.makeUser(nn.author),
            createdAt: this.toDate(nn.createdAt),
            body: nn.body,
          })) ?? [],
        file: { path: n.path },
      });
    });

    return {
      id: root.id,
      repo: root.repository.nameWithOwner,
      number: root.number,
      title: root.title,
      state: root.isDraft
        ? PullState.Draft
        : root.merged
          ? PullState.Merged
          : root.closed
            ? PullState.Closed
            : root.reviewDecision == PullRequestReviewDecision.Approved
              ? PullState.Approved
              : PullState.Pending,
      ciState:
        root.statusCheckRollup?.state == StatusState.Error
          ? CheckState.Error
          : root.statusCheckRollup?.state == StatusState.Failure
            ? CheckState.Failure
            : root.statusCheckRollup?.state == StatusState.Success
              ? CheckState.Success
              : // Do not differentiate between "Pending" and "Expected".
                root.statusCheckRollup?.state == StatusState.Pending
                ? CheckState.Pending
                : root.statusCheckRollup?.state == StatusState.Expected
                  ? CheckState.Pending
                  : CheckState.None,
      createdAt: this.toDate(root.createdAt),
      updatedAt: this.toDate(root.updatedAt),
      url: `${root.url}`,
      additions: root.additions,
      deletions: root.deletions,
      author: this.makeUser(root.author),
      requestedReviewers:
        root.reviewRequests?.nodes
          ?.map((n) => n?.requestedReviewer)
          .filter(isNonNullish)
          .filter((n) => n?.__typename != "Team")
          .map((n) => this.makeUser(n)) ?? [],
      requestedTeams:
        root.reviewRequests?.nodes
          ?.map((n) => n?.requestedReviewer)
          .filter(isNonNullish)
          .filter((n) => n.__typename == "Team")
          .map((n) => ({ name: n.combinedSlug })) ?? [],
      reviews,
      discussions,
    };
  }

  private getOctokit(endpoint: Endpoint): Octokit {
    const key = `${endpoint.baseUrl}:${endpoint.auth}`;
    if (!(key in this.octokits)) {
      this.octokits[key] = new MyOctokit({
        auth: endpoint.auth,
        baseUrl: endpoint.baseUrl,
        throttle: {
          // For now, allow retries in all situations.
          onRateLimit: (retryAfter, options, octokit) => {
            octokit.log.warn(
              `Request quota exhausted for request ${options.method} ${options.url}, retrying after ${retryAfter} seconds`,
            );
            return true;
          },
          onSecondaryRateLimit: (retryAfter, options, octokit) => {
            octokit.log.warn(
              `Secondary rate limit detected for request ${options.method} ${options.url}, retrying after ${retryAfter} seconds`,
            );
            return true;
          },
        },
      });
    }
    return this.octokits[key];
  }

  private makeUser(
    user:
      | { __typename: string; login: string; avatarUrl: string }
      | undefined
      | null,
  ): User {
    if (
      user?.__typename === "Bot" ||
      user?.__typename === "Mannequin" ||
      user?.__typename === "User"
    ) {
      return {
        name: user.login,
        avatarUrl: `${user.avatarUrl}`,
        bot: user.__typename === "Bot",
      };
    } else {
      // No user provided, or unsupported type.
      return anonymousUser;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDate(v: any) {
    if (typeof v === "string") {
      return new Date(v);
    }
    if (typeof v === "number") {
      return new Date(v);
    }
    if (v instanceof Date) {
      return v;
    }
    return new Date(0);
  }
}

export class TestGitHubClient implements GitHubClient {
  private pullsByKey: Record<string, PullProps> = {};
  private pullsBySearch: Record<string, PullResult[]> = {};

  getViewer(endpoint: Endpoint): Promise<Profile> {
    return Promise.resolve({
      user: { name: `test[${endpoint.baseUrl}]`, avatarUrl: "", bot: false },
      teams: [{ name: `test[${endpoint.baseUrl}]` }],
    });
  }

  searchPulls(endpoint: Endpoint, search: string): Promise<PullResult[]> {
    const pulls =
      this.pullsBySearch[`${endpoint.baseUrl}:${endpoint.auth}:${search}`] ||
      [];
    return Promise.resolve(pulls);
  }

  setPullsBySearch(endpoint: Endpoint, search: string, pulls: PullProps[]) {
    this.pullsBySearch[`${endpoint.baseUrl}:${endpoint.auth}:${search}`] =
      pulls;
    pulls.forEach((pull) => this.addPull(endpoint, pull));
  }

  addPull(endpoint: Endpoint, pull: PullProps) {
    this.pullsByKey[`${endpoint.baseUrl}:${endpoint.auth}:${pull.repo}:${pull.number}`] = pull;
  }

  getPull(endpoint: Endpoint, repo: string, number: number): Promise<PullProps> {
    const pull = this.pullsByKey[`${endpoint.baseUrl}:${endpoint.auth}:${repo}:${number}`];
    return pull !== undefined
      ? Promise.resolve(pull)
      : Promise.reject(new Error("Not Found"));
  }

  clear(): void {
    this.pullsBySearch = {};
    this.pullsByKey = {};
  }
}
