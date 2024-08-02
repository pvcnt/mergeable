import type { JestConfigWithTsJest } from 'ts-jest';

export type Config = JestConfigWithTsJest;

const defaultConfig: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    '^\\@/(.*)$':  '<rootDir>/src/$1',
  },
};

export function defineConfig(params?: Config): Config {
  return {...defaultConfig, ...params};
}