import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom', // important for browser-like environment
    setupFiles: './src/setupTests.js', 
    coverage: {
      provider: 'v8' 
    },
  },
});
