import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const { VITE_DEV_PORT } = loadEnv(process.env.NODE_ENV, process.cwd());

export default defineConfig({
  plugins: [react()],
  appType: "custom",
  clearScreen: false,
  build: {
    manifest: true,
    rollupOptions: {
      input: "/src/client/index.tsx",
    },
  },
  server: {
    port: VITE_DEV_PORT,
    strictPort: true,
  },
});
