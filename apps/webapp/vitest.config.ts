import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: [
      "fake-indexeddb/auto",
      "dotenv/config",
      "test-setup.ts",
    ],
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      include: ["src/**"],
      provider: "istanbul",
    },
  },
});