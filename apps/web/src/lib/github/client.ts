import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";
import type {
  Participant,
  PullProps,
  Team,
  User,
  Profile,
  Discussion,
  CheckState,
  Check,
} from "./types";
import { prepareQuery } from "./search";
import { isNonNull, isNonNullish } from "remeda";
import {
  SearchDocument,
  type SearchQuery,
  PullRequestReviewDecision,
  StatusState,
  PullRequestReviewState,
  CheckConclusionState,
} from "../../../generated/gql/graphql";

export function normalizeBaseUrl(baseUrl: string): string {
  if (!URL.canParse(baseUrl)) {
    throw new Error("Invalid URL");
  }
  const url = new URL(baseUrl);
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
  baseUrl = url.toString();
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 1);
  }
  return baseUrl;
}

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
    limit: number,
  ): Promise<PullProps[]>;
}

type ArrayElement<T> = T extends (infer U)[] ? U : never;

// TODO: infer from GraphQL
type Actor =
  | {
      __typename: "Bot" | "Mannequin" | "User" | "EnterpriseUserAccount";
      id: string;
      login: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      avatarUrl: any;
    }
  | { __typename: "Organization" }
  | undefined
  | null;

export class DefaultGitHubClient implements GitHubClient {
  private octokits: Record<string, Octokit> = {};

  async getViewer(endpoint: Endpoint): Promise<Profile> {
    const octokit = this.getOctokit(endpoint);
    const userResponse = await octokit.rest.users.getAuthenticated();
    const user: User = {
      id: userResponse.data.node_id,
      name: userResponse.data.login,
      avatarUrl: userResponse.data.avatar_url,
      bot: false,
    };
    const teamsResponse = await octokit.paginate("GET /user/teams", {
      per_page: 100,
    });
    const teams: Team[] = teamsResponse.map((obj) => ({
      id: obj.node_id,
      name: `${obj.organization.login}/${obj.slug}`,
    }));
    return { user, teams };
  }

  async searchPulls(
    endpoint: Endpoint,
    search: string,
    orgs: string[],
    limit: number,
  ): Promise<PullProps[]> {
    const q = prepareQuery(search, orgs);
    const query = SearchDocument.toString() as string;

    const octokit = this.getOctokit(endpoint);
    const data = await octokit.graphql<SearchQuery>(query, { q, limit });
    return (
      data.search.edges
        ?.filter(isNonNull)
        .map((n) => this.makePull(n))
        .filter(isNonNull) ?? []
    );
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

  private makePull(
    res: ArrayElement<SearchQuery["search"]["edges"]>,
  ): PullProps | null {
    if (!res || res.node?.__typename !== "PullRequest") {
      return null;
    }
    const node = res.node;
    const discussions: Discussion[] = [];
    let participants: Participant[] = [];
    let numComments = 0;

    // Add top-level comments.
    if (res.node.comments.nodes) {
      for (const comment of res.node.comments.nodes) {
        if (comment) {
          numComments++;
          this.addOrUpdateParticipant(
            participants,
            comment.author,
            comment.publishedAt ?? comment.createdAt,
          );
        }
      }
    }
    // Add reviews.
    if (res.node.latestOpinionatedReviews?.nodes) {
      for (const review of res.node.latestOpinionatedReviews.nodes) {
        if (review && review.state !== PullRequestReviewState.Pending) {
          numComments++;
          this.addOrUpdateParticipant(
            participants,
            review.author,
            review.publishedAt ?? review.createdAt,
          );
        }
      }
    }
    if (participants) {
      discussions.push({ resolved: false, participants, numComments });
    }
    // Add review threads.
    if (res.node.reviewThreads?.nodes) {
      for (const thread of res.node.reviewThreads.nodes) {
        if (thread && thread.comments.nodes) {
          participants = [];
          for (const comment of thread.comments.nodes) {
            if (comment) {
              this.addOrUpdateParticipant(
                participants,
                comment.author,
                comment.publishedAt ?? comment.createdAt,
              );
            }
          }
          if (participants) {
            discussions.push({
              resolved: thread.isResolved,
              participants,
              numComments: thread.comments.nodes.length,
              file: {
                path: thread.path,
                line: isNonNullish(thread.startLine)
                  ? thread.startLine
                  : isNonNullish(thread.line)
                    ? thread.line
                    : undefined,
              },
            });
          }
        }
      }
    }

    return {
      id: node.id,
      repo: `${node.repository.owner.login}/${node.repository.name}`,
      number: node.number,
      title: node.title,
      body: node.body,
      state: node.isDraft
        ? "draft"
        : node.merged
          ? "merged"
          : node.closed
            ? "closed"
            : node.mergeQueueEntry
              ? "enqueued"
              : node.reviewDecision == PullRequestReviewDecision.Approved
                ? "approved"
                : "pending",
      checkState: this.toCheckState(node.statusCheckRollup?.state),
      queueState: undefined, // TODO
      createdAt: this.toDate(node.createdAt),
      updatedAt: this.toDate(node.updatedAt),
      enqueuedAt: node.mergeQueueEntry
        ? this.toDate(node.mergeQueueEntry.enqueuedAt)
        : undefined,
      mergedAt: node.mergedAt ? this.toDate(node.mergedAt) : undefined,
      closedAt: node.closedAt ? this.toDate(node.closedAt) : undefined,
      locked: node.locked,
      url: `${node.url}`,
      labels: node.labels?.nodes?.filter(isNonNullish).map((n) => n.name) ?? [],
      additions: node.additions,
      deletions: node.deletions,
      author: this.makeUser(node.author),
      requestedReviewers:
        node.reviewRequests?.nodes
          ?.map((n) => n?.requestedReviewer)
          .filter(isNonNullish)
          .filter((n) => n?.__typename != "Team")
          .map((n) => this.makeUser(n))
          .filter(isNonNull) ?? [],
      requestedTeams:
        node.reviewRequests?.nodes
          ?.map((n) => n?.requestedReviewer)
          .filter(isNonNullish)
          .filter((n) => n.__typename == "Team")
          .map((n) => ({ id: n.id, name: n.combinedSlug })) ?? [],
      reviews:
        node.latestOpinionatedReviews?.nodes
          ?.filter(isNonNullish)
          .filter(
            (n) =>
              n.state !== PullRequestReviewState.Dismissed &&
              n.state !== PullRequestReviewState.Pending,
          )
          .map((n) => ({
            author: this.makeUser(n.author),
            collaborator: n.authorCanPushToRepository,
            approved: n.state === PullRequestReviewState.Approved,
          })) ?? [],
      checks:
        node.statusCheckRollup?.contexts?.nodes
          ?.filter(isNonNullish)
          .map((n) => this.makeCheck(n)) ?? [],
      discussions,
    };
  }

  private makeUser(obj: Actor): User | null {
    if (
      obj?.__typename === "Bot" ||
      obj?.__typename === "Mannequin" ||
      obj?.__typename === "User" ||
      obj?.__typename === "EnterpriseUserAccount"
    ) {
      return {
        id: obj.id,
        name: obj.login,
        avatarUrl: `${obj.avatarUrl}`,
        bot: obj.__typename === "Bot",
      };
    } else {
      // No user provided, or unsupported type.
      return null;
    }
  }

  private makeCheck(
    // TODO: infer from GraphQL
    obj:
      | {
          __typename: "CheckRun";
          name: string;
          title?: string | null;
          conclusion?: CheckConclusionState | null;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          url: any;
        }
      | {
          __typename: "StatusContext";
          context: string;
          description?: string | null;
          state: StatusState;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          targetUrl?: any;
        },
  ): Check {
    if (obj.__typename === "CheckRun") {
      return {
        name: obj.name,
        state:
          obj.conclusion === CheckConclusionState.Success
            ? "success"
            : "pending",
        description: obj.name,
        url: obj.url ? `${obj.url}` : null,
      };
    } else {
      return {
        name: obj.context,
        state: this.toCheckState(obj.state),
        description: obj.context,
        url: obj.targetUrl ? `${obj.targetUrl}` : null,
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDate(v: any) {
    if (typeof v === "number") {
      return new Date(v).toISOString();
    } else if (v instanceof Date) {
      return v.toISOString();
    } else {
      return `${v}`;
    }
  }

  private maxDate(a: string, b: string) {
    const da = new Date(a);
    const db = new Date(b);
    return da > db ? a : b;
  }

  private toCheckState(v: StatusState | null | undefined): CheckState {
    return v == StatusState.Error
      ? "error"
      : v == StatusState.Failure
        ? "failure"
        : v == StatusState.Success
          ? "success"
          : "pending";
  }

  private addOrUpdateParticipant(
    participants: Participant[],
    actor: Actor,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeAt: any,
  ) {
    const user = this.makeUser(actor);
    if (user) {
      const participant = participants.find((p) => p.user.id === user.id);
      if (participant) {
        participant.numComments += 1;
        participant.lastActiveAt = this.maxDate(
          participant.lastActiveAt,
          this.toDate(activeAt),
        );
      } else {
        participants.push({
          user,
          numComments: 1,
          lastActiveAt: this.toDate(activeAt),
        });
      }
    }
  }
}
