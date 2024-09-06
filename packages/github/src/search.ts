import { Connection } from "@repo/model";

/**
 * Split a search string into multiple GitHub search queries.
 *
 * Multiple queries can be concatenated in a single search string by using
 * a semi-colon (";") as a delimiter. Individual queries are trimmed, and
 * empty queries are ignored.
 *
 * @param search A search string.
 * @returns A list of search queries.
 */
export function splitQueries(search: string): string[] {
  const queries: string[] = [];
  let query = "";
  let quoted = false;
  for (const c of search) {
    if (c === ";" && !quoted) {
      queries.push(query);
      query = "";
    } else if (c === '"') {
      quoted = !quoted;
    } else {
      query += c;
    }
  }
  queries.push(query);
  return queries.map((s) => s.trim()).filter((s) => s.length > 0);
}

export function prepareQuery(search: string, connection: Connection): string {
  const q = new SearchQuery(search);
  // Enforce searching for PRs. There are two syntaxes to search for PRs: "type:pr"
  // and "is:pr". We make sure there are no duplicate filters, which would return
  // no results.
  q.set("type", "pr");
  q.delete("is", "pr");

  if (!q.has("archived")) {
    // Unless the query explicitely allows PRs from archived repositories, exclude
    // them by default as we cannot act on them anymore.
    q.set("archived", "false");
  }

  // Filter by org as required by the connection.
  if (connection.orgs.length > 0) {
    q.setAll("org", connection.orgs);
  }
  if (q.has("org") && q.has("repo")) {
    // GitHub API does not seem to support having both terms with an "org"
    // and "repo" qualifier in a given query. In this situation, the term
    // with the "repo" qualifier is apparently ignored. We remediate to this
    // situation by keeping droping terms with the "org" qualifier, and
    // keeping the more precise "repo" qualifier.
    //
    // Note: We ignore the situation where the targeted repo(s) are not within
    // the originally targeted org(s).
    q.delete("org");
  }

  return q.toString();
}

/**
 * Represents a GitHub search query for issues and pull requests.
 *
 * A search query is broken down into terms, which are AND'ed together. A term
 * may be associated with a qualifier (e.g., `author:@me`, where the qualifier
 * is `author`). When the qualifier is missing, it is a keyword search that is
 * matched against the title, body or comments of an issue.
 *
 * @see https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests
 * @see https://docs.github.com/en/search-github/getting-started-with-searching-on-github/understanding-the-search-syntax
 */
export class SearchQuery {
  terms: SearchTerm[];

  constructor(init?: SearchTerm[] | string) {
    if (init === undefined) {
      this.terms = [];
    } else if (typeof init === "string") {
      this.terms = this.parseTerms(init);
    } else {
      this.terms = init;
    }
  }

  has(qualifier: string): boolean {
    return this.terms.some((t) => t.qualifier === qualifier);
  }

  set(qualifier: string, value: string, op?: SearchOp): undefined {
    this.delete(qualifier);
    this.terms.push(new SearchTerm({ qualifier, op, value }));
  }

  setAll(qualifier: string, values: string[]): undefined {
    this.delete(qualifier);
    values.forEach((value) =>
      this.terms.push(new SearchTerm({ qualifier, value })),
    );
  }

  delete(qualifier: string, value?: string): undefined {
    const matches = (t: SearchTerm) =>
      t.qualifier === qualifier &&
      (value === undefined || (t.values.length === 1 && t.values[0] === value));
    this.terms = this.terms.filter((t) => !matches(t));
  }

  toString(): string {
    return this.terms.map((t) => t.toString()).join(" ");
  }

  private parseTerms(str: string): SearchTerm[] {
    // https://stackoverflow.com/a/16261693
    const parts = str.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const terms: SearchTerm[] = [];
    let not = false;
    for (const part of parts) {
      if (part === "NOT") {
        not = true;
      } else {
        terms.push(this.parseTerm(part, not));
        not = false;
      }
    }
    return terms;
  }

  private parseTerm(str: string, not: boolean): SearchTerm {
    const exclude = str.startsWith("-");
    const colonPos = str.indexOf(":");
    if (colonPos > -1) {
      // There is a qualifier.
      const lhs = str.slice(0, colonPos);
      const rhs = unquote(str.slice(colonPos + 1));
      const qualifier = exclude ? lhs.slice(1) : lhs;
      const rangePos = rhs.indexOf("..");
      if (rangePos > -1) {
        const lower = rhs.slice(0, rangePos);
        const upper = rhs.slice(rangePos + 2);
        return new SearchTerm({ qualifier, lower, upper });
      } else if (rhs.startsWith(">=")) {
        const value = rhs.slice(2);
        return new SearchTerm({
          qualifier,
          op: SearchOp.GreaterThan,
          value,
          exclude,
        });
      } else if (rhs.startsWith(">")) {
        const value = rhs.slice(1);
        return new SearchTerm({
          qualifier,
          op: SearchOp.AtLeast,
          value,
          exclude,
        });
      } else if (rhs.startsWith("<=")) {
        const value = rhs.slice(2);
        return new SearchTerm({
          qualifier,
          op: SearchOp.LessThan,
          value,
          exclude,
        });
      } else if (rhs.startsWith("<")) {
        const value = rhs.slice(1);
        return new SearchTerm({
          qualifier,
          op: SearchOp.AtMost,
          value,
          exclude,
        });
      } else {
        return new SearchTerm({ qualifier, value: rhs, exclude });
      }
    } else {
      // There is no qualifier, it is a keyword match.
      const keywords = unquote(str);
      return new SearchTerm({ keywords, exclude: not });
    }
  }
}

export class SearchTerm {
  readonly qualifier?: string;
  readonly op?: SearchOp;
  readonly values: string[];
  readonly exclude: boolean;

  constructor(
    props:
      | { qualifier?: string; op?: SearchOp; value: string; exclude?: boolean }
      | { keywords: string; exclude?: boolean }
      | { qualifier: string; lower: string; upper: string; exclude?: boolean },
  ) {
    if ("lower" in props && "upper" in props) {
      this.qualifier = props.qualifier;
      this.values = [props.lower, props.upper];
    } else if ("keywords" in props) {
      this.values = [props.keywords];
    } else {
      this.qualifier = props.qualifier;
      this.op = props.op;
      this.values = [props.value];
    }
    this.exclude = props.exclude || false;
  }

  toString(): string {
    if (this.qualifier === undefined) {
      return (this.exclude ? "NOT " : "") + quote(this.values[0]);
    } else {
      const prefix = this.exclude ? "-" : "";
      if (this.values.length == 2) {
        return `${prefix}${this.qualifier}:${this.values[0]}..${this.values[1]}`;
      } else {
        const op = this.op || "";
        return `${prefix}${this.qualifier}:${op}${quote(this.values[0])}`;
      }
    }
  }
}

export enum SearchOp {
  GreaterThan = ">=",
  AtLeast = ">",
  LessThan = "<=",
  AtMost = "<",
}

function unquote(str: string): string {
  if (str.startsWith('"')) {
    str = str.slice(1);
  }
  if (str.endsWith('"')) {
    str = str.slice(0, -1);
  }
  return str;
}

function quote(str: string): string {
  return str.indexOf(" ") > -1 ? `"${str}"` : str;
}
