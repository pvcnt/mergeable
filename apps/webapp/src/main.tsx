import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { BlueprintProvider } from "@blueprintjs/core";
import App from "./App.tsx";
import ErrorPage from "./error-page.tsx";
import Dashboard from "./routes/dashboard.tsx";
import Settings from "./routes/settings.tsx";
import Stars from "./routes/stars.tsx";
import "./main.scss";

const routes = [
  {
    path: "/",
    element: <App />,
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
const router = createBrowserRouter(routes, {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BlueprintProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </BlueprintProvider>
  </React.StrictMode>,
);
