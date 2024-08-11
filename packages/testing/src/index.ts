import { type Pull, type Section, type Connection, PullState } from "@repo/types";

export function mockPull(props?: Partial<Pull>): Pull {
    return {
        uid: "1:1",
        host: "github.com",
        repo: "pvcnt/mergeable",
        number: 1,
        title: "Title",
        state: PullState.Approved,
        createdAt: "2024-08-05T15:57:00T",
        updatedAt: "2024-08-05T15:57:00T",
        url: "https://github.com/pvcnt/mergeable/1",
        additions: 0,
        deletions: 0,
        author: { name: "pvcnt", avatarUrl: "" },
        comments: 0,
        requestedReviewers: [],
        requestedTeams: [],
        reviewers: [],
        starred: 0,
        sections: [],
        attention: 0,
        ...props,
    };
}

export function mockSection(props?: Partial<Section>): Section {
    return {
        id: "",
        label: "Section",
        search: "author:@me",
        notified: false,
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