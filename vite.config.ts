import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import replace from '@rollup/plugin-replace'; // Adicione esta linha

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    replace({
      preventAssignment: true,
      values: { // Estrutura correta para o plugin replace
        'process.env.VERSION': JSON.stringify(
          process.env.npm_package_version || '0.0.0'
        ),
      }
    }),
  ],
  base: '/PontoSeguro/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});