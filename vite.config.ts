import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ponto-eletronico/', // Adiciona o base path para o GitHub Pages
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});