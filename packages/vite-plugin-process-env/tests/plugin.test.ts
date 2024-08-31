import { afterEach, describe, it, expect, vi } from "vitest";
import { build } from "vite";
import { rmSync, readFileSync } from "fs";
import { join } from "path";
import { processEnv } from "../src/plugin.js";

function readDistFile(filename: string) {
  const distPath = join(__dirname, "fixtures", "app", "dist");
  const filepath = join(distPath, filename);
  return readFileSync(filepath, { encoding: "utf8" });
}

async function buildFixture() {
  const root = join(__dirname, "fixtures", "app");
  await build({
    root,
    logLevel: "warn",
    build: {
      minify: false,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      },
    },
    plugins: [processEnv()],
  });
}

describe("vite-plugin-process-env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    rmSync(join(__dirname, "fixtures", "app", "dist"), { recursive: true });
  });

  it("should build", async () => {
    vi.stubEnv("VITE_APP_VERSION", "v1");

    await buildFixture();

    expect(readDistFile("assets/index.js")).toContain(
      "console.log(globalThis.env.VITE_APP_VERSION)",
    );
    expect(readDistFile("env.template.js")).toContain(
      `const rtenv = {"VITE_APP_VERSION":"$VITE_APP_VERSION"};globalThis.env = { ...globalThis.env, ...Object.fromEntries(Object.entries(rtenv).filter(([k, v]) => v.length > 0)) };`,
    );

    expect(readDistFile("index.html")).toContain(
      `<script>globalThis.env = {"VITE_APP_VERSION":"v1"};</script>`,
    );
    expect(readDistFile("index.html")).toContain(
      `<script src="/env.js"></script>`,
    );
  });
});
