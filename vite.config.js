import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/posts": {
        target: "http://localhost:5050",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://localhost:5050",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
