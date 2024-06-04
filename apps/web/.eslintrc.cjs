/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "@repo/eslint-config/index.js",
    "plugin:react-hooks/recommended",
  ],
  plugins: ["react-refresh"],
  parserOptions: {
    project: true,
  },
};
