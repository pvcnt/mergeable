import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

// https://reactrouter.com/start/framework/routing
export default [
  index("routes/login.tsx"),
  layout("components/AppLayout.tsx", [
    route("inbox", "routes/dashboard.tsx"),
    route("inbox/stars", "routes/stars.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
] satisfies RouteConfig;
