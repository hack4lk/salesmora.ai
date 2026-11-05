import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

process.loadEnvFile(fileURLToPath(new URL('../../.env.local', import.meta.url)));

const origin = process.env.SALESMORA_E2E_ORIGIN ?? 'http://127.0.0.1:3002';
export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: { baseURL: origin, channel: 'chromium' },
  webServer: { command: 'node ../../scripts/e2e-server.mjs', url: `${origin}/register`, reuseExistingServer: false, timeout: ['.next-e2e-capture-activation', '.next-e2e-capture-assistant'].includes(process.env.SALESMORA_E2E_DIST_DIR ?? '') ? 240_000 : 120_000 },
});
