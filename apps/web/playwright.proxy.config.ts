import { defineConfig } from '@playwright/test';
import base from './playwright.config';
process.env.SALESMORA_E2E_ORIGIN = 'http://127.0.0.1:3003';
export default defineConfig({
  ...base,
  maxFailures: 1,
  testMatch: ['chat.spec.ts', 'chat-ui.spec.ts', 'chat-actions.spec.ts', 'chat-proxy.spec.ts'],
  use: { ...base.use, baseURL: 'http://127.0.0.1:3003' },
  webServer: { ...base.webServer, command: 'node ../../scripts/e2e-server.mjs', url: 'http://127.0.0.1:3003/register', reuseExistingServer: false,
    env: { SALESMORA_PROXY_TEST: '1' } },
});
