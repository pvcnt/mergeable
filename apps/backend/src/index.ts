import { githubAuth } from "@hono/oauth-providers/github";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { getPrismaClient } from "./db";
import type { Env } from "./env";

const app = new Hono();

app.get("/health", (c) => c.text("OK"));

app.get(
  "/auth/github",
  (c, next) => {
    const vars = env<Env>(c);
    // Those environment variables are not required for the app to run, but still required
    // for the GitHub auth middleware.
    if (
      !vars.MERGEABLE_GITHUB_CLIENT_ID ||
      !vars.MERGEABLE_GITHUB_CLIENT_SECRET
    ) {
      return c.json({ error: "GitHub client ID and secret are not set" }, 500);
    }
    const middleware = githubAuth({
      scope: ["user", "repo", "read:org"],
      oauthApp: true,
      client_id: vars.MERGEABLE_GITHUB_CLIENT_ID,
      client_secret: vars.MERGEABLE_GITHUB_CLIENT_SECRET,
    });
    return middleware(c, next);
  },
  async (c) => {
    // Get the user from the GitHub auth middleware.
    const githubUser = c.get("user-github");
    if (!githubUser || !githubUser.id || !githubUser.login) {
      return c.json({ error: "user not found" }, 400);
    }

    // Upsert the user in the database with the latest data from GitHub.
    // Login and avatar URL might both change over time.
    const vars = env<Env>(c);
    const prisma = getPrismaClient(vars);
    const attrs = {
      login: githubUser.login,
      avatarUrl: githubUser.avatar_url,
      lastUsedAt: new Date(),
    };
    await prisma.user.upsert({
      where: { githubId: githubUser.id },
      update: attrs,
      create: { githubId: githubUser.id, ...attrs },
    });

    const token = c.get("token");
    return c.redirect(`${vars.MERGEABLE_HOST_URL}/?token=${token?.token}`);
  },
);

export default app;
