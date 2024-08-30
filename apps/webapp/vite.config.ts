import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { comlink } from "vite-plugin-comlink";
import { codecovVitePlugin } from "@codecov/vite-plugin";
import processEnv from "@repo/vite-plugin-process-env";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    comlink(),
    react(),
    processEnv(),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "webapp",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
  worker: {
    plugins: () => [
      comlink(),
      processEnv(),
    ],
  },
  envPrefix: ["VITE_", "MERGEABLE_"],
})
