import { Octokit } from "@octokit/rest";
import { type Connection, type Comment, PullState, type PullProps, type Team, type User, type Profile, CheckState, type PullResult, type Review, Discussion } from "@repo/model";
import { SearchQuery } from "./search.js";

const MAX_PULLS_TO_FETCH = 50;

export interface GitHubClient {
  getViewer(connection: Connection): Promise<Profile>;
  searchPulls(connection: Connection, search: string): Promise<PullResult[]>;
  getPull(connection: Connection, id: string): Promise<PullProps>;
}

type GHPull = {
  number: number
  title: string
  repository: {
    nameWithOwner: string
  }
  author: GHUser
  createdAt: string
  updatedAt: string
  url: string
  additions: number
  deletions: number
  isDraft: boolean,
  merged: boolean
  closed: boolean
  reviewDecision: "CHANGES_REQUESTED"|"APPROVED"|"REVIEW_REQUIRED"|null,
  statusCheckRollup: { state: "EXPECTED"|"ERROR"|"FAILURE"|"PENDING"|"SUCCESS" }|null,
  comments: {
    totalCount: number
    nodes: GHComment[]
  }
  reviewRequests: {
    totalCount: number
    nodes: GHReviewRequest[],
  }
  reviews: {
    totalCount: number
    nodes: GHReview[]
  }
  reviewThreads: {
    totalCount: number
    nodes: {
      isResolved: boolean
      path: string
      comments: {
        totalCount: number
        nodes: GHComment[]
      },
    }[],
  }
}

type GHReviewRequest = {
  requestedReviewer: ({ __typename: "Bot"|"Mannequin"|"User" } & GHUser) | ({ __typename: "Team" } & GHTeam)
}

type GHReview = {
  id: string
  author: GHUser|null
  state: "PENDING"|"COMMENTED"|"APPROVED"|"CHANGES_REQUESTED"|"DISMISSED"
  body: string
  createdAt: string
  authorCanPushToRepository: boolean
}

type GHUser = {
  login: string
  avatarUrl: string
}

type GHTeam = {
  combinedSlug: string
}

type GHComment = {
  id: string
  author: GHUser|null
  createdAt: string
  body: string
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
    const teams: Team[] = teamsResponse.map(obj => ({ name: `${obj.organization.login}/${obj.slug}` }));
    return { user, teams };
  }

  async searchPulls(connection: Connection, search: string): Promise<PullResult[]> {
    // Enforce searching for PRs, and filter by org as required by the connection.
    const q = new SearchQuery(search);
    q.set("type", "pr");
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
    const response = await octokit.search.issuesAndPullRequests({
      q: q.toString(),
      sort: "updated",
      per_page: MAX_PULLS_TO_FETCH,
    });
    return response.data.items.map(obj => ({ id: obj.node_id, updatedAt: new Date(obj.updated_at) }));
  }

  async getPull(connection: Connection, id: string): Promise<PullProps> {
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
        node: GHPull
        rateLimit: {
            cost: number
        }
    }
    const octokit = this.getOctokit(connection);
    const data = await octokit.graphql<Data>(query, { id });
    const reviews: Review[] = data.node.reviews.nodes
      .filter(n => n.authorCanPushToRepository)
      .map(n => this.makeReview(n));

    const topLevelComments: Comment[] = [];
    data.node.comments.nodes.forEach(n => topLevelComments.push(this.makeComment(n)));
    data.node.reviews.nodes.map(n => topLevelComments.push(this.makeComment(n)));
    topLevelComments.sort((a, b) => a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0);
    
    const discussions: Discussion[] = [{
      resolved: false,
      comments: topLevelComments,
    }];
    data.node.reviewThreads.nodes.forEach(n => {
      discussions.push({
        resolved: n.isResolved,
        comments: n.comments.nodes.map(n2 => this.makeComment(n2)),
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
        ciState: data.node.statusCheckRollup?.state == "ERROR"
          ? CheckState.Error
          : data.node.statusCheckRollup?.state == "FAILURE"
          ? CheckState.Failure
          : data.node.statusCheckRollup?.state == "SUCCESS"
          ? CheckState.Success
          // Do not differentiate between "Pending" and "Expected".
          : data.node.statusCheckRollup?.state == "PENDING"
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
          .filter(n => n.requestedReviewer.__typename != "Team")
          .map(n => this.makeUser(n.requestedReviewer as GHUser)),
        requestedTeams: data.node.reviewRequests.nodes
          .filter(n => n.requestedReviewer.__typename == "Team")
          .map(n => this.makeTeam(n.requestedReviewer as GHTeam)),
        reviews,
        discussions,
    };
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

  private makeReview(review: GHReview): Review {
    return {
      author: (review.author !== null) ? this.makeUser(review.author) : undefined,
      createdAt: new Date(review.createdAt),
      lgtm: review.state === "APPROVED",
    }
  }

  private makeComment(comment: GHComment): Comment {
    return {
      id: comment.id,
      author: (comment.author !== null) ? this.makeUser(comment.author) : undefined,
      createdAt: new Date(comment.createdAt),
      body: comment.body,
    };
  }
}

export class TestGitHubClient implements GitHubClient {
  private pullsByKey: Record<string, PullProps> = {};
  private pullsBySearch: Record<string, PullResult[]> = {};

  getViewer(connection: Connection): Promise<Profile> {
    return Promise.resolve({
      user: { name: `test[${connection.id}]`, avatarUrl: "" },
      teams: [ { name: `test[${connection.id}]` } ],
    });
  }

  searchPulls(connection: Connection, search: string): Promise<PullResult[]> {
    return Promise.resolve(this.pullsBySearch[`${connection.id}:${search}`] || []);
  }

  setPullsBySearch(connection: Connection, search: string, pulls: PullProps[]) {
    this.pullsBySearch[`${connection.id}:${search}`] = pulls;
    pulls.forEach(pull => this.addPull(connection, pull));
  }

  addPull(connection: Connection, pull: PullProps) {
    this.pullsByKey[`${connection.id}:${pull.id}`] = pull;
  }

  getPull(connection: Connection, id: string): Promise<PullProps> {
    const pull = this.pullsByKey[`${connection.id}:${id}`];
    return (pull !== undefined) ? Promise.resolve(pull) : Promise.reject(new Error("Not Found"));
  }

  clear(): void {
    this.pullsBySearch = {};
    this.pullsByKey = {};
  }
}