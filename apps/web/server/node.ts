import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { createRequestHandler, type ServerBuild } from "react-router";
import sourceMapSupport from "source-map-support";
import { Hono } from "hono";
import { compress } from "hono/compress";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
// @ts-expect-error This file wont exist if it hasn't yet been built
import * as build from "../dist/server/index.js";
import { logHttpRequest } from "./logging.ts";

sourceMapSupport.install({
  retrieveSourceMap: function (source) {
    if (source.startsWith("file://")) {
      const filePath = url.fileURLToPath(source);
      const sourceMapPath = `${filePath}.map`;
      if (fs.existsSync(sourceMapPath)) {
        return {
          url: source,
          map: fs.readFileSync(sourceMapPath, "utf8"),
        };
      }
    }
    return null;
  },
});

const port = parseInt(process.env.PORT || "3000");
const serverBuild = build as unknown as ServerBuild;
const requestHandler = createRequestHandler(serverBuild, process.env.NODE_ENV);

const app = new Hono();
app.use(compress());
app.use(async (c, next) => {
  const start = Date.now();
  try {
    await next();
  } finally {
    logHttpRequest(c.req.raw, {
      status: c.res.status,
      duration: (Date.now() - start) / 1000,
    });
  }
});
app.use(
  path.posix.join(serverBuild.publicPath, "assets", "*"),
  serveStatic({
    root: path.join(serverBuild.assetsBuildDirectory, "assets"),
    onFound: (_, c) => {
      c.header("Cache-Control", "immutable, max-age=3600");
    },
  }),
);
app.use(
  path.posix.join(serverBuild.publicPath, "*"),
  serveStatic({ root: serverBuild.assetsBuildDirectory }),
);
app.use(
  path.posix.join(serverBuild.publicPath, "*"),
  serveStatic({
    root: "public",
    onFound: (_, c) => {
      c.header("Cache-Control", "max-age=3600");
    },
  }),
);
app.all("*", async (c) => {
  return await requestHandler(c.req.raw);
});

console.log(`Starting server on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
