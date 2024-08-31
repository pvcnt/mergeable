export type User = {
  name: string;
  avatarUrl: string;
  bot: boolean;
};

export type Team = {
  name: string;
};

export type Profile = {
  user: User;
  teams: Team[];
};
