import { createRequestHandler } from "react-router";
import type { ServerBuild } from "react-router";
// @ts-expect-error This file wont exist if it hasn't yet been built
import * as build from "../dist/server";

const requestHandler = createRequestHandler(
  build as unknown as ServerBuild,
  process.env.NODE_ENV,
);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const response = await env.ASSETS.fetch(request);
    if (response.status >= 200 && response.status < 400) {
      return response;
    }
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
    return requestHandler(request, loadContext);
  },
} satisfies ExportedHandler<Env>;
