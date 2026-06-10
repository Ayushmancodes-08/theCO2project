import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'e2e', 'src'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'e2e/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
