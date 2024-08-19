import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["fake-indexeddb/auto"],
    coverage: {
      enabled: true,
      include: ["src/**"],
      provider: "istanbul",
      reporter: ["text", "lcovonly"],
    },
  },
});