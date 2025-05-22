import { createRequestHandler } from "react-router";
import type { ServerBuild } from "react-router";
// @ts-expect-error This file wont exist if it hasn't yet been built
import * as build from "../dist/server/index.js";
import { logHttpRequest } from "./logging.js";

const requestHandler = createRequestHandler(
  build as unknown as ServerBuild,
  process.env.NODE_ENV,
);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const start = Date.now();
    let response: Response | null = null;
    try {
      response = await env.ASSETS.fetch(request);
      if (response.status >= 200 && response.status < 400) {
        return response;
      } else {
        const loadContext = {
          request,
          context: {
            cloudflare: {
              ctx,
              env,
              caches,
              cf: request.cf as never,
            },
          },
        };
        response = await requestHandler(request, loadContext);
        return response;
      }
    } finally {
      logHttpRequest(request, {
        status: response?.status,
        duration: (Date.now() - start) / 1000,
      });
    }
  },
} satisfies ExportedHandler<Env>;
