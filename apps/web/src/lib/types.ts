import type { Profile } from "../lib/github/types";

export const DEFAULT_SECTION_LIMIT = 50;
export const MAX_SECTION_LIMIT = 50;

/**
 * Properties for a section, as provided by a user in a form or API.
 */
export type SectionProps = {
  label: string;
  search: string;
  attention: boolean;
  limit?: number;
};

export const defaultSections: SectionProps[] = [
  {
    label: "Incoming reviews",
    search:
      "is:open -author:@me review-requested:@me ; is:open -author:@me involves:@me",
    attention: true,
    limit: DEFAULT_SECTION_LIMIT,
  },
  {
    label: "Outgoing reviews",
    search: "is:open author:@me draft:false",
    attention: true,
    limit: DEFAULT_SECTION_LIMIT,
  },
  {
    label: "Draft reviews",
    search: "is:open author:@me draft:true",
    attention: true,
    limit: DEFAULT_SECTION_LIMIT,
  },
];

/**
 * A section, as saved in the database.
 */
export type Section = SectionProps & {
  id: string;
  position: number;
};

/**
 * Properties for a connection, as provided by a user in a form or API.
 */
export type ConnectionProps = {
  label: string;
  baseUrl: string;
  host: string;
  auth: string;
  orgs: string[];
};

/**
 * A connection, as saved in the database.
 */
export type Connection = ConnectionProps & {
  id: string;
  viewer?: Profile;
};

/**
 * A star, as saved in the database.
 */
export type Star = {
  uid: string;
};
