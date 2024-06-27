import { defineConfig, type Config } from "@repo/jest-config";

const config: Config = defineConfig({
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
});

export default config;