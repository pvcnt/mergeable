import { defineConfig, type Config } from "@repo/jest-config";

const config: Config = defineConfig({
  setupFiles: ["fake-indexeddb/auto"],
});

export default config;