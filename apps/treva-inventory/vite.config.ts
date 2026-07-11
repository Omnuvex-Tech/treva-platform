import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget = env.VITE_API_PROXY_TARGET;
  const devPort = Number(env.VITE_DEV_PORT);

  if (!apiProxyTarget) {
    throw new Error("VITE_API_PROXY_TARGET is not configured");
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
    },
    server: {
      port: devPort || 3003,
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        "/uploads": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        "/cms-api": {
          target: "http://localhost:10021",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/cms-api/, ""),
        },
      },
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  };
});
