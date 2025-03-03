import { githubAuth } from "@hono/oauth-providers/github";
import { Hono } from "hono";

const app = new Hono();

app.get(
  "/",
  githubAuth({
    scope: ["user", "repo", "read:org"],
    oauthApp: true,
    redirect_uri: "https://mergeable-login.pvcnt.workers.dev",
  }),
  (c) => {
    const token = c.get("token");
    return c.redirect(`https://mergeable.pages.dev/#token=${token?.token}`);
  },
);

export default app;
