import type { Section } from "@repo/types"

export const defaultSections: Section[] = [
    {
        id: "",
        label: "Needs your review",
        search: "is:open review-requested:@me -review:approved -reviewed-by:@me",
        notified: true,
        position: 0,
    },
    {
        id: "",
        label: "Changes requested",
        search: "is:open author:@me review:changes_requested",
        notified: true,
        position: 1,
    },
    {
        id: "",
        label: "Approved",
        search: "is:open author:@me review:approved",
        notified: false,
        position: 2,
    },
    {
        id: "",
        label: "Waiting for reviewers",
        search: "is:open author:@me review:none draft:false",
        notified: false,
        position: 3,
    },
    {
        id: "",
        label: "Waiting for the author",
        search: "is:open review-requested:@me review:changes_requested",
        notified: false,
        position: 4,
    },
    {
        id: "",
        label: "Draft",
        search: "is:open author:@me draft:true",
        notified: false,
        position: 5,
    }
];