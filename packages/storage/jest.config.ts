import type { JestConfigWithTsJest } from 'ts-jest';
import defaults from "@repo/jest-config";

const config: JestConfigWithTsJest = {
  ...defaults,
  setupFiles: ["fake-indexeddb/auto"],
};

export default config;