import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Browser/API suites use Playwright and its isolated database lifecycle.
    include: ['packages/**/*.test.ts', 'apps/*/src/**/*.test.ts'],
  },
});
