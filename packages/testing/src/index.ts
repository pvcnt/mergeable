import { type Pull, type Section, type Connection, PullState, CheckState } from "@repo/model";

export function mockPull(props?: Omit<Partial<Pull>, "uid"|"url">): Pull {
    const id = props?.id ?? "PR_1";
    const repo = props?.repo ?? "pvcnt/mergeable";
    const number = props?.number ?? 1;
    const host = props?.host ?? "github.com";
    const connection = props?.connection ?? "1";
    return {
        id,
        repo,
        number,
        title: "Pull request",
        state: PullState.Pending,
        ciState: CheckState.None,
        createdAt: new Date("2024-08-05T15:57:00Z"),
        updatedAt: new Date("2024-08-05T15:57:00Z"),
        url: `https://${host}/${repo}/${number}`,
        additions: 0,
        deletions: 0,
        author: { name: "pvcnt", avatarUrl: "", bot: false },
        requestedReviewers: [],
        requestedTeams: [],
        reviews: [],
        discussions: [],
        uid: `${connection}:${id}`,
        host,
        starred: 0,
        sections: [],
        connection,
        ...props,
    };
}

export function mockSection(props?: Partial<Section>): Section {
    return {
        id: "",
        label: "Section",
        search: "author:@me",
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