import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRouter()],
  envPrefix: ["VITE_", "MERGEABLE_"],
});
