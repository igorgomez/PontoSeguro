import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
    replace({
      preventAssignment: true,
      'process.env.VERSION': JSON.stringify(process.env.npm_package_version),
    }),
  ],
  base: '/PontoSeguro/', // Adiciona o base path para o GitHub Pages
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});