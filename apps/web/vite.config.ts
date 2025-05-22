import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import { codecovVitePlugin } from "@codecov/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRouter(),
    codecovVitePlugin({ uploadToken: process.env.CODECOV_TOKEN }),
  ],
  envPrefix: ["VITE_", "MERGEABLE_"],
});
