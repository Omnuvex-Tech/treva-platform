import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        extensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
    },
    server: {
        port: 3003,
        proxy: {
            "/api": {
                target: "http://localhost:3001",
                changeOrigin: true,
            },
            "/uploads": {
                target: "http://localhost:3001",
                changeOrigin: true,
            },
        },
        headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
        },
    },
});
