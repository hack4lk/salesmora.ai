import type { NextConfig } from 'next';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const envFile = fileURLToPath(new URL('../../.env.local', import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);

const config: NextConfig = {
  distDir: process.env.SALESMORA_TEST_SERVER === '1' ? '.next-e2e' : '.next',
  experimental: { turbopackFileSystemCacheForDev: process.env.SALESMORA_TEST_SERVER !== '1' },
  serverExternalPackages: ['knex', 'pg'],
  transpilePackages: ['@salesmora/ui', '@salesmora/contracts', '@salesmora/data'],
  logging: { incomingRequests: { ignore: [/\/customers(?:\/|\?|$)/, /\/reset-password/, /\/verify-email/, /\/accept-invitation/] } },
  async headers() {
    return ['/jobs', '/jobs/:path*', '/api/jobs/:path*', '/customers', '/customers/:path*', '/api/customers/:path*', '/reset-password', '/api/auth/reset-password/:path*', '/verify-email', '/api/auth/verify-email', '/accept-invitation', '/api/invitations/:path*', '/login', '/register', '/setup', '/setup/:path*'].map((source) => ({
      source,
      headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }, { key: 'Cache-Control', value: 'no-store' }],
    }));
  },
};
export default config;
