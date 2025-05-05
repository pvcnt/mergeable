export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  bot: boolean;
};

export type Team = {
  id: string;
  name: string;
};

export type Profile = {
  user: User;
  teams: Team[];
};

export type Review = {
  author: User | null;
  collaborator: boolean;
  approved: boolean;
};

export type Discussion = {
  resolved: boolean;
  numComments: number;
  participants: Participant[];
  file?: { path: string; line?: number };
};

export type Participant = {
  user: User;
  numComments: number;
  lastActiveAt: string;
};

export type CheckState = "pending" | "error" | "failure" | "success";

export type Check = {
  name: string;
  state: CheckState;
  description: string | null;
  url: string | null;
};

export type PullState =
  | "draft"
  | "pending"
  | "approved"
  | "enqueued"
  | "merged"
  | "closed";

export type QueueState = "pending" | "mergeable" | "unmergeable";

export type PullProps = {
  id: string;
  repo: string;
  number: number;
  title: string;
  body: string;
  state: PullState;
  checkState: CheckState;
  queueState?: QueueState;
  createdAt: string;
  updatedAt: string;
  enqueuedAt?: string;
  mergedAt?: string;
  closedAt?: string;
  locked: boolean;
  url: string;
  labels: string[];
  additions: number;
  deletions: number;
  author: User | null;
  requestedReviewers: User[];
  requestedTeams: Team[];
  reviews: Review[];
  checks: Check[];
  discussions: Discussion[];
};

export type Attention = {
  set: boolean;
  reason?: string;
};

export type Pull = PullProps & {
  uid: string;
  host: string;
  starred: number; // boolean is not indexable.
  sections: string[];
  attention?: Attention;
  connection: string;
  schemaVersion?: string;
};
