import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import shadcnThemeJson from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorModal from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    root: path.resolve(__dirname, 'client'),
    plugins: [
        react(),
        runtimeErrorModal(),
        shadcnThemeJson(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./client/src"),
            "@shared": path.resolve(__dirname, "./shared"),
        },
    },
    build: {
        outDir: path.resolve(__dirname, 'dist'),
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
});
