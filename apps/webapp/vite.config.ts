import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { codecovVitePlugin } from "@codecov/vite-plugin";
import processEnv from "@repo/vite-plugin-process-env";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
        }
      }
    }
  }
});
