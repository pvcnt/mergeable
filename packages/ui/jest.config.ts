import type { JestConfigWithTsJest } from 'ts-jest';
import defaults from "@repo/jest-config";

const config: JestConfigWithTsJest = {
  ...defaults,
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
};

export default config;