import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Auto-cleanup after each test.
afterEach(() => cleanup());

// structuredClone is missing in jsdom environment.
// https://stackoverflow.com/a/76729230
global.structuredClone = v => JSON.parse(JSON.stringify(v));