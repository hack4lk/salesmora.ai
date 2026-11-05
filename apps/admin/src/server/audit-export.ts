import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { auditExportInputSchema, type AuditExportInput } from '@salesmora/contracts';
import type { Knex } from '@salesmora/data';
import { appendAdminAuditEvent, type AdminAuditRecord } from '@salesmora/data/admin-audit';
import { csvLine } from '@salesmora/data/csv';
import { invitationTokenHash } from '@salesmora/data/invitation-tokens';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { auth } from './auth';
import { getAdminAuthConfiguration } from './auth-config';
import { verifyAdminActionFactor, type AdminActionFactor } from './admin-action-factor';
import { auditQuery } from './audit-query';
import { AuditViewerError, type AuditAuthorization, type AuditViewerIdentity, type AuditViewerContext } from './audit-viewer';

type ExportChallenge = {
  id: string; input: { kind: 'audit_export'; value: AuditExportInput; method?: AdminActionFactor['method'] };
  challenge: string; expiresAt: Date; verifiedAt: Date | null; consumedAt: Date | null; attempts: number;
};
const lifetime = 5 * 60 * 1000;
const maxBytes = 32 * 1024 * 1024;
const columns = ['sequence', 'event_id', 'occurred_at_utc', 'staff_user_id', 'recorded_staff_role', 'action',
  'target_type', 'target_id', 'workspace_id', 'reason', 'request_id', 'ip_address', 'user_agent', 'before_json', 'after_json', 'prev_hash', 'hash'];

export function createAuditExportService(authorized: AuditAuthorization) {
  async function rateLimit(trx: Knex.Transaction, identity: AuditViewerIdentity) {
    // Share the staff-verification budget so changing action types cannot bypass it.
    const key = `staff-actions:${identity.userId}`;
    const row = await trx.withSchema('admin').table('staffRateLimits').where({ key })
      .first<{ count: number; lastRequest: string }>();
    const now = Date.now();
    if (row && now - Number(row.lastRequest) < 15 * 60 * 1000 && row.count >= 30) {
      throw new AuditViewerError('Too many admin verification attempts. Try again in 15 minutes.', 429);
    }
    const count = row && now - Number(row.lastRequest) < 15 * 60 * 1000 ? row.count + 1 : 1;
    await trx.withSchema('admin').table('staffRateLimits').insert({
      id: key, key, count, lastRequest: count === 1 ? now : row!.lastRequest,
    }).onConflict('key').merge(['count', 'lastRequest']);
  }

  async function scope(trx: Knex.Transaction, input: AuditExportInput) {
    const snapshot = input.snapshot;
    if (Date.parse(snapshot.asOf) > Date.now()) throw new AuditViewerError('The export snapshot cannot be in the future.');
    const head = await trx.withSchema('admin').table('auditEvents').orderBy('sequence', 'desc').first<{ sequence: string }>('sequence');
    if (BigInt(snapshot.throughSequence) > BigInt(head?.sequence ?? '0')) throw new AuditViewerError('Invalid export snapshot sequence.');
    const query = () => auditQuery(trx, { ...snapshot.filters, page: 0 }, new Date(snapshot.asOf), snapshot.throughSequence);
    const count = await query().count<{ count: string }[]>('* as count');
    const total = Number(count[0].count);
    if (!total || total > 50_000 || total !== snapshot.count) {
      throw new AuditViewerError('Export count changed, is empty or exceeds 50,000. Refresh and narrow the filters; no partial file was exported.', 409);
    }
    return query;
  }

  async function exportMethods(identity: AuditViewerIdentity, context: AuditViewerContext = {}) {
    return authorized(identity, 'export', context, async trx => {
      const keys = await trx.withSchema('admin').table('staffPasskeys').where({ userId: identity.userId }).first('id');
      const totp = await trx.withSchema('admin').table('staffTwoFactors').where({ userId: identity.userId, verified: true }).first('id');
      const methods: AdminActionFactor['method'][] = [];
      if (keys) methods.push('passkey');
      if (totp) methods.push('totp');
      return { methods };
    });
  }

  async function startExport(identity: AuditViewerIdentity, value: unknown, password: string, context: AuditViewerContext = {}) {
    const parsed = auditExportInputSchema.safeParse(value);
    if (!parsed.success || !password || password.length > 128) throw new AuditViewerError('Invalid audit export review.');
    const result = await authorized(identity, 'export', context, async trx => {
      await rateLimit(trx, identity);
      await scope(trx, parsed.data);
      const account = await trx.withSchema('admin').table('staffAccounts')
        .where({ userId: identity.userId, providerId: 'credential' }).first<{ password: string }>('password');
      if (!account?.password || !await (await auth.$context).password.verify({ password, hash: account.password })) {
        return { error: 'Password verification failed.' };
      }
      const keys = await trx.withSchema('admin').table('staffPasskeys').where({ userId: identity.userId }).select<{ credentialID: string }[]>('credentialID');
      const totp = await trx.withSchema('admin').table('staffTwoFactors').where({ userId: identity.userId, verified: true }).first('id');
      if (!keys.length && !totp) return { error: 'Enroll a second factor before exporting.' };
      const options = await generateAuthenticationOptions({
        rpID: getAdminAuthConfiguration().rpID, userVerification: 'required', allowCredentials: keys.map(key => ({ id: key.credentialID })),
      });
      const token = randomBytes(32).toString('base64url');
      const now = new Date();
      await trx.withSchema('admin').table('staffActionChallenges').where({ sessionId: identity.sessionId }).whereNull('consumedAt').update({ consumedAt: now });
      await trx.withSchema('admin').table('staffActionChallenges').insert({
        id: invitationTokenHash(token), userId: identity.userId, sessionId: identity.sessionId,
        input: { kind: 'audit_export', value: parsed.data }, challenge: options.challenge,
        createdAt: now, expiresAt: new Date(now.getTime() + lifetime),
      });
      return { token, options };
    });
    if (typeof result.error === 'string') throw new AuditViewerError(result.error, 401);
    return result;
  }

  async function challenge(trx: Knex.Transaction, identity: AuditViewerIdentity, token: string) {
    if (!/^[\w-]{43}$/.test(token)) throw new AuditViewerError('Invalid export verification.', 401);
    const row = await trx.withSchema('admin').table('staffActionChallenges')
      .where({ id: invitationTokenHash(token), userId: identity.userId, sessionId: identity.sessionId }).forUpdate().first<ExportChallenge>();
    if (!row || row.input.kind !== 'audit_export' || row.consumedAt || row.expiresAt.getTime() <= Date.now() || row.attempts >= 5) {
      throw new AuditViewerError('Export verification expired, was already used or belongs to another action. Start a new review.', 401);
    }
    row.input.value = auditExportInputSchema.parse(row.input.value);
    return row;
  }

  async function verifyExportFactor(identity: AuditViewerIdentity, token: string, factor: AdminActionFactor, context: AuditViewerContext = {}) {
    const result = await authorized(identity, 'export', context, async trx => {
      await rateLimit(trx, identity);
      const row = await challenge(trx, identity, token);
      if (row.verifiedAt) throw new AuditViewerError('Export verification is already complete.', 409);
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).increment('attempts', 1);
      if (!await verifyAdminActionFactor(trx, identity.userId, row.challenge, factor)) return { error: 'Second-factor verification failed or the code was already used.' };
      if (row.expiresAt.getTime() <= Date.now()) return { error: 'Export verification expired. Start a new review.' };
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id })
        .update({ verifiedAt: new Date(), input: { ...row.input, method: factor.method } });
      return { verified: true };
    });
    if (typeof result.error === 'string') throw new AuditViewerError(result.error, 401);
    return result;
  }

  async function commitExport(identity: AuditViewerIdentity, token: string, context: AuditViewerContext = {}) {
    return authorized(identity, 'export', context, async trx => {
      const row = await challenge(trx, identity, token);
      if (!row.verifiedAt || !row.input.method) throw new AuditViewerError('Verify your second factor before exporting.', 401);
      const query = await scope(trx, row.input.value);
      // Build the bounded file before committing its audit record; never stream unaudited rows.
      const chunks = [csvLine(columns)];
      let bytes = Buffer.byteLength(chunks[0]);
      let count = 0;
      let cursor: { time: Date | string; sequence: string | number } | null = null;
      const deadline = Date.now() + 30_000;
      for (;;) {
        const batch = query().select<AdminAuditRecord[]>('e.*').orderBy('e.occurredAt', 'desc').orderBy('e.sequence', 'desc').limit(500);
        if (cursor) batch.whereRaw('(e."occurredAt", e.sequence) < (?, ?)', [cursor.time, cursor.sequence]);
        const events = await batch;
        if (!events.length) break;
        for (const event of events) {
          const line = csvLine([event.sequence, event.id, new Date(event.occurredAt).toISOString(), event.staffUserId, event.staffRole,
            event.action, event.targetType, event.targetId, event.workspaceId, event.reason, event.requestId, event.ipAddress,
            event.userAgent, event.before === null ? '' : JSON.stringify(event.before), event.after === null ? '' : JSON.stringify(event.after),
            event.prevHash, event.hash]);
          bytes += Buffer.byteLength(line);
          if (bytes > maxBytes || ++count > 50_000) throw new AuditViewerError('Export is too large. Narrow the filters; no partial file was exported.', 409);
          chunks.push(line);
        }
        const last = events.at(-1)!;
        cursor = { time: last.occurredAt, sequence: last.sequence };
        if (Date.now() >= deadline) throw new AuditViewerError('Export preparation timed out. Narrow the filters and start a new review.', 503);
      }
      if (count !== row.input.value.snapshot.count) throw new AuditViewerError('Export scope changed. Refresh and review again.', 409);
      if (row.expiresAt.getTime() <= Date.now()) throw new AuditViewerError('Export verification expired during preparation. Start again.', 401);
      const csv = chunks.join('');
      const checksum = createHash('sha256').update(csv).digest('hex');
      const event = await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId, staffRole: 'super_admin', action: 'staff.audit_export',
        targetType: 'admin_audit_export', targetId: row.id, reason: row.input.value.reason, ...context,
        after: { ...row.input.value.snapshot, count, bytes, sha256: checksum, factor: row.input.method,
          delivery: 'prepared_for_download', chainVerified: false },
      });
      if (row.expiresAt.getTime() <= Date.now()) throw new AuditViewerError('Export verification expired before release. Start a new review.', 401);
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ consumedAt: new Date() });
      return { csv, count, eventId: event.id, checksum };
    });
  }
  return { exportMethods, startExport, verifyExportFactor, commitExport };
}
