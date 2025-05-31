import { type PluginOption, loadEnv } from "vite";
import path from "node:path";
import MagicString from "magic-string";
import assert from "assert";

type EnvVars = Record<string, string>;

interface Options {
  extraEnv?: () => EnvVars;
}

// Constants that never change.
const transformedExtensions = new Set([".js", ".jsx", ".ts", ".tsx"]);
const workerUrlRE =
  /\bnew\s+(?:Worker|SharedWorker)\s*\(\s*new\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*\)/g;

// Global state, to persist between consecutive invocations of Vite
// (in practice, between worker and non-worker builds).
const workerIds: Set<string> = new Set();

/**
 * Expose `process.env` environment variables to your client code.
 *
 * @param {Options} options
 */
export function processEnv({ extraEnv }: Options = {}): PluginOption {
  // Local state, that is reset between consecutive invocations of Vite.
  let shouldGenerateSourcemap = false;
  let env: EnvVars = {};
  let workerScript = "";
  let command = "";

  return {
    name: "vite-plugin-process-env",
    configResolved(config) {
      shouldGenerateSourcemap = config.build.sourcemap !== false;
      command = config.command;

      // Load build-time environment variables.
      env = loadEnv(config.mode, config.envDir, config.envPrefix);
      if (extraEnv !== undefined) {
        env = { ...env, ...extraEnv };
      }

      if (config.isWorker) {
        workerScript = `globalThis.env = ${JSON.stringify(env)};`;
        if (config.isProduction) {
          workerScript += "importScripts('/env.js');";
        }
        workerScript += "\n";
      }
    },
    buildStart() {
      this.info(`Env vars: ${Object.keys(env).join(", ")}`);
    },
    generateBundle() {
      // Generate a template file that defines overrides for environment variables. This file is intended
      // to processed by envsubst to produce an `env.js` file.
      const rtenv = Object.fromEntries(
        Object.keys(env).map((key) => [key, `$${key}`]),
      );
      const source =
        `const rtenv = ${JSON.stringify(rtenv)};` +
        "globalThis.env = { ...globalThis.env, ...Object.fromEntries(Object.entries(rtenv).filter(([k, v]) => v.length > 0)) };";
      this.emitFile({
        type: "asset",
        fileName: "env.template.js",
        source,
      });
      this.emitFile({
        type: "asset",
        fileName: "env.js",
        source: `globalThis.env = ${JSON.stringify(env)};`,
      });
    },
    transform(code, id) {
      const extension = path.extname(id);
      if (!transformedExtensions.has(extension)) {
        // Do not transform files that are not Javascript or Typescript files.
        return;
      }

      for (const match of code.matchAll(workerUrlRE)) {
        let filepath = match[1].slice(1, -1);
        if (path.extname(filepath).length === 0) {
          filepath = filepath + extension;
        }
        workerIds.add(path.join(path.dirname(id), filepath));
      }

      const s = new MagicString(code);
      if (workerScript.length > 0 && workerIds.has(id)) {
        s.prepend(workerScript);
      }
      s.replace(/import\.meta\.env\.([A-Za-z0-9$_]+)/g, (match, name) => {
        assert(typeof name === "string");
        if (name in env) {
          if (command === "serve") {
            // When running development server, replace environment variables directly.
            return JSON.stringify(env[name]);
          } else {
            // In production, access the dynamically injected environment.
            return `globalThis.env.${name}`;
          }
        } else {
          return match;
        }
      });
      if (!s.hasChanged()) {
        return;
      }
      if (!shouldGenerateSourcemap) {
        return s.toString();
      }
      const map = s.generateMap({
        source: id,
        includeContent: true,
        hires: true,
      });
      return {
        code: s.toString(),
        map: map.toString(),
      };
    },
    transformIndexHtml() {
      return [
        {
          tag: "script",
          injectTo: "head-prepend",
          children: `globalThis.env = ${JSON.stringify(env)};`,
        },
        {
          tag: "script",
          injectTo: "head-prepend",
          attrs: { src: "/env.js" },
        },
      ];
    },
  };
}
