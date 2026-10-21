import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/bpc-management/",
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "../public/bpc-management",
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api/bpc": "http://127.0.0.1:3000",
    },
  },
});