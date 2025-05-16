import { PassThrough } from "node:stream";
import type { EntryContext } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import * as ReactDOMServer from "react-dom/server";

// https://reactrouter.com/explanation/special-files#streamtimeout
export const streamTimeout = 5_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  const userAgent = request.headers.get("user-agent");

  if ("renderToReadableStream" in ReactDOMServer) {
    // This method is only available in edge runtimes, e.g., Cloudflare Workers.
    let shellRendered = false;
    const body = await ReactDOMServer.renderToReadableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        onError(error: unknown) {
          responseStatusCode = 500;
          handleError(error, shellRendered);
        },
      },
    );
    shellRendered = true;
    // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
    // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
    if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
      await body.allReady;
    }
    return makeResponse(body, responseHeaders, responseStatusCode);
  } else {
    return new Promise((resolve, reject) => {
      let shellRendered = false;

      // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
      // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
      const readyOption: keyof RenderToPipeableStreamOptions =
        (userAgent && isbot(userAgent)) || routerContext.isSpaMode
          ? "onAllReady"
          : "onShellReady";

      const { pipe, abort } = ReactDOMServer.renderToPipeableStream(
        <ServerRouter context={routerContext} url={request.url} />,
        {
          [readyOption]() {
            shellRendered = true;
            const body = new PassThrough();
            const stream = createReadableStreamFromReadable(body);
            resolve(makeResponse(stream, responseHeaders, responseStatusCode));
            pipe(body);
          },
          onShellError(error: unknown) {
            reject(error);
          },
          onError(error: unknown) {
            responseStatusCode = 500;
            handleError(error, shellRendered);
          },
        },
      );

      // Abort the rendering stream after the `streamTimeout` so it has time to
      // flush down the rejected boundaries
      setTimeout(abort, streamTimeout + 1000);
    });
  }
}

function makeResponse(
  stream: ReadableStream,
  headers: Headers,
  status: number,
) {
  headers.set("Content-Type", "text/html");
  return new Response(stream, { headers, status });
}

function handleError(error: unknown, shellRendered: boolean) {
  // Log streaming rendering errors from inside the shell.  Don't log
  // errors encountered during initial shell rendering since they'll
  // reject and get logged in handleDocumentRequest.
  if (shellRendered) {
    console.error(error);
  }
}
