import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import { codecovVitePlugin } from "@codecov/vite-plugin";
import processEnv from "@repo/vite-plugin-process-env";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRouter(),
    processEnv(),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "webapp",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
  worker: {
    plugins: () => [processEnv()],
  },
  envPrefix: ["VITE_", "MERGEABLE_"],
});
