import { test, expect } from "@jest/globals";
import { PullState } from "@repo/types";
import { getPullUid } from "./pull";

test("getPullUid returns a unique identifier", () => {
    const pull = {
        host: "github.com",
        repository: "pvcnt/reviewer",
        id: "1",
        title: "Title",
        state: PullState.Approved,
        createdAt: "now",
        updatedAt: "now",
        url: "https://github.com/pvcnt/reviewer/1",
        additions: 1,
        deletions: 0,
        author: {name: "pvcnt", avatarUrl: ""},
    };
    
    expect(getPullUid(pull)).toBe("github.com,pvcnt/reviewer,1");
});