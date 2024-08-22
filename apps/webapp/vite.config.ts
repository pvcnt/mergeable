import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { comlink } from "vite-plugin-comlink";
import processEnv from "@repo/vite-plugin-process-env";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    comlink(),
    react(),
    processEnv({
      keys: [
        "MERGEABLE_GITHUB_URLS",
        "MERGEABLE_PR_SIZES",
      ],
    }),
  ],
  worker: {
    plugins: () => [comlink()],
  },
})
