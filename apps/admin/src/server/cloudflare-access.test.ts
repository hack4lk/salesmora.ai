import { describe, expect, it } from 'vitest';
import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  SignJWT,
} from 'jose';
import {
  AccessConfigurationError,
  AccessTokenError,
  createVerifiedAccessHeaders,
  getAdminAccessEmail,
  getCloudflareAccessConfiguration,
  verifyCloudflareAccessJwt,
} from './cloudflare-access';

const configuration = getCloudflareAccessConfiguration({
  ADMIN_ACCESS_TEAM_DOMAIN: 'salesmora.cloudflareaccess.com',
  ADMIN_ACCESS_AUD: 'admin-app-audience',
});

async function keySet() {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const jwk = await exportJWK(publicKey);
  return {
    privateKey,
    keys: createLocalJWKSet({ keys: [{ ...jwk, kid: 'access-test-key', alg: 'RS256', use: 'sig' }] }),
  };
}

async function tokenFor(
  privateKey: Awaited<ReturnType<typeof generateKeyPair>>['privateKey'],
  payload: Record<string, unknown> = { email: 'Admin@karpukcreative.com' },
  patch: { issuer?: string; audience?: string; expires?: string } = {},
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', kid: 'access-test-key' })
    .setIssuer(patch.issuer ?? configuration.issuer)
    .setAudience(patch.audience ?? configuration.audience)
    .setIssuedAt()
    .setExpirationTime(patch.expires ?? '5m')
    .sign(privateKey);
}

describe('Cloudflare Access JWT verification', () => {
  it('validates signature, issuer, audience and staff email, then normalizes the email', async () => {
    const { privateKey, keys } = await keySet();
    const token = await tokenFor(privateKey);
    await expect(verifyCloudflareAccessJwt(token, configuration, keys)).resolves.toBe('admin@karpukcreative.com');
  });

  it('rejects invalid signatures, issuer, audience, expiry and non-staff identities', async () => {
    const { privateKey, keys } = await keySet();
    const otherKey = await generateKeyPair('RS256');
    const wrongSignature = await tokenFor(otherKey.privateKey);
    const wrongIssuer = await tokenFor(privateKey, undefined, { issuer: 'https://other.cloudflareaccess.com' });
    const wrongAudience = await tokenFor(privateKey, undefined, { audience: 'another-app' });
    const expired = await tokenFor(privateKey, undefined, { expires: '-1s' });
    const externalEmail = await tokenFor(privateKey, { email: 'person@example.com' });
    const legacyEmail = await tokenFor(privateKey, { email: 'admin@salesmora.ai' });
    const suffixEmail = await tokenFor(privateKey, { email: 'admin@karpukcreative.com.attacker.com' });
    const malformedEmail = await tokenFor(privateKey, { email: 'admin@@karpukcreative.com' });

    for (const token of [wrongSignature, wrongIssuer, wrongAudience, expired, externalEmail,
      legacyEmail, suffixEmail, malformedEmail]) {
      await expect(verifyCloudflareAccessJwt(token, configuration, keys)).rejects.toBeInstanceOf(AccessTokenError);
    }
  });

  it('fails closed on missing or malformed Access configuration and invalid dev identities', async () => {
    expect(() => getCloudflareAccessConfiguration({})).toThrow(AccessConfigurationError);
    expect(() => getCloudflareAccessConfiguration({
      ADMIN_ACCESS_TEAM_DOMAIN: 'https://salesmora.cloudflareaccess.com/path',
      ADMIN_ACCESS_AUD: 'admin-app-audience',
    })).toThrow(AccessConfigurationError);
    await expect(getAdminAccessEmail(new Headers(), {
      NODE_ENV: 'development',
      ADMIN_ACCESS_DEV_EMAIL: 'person@example.com',
    })).rejects.toBeInstanceOf(AccessTokenError);
  });

  it('replaces untrusted identity headers and strips the verified assertion before forwarding', () => {
    const original = new Headers({
      'cf-access-jwt-assertion': 'signed-access-token',
      'x-admin-access-email': 'attacker@karpukcreative.com',
      'x-request-id': 'request-123',
    });
    const forwarded = createVerifiedAccessHeaders(original, 'admin@karpukcreative.com');

    expect(forwarded.get('x-admin-access-email')).toBe('admin@karpukcreative.com');
    expect(forwarded.has('cf-access-jwt-assertion')).toBe(false);
    expect(forwarded.get('x-request-id')).toBe('request-123');
  });

  it('permits an explicit company identity override only outside production', async () => {
    await expect(getAdminAccessEmail(new Headers(), {
      NODE_ENV: 'development',
      ADMIN_ACCESS_DEV_EMAIL: 'Admin@karpukcreative.com',
    })).resolves.toBe('admin@karpukcreative.com');
    await expect(getAdminAccessEmail(new Headers(), {
      NODE_ENV: 'production',
      ADMIN_ACCESS_DEV_EMAIL: 'admin@karpukcreative.com',
    })).rejects.toBeInstanceOf(AccessConfigurationError);
    await expect(getAdminAccessEmail(new Headers(), {
      NODE_ENV: 'development',
      ADMIN_ACCESS_DEV_EMAIL: 'admin@salesmora.ai',
    })).rejects.toBeInstanceOf(AccessTokenError);
  });
});
