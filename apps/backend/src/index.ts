import { githubAuth } from "@hono/oauth-providers/github";
import { Hono } from "hono";
import { env } from "hono/adapter";

export type Env = {
  MERGEABLE_GITHUB_CLIENT_ID: string;
  MERGEABLE_GITHUB_CLIENT_SECRET: string;
};

const app = new Hono();

app.get(
  "/auth/github",
  (c, next) => {
    const { MERGEABLE_GITHUB_CLIENT_ID, MERGEABLE_GITHUB_CLIENT_SECRET } =
      env<Env>(c);
    const middleware = githubAuth({
      scope: ["user", "repo", "read:org"],
      oauthApp: true,
      client_id: MERGEABLE_GITHUB_CLIENT_ID,
      client_secret: MERGEABLE_GITHUB_CLIENT_SECRET,
    });
    return middleware(c, next);
  },
  (c) => {
    const token = c.get("token");
    return c.redirect(`https://mergeable.pages.dev/#token=${token?.token}`);
  },
);

export default app;
