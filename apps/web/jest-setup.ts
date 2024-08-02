import "@testing-library/jest-dom/jest-globals"

// structuredClone is missing in jsdom environment.
// https://stackoverflow.com/a/76729230
global.structuredClone = v => JSON.parse(JSON.stringify(v));