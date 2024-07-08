import { Octokit } from "@octokit/rest";
import { Connection, ConnectionValue, PullState, PullValue, User } from "@repo/types";
import { SearchQuery } from "./search";

const LIMIT = 50;

type GHPull = {
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
}

type GHUser = {
    name: string,
    login: string,
    avatarUrl: string,
}

type RateLimit = {
    limit: number,
    cost: number,
    remaining: number,
    resetAt: number,
}

export async function getViewer(connection: ConnectionValue): Promise<User> {
    const client = createClient(connection);
    const user = await client.rest.users.getAuthenticated()
    return {name: user.data.login, avatarUrl: user.data.avatar_url};
}

export async function getPulls(connection: Connection, search: string): Promise<PullValue[]> {
    const query = `query dashboard($search: String!) {
        search(query: $search, type: ISSUE, first: ${LIMIT}) {
          issueCount
          edges {
            node {
              ... on PullRequest {
                number
                title
                author {
                  login
                  url
                  avatarUrl
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
        rateLimit {
            limit
            cost
            remaining
            resetAt
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
        rateLimit: RateLimit,
    }
    // Enforce searching for PRs, and filter by org as required by the connection.
    const q = new SearchQuery(search);
    q.set("type", "pr");
    q.set("sort", "updated");
    q.setAll("org", connection.orgs);

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
    
    const client = createClient(connection);
    const data = await client.graphql<Data>(query, {search: q.toString()});
    return data.search.edges.map(edge => edge.node).map(pull => ({
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
        author: {
            name: pull.author.login,
            avatarUrl: pull.author.avatarUrl,
        },
    }));
}

function createClient(connection: ConnectionValue): Octokit {
    return new Octokit({auth: connection.auth, baseUrl: connection.baseUrl});
}