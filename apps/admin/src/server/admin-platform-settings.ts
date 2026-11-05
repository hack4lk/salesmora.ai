import 'server-only';
import { randomBytes, randomUUID } from 'node:crypto';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import {
  adminPlatformSettingsOperationSchema,
  adminPlatformSettingsResponseSchema,
  adminPlatformSettingsResultSchema,
  adminPlatformSettingsStartSchema,
  adminPlatformSettingsVerifiedSchema,
  staffRoleIdSchema,
  staffRolePermissions,
  type StaffRoleId,
} from '@salesmora/contracts';
import { appendAdminAuditEvent } from '@salesmora/data/admin-audit';
import { createDatabase } from '@salesmora/data/database';
import { defaultMonthlyAITokens } from '@salesmora/data';
import { invitationTokenHash } from '@salesmora/data/invitation-tokens';
import type { Knex } from '@salesmora/data/database';
import { verifyAdminActionFactor, type AdminActionFactor } from './admin-action-factor';
import { getAdminAuthConfiguration } from './auth-config';
import { isAdminSessionWithinLimits } from './session-policy';

const configuration = getAdminAuthConfiguration();
export const adminPlatformSettingsDatabase = createDatabase(configuration.databaseUrl);
const challengeLifetime = 5 * 60 * 1000;
const settingKey = 'default_monthly_ai_tokens';

export class AdminPlatformSettingsError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}

export interface AdminPlatformSettingsIdentity { userId: string; sessionId: string; accessEmail: string }
export interface AdminPlatformSettingsContext { userAgent?: string | null }
interface SettingChangeInput {
  kind: 'platform_default_ai_budget';
  monthlyTokens: number | null;
  expectedVersion: number;
  reason: string;
}
interface SettingChallenge {
  id: string;
  challenge: string;
  input: SettingChangeInput;
  verifiedAt: Date | null;
  consumedAt: Date | null;
  expiresAt: Date;
  attempts: number;
}

export function createAdminPlatformSettingsService(db: Knex) {
  async function authorized<T>(
    identity: AdminPlatformSettingsIdentity,
    context: AdminPlatformSettingsContext,
    action: string,
    targetId: string,
    callback: (trx: Knex.Transaction, role: StaffRoleId) => Promise<T>,
  ): Promise<T> {
    const result = await db.transaction(async trx => {
      await trx.raw("SET LOCAL lock_timeout = '5s'");
      await trx.raw("SET LOCAL statement_timeout = '15s'");
      await trx.raw("SELECT pg_advisory_xact_lock_shared(hashtextextended('admin:staff-access', 0))");
      const staff = await trx.withSchema('admin').table('staffUsers').where({ id: identity.userId }).forShare()
        .first<{ email: string; disabledAt: Date | null }>('email', 'disabledAt');
      const session = await trx.withSchema('admin').table('staffSessions').where({ id: identity.sessionId, userId: identity.userId })
        .forShare().first<{ createdAt: Date; updatedAt: Date; expiresAt: Date }>('createdAt', 'updatedAt', 'expiresAt');
      if (!staff || staff.disabledAt || staff.email.toLowerCase() !== identity.accessEmail.toLowerCase() || !session ||
        session.expiresAt.getTime() <= Date.now() || !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        return { denied: 401 as const };
      }
      const assigned = await trx.withSchema('admin').table('staffRoleAssignments').where({ userId: identity.userId })
        .whereNull('revokedAt').forShare().first<{ role: string }>('role');
      const parsedRole = staffRoleIdSchema.safeParse(assigned?.role);
      const role = parsedRole.success ? parsedRole.data : null;
      if (!role || !staffRolePermissions[role].includes('admin.settings.read') ||
        (action !== 'settings.read' && !staffRolePermissions[role].includes('admin.settings.write'))) {
        await appendAdminAuditEvent(trx, {
          staffUserId: identity.userId,
          staffRole: role ?? 'bootstrap',
          action: 'platform_settings.access_denied',
          targetType: 'platform_setting',
          targetId,
          after: { requestedAction: action, assignedRole: role },
          userAgent: context.userAgent,
        });
        return { denied: 403 as const };
      }
      const value = await callback(trx, role);
      if (session.expiresAt.getTime() <= Date.now() || !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        throw new AdminPlatformSettingsError('Your admin session expired during the request. Sign in again.', 401);
      }
      return { value };
    });
    if ('denied' in result) {
      throw new AdminPlatformSettingsError(
        result.denied === 401 ? 'Sign in with your verified staff identity.' : 'Your current role cannot manage platform settings.',
        result.denied,
      );
    }
    return result.value;
  }

  async function currentVersion(trx: Knex.Transaction) {
    const row = await trx.withSchema('admin').table('systemSettingVersions').where({ key: settingKey })
      .orderBy('version', 'desc').first<{ version: number; value: { monthlyTokens: number | null } }>('version', 'value');
    return row ?? null;
  }

  async function actionMethods(trx: Knex.Transaction, userId: string) {
    const passkey = await trx.withSchema('admin').table('staffPasskeys').where({ userId }).first('id');
    const totp = await trx.withSchema('admin').table('staffTwoFactors').where({ userId, verified: true }).first('id');
    const methods: ('passkey' | 'totp')[] = [];
    if (passkey) methods.push('passkey');
    if (totp) methods.push('totp');
    return methods;
  }

  async function rateLimit(trx: Knex.Transaction, identity: AdminPlatformSettingsIdentity) {
    const key = `staff-actions:${identity.userId}`;
    await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [key]);
    const row = await trx.withSchema('admin').table('staffRateLimits').where({ key })
      .first<{ count: number; lastRequest: string }>('count', 'lastRequest');
    const now = Date.now();
    if (row && now - Number(row.lastRequest) < 15 * 60 * 1000 && row.count >= 30) {
      throw new AdminPlatformSettingsError('Too many admin verification attempts. Try again in 15 minutes.', 429);
    }
    const count = row && now - Number(row.lastRequest) < 15 * 60 * 1000 ? row.count + 1 : 1;
    await trx.withSchema('admin').table('staffRateLimits').insert({
      id: key, key, count, lastRequest: count === 1 ? now : row!.lastRequest,
    }).onConflict('key').merge(['count', 'lastRequest']);
  }

  async function challenge(
    trx: Knex.Transaction,
    identity: AdminPlatformSettingsIdentity,
    token: string,
  ): Promise<SettingChallenge> {
    if (!/^[\w-]{43}$/.test(token)) throw new AdminPlatformSettingsError('Invalid platform-setting verification.', 401);
    const row = await trx.withSchema('admin').table('staffActionChallenges').where({
      id: invitationTokenHash(token),
      userId: identity.userId,
      sessionId: identity.sessionId,
    }).forUpdate().first<SettingChallenge>();
    if (!row || row.input.kind !== 'platform_default_ai_budget' || row.consumedAt ||
      row.expiresAt.getTime() <= Date.now() || row.attempts >= 5) {
      throw new AdminPlatformSettingsError('Platform-setting verification expired or was already used. Start again.', 409);
    }
    return row;
  }

  async function read(identity: AdminPlatformSettingsIdentity, context: AdminPlatformSettingsContext = {}) {
    return authorized(identity, context, 'settings.read', settingKey, async (trx, role) => {
      const versionRows = await trx.withSchema('admin').table('systemSettingVersions as versions')
        .leftJoin('staffUsers as staff', 'staff.id', 'versions.createdBy')
        .where('versions.key', settingKey).select(
          'versions.version', 'versions.value', 'versions.reason', 'versions.createdAt',
          trx.raw('coalesce(staff.name, staff.email, ?) AS "actorName"', ['Former staff member']),
        ).orderBy('versions.version', 'desc').limit(20);
      const latest = versionRows[0] as {
        version: number;
        value: { monthlyTokens: number | null };
      } | undefined;
      const fallback = defaultMonthlyAITokens();
      const databaseValue = latest?.value.monthlyTokens ?? null;
      const hasAdminValue = databaseValue !== null;
      const methods = await actionMethods(trx, identity.userId);
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'platform_settings.ai_budget.read',
        targetType: 'platform_setting',
        targetId: settingKey,
        after: { currentVersion: latest?.version ?? 0, source: hasAdminValue ? 'admin' : 'environment' },
        userAgent: context.userAgent,
      });
      return adminPlatformSettingsResponseSchema.parse({
        defaultMonthlyAITokens: hasAdminValue ? defaultMonthlyAITokens(String(databaseValue)) : fallback,
        source: hasAdminValue ? 'admin' : 'environment',
        version: latest?.version ?? 0,
        history: versionRows.map(row => {
          const entry = row as {
            version: number;
            value: { monthlyTokens: number | null };
            reason: string;
            createdAt: Date;
            actorName: string;
          };
          return {
            version: entry.version,
            monthlyTokens: entry.value.monthlyTokens,
            reason: entry.reason,
            createdAt: entry.createdAt.toISOString(),
            actorName: entry.actorName,
          };
        }),
        methods,
      });
    });
  }

  async function start(identity: AdminPlatformSettingsIdentity, input: unknown, context: AdminPlatformSettingsContext = {}) {
    const parsed = adminPlatformSettingsOperationSchema.safeParse(input);
    if (!parsed.success || parsed.data.operation !== 'start') throw new AdminPlatformSettingsError('Invalid AI budget setting request.');
    const operation = parsed.data;
    if (operation.monthlyTokens !== null) defaultMonthlyAITokens(String(operation.monthlyTokens));
    return authorized(identity, context, 'settings.write', settingKey, async trx => {
      await rateLimit(trx, identity);
      const current = await currentVersion(trx);
      if ((current?.version ?? 0) !== operation.expectedVersion) {
        throw new AdminPlatformSettingsError('The default AI budget changed. Refresh settings before trying again.', 409);
      }
      const methods = await actionMethods(trx, identity.userId);
      if (!methods.length) throw new AdminPlatformSettingsError('Enroll a passkey or authenticator app before changing platform settings.', 409);
      const passkeys = await trx.withSchema('admin').table('staffPasskeys').where({ userId: identity.userId })
        .select<{ credentialID: string }[]>('credentialID');
      const options = await generateAuthenticationOptions({
        rpID: configuration.rpID,
        userVerification: 'required',
        allowCredentials: passkeys.map(key => ({ id: key.credentialID })),
      });
      const token = randomBytes(32).toString('base64url');
      const now = new Date();
      await trx.withSchema('admin').table('staffActionChallenges').where({ sessionId: identity.sessionId })
        .whereNull('consumedAt').update({ consumedAt: now });
      await trx.withSchema('admin').table('staffActionChallenges').insert({
        id: invitationTokenHash(token),
        userId: identity.userId,
        sessionId: identity.sessionId,
        input: {
          kind: 'platform_default_ai_budget',
          monthlyTokens: operation.monthlyTokens,
          expectedVersion: operation.expectedVersion,
          reason: operation.reason,
        },
        challenge: options.challenge,
        createdAt: now,
        expiresAt: new Date(now.getTime() + challengeLifetime),
      });
      return adminPlatformSettingsStartSchema.parse({ token, options });
    });
  }

  async function verifyFactor(
    identity: AdminPlatformSettingsIdentity,
    token: string,
    factor: AdminActionFactor,
    context: AdminPlatformSettingsContext = {},
  ) {
    const result = await authorized(identity, context, 'settings.write', settingKey, async trx => {
      await rateLimit(trx, identity);
      const row = await challenge(trx, identity, token);
      if (row.verifiedAt) throw new AdminPlatformSettingsError('This platform-setting verification is already complete.', 409);
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).increment('attempts', 1);
      if (!await verifyAdminActionFactor(trx, identity.userId, row.challenge, factor)) {
        return { error: 'Second-factor verification failed or the code was already used.' };
      }
      if (row.expiresAt.getTime() <= Date.now()) return { error: 'Platform-setting verification expired. Start a new review.' };
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ verifiedAt: new Date() });
      return { verified: true as const };
    });
    if ('error' in result && typeof result.error === 'string') throw new AdminPlatformSettingsError(result.error, 422);
    return adminPlatformSettingsVerifiedSchema.parse(result);
  }

  async function commit(identity: AdminPlatformSettingsIdentity, token: string, context: AdminPlatformSettingsContext = {}) {
    return authorized(identity, context, 'settings.write', settingKey, async (trx, role) => {
      const row = await challenge(trx, identity, token);
      if (!row.verifiedAt) throw new AdminPlatformSettingsError('Verify your second factor before confirming this budget.', 409);
      await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [`admin:system-setting:${settingKey}`]);
      const current = await currentVersion(trx);
      if ((current?.version ?? 0) !== row.input.expectedVersion) {
        throw new AdminPlatformSettingsError('The default AI budget changed. Refresh settings before trying again.', 409);
      }
      const version = (current?.version ?? 0) + 1;
      if (!Number.isSafeInteger(version)) throw new Error('Platform setting version is invalid.');
      const settingId = randomUUID();
      await trx.withSchema('admin').table('systemSettingVersions').insert({
        id: settingId,
        key: settingKey,
        version,
        value: { monthlyTokens: row.input.monthlyTokens },
        reason: row.input.reason,
        createdBy: identity.userId,
      });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'platform_settings.ai_budget.updated',
        targetType: 'platform_setting',
        targetId: settingKey,
        reason: row.input.reason,
        before: { version: current?.version ?? 0, monthlyTokens: current?.value.monthlyTokens ?? null },
        after: { version, monthlyTokens: row.input.monthlyTokens },
        userAgent: context.userAgent,
      });
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ consumedAt: new Date() });
      return adminPlatformSettingsResultSchema.parse({
        changed: true,
        version,
        monthlyTokens: row.input.monthlyTokens,
      });
    });
  }

  return {
    read,
    start,
    verifyFactor,
    commit,
  };
}

export const adminPlatformSettings = createAdminPlatformSettingsService(adminPlatformSettingsDatabase);
