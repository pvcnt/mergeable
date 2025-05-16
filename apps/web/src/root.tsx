import { useState } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { createQueryClient, createIDBPersister } from "./lib/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BlueprintProvider } from "@blueprintjs/core";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import type { Route } from "./+types/root";
import "normalize.css/normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "./styles.scss";

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="/env.js" type="text/javascript" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

if (!import.meta.env.SSR) {
  // This ugly switch is needed to support the worker in dev mode.
  if (import.meta.env.DEV) {
    new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
  } else {
    new Worker(new URL("./worker.ts", import.meta.url), {
      type: "classic",
    });
  }
}

export default function App() {
  // Ensure that each request has its own cache.
  const [queryClient] = useState(createQueryClient);
  const persister = createIDBPersister();
  return (
    <BlueprintProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <Outlet />
        <ReactQueryDevtools initialIsOpen={false} />
      </PersistQueryClientProvider>
    </BlueprintProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
