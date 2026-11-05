import 'server-only';
import type { Knex } from '@salesmora/data';
import { verifyAuthenticationResponse, type AuthenticationResponseJSON } from '@simplewebauthn/server';
import { symmetricDecrypt } from 'better-auth/crypto';
import { getAdminAuthConfiguration } from './auth-config';
import { staffTotpMatchingStep } from './staff-totp';

export type AdminActionFactor = { method: 'totp'; code: string } | { method: 'passkey'; response: AuthenticationResponseJSON };

export async function verifyAdminActionFactor(trx: Knex.Transaction, userId: string, challenge: string, factor: AdminActionFactor) {
  const configuration = getAdminAuthConfiguration();
  if (factor.method === 'totp') {
    const totp = await trx.withSchema('admin').table('staffTwoFactors')
      .where({ userId, verified: true }).forUpdate().first<{ secret: string }>('secret');
    if (!totp) return false;
    const secret = await symmetricDecrypt({ key: configuration.secret, data: totp.secret });
    const step = staffTotpMatchingStep(secret, factor.code);
    if (step === null) return false;
    const used = await trx.withSchema('admin').table('staffFactorUses').insert({ userId, step })
      .onConflict(['userId', 'step']).ignore().returning('step');
    return used.length === 1;
  }
  const key = await trx.withSchema('admin').table('staffPasskeys')
    .where({ userId, credentialID: factor.response.id }).forUpdate()
    .first<{ id: string; publicKey: string; credentialID: string; counter: number }>();
  if (!key) return false;
  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: factor.response, expectedChallenge: challenge, expectedOrigin: configuration.baseURL,
      expectedRPID: configuration.rpID, requireUserVerification: true,
      credential: { id: key.credentialID, publicKey: new Uint8Array(Buffer.from(key.publicKey, 'base64')), counter: key.counter },
    });
  } catch {
    console.warn('Admin action passkey assertion rejected.');
  }
  if (!verification?.verified) return false;
  await trx.withSchema('admin').table('staffPasskeys').where({ id: key.id }).update({ counter: verification.authenticationInfo.newCounter });
  return true;
}
