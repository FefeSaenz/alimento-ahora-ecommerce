import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      // Esto permite que import { ... } from '@/src/...' funcione siempre
      "@": path.resolve(__dirname, "./"),
    },
  },
  server: {
    watch: {
      // Dev Container: los eventos de archivos no llegan al contenedor, se usa polling
      usePolling: true,
    },
  },
});
