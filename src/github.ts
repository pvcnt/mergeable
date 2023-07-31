import { Octokit } from "@octokit/rest"
import { Connection } from "./config"
import { Pull, User } from "./model"

export function createClient(connection: Connection): Octokit {
    return new Octokit({auth: connection.auth, baseUrl: connection.baseUrl})
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
            name
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
        viewer: User,
        rateLimit: RateLimit,
    }

    return createClient(connection).graphql<Data>(query)
        .then(data => data.viewer)
} 

export function getPulls(connection: Connection, search: string, user: string): Promise<Pull[]> {
    const query = `query dashboard($search: String!) {
        search(query: $search, type: ISSUE, first: 50) {
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
        .then(data => data.search.edges.map(edge => edge.node))
}