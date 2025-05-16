import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { BlueprintProvider } from "@blueprintjs/core";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createIDBPersister, createQueryClient } from "./lib/react-query.ts";
import AppLayout from "./components/AppLayout.tsx";
import ErrorPage from "./error-page.tsx";
import Dashboard from "./routes/dashboard.tsx";
import Settings from "./routes/settings.tsx";
import Stars from "./routes/stars.tsx";
import "normalize.css/normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "./main.scss";

const routes = [
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/inbox" />,
      },
      {
        path: "/inbox",
        element: <Dashboard />,
      },
      {
        path: "/inbox/stars",
        element: <Stars />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
    ],
  },
];
const router = createBrowserRouter(routes);

const queryClient = createQueryClient();
const persister = createIDBPersister();

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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BlueprintProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <RouterProvider router={router} />
        <ReactQueryDevtools />
      </PersistQueryClientProvider>
    </BlueprintProvider>
  </React.StrictMode>,
);
