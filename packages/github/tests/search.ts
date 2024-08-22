import { describe, test, expect } from "vitest";
import { SearchQuery, SearchOp, SearchTerm } from "@repo/github";

describe("SearchQuery", () => {
    const expectTerms = (str: string, terms: SearchTerm[]) => {
        const q = new SearchQuery(str);
        expect(q.terms).toEqual(terms);
        expect(q.toString()).toEqual(str);
    }

    test("parse from string", () => {
        expectTerms("", []);

        expectTerms("stars:>1000", [
            new SearchTerm({qualifier: "stars", op: SearchOp.AtLeast, value: "1000"})
        ]);
        expectTerms("topics:>=5", [
            new SearchTerm({qualifier: "topics", op: SearchOp.GreaterThan, value: "5"})
        ]);
        expectTerms("size:<10000", [
            new SearchTerm({qualifier: "size", op: SearchOp.AtMost, value: "10000"})
        ]);
        expectTerms("stars:<=50", [
            new SearchTerm({qualifier: "stars", op: SearchOp.LessThan, value: "50"})
        ]);

        expectTerms("stars:10..*", [
            new SearchTerm({qualifier: "stars", lower: "10", upper: "*"})
        ]);
        expectTerms("stars:*..10", [
            new SearchTerm({qualifier: "stars", lower: "*", upper: "10"})
        ]);
        expectTerms("stars:5..10", [
            new SearchTerm({qualifier: "stars", lower: "5", upper: "10"}),
        ]);
        
        expectTerms("foo bar", [
            new SearchTerm({keywords: "foo"}),
            new SearchTerm({keywords: "bar"}),
        ]);
        expectTerms("\"foo bar\"", [
            new SearchTerm({keywords: "foo bar"})
        ]);

        expectTerms("cats stars:>10 -language:javascript", [
            new SearchTerm({keywords: "cats"}),
            new SearchTerm({qualifier: "stars", op: SearchOp.AtLeast, value: "10"}),
            new SearchTerm({qualifier: "language", value: "javascript", exclude: true}),
        ]);
        expectTerms("mentions:defunkt -org:github", [
            new SearchTerm({qualifier: "mentions", value: "defunkt"}),
            new SearchTerm({qualifier: "org", value: "github", exclude: true}),
        ]);

        expectTerms("NOT hello world", [
            new SearchTerm({keywords: "hello", exclude: true}),
            new SearchTerm({keywords: "world"}),
        ]);
        expectTerms("NOT \"hello world\"", [
            new SearchTerm({keywords: "hello world", exclude: true})
        ]);
        expectTerms("hello NOT world", [
            new SearchTerm({keywords: "hello"}),
            new SearchTerm({keywords: "world", exclude: true}),
        ]);

        expectTerms("user:pvcnt", [
            new SearchTerm({qualifier: "user", value: "pvcnt"})
        ]);
        expectTerms("user:@me", [
            new SearchTerm({qualifier: "user", value: "@me"})
        ]);
    })

    test("has term(s) with qualifier", () => {
        const q = new SearchQuery("org:foo org:bar stars:>10");
        expect(q.has("org")).toBe(true);
        expect(q.has("stars")).toBe(true);
        expect(q.has("mentions")).toBe(false);
    })

    test("delete term(s) with qualifier", () => {
        const q = new SearchQuery("org:foo org:bar user:pvcnt stars:>10");

        q.delete("user");
        expect(q.toString()).toEqual("org:foo org:bar stars:>10")

        q.delete("org");
        expect(q.toString()).toEqual("stars:>10")
    })

    test("set term(s) with qualifier", () => {
        const q = new SearchQuery("user:pvcnt org:foo org:bar");

        q.set("org", "github");
        expect(q.toString()).toEqual("user:pvcnt org:github")

        q.setAll("org", ["foo", "bar"]);
        expect(q.toString()).toEqual("user:pvcnt org:foo org:bar")

        q.set("stars", "10", SearchOp.AtLeast);
        expect(q.toString()).toEqual("user:pvcnt org:foo org:bar stars:>10")

    })
})