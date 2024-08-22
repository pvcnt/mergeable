import { describe, it, expect } from "vitest";
import { splitQueries, joinQueries } from "@repo/types";

describe("Section", () => {
    it("should split a search string into queries", () => {
        expect(splitQueries("a")).toEqual(["a"]);
        expect(splitQueries("a;b")).toEqual(["a", "b"]);
        expect(splitQueries("   a ;  b ")).toEqual(["a", "b"]);
        expect(splitQueries('"a;b";c')).toEqual(["a;b", "c"]);
        expect(splitQueries("a; ;c")).toEqual(["a", "c"]);
    })

    it("should merge queries into a search string", () => {
        expect(joinQueries(["a"])).toEqual("a");
        expect(joinQueries(["a", "b"])).toEqual("a;b");
        expect(joinQueries(["   a ", "  b "])).toEqual("a;b");
        expect(joinQueries(["a", "", "c"])).toEqual("a;c");
        expect(joinQueries([""])).toEqual("");
    })
})