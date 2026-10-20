import 'server-only';
import { safelyDeliverOwnerInvitations } from '../invitations/store';
import { betterAuth } from 'better-auth';
import { APIError, createAuthMiddleware, getSessionFromCtx } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { sandboxBillingEnabled } from '@salesmora/data';
import { createAuthPool } from '@salesmora/data';
import { registrationSchema, registrationPolicy } from '@salesmora/contracts';
import { sendVerificationEmail } from '../email/send-verification';
import { sendPasswordResetEmail } from '../email/send-password-reset';
import { verifyEmailDelivery } from '../email/transport';

function requiredEnv(key: string) {
  const value = process.env[key];
  if (!value) throw new Error(`Missing ${key}. Run pnpm db:setup before starting the app.`);
  return value;
}

const databaseURL = requiredEnv('DATABASE_URL');
const secret = requiredEnv('BETTER_AUTH_SECRET');
if (secret.length < 32) throw new Error('BETTER_AUTH_SECRET must contain at least 32 characters.');
const baseURL = requiredEnv('BETTER_AUTH_URL');
const termsVersion = requiredEnv('TERMS_VERSION');

// Keep the pool stable across Next.js development hot reloads.
const globalAuth = globalThis as typeof globalThis & { salesmoraAuthPool?: ReturnType<typeof createAuthPool> };
const pool = globalAuth.salesmoraAuthPool ?? createAuthPool(databaseURL);
if (process.env.NODE_ENV !== 'production') globalAuth.salesmoraAuthPool = pool;

export const auth = betterAuth({
  appName: 'SalesMora.ai',
  baseURL,
  secret,
  database: pool,
  trustedOrigins: [new URL(baseURL).origin],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: registrationPolicy.passwordMinimum,
    maxPasswordLength: registrationPolicy.passwordMaximum,
    resetPasswordTokenExpiresIn: 30 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => sendPasswordResetEmail(user.email, url, baseURL),
  },
  emailVerification: {
    sendOnSignUp: true,
    afterEmailVerification: async (user) => { await safelyDeliverOwnerInvitations(user.id); },
    sendOnSignIn: false,
    expiresIn: 60 * 60,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }, request) => {
      try { await sendVerificationEmail(user.email, url, baseURL); }
      catch {
        // Registration must retain a usable session even if email is unavailable.
        // An explicit resend must report failure instead of claiming delivery.
        if (new URL(request?.url ?? baseURL).pathname.endsWith('/send-verification-email')) {
          throw new APIError('SERVICE_UNAVAILABLE', { message: 'Email delivery is temporarily unavailable.' });
        }
        console.error('Verification email delivery failed. Check the configured email service.');
      }
    },
  },
  user: {
    modelName: 'users',
    additionalFields: {
      registrationPlan: { type: 'string', required: true, input: true, defaultValue: 'free' },
      termsVersion: { type: 'string', required: true, input: false, defaultValue: termsVersion },
      termsAcceptedAt: { type: 'date', required: true, input: false, defaultValue: () => new Date() },
      onboardingStatus: { type: 'string', required: true, input: false, defaultValue: 'pending' },
    },
  },
  session: { modelName: 'sessions', expiresIn: 60 * 60 * 24 * 7, cookieCache: { enabled: false } },
  account: { modelName: 'accounts' },
  verification: { modelName: 'verifications', storeIdentifier: 'hashed' },
  rateLimit: {
    enabled: true,
    storage: 'database',
    modelName: 'rateLimits',
    customRules: {
      '/sign-up/email': { window: 60, max: 5 },
      '/request-password-reset': { window: 60, max: 3 },
      '/reset-password': { window: 60, max: 5 },
      '/send-verification-email': { window: 60, max: 1 },
      '/verify-email': { window: 60, max: 20 },
    },
  },
  // Local requests share a bucket. Do not trust caller-supplied proxy headers.
  // Configure a verified deployment proxy before public hosting.
  advanced: { ipAddress: { ipAddressHeaders: [] } },
  logger: { level: 'error' },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/send-verification-email') {
        if (ctx.request?.headers.get('origin') !== new URL(baseURL).origin) throw new APIError('FORBIDDEN', { message: 'Invalid origin.' });
        const session = await getSessionFromCtx(ctx);
        if (!session) throw new APIError('UNAUTHORIZED', { message: 'Sign in to resend verification.' });
        if (typeof ctx.body?.email === 'string' && ctx.body.email.toLowerCase() !== session.user.email.toLowerCase()) {
          throw new APIError('FORBIDDEN', { message: 'Invalid recipient.' });
        }
        return { context: { ...ctx, body: { email: session.user.email, callbackURL: new URL('/verify-email', baseURL).href } } };
      }
      if (ctx.path === '/request-password-reset' || ctx.path === '/reset-password') {
        const origin = ctx.request?.headers.get('origin');
        if (origin && origin !== new URL(baseURL).origin) throw new APIError('FORBIDDEN', { message: 'Invalid origin.' });
      }
      if (ctx.path === '/request-password-reset') {
        // Check delivery availability equally for known and unknown accounts.
        try { await verifyEmailDelivery(baseURL); }
        catch { throw new APIError('SERVICE_UNAVAILABLE', { message: 'Email delivery is temporarily unavailable.' }); }
        return { context: { ...ctx, body: {
          email: typeof ctx.body?.email === 'string' ? ctx.body.email.trim().toLowerCase() : ctx.body?.email,
          redirectTo: new URL('/reset-password', baseURL).href,
        } } };
      }
      if (ctx.path !== '/sign-up/email') return;
      const result = registrationSchema.safeParse(ctx.body);
      if (!result.success) throw new APIError('BAD_REQUEST', { message: 'Check your registration details and accept the terms.' });
      const { name, email, password, plan = 'free' } = result.data;
      if (plan !== 'free' && !sandboxBillingEnabled()) throw new APIError('BAD_REQUEST', { message: 'Paid registration is unavailable.' });
      return { context: { ...ctx, body: { name, email, password, registrationPlan: plan } } };
    }),
  },
  databaseHooks: {
    session: { create: { before: async (session) => {
      const result = await pool.query('SELECT "deletionRequestedAt" FROM users WHERE id = $1', [session.userId]);
      return result.rows[0]?.deletionRequestedAt ? false : { data: session };
    } } },
    user: { create: { before: async (user) => ({ data: {
      ...user, termsVersion, termsAcceptedAt: new Date(), onboardingStatus: 'pending',
    } }) } },
  },
  plugins: [nextCookies()],
});
