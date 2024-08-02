import { defineConfig, type Config } from "@repo/jest-config";

const config: Config = defineConfig({
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
  setupFiles: ["fake-indexeddb/auto"],
});

export default config;