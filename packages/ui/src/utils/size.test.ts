import { test, expect } from "@jest/globals";
import { PullState } from "@repo/types";
import { computeSize } from "./size";

test("computeSize returns size of a pull request", () => {
    const pull = {
        uid: "github.com,pvcnt/reviewer/1",
        host: "github.com",
        repository: "pvcnt/reviewer",
        number: 1,
        title: "Title",
        state: PullState.Approved,
        createdAt: "now",
        updatedAt: "now",
        url: "https://github.com/pvcnt/reviewer/1",
        additions: 0,
        deletions: 0,
        author: {name: "pvcnt", avatarUrl: ""},
    };

    expect(computeSize({...pull, additions: 1})).toBe("XS");
    expect(computeSize({...pull, deletions: 30})).toBe("M");
    expect(computeSize({...pull, additions: 500, deletions: 500})).toBe("XXL");
});