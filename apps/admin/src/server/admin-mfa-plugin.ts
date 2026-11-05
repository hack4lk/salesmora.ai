import { randomUUID } from 'node:crypto';
import { staffEmailSchema } from '@salesmora/contracts';
import type { BetterAuthPlugin } from 'better-auth';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { deleteSessionCookie } from 'better-auth/cookies';
import { ADMIN_AUTH_FACTOR_CHALLENGE_SECONDS } from './auth-config';
import { isAdminSessionWithinLimits } from './session-policy';

type AdminAuthContext = Parameters<Parameters<typeof createAuthMiddleware>[0]>[0];

function hasSessionTimestamps(value: unknown): value is {
  session: { createdAt: Date; updatedAt: Date };
} {
  if (typeof value !== 'object' || value === null || !('session' in value)) return false;
  const session = value.session;
  return typeof session === 'object' && session !== null &&
    'createdAt' in session && session.createdAt instanceof Date &&
    'updatedAt' in session && session.updatedAt instanceof Date;
}

function isTwoFactorResponse(value: unknown): value is {
  twoFactorRedirect: true;
  twoFactorMethods: string[];
} {
  if (!value || typeof value !== 'object' || !('twoFactorRedirect' in value) ||
    value.twoFactorRedirect !== true || !('twoFactorMethods' in value) ||
    !Array.isArray(value.twoFactorMethods)) return false;
  return value.twoFactorMethods.every(method => typeof method === 'string');
}

async function findFactorState(ctx: AdminAuthContext, userId: string) {
  const [totp, passkeys, recovery] = await Promise.all([
    ctx.context.adapter.findOne({
      model: 'staffTwoFactors',
      where: [{ field: 'userId', value: userId }, { field: 'verified', value: true }],
    }),
    ctx.context.adapter.findMany({
      model: 'staffPasskeys',
      where: [{ field: 'userId', value: userId }],
    }),
    ctx.context.adapter.findOne({
      model: 'staffTwoFactors',
      where: [{ field: 'userId', value: userId }],
    }),
  ]);
  return { hasTOTP: Boolean(totp), hasPasskey: passkeys.length > 0, hasRecovery: Boolean(recovery) };
}

async function issueChallenge(ctx: AdminAuthContext, userId: string) {
  const token = `2fa-${randomUUID()}`;
  const expiresAt = new Date(Date.now() + ADMIN_AUTH_FACTOR_CHALLENGE_SECONDS * 1000);
  await ctx.context.internalAdapter.createVerificationValue({ identifier: token, value: userId, expiresAt });
  await ctx.context.internalAdapter.createVerificationValue({
    identifier: `2fa-attempts-${token}`,
    value: '0',
    expiresAt,
  });
  const cookie = ctx.context.createAuthCookie('two_factor', { maxAge: ADMIN_AUTH_FACTOR_CHALLENGE_SECONDS });
  await ctx.setSignedCookie(cookie.name, token, ctx.context.secret, cookie.attributes);
}

async function addPasskeyMethod(ctx: AdminAuthContext) {
  const response = ctx.context.returned;
  const email = ctx.body?.email;
  if (!isTwoFactorResponse(response) || typeof email !== 'string') return;
  const user = await ctx.context.adapter.findOne({
    model: 'staffUsers',
    where: [{ field: 'email', value: email.trim().toLowerCase() }],
  });
  if (!user || typeof user !== 'object' || !('id' in user) || typeof user.id !== 'string') return;
  const { hasPasskey, hasRecovery } = await findFactorState(ctx, user.id);
  const methods = [
    ...response.twoFactorMethods,
    ...(hasPasskey && !response.twoFactorMethods.includes('passkey') ? ['passkey'] : []),
    ...(hasRecovery && !response.twoFactorMethods.includes('backup') ? ['backup'] : []),
  ];
  if (methods.length === response.twoFactorMethods.length) return;
  return ctx.json({
    ...response,
    twoFactorMethods: methods,
  });
}

export function isPasskeySecondFactorValid(
  pendingUserId: string,
  passkeyUserId: string,
  userVerified: boolean,
) {
  return pendingUserId === passkeyUserId && userVerified;
}

export function createAdminMfaPlugin(): BetterAuthPlugin {
  return {
    id: 'salesmora-admin-mfa',
    hooks: {
      before: [
        {
          matcher: context => context.path === '/sign-in/email',
          handler: createAuthMiddleware(async ctx => {
            const email = ctx.body?.email;
            const accessEmail = ctx.headers?.get('x-admin-access-email')?.trim().toLowerCase();
            const parsed = staffEmailSchema.safeParse(email);
            if (!parsed.success || accessEmail !== parsed.data) {
              throw new APIError('UNAUTHORIZED', { message: 'Invalid credentials.' });
            }
            const user = await ctx.context.adapter.findOne<{ disabledAt: Date | null }>({
              model: 'staffUsers', where: [{ field: 'email', value: parsed.data }],
            });
            if (user?.disabledAt) throw new APIError('UNAUTHORIZED', { message: 'Invalid credentials.' });
          }),
        },
        {
          matcher: context => context.path === '/get-session',
          handler: createAuthMiddleware(async ctx => {
            const cookie = ctx.context.authCookies.sessionToken;
            const token = await ctx.getSignedCookie(cookie.name, ctx.context.secret);
            if (!token) return;

            const session = await ctx.context.internalAdapter.findSession(token);
            if (!session) return;
            const user = await ctx.context.adapter.findOne<{ disabledAt: Date | null }>({
              model: 'staffUsers', where: [{ field: 'id', value: session.user.id }],
            });
            if (user && !user.disabledAt && hasSessionTimestamps(session) && isAdminSessionWithinLimits(
              session.session.createdAt,
              session.session.updatedAt,
            )) return;

            await ctx.context.internalAdapter.deleteSession(token);
            deleteSessionCookie(ctx, true);
            throw new APIError('UNAUTHORIZED', { message: 'The admin session has expired.' });
          }),
        },
      ],
      after: [{
        matcher: context => context.path === '/sign-in/email',
        handler: createAuthMiddleware(async ctx => {
          const session = ctx.context.newSession;
          if (!session) return addPasskeyMethod(ctx);

          const factors = await findFactorState(ctx, session.user.id);
          await ctx.context.internalAdapter.deleteSession(session.session.token);
          deleteSessionCookie(ctx, true);
          ctx.context.setNewSession(null);
          if (!factors.hasTOTP && !factors.hasPasskey) {
            throw new APIError('UNAUTHORIZED', { message: 'A second factor is required to sign in.' });
          }

          await issueChallenge(ctx, session.user.id);
          const methods = [
            ...(factors.hasPasskey ? ['passkey'] : []),
            ...(factors.hasTOTP ? ['totp'] : []),
          ];
          return ctx.json({ twoFactorRedirect: true, twoFactorMethods: methods });
        }),
      }],
    },
  };
}

export async function assertPasskeySecondFactor(
  ctx: AdminAuthContext,
  credentialID: string,
  userVerified: boolean,
) {
  const cookie = ctx.context.createAuthCookie('two_factor');
  const token = await ctx.getSignedCookie(cookie.name, ctx.context.secret);
  if (!token) throw new APIError('UNAUTHORIZED', { message: 'Complete password verification first.' });

  const pending = await ctx.context.internalAdapter.findVerificationValue(token);
  if (!pending || pending.expiresAt <= new Date()) {
    throw new APIError('UNAUTHORIZED', { message: 'The second-factor challenge expired.' });
  }

  const passkey = await ctx.context.adapter.findOne({
    model: 'staffPasskeys',
    where: [{ field: 'credentialID', value: credentialID }],
  });
  if (!passkey || typeof passkey !== 'object' || !('userId' in passkey) ||
    typeof passkey.userId !== 'string' || passkey.userId !== pending.value) {
    throw new APIError('UNAUTHORIZED', { message: 'The second factor does not match the password account.' });
  }
  if (!isPasskeySecondFactorValid(pending.value, passkey.userId, userVerified)) {
    throw new APIError('UNAUTHORIZED', { message: 'Passkey user verification is required.' });
  }

  const consumed = await ctx.context.internalAdapter.consumeVerificationValue(token);
  if (!consumed || consumed.value !== passkey.userId) {
    throw new APIError('UNAUTHORIZED', { message: 'The second-factor challenge was already used.' });
  }
  await ctx.context.internalAdapter.consumeVerificationValue(`2fa-attempts-${token}`);
}
