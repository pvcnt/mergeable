import { Plugin } from "vite";

interface Options {
  /**
   * Name of environment variables that will be made available.
   */
  keys: string[]
}

/**
 * Expose `process.env` environment variables to your client code.
 *
 * @param {Options} options
 */
export function processEnv({ keys }: Options): Plugin {
  return {
    name: "vite-plugin-process-env",
    config () {
      const define = Object.fromEntries(keys.map(key => [`import.meta.env.${key}`, `globalThis.env.${key}`]));
      return { define };
    },
    generateBundle() {
      // Generate a template file that defines overrides for environment variables. This file is intended
      // to processed by envsubst (the one from https://github.com/a8m/envsubst, that supports basic
      // Bash-like variable expansion) to produce an `env.js` file.
      const template = Object.fromEntries(keys.map(key => [key, `\${${key}:-}`]));
      this.emitFile({
        type: "asset",
        fileName: "env.template.js",
        source: `export default ${JSON.stringify(template)};`,
      });
    },
    transformIndexHtml() {
      // Injects a script into `index.html` that provides values for environment variables.
      // Value is one of the following, by order of precedence:
      // - Provided by 
      const env = Object.fromEntries(keys.map(key => [key, process.env[key] !== undefined ? process.env[key] : ""]));
      const script = [
        `globalThis.env = ${JSON.stringify(env)};`,
        `try { const rtenv = (await import("/env.js")).default; globalThis.env = {...globalThis.env, ...Object.fromEntries(Object.entries(rtenv).filter(kv => kv[1].length > 0))}; } catch (e) {}`,
      ]
      return [
        {
          tag: "script",
          attrs: {
            type: "module",
          },
          children: script.join(""),
          injectTo: "head-prepend",
        },
      ];
    }
  }
}