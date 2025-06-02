import { githubAuth } from "@hono/oauth-providers/github";
import { Hono } from "hono";
import { getPrismaClient } from "./db";
import { environ } from "./env";
import { logger } from "./logging";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return c.json({ ok: false }, 500);
});

app.use(async (c, next) => {
  const start = Date.now();
  try {
    await next();
  } finally {
    const url = new URL(c.req.url);
    const attrs: Record<string, string | number> = {
      "http.request.method": c.req.method,
      "url.scheme": url.protocol.substring(0, url.protocol.length - 1),
      "url.path": url.pathname,
      "http.response.status_code": c.res.status,
      "http.server.request.duration": (Date.now() - start) / 1000,
    };
    if (c.error) {
      attrs["exception.type"] = c.error.name;
      attrs["exception.message"] = c.error.message;
      if (c.error.stack) {
        attrs["exception.stacktrace"] = c.error.stack;
      }
    }
    logger.info(attrs);
  }
});

app.get("/health", (c) => c.text("OK"));

app.get(
  "/auth/github",
  (c, next) => {
    const env = environ(c);
    const middleware = githubAuth({
      scope: ["user", "repo", "read:org"],
      oauthApp: true,
      client_id: env.MERGEABLE_GITHUB_CLIENT_ID,
      client_secret: env.MERGEABLE_GITHUB_CLIENT_SECRET,
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
    const env = environ(c);
    const prisma = getPrismaClient(env);
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
    return c.redirect(`${env.MERGEABLE_APP_URL}/?auth=${token?.token}`);
  },
);

export default app;
