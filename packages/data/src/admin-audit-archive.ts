import { createHash } from 'node:crypto';
import { TextDecoder } from 'node:util';
import {
  auditArchiveCheckpointSchema,
  auditArchiveRecordSchema,
  auditArchiveScopeSchema,
  type AuditArchiveAnchor,
  type AuditArchiveCheckpoint,
  type AuditArchiveRecord,
  type AuditArchiveScope,
} from '@salesmora/contracts';
import { hashAdminAuditEvent, serializeAdminAuditRecord, type AdminAuditRecord } from './admin-audit';

export interface AdminAuditArchiveLimits {
  maxEvents: number;
  maxBytes: number;
}

export interface AdminAuditArchive {
  ndjson: Buffer;
  checkpoint: Buffer;
  checkpointSHA256: string;
}

const MAX_CHECKPOINT_BYTES = 16 * 1024;
const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
const decode = (bytes: Buffer) => new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);

function validateLimits(limits: AdminAuditArchiveLimits) {
  if (!Number.isSafeInteger(limits.maxEvents) || limits.maxEvents < 1 ||
    !Number.isSafeInteger(limits.maxBytes) || limits.maxBytes < 1) {
    throw new Error('Archive limits must be positive safe integers.');
  }
}

function sameAnchor(left: AuditArchiveAnchor | null, right: AuditArchiveAnchor | null) {
  if (left === null || right === null) return left === right;
  return left.checkpointSHA256 === right.checkpointSHA256 &&
    left.throughSequence === right.throughSequence && left.headHash === right.headHash;
}

function segmentTracker(scope: AuditArchiveScope, limits: AdminAuditArchiveLimits) {
  let cursor = BigInt(scope.previousCheckpoint?.throughSequence ?? '0');
  let headHash = scope.previousCheckpoint?.headHash ?? null;
  let firstSequence: string | undefined;
  let eventCount = 0;
  let byteLength = 0;

  return {
    add(event: AuditArchiveRecord, bytes: number) {
      if (eventCount >= limits.maxEvents || byteLength + bytes > limits.maxBytes) {
        throw new Error('Archive exceeds its event or byte limit; no partial segment is valid.');
      }
      if (BigInt(event.sequence) <= cursor || BigInt(event.sequence) > BigInt(scope.throughSequence)) {
        throw new Error(`Archive sequence is outside the ordered scope at ${event.sequence}.`);
      }
      if (event.prevHash !== headHash || hashAdminAuditEvent(event) !== event.hash) {
        throw new Error(`Archive event hash or previous-hash link mismatch at ${event.sequence}.`);
      }
      firstSequence ??= event.sequence;
      cursor = BigInt(event.sequence);
      headHash = event.hash;
      eventCount++;
      byteLength += bytes;
    },
    finish(digest: string): AuditArchiveCheckpoint {
      if (firstSequence === undefined || headHash === null) {
        throw new Error('Cannot create an empty archive segment.');
      }
      if (String(cursor) !== scope.throughSequence) {
        throw new Error('Archive does not reach the captured sequence bound.');
      }
      return auditArchiveCheckpointSchema.parse({
        version: 1,
        format: 'salesmora.admin-audit.ndjson',
        ledgerId: scope.ledgerId,
        previousCheckpoint: scope.previousCheckpoint,
        firstSequence,
        throughSequence: scope.throughSequence,
        eventCount,
        byteLength,
        sha256: digest,
        headHash,
      });
    },
  };
}

export async function buildAdminAuditArchive(
  records: Iterable<AdminAuditRecord> | AsyncIterable<AdminAuditRecord>,
  expectedScope: AuditArchiveScope,
  limits: AdminAuditArchiveLimits,
): Promise<AdminAuditArchive> {
  validateLimits(limits);
  const scope = auditArchiveScopeSchema.parse(expectedScope);
  const tracker = segmentTracker(scope, limits);
  const chunks: Buffer[] = [];
  for await (const record of records) {
    if (typeof record.sequence === 'number' && !Number.isSafeInteger(record.sequence)) {
      throw new Error('Audit sequence must not be an imprecise JavaScript number.');
    }
    const event = auditArchiveRecordSchema.parse({
      ...record, sequence: String(record.sequence), occurredAt: new Date(record.occurredAt).toISOString(),
    });
    const bytes = Buffer.from(`${serializeAdminAuditRecord(event)}\n`, 'utf8');
    tracker.add(event, bytes.length);
    chunks.push(bytes);
  }
  const ndjson = Buffer.concat(chunks);
  const checkpoint = Buffer.from(`${JSON.stringify(tracker.finish(sha256(ndjson)))}\n`, 'utf8');
  return { ndjson, checkpoint, checkpointSHA256: sha256(checkpoint) };
}

export function verifyAdminAuditArchive(
  ndjson: Buffer,
  checkpointBytes: Buffer,
  expectedScope: AuditArchiveScope,
  limits: AdminAuditArchiveLimits,
): { checkpoint: AuditArchiveCheckpoint; checkpointSHA256: string } {
  validateLimits(limits);
  const scope = auditArchiveScopeSchema.parse(expectedScope);
  if (checkpointBytes.length > MAX_CHECKPOINT_BYTES) throw new Error('Archive checkpoint is too large.');
  const checkpoint = auditArchiveCheckpointSchema.parse(JSON.parse(decode(checkpointBytes)));
  if (!checkpointBytes.equals(Buffer.from(`${JSON.stringify(checkpoint)}\n`, 'utf8'))) {
    throw new Error('Archive checkpoint is not canonically encoded.');
  }
  if (checkpoint.ledgerId !== scope.ledgerId || checkpoint.throughSequence !== scope.throughSequence ||
    !sameAnchor(checkpoint.previousCheckpoint, scope.previousCheckpoint)) {
    throw new Error('Archive checkpoint does not match the independently supplied scope.');
  }
  if (ndjson.length > limits.maxBytes || checkpoint.eventCount > limits.maxEvents) {
    throw new Error('Archive exceeds its event or byte limit.');
  }
  if (checkpoint.byteLength !== ndjson.length || checkpoint.sha256 !== sha256(ndjson)) {
    throw new Error('Archive byte length or checksum mismatch.');
  }
  const tracker = segmentTracker(scope, limits);
  const text = decode(ndjson);
  if (!text.endsWith('\n')) throw new Error('Archive must end with an NDJSON newline.');
  for (const line of text.slice(0, -1).split('\n')) {
    const event = auditArchiveRecordSchema.parse(JSON.parse(line));
    if (serializeAdminAuditRecord(event) !== line) throw new Error('Archive record is not canonically encoded.');
    tracker.add(event, Buffer.byteLength(`${line}\n`, 'utf8'));
  }
  const actual = tracker.finish(checkpoint.sha256);
  if (actual.eventCount !== checkpoint.eventCount || actual.firstSequence !== checkpoint.firstSequence ||
    actual.headHash !== checkpoint.headHash || actual.byteLength !== checkpoint.byteLength) {
    throw new Error('Archive checkpoint evidence does not match its records.');
  }
  return { checkpoint, checkpointSHA256: sha256(checkpointBytes) };
}
