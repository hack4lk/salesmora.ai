import { createHash, randomUUID } from 'node:crypto';
import type { StaffRoleId } from '@salesmora/contracts';
import type { Knex } from 'knex';

export type AdminAuditActorRole = StaffRoleId | 'bootstrap';

export interface AdminAuditEventInput {
  staffUserId: string | null;
  staffRole: AdminAuditActorRole;
  action: string;
  targetType: string;
  targetId: string;
  workspaceId?: string | null;
  reason?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  requestId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  occurredAt?: Date;
}

export interface AdminAuditRecord {
  sequence: string | number;
  id: string;
  occurredAt: Date | string;
  staffUserId: string | null;
  staffRole: AdminAuditActorRole;
  action: string;
  targetType: string;
  targetId: string;
  workspaceId: string | null;
  reason: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  requestId: string;
  ipAddress: string | null;
  userAgent: string | null;
  prevHash: string | null;
  hash: string;
}

function canonicalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => [key, canonicalize(nested)]));
  }
  return value;
}

function eventPayload(event: Omit<AdminAuditRecord, 'hash'>) {
  return {
    sequence: String(event.sequence),
    id: event.id,
    occurredAt: new Date(event.occurredAt).toISOString(),
    staffUserId: event.staffUserId,
    staffRole: event.staffRole,
    action: event.action,
    targetType: event.targetType,
    targetId: event.targetId,
    workspaceId: event.workspaceId,
    reason: event.reason,
    before: event.before,
    after: event.after,
    requestId: event.requestId,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    prevHash: event.prevHash,
  };
}

export function hashAdminAuditEvent(event: Omit<AdminAuditRecord, 'hash'>) {
  return createHash('sha256').update(JSON.stringify(canonicalize(eventPayload(event)))).digest('hex');
}

export function serializeAdminAuditRecord(event: AdminAuditRecord) {
  return JSON.stringify(canonicalize({ ...eventPayload(event), hash: event.hash }));
}

export async function appendAdminAuditEvent(
  trx: Knex.Transaction,
  input: AdminAuditEventInput,
) {
  const occurredAt = input.occurredAt ?? new Date();
  if (!Number.isFinite(occurredAt.getTime())) throw new Error('Invalid audit event timestamp.');

  await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', ['admin:audit-chain']);
  const previous = await trx.withSchema('admin').table('auditEvents')
    .orderBy('sequence', 'desc')
    .first('hash') as { hash: string } | undefined;
  const sequenceResult = await trx.raw<{ rows: { sequence: string }[] }>(
    `SELECT nextval(pg_get_serial_sequence('admin."auditEvents"', 'sequence'))::text AS sequence`,
  );
  const sequence = sequenceResult.rows[0].sequence;
  const event: Omit<AdminAuditRecord, 'hash'> = {
    sequence,
    id: randomUUID(),
    occurredAt,
    staffUserId: input.staffUserId,
    staffRole: input.staffRole,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    workspaceId: input.workspaceId ?? null,
    reason: input.reason ?? null,
    before: input.before ?? null,
    after: input.after ?? null,
    requestId: input.requestId?.trim() || randomUUID(),
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    prevHash: previous?.hash ?? null,
  };
  const hash = hashAdminAuditEvent(event);
  await trx.withSchema('admin').table('auditEvents').insert({ ...event, hash });
  return { id: event.id, sequence, hash };
}

export async function verifyAdminAuditChain(db: Knex | Knex.Transaction, deadline?: number) {
  const head = await db.withSchema('admin').table('auditEvents').orderBy('sequence', 'desc').first<{ sequence: string }>('sequence');
  const throughSequence = String(head?.sequence ?? '0');
  let previousHash: string | null = null;
  let cursor = '0';
  let checked = 0;
  for (;;) {
    if (deadline !== undefined && Date.now() >= deadline) throw new Error('Audit chain verification timed out.');
    const events = await db.withSchema('admin').table('auditEvents')
      .where('sequence', '>', cursor).where('sequence', '<=', throughSequence)
      .orderBy('sequence', 'asc').limit(500)
      .select<AdminAuditRecord[]>([
        'sequence',
        'id',
        'occurredAt',
        'staffUserId',
        'staffRole',
        'action',
        'targetType',
        'targetId',
        'workspaceId',
        'reason',
        'before',
        'after',
        'requestId',
        'ipAddress',
        'userAgent',
        'prevHash',
        'hash',
      ]);
    if (!events.length) break;
    for (const event of events) {
      checked++;
      const occurredAt = new Date(event.occurredAt);
      if (!Number.isFinite(occurredAt.getTime()) || event.prevHash !== previousHash ||
        hashAdminAuditEvent({ ...event, occurredAt }) !== event.hash) {
        return { valid: false as const, checked, brokenSequence: String(event.sequence), throughSequence };
      }
      previousHash = event.hash;
      cursor = String(event.sequence);
    }
  }
  if (cursor !== throughSequence) return { valid: false as const, checked, brokenSequence: throughSequence, throughSequence };
  return { valid: true as const, checked, headHash: previousHash, throughSequence };
}
