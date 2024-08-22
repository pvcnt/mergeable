import { defineConfig } from "vite";
import processEnv from "@repo/vite-plugin-process-env";

export default defineConfig({
  build: {
    minify: false,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    },
  },
  plugins: [
    processEnv({keys: ["APP_VERSION"]}),
  ],
});