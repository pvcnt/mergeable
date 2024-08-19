import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["fake-indexeddb/auto", "test-setup.ts"],
    coverage: {
      enabled: true,
      include: ["src/**"],
      provider: "istanbul",
      reporter: ["text", "lcovonly"],
    },
  },
});