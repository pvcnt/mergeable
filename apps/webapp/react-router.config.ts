import type { Config } from "@react-router/dev/config";

// https://api.reactrouter.com/v7/types/_react_router_dev.config.Config.html
export default {
  appDirectory: "src",
  buildDirectory: "dist",
  ssr: true,
} satisfies Config;
