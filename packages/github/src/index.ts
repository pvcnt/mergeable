import { Octokit } from "@octokit/rest";
import { Connection, ConnectionValue, PullList, PullState, User } from "@repo/types";

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

export function getViewer(connection: ConnectionValue): Promise<User> {
    const query = `query {
        viewer {
            login
            avatarUrl
        }
        rateLimit {
            limit
            cost
            remaining
            resetAt
        }
    }`;
    type Data = {
        viewer: GHUser,
        rateLimit: RateLimit,
    }

    return createClient(connection).graphql<Data>(query)
        .then(data => data.viewer)
        .then(user => ({name: user.login, avatarUrl: user.avatarUrl}));
}

export function getPulls(connection: Connection, search: string): Promise<PullList> {
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
    return createClient(connection).graphql<Data>(query, {search: `type:pr ${search}`})
        .then(data => {
            const total = data.search.issueCount;
            const pulls = data.search.edges.map(edge => edge.node).map(pull => ({
                uid: `${connection.host},${pull.repository.nameWithOwner},${pull.number}`,
                host: connection.host,
                repository: pull.repository.nameWithOwner,
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
                author: {
                    name: pull.author.login,
                    avatarUrl: pull.author.avatarUrl,
                },
            }))
            return {total, hasMore: total > LIMIT, pulls}
        });
}

function createClient(connection: ConnectionValue): Octokit {
    return new Octokit({auth: connection.auth, baseUrl: connection.baseUrl});
}