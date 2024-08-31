/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/index.js", "plugin:react-hooks/recommended"],
  ignorePatterns: ["public/**"],
  plugins: ["react-refresh"],
  parserOptions: {
    project: true,
  },
};
