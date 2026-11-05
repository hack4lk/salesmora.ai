import 'server-only';
import { randomBytes } from 'node:crypto';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import {
  adminFeatureFlagCatalog,
  adminFeatureFlagIdSchema,
  adminFeatureFlagOperationSchema,
  adminFeatureFlagResponseSchema,
  adminFeatureFlagResultSchema,
  adminFeatureFlagStartResponseSchema,
  adminFeatureFlagIds,
  adminRolloutFlagMutationSchema,
  adminRolloutFlagSchema,
  adminRolloutFlagsResponseSchema,
  staffRoleIdSchema,
  staffRolePermissions,
  type AdminFeatureFlagId,
  type AdminFeatureFlagTarget,
  type StaffRoleId,
} from '@salesmora/contracts';
import { appendAdminAuditEvent } from '@salesmora/data/admin-audit';
import { createDatabase } from '@salesmora/data/database';
import type { Knex } from '@salesmora/data/database';
import { invitationTokenHash } from '@salesmora/data/invitation-tokens';
import { verifyAdminActionFactor, type AdminActionFactor } from './admin-action-factor';
import { getAdminAuthConfiguration } from './auth-config';
import { isAdminSessionWithinLimits } from './session-policy';

const configuration = getAdminAuthConfiguration();
const challengeLifetime = 5 * 60 * 1000;
const maximumExpiryMs = 366 * 24 * 60 * 60 * 1000;
const database = createDatabase(configuration.databaseUrl);

export class AdminFeatureFlagsError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}

export interface AdminFeatureFlagsIdentity { userId: string; sessionId: string; accessEmail: string }
export interface AdminFeatureFlagsContext { userAgent?: string | null }

interface FeatureFlagChange {
  kind: 'feature_flag_change';
  flagId: AdminFeatureFlagId;
  target: AdminFeatureFlagTarget;
  enabled: boolean | null;
  expiresAt: string | null;
  reason: string;
  expectedState: { enabled: boolean; expiresAt: string | null } | null;
}

interface FeatureFlagChallenge {
  id: string;
  challenge: string;
  input: FeatureFlagChange;
  verifiedAt: Date | null;
  consumedAt: Date | null;
  expiresAt: Date;
  attempts: number;
}

function targetColumns(target: AdminFeatureFlagTarget) {
  if (target.type === 'global') return { targetType: 'global', targetId: 'global' };
  if (target.type === 'plan') return { targetType: 'plan', targetId: target.planId };
  return { targetType: 'workspace', targetId: target.workspaceId };
}

function targetIdentity(target: AdminFeatureFlagTarget) {
  const columns = targetColumns(target);
  return `${columns.targetType}:${columns.targetId}`;
}

function serializeDate(value: Date | string | null | undefined) {
  return value == null ? null : new Date(value).toISOString();
}

function validateExpiry(value: string | null) {
  if (value === null) return;
  const expiresAt = new Date(value);
  const now = Date.now();
  if (!Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= now || expiresAt.getTime() > now + maximumExpiryMs) {
    throw new AdminFeatureFlagsError('Choose an expiry time within the next 12 months, or leave expiry unset.');
  }
}

export function createAdminFeatureFlagsService(db: Knex) {
  async function authorized<T>(
    identity: AdminFeatureFlagsIdentity,
    context: AdminFeatureFlagsContext,
    action: 'flags.read' | 'flags.write',
    callback: (trx: Knex.Transaction, role: StaffRoleId) => Promise<T>,
  ): Promise<T> {
    const result = await db.transaction(async trx => {
      await trx.raw("SET LOCAL lock_timeout = '5s'");
      await trx.raw("SET LOCAL statement_timeout = '15s'");
      await trx.raw("SELECT pg_advisory_xact_lock_shared(hashtextextended('admin:staff-access', 0))");
      const staff = await trx.withSchema('admin').table('staffUsers').where({ id: identity.userId }).forShare()
        .first<{ email: string; disabledAt: Date | null }>('email', 'disabledAt');
      const session = await trx.withSchema('admin').table('staffSessions').where({
        id: identity.sessionId,
        userId: identity.userId,
      }).forShare().first<{ createdAt: Date; updatedAt: Date; expiresAt: Date }>();
      if (!staff || staff.disabledAt || staff.email.toLowerCase() !== identity.accessEmail.toLowerCase() ||
        !session || session.expiresAt.getTime() <= Date.now() ||
        !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) return { denied: 401 as const };

      const assignment = await trx.withSchema('admin').table('staffRoleAssignments')
        .where({ userId: identity.userId }).whereNull('revokedAt').forShare().first<{ role: string }>('role');
      const role = staffRoleIdSchema.safeParse(assignment?.role);
      if (!role.success || !staffRolePermissions[role.data].includes(`admin.${action}`)) {
        await appendAdminAuditEvent(trx, {
          staffUserId: identity.userId,
          staffRole: role.success ? role.data : 'bootstrap',
          action: 'feature_flags.access_denied',
          targetType: 'feature_flag',
          targetId: 'catalog',
          after: { requestedAction: action, assignedRole: role.success ? role.data : null },
          userAgent: context.userAgent,
        });
        return { denied: 403 as const };
      }

      const value = await callback(trx, role.data);
      if (session.expiresAt.getTime() <= Date.now() ||
        !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        throw new AdminFeatureFlagsError('Your Admin session expired during the request. Sign in again.', 401);
      }
      return { value };
    });

    if ('denied' in result) {
      throw new AdminFeatureFlagsError(
        result.denied === 401 ? 'Sign in with your verified staff identity.' : 'Your current role cannot manage feature flags.',
        result.denied,
      );
    }
    return result.value;
  }

  async function rateLimit(trx: Knex.Transaction, identity: AdminFeatureFlagsIdentity) {
    const key = `staff-actions:${identity.userId}`;
    await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [key]);
    const row = await trx.withSchema('admin').table('staffRateLimits').where({ key })
      .first<{ count: number; lastRequest: string }>('count', 'lastRequest');
    const now = Date.now();
    if (row && now - Number(row.lastRequest) < 15 * 60 * 1000 && row.count >= 30) {
      throw new AdminFeatureFlagsError('Too many Admin verification attempts. Try again in 15 minutes.', 429);
    }
    const count = row && now - Number(row.lastRequest) < 15 * 60 * 1000 ? row.count + 1 : 1;
    await trx.withSchema('admin').table('staffRateLimits').insert({
      id: key,
      key,
      count,
      lastRequest: count === 1 ? now : row!.lastRequest,
    }).onConflict('key').merge(['count', 'lastRequest']);
  }

  async function actionMethods(trx: Knex.Transaction, userId: string) {
    const passkey = await trx.withSchema('admin').table('staffPasskeys').where({ userId }).first('id');
    const totp = await trx.withSchema('admin').table('staffTwoFactors')
      .where({ userId, verified: true }).first('id');
    const methods: ('passkey' | 'totp')[] = [];
    if (passkey) methods.push('passkey');
    if (totp) methods.push('totp');
    return methods;
  }

  async function readState(trx: Knex.Transaction, flagId: AdminFeatureFlagId, target: AdminFeatureFlagTarget) {
    const columns = targetColumns(target);
    if (target.type === 'global') {
      const row = await trx.withSchema('admin').table('featureFlags').where({ id: flagId })
        .first<{ enabled: boolean; expiresAt: Date | null }>('enabled', 'expiresAt');
      if (!row) throw new Error('Configured feature flag is missing.');
      return { enabled: row.enabled, expiresAt: serializeDate(row.expiresAt) };
    }
    const row = await trx.withSchema('admin').table('featureFlagOverrides')
      .where({ flagId, targetType: columns.targetType, targetId: columns.targetId })
      .first<{ enabled: boolean; expiresAt: Date | null }>('enabled', 'expiresAt');
    return row ? { enabled: row.enabled, expiresAt: serializeDate(row.expiresAt) } : null;
  }

  async function getChallenge(trx: Knex.Transaction, identity: AdminFeatureFlagsIdentity, token: string) {
    if (!/^[\w-]{43}$/.test(token)) throw new AdminFeatureFlagsError('Invalid feature flag verification.', 401);
    const row = await trx.withSchema('admin').table('staffActionChallenges').where({
      id: invitationTokenHash(token),
      userId: identity.userId,
      sessionId: identity.sessionId,
    }).forUpdate().first<FeatureFlagChallenge>();
    if (!row || row.input.kind !== 'feature_flag_change' || row.consumedAt ||
      row.expiresAt.getTime() <= Date.now() || row.attempts >= 5) {
      throw new AdminFeatureFlagsError('Feature flag verification expired or was already used. Start again.', 409);
    }
    return row;
  }

  async function read(identity: AdminFeatureFlagsIdentity, context: AdminFeatureFlagsContext = {}) {
    return authorized(identity, context, 'flags.read', async trx => {
      const methods = await actionMethods(trx, identity.userId);
      const globalRows = await trx.withSchema('admin').table('featureFlags as flags')
        .leftJoin('staffUsers as staff', 'staff.id', 'flags.updatedBy')
        .select(
          'flags.id', 'flags.enabled', 'flags.defaultEnabled', 'flags.expiresAt', 'flags.updatedAt',
          trx.raw('coalesce(staff.name, staff.email) AS "updatedBy"'),
        );
      const globals = new Map(globalRows.map(row => [row.id, row]));
      const overrideRows = await trx.withSchema('admin').table('featureFlagOverrides as overrides')
        .leftJoin('staffUsers as staff', 'staff.id', 'overrides.updatedBy')
        .select(
          'overrides.flagId', 'overrides.targetType', 'overrides.targetId', 'overrides.enabled',
          'overrides.expiresAt', 'overrides.updatedAt',
          trx.raw('coalesce(staff.name, staff.email, ?) AS "updatedBy"', ['Former staff member']),
        );
      const historyRows = await trx.withSchema('admin').table('auditEvents as events')
        .leftJoin('staffUsers as staff', 'staff.id', 'events.staffUserId')
        .where({ targetType: 'feature_flag' }).whereIn('events.action', [
          'feature_flags.changed',
          'feature_flags.override_cleared',
        ])
        .orderBy('events.sequence', 'desc').limit(100)
        .select(
          'events.id', 'events.targetId', 'events.action', 'events.before', 'events.after',
          'events.reason', 'events.occurredAt',
          trx.raw('coalesce(staff.name, staff.email, ?) AS "actorName"', ['Former staff member']),
        );
      return adminFeatureFlagResponseSchema.parse({
        methods,
        flags: adminFeatureFlagIds.map(id => {
          const definition = adminFeatureFlagCatalog[id];
          const global = globals.get(id);
          if (!global) throw new Error(`Feature flag ${id} is not initialized.`);
          return {
            id,
            ...definition,
            global: {
              enabled: global.enabled,
              expiresAt: serializeDate(global.expiresAt),
              updatedAt: serializeDate(global.updatedAt),
              updatedBy: global.updatedBy ?? null,
            },
            overrides: overrideRows.filter(row => row.flagId === id).map(row => ({
              target: row.targetType === 'plan'
                ? { type: 'plan' as const, planId: row.targetId }
                : { type: 'workspace' as const, workspaceId: row.targetId },
              enabled: row.enabled,
              expiresAt: serializeDate(row.expiresAt),
              updatedAt: new Date(row.updatedAt).toISOString(),
              updatedBy: row.updatedBy,
            })),
          };
        }),
        history: historyRows.flatMap(row => {
          const flagId = adminFeatureFlagIdSchema.safeParse(row.targetId);
          const detail = row.after ?? row.before;
          if (!flagId.success || !detail || typeof detail !== 'object' || !('target' in detail)) return [];
          return [{
            id: row.id,
            flagId: flagId.data,
            target: detail.target,
            action: row.action === 'feature_flags.override_cleared' ? 'cleared' as const : 'set' as const,
            before: row.before,
            after: row.after,
            reason: row.reason ?? '',
            createdAt: new Date(row.occurredAt).toISOString(),
            actorName: row.actorName,
          }];
        }),
      });
    });
  }

  async function start(identity: AdminFeatureFlagsIdentity, input: unknown, context: AdminFeatureFlagsContext = {}) {
    const parsed = adminFeatureFlagOperationSchema.safeParse(input);
    if (!parsed.success || parsed.data.operation !== 'start') {
      throw new AdminFeatureFlagsError('Invalid feature flag change request.');
    }
    const operation = parsed.data;
    if (operation.target.type === 'global' && operation.expiresAt !== null) validateExpiry(operation.expiresAt);
    if (operation.target.type !== 'global' && operation.enabled !== null && operation.expiresAt !== null) {
      validateExpiry(operation.expiresAt);
    }
    return authorized(identity, context, 'flags.write', async trx => {
      await rateLimit(trx, identity);
      const expectedState = await readState(trx, operation.flagId, operation.target);
      const methods = await actionMethods(trx, identity.userId);
      if (!methods.length) throw new AdminFeatureFlagsError('Enroll a passkey or authenticator app before changing feature flags.', 409);
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
      const change: FeatureFlagChange = {
        kind: 'feature_flag_change',
        flagId: operation.flagId,
        target: operation.target,
        enabled: operation.enabled,
        expiresAt: operation.enabled === null ? null : operation.expiresAt,
        reason: operation.reason.trim(),
        expectedState,
      };
      await trx.withSchema('admin').table('staffActionChallenges').insert({
        id: invitationTokenHash(token),
        userId: identity.userId,
        sessionId: identity.sessionId,
        input: change,
        challenge: options.challenge,
        createdAt: now,
        expiresAt: new Date(now.getTime() + challengeLifetime),
      });
      return adminFeatureFlagStartResponseSchema.parse({ token, options });
    });
  }

  async function verifyFactor(
    identity: AdminFeatureFlagsIdentity,
    token: string,
    factor: AdminActionFactor,
    context: AdminFeatureFlagsContext = {},
  ) {
    const result = await authorized(identity, context, 'flags.write', async trx => {
      await rateLimit(trx, identity);
      const row = await getChallenge(trx, identity, token);
      if (row.verifiedAt) throw new AdminFeatureFlagsError('This feature flag verification is already complete.', 409);
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).increment('attempts', 1);
      if (!await verifyAdminActionFactor(trx, identity.userId, row.challenge, factor)) {
        return { error: 'Second-factor verification failed or the code was already used.' };
      }
      if (row.expiresAt.getTime() <= Date.now()) return { error: 'Feature flag verification expired. Start again.' };
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ verifiedAt: new Date() });
      return { verified: true as const };
    });
    if ('error' in result && typeof result.error === 'string') throw new AdminFeatureFlagsError(result.error, 422);
    return result;
  }

  async function commit(identity: AdminFeatureFlagsIdentity, token: string, context: AdminFeatureFlagsContext = {}) {
    return authorized(identity, context, 'flags.write', async (trx, role) => {
      const row = await getChallenge(trx, identity, token);
      if (!row.verifiedAt) throw new AdminFeatureFlagsError('Verify your second factor before confirming this flag change.', 409);
      const change = row.input;
      const columns = targetColumns(change.target);
      await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [
        `admin:feature-flag:${change.flagId}:${targetIdentity(change.target)}`,
      ]);
      const current = await readState(trx, change.flagId, change.target);
      if (JSON.stringify(current) !== JSON.stringify(change.expectedState)) {
        throw new AdminFeatureFlagsError('This feature flag changed. Refresh the page and start again.', 409);
      }

      const action = change.enabled === null && change.target.type !== 'global'
        ? 'feature_flags.override_cleared'
        : 'feature_flags.changed';
      if (change.target.type === 'global') {
        const definition = adminFeatureFlagCatalog[change.flagId];
        await trx.withSchema('admin').table('featureFlags').where({ id: change.flagId }).update({
          enabled: change.enabled ?? definition.defaultEnabled,
          expiresAt: change.enabled === null ? null : change.expiresAt,
          updatedBy: identity.userId,
          updatedAt: new Date(),
        });
      } else if (change.enabled === null) {
        await trx.withSchema('admin').table('featureFlagOverrides')
          .where({ flagId: change.flagId, targetType: columns.targetType, targetId: columns.targetId }).delete();
      } else {
        await trx.withSchema('admin').table('featureFlagOverrides').insert({
          flagId: change.flagId,
          targetType: columns.targetType,
          targetId: columns.targetId,
          enabled: change.enabled,
          expiresAt: change.expiresAt,
          reason: change.reason,
          updatedBy: identity.userId,
          updatedAt: new Date(),
        }).onConflict(['flagId', 'targetType', 'targetId']).merge([
          'enabled', 'expiresAt', 'reason', 'updatedBy', 'updatedAt',
        ]);
      }

      const after = await readState(trx, change.flagId, change.target);
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action,
        targetType: 'feature_flag',
        targetId: change.flagId,
        reason: change.reason,
        before: { target: change.target, state: current },
        after: { target: change.target, state: after },
        workspaceId: change.target.type === 'workspace' ? change.target.workspaceId : null,
        userAgent: context.userAgent,
      });
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ consumedAt: new Date() });
      return adminFeatureFlagResultSchema.parse({
        changed: true,
        flagId: change.flagId,
        target: change.target,
        enabled: after?.enabled ?? null,
      });
    });
  }

  async function rolloutRows(trx: Knex.Transaction) {
    const flags = await trx.withSchema('admin').table('rolloutFlags')
      .select('key', 'description', 'enabled').orderBy('key');
    return adminRolloutFlagsResponseSchema.parse({ flags });
  }

  async function readRollouts(identity: AdminFeatureFlagsIdentity, context: AdminFeatureFlagsContext = {}) {
    return authorized(identity, context, 'flags.read', async (trx, role) => {
      const response = await rolloutRows(trx);
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId, staffRole: role, action: 'rollout_flags.read',
        targetType: 'rollout_flag', targetId: 'catalog', userAgent: context.userAgent,
      });
      return response;
    });
  }

  async function mutateRollout(identity: AdminFeatureFlagsIdentity, input: unknown, context: AdminFeatureFlagsContext = {}) {
    const parsed = adminRolloutFlagMutationSchema.safeParse(input);
    if (!parsed.success) throw new AdminFeatureFlagsError('Invalid rollout flag request.');
    const change = parsed.data;
    return authorized(identity, context, 'flags.write', async (trx, role) => {
      await trx.raw("SELECT pg_advisory_xact_lock(hashtextextended('admin:rollout-flags', 0))");
      const key = change.operation === 'create' ? change.flag.key
        : change.operation === 'update' ? change.originalKey : change.key;
      const currentRow = await trx.withSchema('admin').table('rolloutFlags').where({ key })
        .first('key', 'description', 'enabled');
      const current = currentRow ? adminRolloutFlagSchema.parse(currentRow) : null;
      if (change.operation === 'create') {
        if (current) throw new AdminFeatureFlagsError('A flag with this key already exists.', 409);
      } else {
        if (!current) throw new AdminFeatureFlagsError('This flag no longer exists. Refresh the page.', 409);
        if (current.key !== change.expected.key || current.description !== change.expected.description ||
          current.enabled !== change.expected.enabled) {
          throw new AdminFeatureFlagsError('This flag changed. Refresh the page before trying again.', 409);
        }
        if (change.operation === 'update' && change.flag.key !== key &&
          await trx.withSchema('admin').table('rolloutFlags').where({ key: change.flag.key }).first('key')) {
          throw new AdminFeatureFlagsError('A flag with this key already exists.', 409);
        }
      }
      const after = change.operation === 'delete' ? null : change.flag;
      if (change.operation === 'delete') {
        await trx.withSchema('admin').table('rolloutFlags').where({ key }).delete();
      } else {
        const row = { ...change.flag, updatedBy: identity.userId, updatedAt: new Date() };
        if (change.operation === 'create') await trx.withSchema('admin').table('rolloutFlags').insert(row);
        else await trx.withSchema('admin').table('rolloutFlags').where({ key }).update(row);
      }
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId, staffRole: role,
        action: `rollout_flags.${change.operation === 'create' ? 'created' : change.operation === 'update' ? 'updated' : 'deleted'}`,
        targetType: 'rollout_flag', targetId: key, before: current, after,
        userAgent: context.userAgent,
      });
      return rolloutRows(trx);
    });
  }

  return { read, start, verifyFactor, commit, readRollouts, mutateRollout };
}

export const adminFeatureFlags = createAdminFeatureFlagsService(database);
