import { test, expect } from "vitest";
import { Pull, PullState } from "@repo/types";
import { computeSize } from "./size";

test("computeSize returns size of a pull request", () => {
    const pull: Pull = {
        uid: "1:1",
        host: "github.com",
        repo: "pvcnt/mergeable",
        number: 1,
        title: "Title",
        state: PullState.Approved,
        createdAt: "now",
        updatedAt: "now",
        url: "https://github.com/pvcnt/mergeable/1",
        additions: 0,
        deletions: 0,
        author: { uid: "1:1", name: "pvcnt", avatarUrl: "" },
        comments: 0,
        starred: 0,
        sections: [],
    };

    expect(computeSize({...pull, additions: 1})).toBe("XS");
    expect(computeSize({...pull, deletions: 30})).toBe("M");
    expect(computeSize({...pull, additions: 500, deletions: 500})).toBe("XXL");
});