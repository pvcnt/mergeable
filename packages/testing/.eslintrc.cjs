/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  ignorePatterns: [".eslintrc.cjs"],
  extends: ["@repo/eslint-config/index.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.build.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { args: "none" },
    ]
  },
};
