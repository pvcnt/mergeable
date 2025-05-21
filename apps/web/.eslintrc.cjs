/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "@repo/eslint-config/index.js",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["public/**"],
  plugins: ["react-refresh"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      "./tsconfig.node.json",
      "./tsconfig.vite.json",
      "./tsconfig.cloudflare.json",
    ],
  },
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { args: "none" },
    ]
  },
};
