import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  // Vitest configuration — runs in jsdom environment for browser-like globals
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.{js,jsx}'],
    globals: false,
  },
});
