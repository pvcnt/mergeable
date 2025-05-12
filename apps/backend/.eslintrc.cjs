/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "@repo/eslint-config/index.js",
    "plugin:@tanstack/query/recommended",
  ],
  parserOptions: {
    project: true,
  },
};
