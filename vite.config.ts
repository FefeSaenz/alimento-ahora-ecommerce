import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  resolve: {
    alias: {
      // Esto permite que import { ... } from '@/src/...' funcione siempre
      '@': path.resolve(__dirname, './'),
    },
  },
})
/*APACHE: Va a necesitar un archivo llamado .htaccess.
Cuando pida el dist "Acordarse de crearle un archivo .htaccess en la raíz del hosting que redirija todo al index.html, porque es una SPA.
*/