import { afterEach, describe, it, expect, vi } from "vitest";
import { build } from "vite";
import type { InlineConfig } from "vite";
import { rmSync, readFileSync } from "fs";
import { join } from "path";

function readDistFile(filename: string) {
    const distPath = join(__dirname, "fixtures", "app", "dist");
    const filepath = join(distPath, filename);
    return readFileSync(filepath, { encoding: "utf8" });
}

async function buildFixture(options?: InlineConfig) {
    const root = join(__dirname, "fixtures", "app")
    await build({ root, logLevel: "warn", ...options })
}

describe("vite-plugin-process-env", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        rmSync(join(__dirname, "fixtures", "app", "dist"), { recursive: true });
    })

    it("should build", async () => {
        vi.stubEnv("APP_VERSION", "v1");

        await buildFixture();

        expect(readDistFile("assets/index.js")).toContain("define_process_env_default.APP_VERSION");
        expect(readDistFile("env.template.js")).toContain('export default {"APP_VERSION":"${APP_VERSION:-}"};');
        expect(readDistFile("index.html")).toContain(
            '<script type="module">globalThis.env = {"APP_VERSION":"v1"};try { const rtenv = (await import("/env.js")).default; globalThis.env = {...globalThis.env, ...Object.fromEntries(Object.entries(rtenv).filter(kv => kv[1].length > 0))}; } catch (e) {}</script>'
        );
    })
})