import 'server-only';
import { createAuthPool } from '@salesmora/data/auth-pool';
import { passkey } from '@better-auth/passkey';
import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { twoFactor } from 'better-auth/plugins';
import { createAdminMfaPlugin, assertPasskeySecondFactor } from './admin-mfa-plugin';
import { getAdminAuthConfiguration, ADMIN_AUTH_COOKIE_PREFIX, ADMIN_AUTH_FACTOR_CHALLENGE_SECONDS } from './auth-config';
import {
  ADMIN_SESSION_ABSOLUTE_SECONDS,
  isAdminSessionWithinLimits,
} from './session-policy';

const configuration = getAdminAuthConfiguration();

const globalAdminAuth = globalThis as typeof globalThis & {
  salesmoraAdminAuthPool?: ReturnType<typeof createAuthPool>;
};
const pool = globalAdminAuth.salesmoraAdminAuthPool ?? createAuthPool(configuration.databaseUrl, 'admin');
if (process.env.NODE_ENV !== 'production') globalAdminAuth.salesmoraAdminAuthPool = pool;

const cookieAttributes = {
  httpOnly: true,
  secure: configuration.secureCookies,
  sameSite: 'strict' as const,
  path: '/',
};

export const auth = betterAuth({
  appName: 'SalesMora Admin',
  baseURL: configuration.baseURL,
  secret: configuration.secret,
  database: pool,
  trustedOrigins: [configuration.trustedOrigin],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 14,
    maxPasswordLength: 128,
  },
  user: {
    modelName: 'staffUsers',
    additionalFields: { disabledAt: { type: 'date', required: false, input: false, returned: false } },
  },
  session: {
    modelName: 'staffSessions',
    expiresIn: ADMIN_SESSION_ABSOLUTE_SECONDS,
    updateAge: 0,
    cookieCache: { enabled: false },
  },
  account: { modelName: 'staffAccounts' },
  verification: { modelName: 'staffVerifications', storeIdentifier: 'hashed' },
  rateLimit: {
    enabled: true,
    storage: 'database',
    modelName: 'staffRateLimits',
    customRules: {
      '/sign-in/email': { window: 60 * 15, max: 5 },
      '/passkey/verify-authentication': { window: 60 * 15, max: 5 },
      '/two-factor/verify-totp': { window: 60 * 15, max: 5 },
      '/two-factor/verify-backup-code': { window: 60 * 15, max: 5 },
    },
  },
  advanced: {
    cookiePrefix: ADMIN_AUTH_COOKIE_PREFIX,
    useSecureCookies: configuration.secureCookies,
    ipAddress: { ipAddressHeaders: [] },
    cookies: {
      session_token: { attributes: cookieAttributes },
      session_data: { attributes: cookieAttributes },
      two_factor: { attributes: { ...cookieAttributes, maxAge: ADMIN_AUTH_FACTOR_CHALLENGE_SECONDS } },
      'sm_admin_passkey_challenge': { attributes: cookieAttributes },
    },
  },
  plugins: [
    passkey({
      rpID: configuration.rpID,
      rpName: 'SalesMora Admin',
      origin: configuration.baseURL,
      authenticatorSelection: { userVerification: 'required' },
      advanced: { webAuthnChallengeCookie: 'sm_admin_passkey_challenge' },
      schema: { passkey: { modelName: 'staffPasskeys' } },
      authentication: {
        afterVerification: async ({ ctx, verification, clientData }) => {
          await assertPasskeySecondFactor(ctx, clientData.id, verification.authenticationInfo.userVerified);
        },
      },
    }),
    twoFactor({
      twoFactorTable: 'staffTwoFactors',
      issuer: 'SalesMora Admin',
      allowPasswordless: false,
      skipVerificationOnEnable: false,
      storeBackupCodes: 'encrypted',
      twoFactorCookieMaxAge: ADMIN_AUTH_FACTOR_CHALLENGE_SECONDS,
      trustDeviceMaxAge: 0,
      accountLockout: { enabled: true, maxFailedAttempts: 5, durationSeconds: 60 * 15 },
    }),
    createAdminMfaPlugin(),
  ],
  databaseHooks: {
    session: {
      create: {
        before: async session => {
          const result = await pool.query<{ disabledAt: Date | null }>(
            'SELECT "disabledAt" FROM admin."staffUsers" WHERE id = $1', [session.userId],
          );
          if (!result.rows[0] || result.rows[0].disabledAt) {
            throw new APIError('UNAUTHORIZED', { message: 'Staff access is disabled. Contact another administrator.' });
          }
        },
      },
      update: {
        before: async (_update, context) => {
          const currentSession = context?.context.session?.session;
          if (!currentSession || !isAdminSessionWithinLimits(
            currentSession.createdAt,
            currentSession.updatedAt,
          )) return false;
          return;
        },
      },
    },
  },
  logger: { level: 'error' },
});
