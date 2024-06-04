import { Octokit } from "@octokit/rest"
import { Connection, DiffList, DiffState, User } from "@repo/types"

const LIMIT = 50

export function createClient(connection: Connection): Octokit {
    return new Octokit({auth: connection.auth, baseUrl: connection.baseUrl})
}

type PullList = {
    total: number
    pulls: Pull[]
}

type Pull = {
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

export function getViewer(connection: Connection): Promise<User> {
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
    }`
    type Data = {
        viewer: GHUser,
        rateLimit: RateLimit,
    }

    return createClient(connection).graphql<Data>(query)
        .then(data => data.viewer)
        .then(user => ({name: user.login, avatarUrl: user.avatarUrl}))
}

export function getDiffs(connection: Connection, search: string, user: string): Promise<DiffList> {
    return getPulls(connection, search, user).then(data => {
        const diffs = data.pulls.map(pull => ({
            host: connection.host,
            repository: pull.repository.nameWithOwner,
            id: `${pull.number}`,
            title: pull.title,
            state: pull.isDraft
                ? DiffState.Draft
                : pull.merged
                ? DiffState.Merged
                : pull.closed
                ? DiffState.Closed
                : pull.reviewDecision == "APPROVED"
                ? DiffState.Approved
                : pull.reviewDecision == "CHANGES_REQUESTED"
                ? DiffState.ChangesRequested
                : DiffState.Pending,
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
        return {total: data.total, hasMore: data.total > LIMIT, diffs}
    })
}

function getPulls(connection: Connection, search: string, user: string): Promise<PullList> {
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
    }`
    type Edge = {
        node: Pull,
    }
    type Data = {
        search: {
            issueCount: number,
            edges: Edge[],
        },
        rateLimit: RateLimit,
    }

    const finalSearch = "type:pr " + search.replaceAll("{USER}", user)

    return createClient(connection).graphql<Data>(query, {search: finalSearch})
        .then(data => ({
            total: data.search.issueCount,
            pulls: data.search.edges.map(edge => edge.node)
        }))
}