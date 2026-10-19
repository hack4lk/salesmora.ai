import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

process.loadEnvFile(fileURLToPath(new URL('../../.env.local', import.meta.url)));

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3002', channel: 'chromium' },
  webServer: { command: 'node ../../scripts/e2e-server.mjs', url: 'http://127.0.0.1:3002/register', reuseExistingServer: false, timeout: 120_000 },
});
