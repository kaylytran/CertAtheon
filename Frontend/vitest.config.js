import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // Use jsdom for React testing
    setupFiles: './setupTests.js', // Path to your setup file
    globals: true, // Enable global test APIs like `describe` and `it`
  },
});