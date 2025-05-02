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
  type Review,
  type Discussion,
} from "./types";
import { prepareQuery } from "./search";

const MAX_PULLS_TO_FETCH = 50;

const MyOctokit = Octokit.plugin(throttling);

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
  getPull(endpoint: Endpoint, id: string): Promise<PullProps>;
}

type GHPull = {
  number: number;
  title: string;
  repository: {
    nameWithOwner: string;
  };
  author: GHUser;
  createdAt: string;
  updatedAt: string;
  url: string;
  additions: number;
  deletions: number;
  isDraft: boolean;
  merged: boolean;
  closed: boolean;
  reviewDecision: "CHANGES_REQUESTED" | "APPROVED" | "REVIEW_REQUIRED" | null;
  statusCheckRollup: {
    state: "EXPECTED" | "ERROR" | "FAILURE" | "PENDING" | "SUCCESS";
  } | null;
  comments: {
    totalCount: number;
    nodes: GHComment[];
  };
  reviewRequests: {
    totalCount: number;
    nodes: GHReviewRequest[];
  };
  reviews: {
    totalCount: number;
    nodes: GHReview[];
  };
  reviewThreads: {
    totalCount: number;
    nodes: {
      isResolved: boolean;
      path: string;
      comments: {
        totalCount: number;
        nodes: GHComment[];
      };
    }[];
  };
};

type GHReviewRequest = {
  requestedReviewer:
    | ({ __typename: "Bot" | "Mannequin" | "User" } & GHUser)
    | ({ __typename: "Team" } & GHTeam);
};

type GHReview = {
  id: string;
  author: GHUser | null;
  state:
    | "PENDING"
    | "COMMENTED"
    | "APPROVED"
    | "CHANGES_REQUESTED"
    | "DISMISSED";
  body: string;
  createdAt: string;
  authorCanPushToRepository: boolean;
};

type GHUser = {
  __typename:
    | "Bot"
    | "EnterpriseUserAccount"
    | "Mannequin"
    | "Organization"
    | "User";
  login: string;
  avatarUrl: string;
};

type GHTeam = {
  combinedSlug: string;
};

type GHComment = {
  id: string;
  author: GHUser | null;
  createdAt: string;
  body: string;
};

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
    return response.data.items.map((obj) => ({
      id: obj.node_id,
      updatedAt: new Date(obj.updated_at),
    }));
  }

  async getPull(endpoint: Endpoint, id: string): Promise<PullProps> {
    const query = `query pull($id: ID!) {
      node(id: $id) {
        ... on PullRequest {
          number
          title
          repository {
            nameWithOwner
          }
          createdAt
          updatedAt
          state
          url
          isDraft
          closed
          merged
          reviewDecision
          additions
          deletions
          author {
            __typename
            login
            avatarUrl
          }
          statusCheckRollup {
            state
          }
          comments(first: 100) {
            totalCount
            nodes {
              id
              author {
                __typename
                login
                avatarUrl
              }
              body
              createdAt
            }
          }
          reviewRequests(first: 100) {
            totalCount
            nodes {
              requestedReviewer {
                __typename
                ... on Bot {
                  login
                  avatarUrl
                }
                ... on Mannequin {
                  login
                  avatarUrl
                }
                ... on User {
                  login
                  avatarUrl
                }
                ... on Team {
                  combinedSlug
                }
              }
            }
          }
          reviews(first: 100) {
            totalCount
            nodes {
              id
              author {
                __typename
                login
                avatarUrl
              }
              authorCanPushToRepository
              state
              body
              createdAt
            }
          }
          reviewThreads(first: 100) {
            totalCount
            nodes {
              isResolved
              path
              comments(first: 100) {
                totalCount
                nodes {
                  id
                  author {
                    __typename
                    login
                    avatarUrl
                  }
                  createdAt
                  body
                }
              }
            }
          }
        }
      }
      rateLimit {
        cost
      }
    }`;
    type Data = {
      node: GHPull;
      rateLimit: {
        cost: number;
      };
    };
    const octokit = this.getOctokit(endpoint);
    const data = await octokit.graphql<Data>(query, { id });
    const reviews: Review[] = data.node.reviews.nodes
      .filter((n) => n.authorCanPushToRepository)
      .map((n) => this.makeReview(n));

    const topLevelComments: Comment[] = [];
    data.node.comments.nodes.forEach((n) =>
      topLevelComments.push(this.makeComment(n)),
    );
    data.node.reviews.nodes.map((n) =>
      topLevelComments.push(this.makeComment(n)),
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
    data.node.reviewThreads.nodes.forEach((n) => {
      discussions.push({
        resolved: n.isResolved,
        comments: n.comments.nodes.map((n2) => this.makeComment(n2)),
        file: { path: n.path },
      });
    });

    return {
      id,
      repo: data.node.repository.nameWithOwner,
      number: data.node.number,
      title: data.node.title,
      state: data.node.isDraft
        ? PullState.Draft
        : data.node.merged
          ? PullState.Merged
          : data.node.closed
            ? PullState.Closed
            : data.node.reviewDecision == "APPROVED"
              ? PullState.Approved
              : PullState.Pending,
      ciState:
        data.node.statusCheckRollup?.state == "ERROR"
          ? CheckState.Error
          : data.node.statusCheckRollup?.state == "FAILURE"
            ? CheckState.Failure
            : data.node.statusCheckRollup?.state == "SUCCESS"
              ? CheckState.Success
              : // Do not differentiate between "Pending" and "Expected".
                data.node.statusCheckRollup?.state == "PENDING"
                ? CheckState.Pending
                : data.node.statusCheckRollup?.state == "EXPECTED"
                  ? CheckState.Pending
                  : CheckState.None,
      createdAt: new Date(data.node.createdAt),
      updatedAt: new Date(data.node.updatedAt),
      url: data.node.url,
      additions: data.node.additions,
      deletions: data.node.deletions,
      author: this.makeUser(data.node.author),
      requestedReviewers: data.node.reviewRequests.nodes
        .filter((n) => n.requestedReviewer.__typename != "Team")
        .map((n) => this.makeUser(n.requestedReviewer as GHUser)),
      requestedTeams: data.node.reviewRequests.nodes
        .filter((n) => n.requestedReviewer.__typename == "Team")
        .map((n) => this.makeTeam(n.requestedReviewer as GHTeam)),
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

  private makeUser(user: GHUser): User {
    return {
      name: user.login,
      avatarUrl: user.avatarUrl,
      bot: user.__typename === "Bot",
    };
  }

  private makeTeam(team: GHTeam): Team {
    return { name: team.combinedSlug };
  }

  private makeReview(review: GHReview): Review {
    return {
      author: review.author !== null ? this.makeUser(review.author) : undefined,
      createdAt: new Date(review.createdAt),
      lgtm: review.state === "APPROVED",
    };
  }

  private makeComment(comment: GHComment): Comment {
    return {
      id: comment.id,
      author:
        comment.author !== null ? this.makeUser(comment.author) : undefined,
      createdAt: new Date(comment.createdAt),
      body: comment.body,
    };
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
    const pulls = this.pullsBySearch[`${endpoint.baseUrl}:${search}`] || [];
    return Promise.resolve(pulls);
  }

  setPullsBySearch(endpoint: Endpoint, search: string, pulls: PullProps[]) {
    this.pullsBySearch[`${endpoint.baseUrl}:${search}`] = pulls;
    pulls.forEach((pull) => this.addPull(endpoint, pull));
  }

  addPull(endpoint: Endpoint, pull: PullProps) {
    this.pullsByKey[`${endpoint.baseUrl}:${pull.id}`] = pull;
  }

  getPull(endpoint: Endpoint, id: string): Promise<PullProps> {
    const pull = this.pullsByKey[`${endpoint.baseUrl}:${id}`];
    return pull !== undefined
      ? Promise.resolve(pull)
      : Promise.reject(new Error("Not Found"));
  }

  clear(): void {
    this.pullsBySearch = {};
    this.pullsByKey = {};
  }
}
