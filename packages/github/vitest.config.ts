import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**"],
    coverage: {
      include: ["src/**"],
      provider: "istanbul",
    },
  },
});