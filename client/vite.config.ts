import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load env file based on mode (development, production)
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');

  return {
    root: __dirname,
    plugins: [
      react(),
      runtimeErrorOverlay(),
    ],
    // Define process.env for client-side access
    define: {
      'process.env': Object.keys(env).reduce((acc, key) => {
        acc[key] = JSON.stringify(env[key]);
        return acc;
      }, {})
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "../shared"),
      },
    },
    build: {
      outDir: '../dist/client',
      emptyOutDir: true,
    },
  }
});
