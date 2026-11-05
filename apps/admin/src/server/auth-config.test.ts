import { describe, expect, it } from 'vitest';
import {
  ADMIN_AUTH_COOKIE_PREFIX,
  ADMIN_AUTH_ROLE,
  getAdminAuthConfiguration,
  getAdminCustomerAppURL,
} from './auth-config';

const validEnvironment = {
  ADMIN_DATABASE_URL: 'postgresql://salesmora_admin_app:password@localhost:5432/salesmora',
  ADMIN_AUTH_SECRET: 'a'.repeat(48),
  ADMIN_AUTH_URL: 'http://localhost:3003',
};

describe('admin authentication configuration', () => {
  describe('admin customer application URL', () => {
    it('accepts a local or HTTPS customer origin and rejects unsafe URL shapes', () => {
      expect(getAdminCustomerAppURL({ CUSTOMER_APP_URL: 'http://127.0.0.1:3000' })).toBe('http://127.0.0.1:3000');
      expect(getAdminCustomerAppURL({ CUSTOMER_APP_URL: 'https://app.salesmora.ai' })).toBe('https://app.salesmora.ai');
      expect(() => getAdminCustomerAppURL({ CUSTOMER_APP_URL: 'http://app.salesmora.ai' })).toThrow(/HTTPS/);
      expect(() => getAdminCustomerAppURL({ CUSTOMER_APP_URL: 'https://app.salesmora.ai/path' })).toThrow(/origin/);
      expect(() => getAdminCustomerAppURL({})).toThrow(/CUSTOMER_APP_URL/);
    });
  });

  it('uses the dedicated database role and exact local auth origin', () => {
    expect(getAdminAuthConfiguration(validEnvironment)).toEqual({
      databaseUrl: validEnvironment.ADMIN_DATABASE_URL,
      secret: validEnvironment.ADMIN_AUTH_SECRET,
      baseURL: 'http://localhost:3003',
      trustedOrigin: 'http://localhost:3003',
      rpID: 'localhost',
      secureCookies: false,
    });

    expect(ADMIN_AUTH_ROLE).toBe('salesmora_admin_app');
    expect(ADMIN_AUTH_COOKIE_PREFIX).toBe('sm_admin');
  });

  it('requires an HTTPS deployment origin and uses its hostname as the WebAuthn RP ID', () => {
    expect(getAdminAuthConfiguration({
      ...validEnvironment,
      ADMIN_AUTH_URL: 'https://admin.salesmora.ai',
    })).toMatchObject({
      baseURL: 'https://admin.salesmora.ai',
      rpID: 'admin.salesmora.ai',
      secureCookies: true,
    });
    expect(() => getAdminAuthConfiguration({
      ...validEnvironment,
      ADMIN_AUTH_URL: 'http://admin.salesmora.ai',
    })).toThrow(/HTTPS/);
  });

  it('fails closed on missing values, weak secrets, wrong database role, or mismatched RP ID', () => {
    expect(() => getAdminAuthConfiguration({})).toThrow(/ADMIN_DATABASE_URL/);
    expect(() => getAdminAuthConfiguration({ ...validEnvironment, ADMIN_AUTH_SECRET: 'short' })).toThrow(/32 characters/);
    expect(() => getAdminAuthConfiguration({
      ...validEnvironment,
      ADMIN_DATABASE_URL: 'postgresql://postgres:password@localhost:5432/salesmora',
    })).toThrow(/salesmora_admin_app/);
    expect(() => getAdminAuthConfiguration({
      ...validEnvironment,
      ADMIN_WEBAUTHN_RP_ID: 'salesmora.ai',
    })).toThrow(/exactly match/);
  });
});
