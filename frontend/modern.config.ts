import { appTools, defineConfig } from '@modern-js/app-tools';

export default defineConfig({
  plugins: [appTools()],
  source: {
    alias: {
      '@': './src',
    },
  },
  dev: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
