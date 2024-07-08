import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { comlink } from "vite-plugin-comlink";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    comlink(),
    react(),
    tsconfigPaths(),
  ],
  worker: {
    plugins: () => [comlink()],
  },
})
