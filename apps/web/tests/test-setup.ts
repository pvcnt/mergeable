import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Auto-cleanup after each test.
afterEach(() => cleanup());
