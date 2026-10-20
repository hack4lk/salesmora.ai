import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

process.loadEnvFile(fileURLToPath(new URL('../../.env.local', import.meta.url)));

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3000', channel: 'chromium' },
});
