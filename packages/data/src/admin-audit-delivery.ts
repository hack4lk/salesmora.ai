import { createHash } from 'node:crypto';
import {
  auditArchiveCheckpointSchema,
  auditArchiveScopeSchema,
  auditArchiveLockRulesSchema,
  type AuditArchiveScope,
  type AuditArchiveLockRules,
} from '@salesmora/contracts';
import { verifyAdminAuditArchive, type AdminAuditArchive, type AdminAuditArchiveLimits } from './admin-audit-archive';

export const AUDIT_ARCHIVE_RETENTION_SECONDS = 365 * 24 * 60 * 60;
export interface AuditArchiveTarget {
  accountId: string;
  bucket: string;
  jurisdiction: 'default' | 'eu' | 'us';
}
export interface AuditStoredObject {
  bytes: Buffer;
  uploadedAt: string;
}
export interface AuditArchiveReader {
  target: AuditArchiveTarget;
  get(key: string, maxBytes: number, signal: AbortSignal): Promise<AuditStoredObject | null>;
}
export interface AuditArchiveWriter {
  target: AuditArchiveTarget;
  create(key: string, bytes: Buffer, contentType: string, signal: AbortSignal): Promise<'created' | 'exists' | 'uncertain'>;
}
export interface AuditArchiveLockReader {
  target: AuditArchiveTarget;
  rules(signal: AbortSignal): Promise<AuditArchiveLockRules>;
}
export class AuditArchiveDeliveryError extends Error {
  constructor(public readonly code:
    'target_mismatch' | 'object_missing' | 'object_mismatch' | 'checkpoint_mismatch' |
    'lock_insufficient' | 'upload_unconfirmed' | 'invalid_evidence') {
    super(`Audit archive delivery failed: ${code}.`);
  }
}
export interface AuditArchiveLockEvidence {
  key: string;
  ruleId: string;
  uploadedAt: string;
  checkedAt: string;
  protectedUntil: string | null;
}

const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

function timestamp(value: string) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new AuditArchiveDeliveryError('invalid_evidence');
  return parsed;
}

export function auditArchiveLockEvidence(
  ruleInput: AuditArchiveLockRules, key: string, uploadedAt: string, checkedAt: string,
): AuditArchiveLockEvidence {
  const rules = auditArchiveLockRulesSchema.parse(ruleInput);
  const uploaded = timestamp(uploadedAt);
  const checked = timestamp(checkedAt);
  if (uploaded > checked) throw new AuditArchiveDeliveryError('invalid_evidence');
  const minimum = uploaded + AUDIT_ARCHIVE_RETENTION_SECONDS * 1000;
  let best: { id: string; until: number } | undefined;
  for (const rule of rules) {
    if (!rule.enabled || !key.startsWith(rule.prefix ?? '')) continue;
    const until = rule.condition.type === 'Indefinite' ? Infinity :
      rule.condition.type === 'Date' ? timestamp(rule.condition.date) :
        uploaded + rule.condition.maxAgeSeconds * 1000;
    if (until < minimum || until <= checked || (until !== Infinity && !Number.isFinite(new Date(until).getTime()))) continue;
    if (!best || until > best.until) best = { id: rule.id, until };
  }
  if (!best) throw new AuditArchiveDeliveryError('lock_insufficient');
  return { key, ruleId: best.id, uploadedAt, checkedAt, protectedUntil: best.until === Infinity ? null :
    new Date(best.until).toISOString() };
}

function sameTargets(...targets: AuditArchiveTarget[]) {
  const first = targets[0];
  if (targets.some(target => target.accountId !== first.accountId || target.bucket !== first.bucket ||
    target.jurisdiction !== first.jurisdiction)) {
    throw new AuditArchiveDeliveryError('target_mismatch');
  }
}

export function auditArchiveObjectKeys(ledgerId: string, checkpointSHA256: string, objectSHA256: string) {
  if (!auditArchiveScopeSchema.safeParse({ ledgerId, previousCheckpoint: null, throughSequence: '1' }).success ||
    !/^[a-f0-9]{64}$/.test(checkpointSHA256) ||
    !/^[a-f0-9]{64}$/.test(objectSHA256)) {
    throw new AuditArchiveDeliveryError('invalid_evidence');
  }
  const prefix = `admin-audit/v1/${ledgerId.toLowerCase()}`;
  return {
    objectKey: `${prefix}/segments/${objectSHA256}.ndjson`,
    checkpointKey: `${prefix}/checkpoints/${checkpointSHA256}.json`,
  };
}

function deliveryLimits(input: AdminAuditArchiveLimits) {
  if (!Number.isSafeInteger(input.maxEvents) || input.maxEvents < 1 || input.maxEvents > 50_000 ||
    !Number.isSafeInteger(input.maxBytes) || input.maxBytes < 1 || input.maxBytes > 32 * 1024 * 1024) {
    throw new AuditArchiveDeliveryError('invalid_evidence');
  }
  return { ...input };
}

export interface AuditArchiveVerification {
  state: 'snapshot_checked';
  target: AuditArchiveTarget;
  objectKey: string;
  checkpointKey: string;
  checkpointSHA256: string;
  objectSHA256: string;
  throughSequence: string;
  headHash: string;
  eventCount: number;
  checkedAt: string;
  locks: AuditArchiveLockEvidence[];
}

export async function verifyStoredAdminAuditArchive(
  reader: AuditArchiveReader,
  lockReader: AuditArchiveLockReader,
  scopeInput: AuditArchiveScope,
  expectedCheckpointSHA256: string,
  limitsInput: AdminAuditArchiveLimits,
  signal: AbortSignal,
): Promise<AuditArchiveVerification> {
  sameTargets(reader.target, lockReader.target);
  const scope = auditArchiveScopeSchema.parse(scopeInput);
  const limits = deliveryLimits(limitsInput);
  signal.throwIfAborted();
  // The checkpoint digest must come from retained expected evidence, not from this fetch.
  const { checkpointKey } = auditArchiveObjectKeys(scope.ledgerId, expectedCheckpointSHA256, '0'.repeat(64));
  const storedCheckpoint = await reader.get(checkpointKey, 16 * 1024, signal);
  if (!storedCheckpoint) throw new AuditArchiveDeliveryError('object_missing');
  if (sha256(storedCheckpoint.bytes) !== expectedCheckpointSHA256) {
    throw new AuditArchiveDeliveryError('checkpoint_mismatch');
  }
  // Parse only after digest comparison; the format verifier below validates the entire manifest.
  const manifest = auditArchiveCheckpointSchema.parse(JSON.parse(storedCheckpoint.bytes.toString('utf8')));
  const keys = auditArchiveObjectKeys(scope.ledgerId, expectedCheckpointSHA256, manifest.sha256);
  const storedObject = await reader.get(keys.objectKey, limits.maxBytes, signal);
  if (!storedObject) throw new AuditArchiveDeliveryError('object_missing');
  const verified = verifyAdminAuditArchive(storedObject.bytes, storedCheckpoint.bytes, scope, limits);
  const rules = await lockReader.rules(signal);
  signal.throwIfAborted();
  const checkedAt = new Date().toISOString();
  return {
    state: 'snapshot_checked', target: { ...reader.target }, ...keys,
    checkpointSHA256: verified.checkpointSHA256, objectSHA256: verified.checkpoint.sha256,
    throughSequence: verified.checkpoint.throughSequence, headHash: verified.checkpoint.headHash,
    eventCount: verified.checkpoint.eventCount, checkedAt,
    locks: [
      auditArchiveLockEvidence(rules, keys.objectKey, storedObject.uploadedAt, checkedAt),
      auditArchiveLockEvidence(rules, keys.checkpointKey, storedCheckpoint.uploadedAt, checkedAt),
    ],
  };
}

export async function deliverAdminAuditArchive(
  archiveInput: AdminAuditArchive,
  scopeInput: AuditArchiveScope,
  limitsInput: AdminAuditArchiveLimits,
  writer: AuditArchiveWriter,
  reader: AuditArchiveReader,
  lockReader: AuditArchiveLockReader,
  signal: AbortSignal,
): Promise<AuditArchiveVerification> {
  sameTargets(writer.target, reader.target, lockReader.target);
  const scope = auditArchiveScopeSchema.parse(scopeInput);
  const limits = deliveryLimits(limitsInput);
  signal.throwIfAborted();
  if (archiveInput.ndjson.length > limits.maxBytes || archiveInput.checkpoint.length > 16 * 1024) {
    throw new AuditArchiveDeliveryError('invalid_evidence');
  }
  // Own immutable snapshots of the caller's buffers across network awaits.
  const archive = { ndjson: Buffer.from(archiveInput.ndjson), checkpoint: Buffer.from(archiveInput.checkpoint) };
  const verified = verifyAdminAuditArchive(archive.ndjson, archive.checkpoint, scope, limits);
  if (verified.checkpointSHA256 !== archiveInput.checkpointSHA256) {
    throw new AuditArchiveDeliveryError('checkpoint_mismatch');
  }
  const keys = auditArchiveObjectKeys(scope.ledgerId, verified.checkpointSHA256, verified.checkpoint.sha256);
  async function ensureObject(key: string, bytes: Buffer, contentType: string) {
    signal.throwIfAborted();
    const existing = await reader.get(key, bytes.length, signal);
    const before = new Date().toISOString();
    const rules = await lockReader.rules(signal);
    auditArchiveLockEvidence(rules, key, existing?.uploadedAt ?? before, new Date().toISOString());
    if (existing) {
      if (!existing.bytes.equals(bytes)) throw new AuditArchiveDeliveryError('object_mismatch');
      return;
    }
    signal.throwIfAborted();
    const outcome = await writer.create(key, bytes, contentType, signal);
    const stored = await reader.get(key, bytes.length, signal);
    if (!stored) throw new AuditArchiveDeliveryError(outcome === 'created' ? 'object_missing' : 'upload_unconfirmed');
    if (!stored.bytes.equals(bytes)) throw new AuditArchiveDeliveryError('object_mismatch');
    const afterRules = await lockReader.rules(signal);
    auditArchiveLockEvidence(afterRules, key, stored.uploadedAt, new Date().toISOString());
  }
  await ensureObject(keys.objectKey, archive.ndjson, 'application/x-ndjson');
  await ensureObject(keys.checkpointKey, archive.checkpoint, 'application/json');
  return verifyStoredAdminAuditArchive(reader, lockReader, scope, verified.checkpointSHA256, limits, signal);
}
