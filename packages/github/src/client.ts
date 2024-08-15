import { Octokit } from "@octokit/rest";
import { type Connection, type Comment, PullState, type PullProps, type Team, type User, type Profile } from "@repo/types";
import { SearchQuery } from "./search";

const MAX_PULLS_TO_FETCH = 50;

type GHPull = {
    id: string,
    number: number,
    title: string,
    state: string,
    author: GHUser,
    createdAt: string,
    updatedAt: string,
    url: string,
    additions: number,
    deletions: number,
    totalCommentsCount: number,
    repository: {
        nameWithOwner: string,
    },
    isDraft: boolean,
    merged: boolean,
    closed: boolean,
    reviewDecision?: string,
    reviewRequests: {
      nodes: GHReviewRequest[],
    }
    latestOpinionatedReviews: {
      nodes: GHReview[],
    }
}

type GHUserReviewRequest = GHUser & {
  __typename: "Bot" | "Mannequin" | "User"
}

type GHTeamReviewRequest = GHTeam & {
  __typename: "Team"
}

type GHReviewRequest = GHUserReviewRequest | GHTeamReviewRequest

type GHReview = {
  author: GHUser
}

type GHUser = {
    login: string
    avatarUrl: string
}

type GHTeam = {
  combinedSlug: string
}

export interface GitHubClient {
  getViewer(connection: Connection): Promise<Profile>;
  getPulls(connection: Connection, search: string): Promise<PullProps[]>;
  getComments(connection: Connection, repo: string, pullNumber: number): Promise<Comment[]>;
}

export class DefaultGitHubClient implements GitHubClient {
  private octokits: Record<string, Octokit> = {};

  async getViewer(connection: Connection): Promise<Profile> {
    const octokit = this.getOctokit(connection);
    const userResponse = await octokit.rest.users.getAuthenticated()
    const user: User = {
        name: userResponse.data.login,
        avatarUrl: userResponse.data.avatar_url,
    };
    const teamsResponse = await octokit.paginate("GET /user/teams", { per_page: 100 });
    const teams: Team[] = teamsResponse.map(obj => ({ name: obj.slug }));
    return { user, teams };
  }
  async getPulls(connection: Connection, search: string): Promise<PullProps[]> {
    const query = `query dashboard($search: String!) {
        search(query: $search, type: ISSUE, first: ${MAX_PULLS_TO_FETCH}) {
          issueCount
          edges {
            node {
              ... on PullRequest {
                id
                number
                title
                author {
                  login
                  avatarUrl                  
                }
                reviewRequests(first: 100) {
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
                latestOpinionatedReviews(first: 100) {
                  nodes {
                    author {
                      login
                      avatarUrl
                    }
                  }
                }
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
                totalCommentsCount
              }
            }
          }
        }
    }`;
    type Edge = {
        node: GHPull,
    }
    type Data = {
        search: {
            issueCount: number,
            edges: Edge[],
        },
    }
    // Enforce searching for PRs, and filter by org as required by the connection.
    const q = new SearchQuery(search);
    q.set("type", "pr");
    q.set("sort", "updated");
    if (connection.orgs.length > 0) {
      q.setAll("org", connection.orgs);
    }

    if (!q.has("archived")) {
        // Unless the query explicitely allows PRs from archived repositories, exclude
        // them by default as we cannot act on them anymore.
        q.set("archived", "false");
    }

    if (q.has("org") && q.has("repo")) {
        // GitHub API does not seem to support having both terms with an "org"
        // and "repo" qualifier in a given query. In this situation, the term 
        // with the "repo" qualifier is apparently ignored. We remediate to this
        // situation by keeping droping terms with the "org" qualifier, and
        // keeping the more precise "repo" qualifier.
        //
        // Note: We ignore the situation where the targeted repo(s) are not within
        // the originally targeted org(s).
        q.delete("org");
    }
    
    const octokit = this.getOctokit(connection);
    const data = await octokit.graphql<Data>(query, {search: q.toString()});
    return data.search.edges.map(edge => edge.node).map(pull => ({
        uid: `${connection.id}:${pull.id}`,
        host: connection.host,
        repo: pull.repository.nameWithOwner,
        number: pull.number,
        title: pull.title,
        state: pull.isDraft
            ? PullState.Draft
            : pull.merged
            ? PullState.Merged
            : pull.closed
            ? PullState.Closed
            : pull.reviewDecision == "APPROVED"
            ? PullState.Approved
            : PullState.Pending,
        createdAt: pull.createdAt,
        updatedAt: pull.updatedAt,
        url: pull.url,
        additions: pull.additions,
        deletions: pull.deletions,
        comments: pull.totalCommentsCount,
        author: this.makeUser(pull.author),
        requestedReviewers: pull.reviewRequests.nodes
          .filter(n => n.__typename != "Team")
          .map(n => this.makeUser(n as GHUser)),
        requestedTeams: pull.reviewRequests.nodes
          .filter(n => n.__typename == "Team")
          .map(n => this.makeTeam(n as GHTeam)),
        reviewers: pull.latestOpinionatedReviews.nodes
          .map(n => this.makeUser(n.author)),
    }));
  }
  
  async getComments(connection: Connection, repo: string, pullNumber: number): Promise<Comment[]> {
    const octokit = this.getOctokit(connection);
    const [ repoOwner, repoName ] = repo.split("/");
    const comments = await octokit.paginate(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments",
      { owner: repoOwner, repo: repoName, pull_number: pullNumber, per_page: 100 }
    );
    return comments.map(comment => ({
      uid: `${connection.id}:${comment.id}`,
      inReplyTo: comment.in_reply_to_id ? `${connection.id}:${comment.in_reply_to_id}` : undefined,
      author: {
        name: comment.user.login,
        avatarUrl: comment.user.avatar_url,
      },
      createdAt: new Date(comment.created_at),
    }));
  }

  private getOctokit(connection: Connection): Octokit {
    if (!(connection.id in this.octokits)) {
      this.octokits[connection.id] = new Octokit({auth: connection.auth, baseUrl: connection.baseUrl});
    }
    return this.octokits[connection.id];
  }

  private makeUser(user: GHUser): User {
    return { name: user.login, avatarUrl: user.avatarUrl };
  }
  
  private makeTeam(team: GHTeam): Team {
    return { name: team.combinedSlug };
  }
}

export class TestGitHubClient implements GitHubClient {
  private pulls: Record<string, Record<string, PullProps[]>> = {};

  getViewer(connection: Connection): Promise<Profile> {
    return Promise.resolve({
      user: { name: `test[${connection.id}]`, avatarUrl: "" },
      teams: [ { name: `test[${connection.id}]` } ],
    });
  }

  getPulls(connection: Connection, search: string): Promise<PullProps[]> {
    return Promise.resolve((this.pulls[connection.id] || {})[search] || []);
  }

  setPulls(connection: Connection, search: string, pulls: PullProps[]) {
    if (!(connection.id in this.pulls)) {
      this.pulls[connection.id] = {};
    }
    this.pulls[connection.id][search] = pulls;
  }

  getComments(connection: Connection, repo: string, pullNumber: number): Promise<Comment[]> {
    return Promise.resolve([]);
  }
}