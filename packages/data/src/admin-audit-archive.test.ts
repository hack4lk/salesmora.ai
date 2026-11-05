import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import type { AuditArchiveScope } from '@salesmora/contracts';
import { hashAdminAuditEvent, serializeAdminAuditRecord, type AdminAuditRecord } from './admin-audit';
import { buildAdminAuditArchive, verifyAdminAuditArchive } from './admin-audit-archive';

const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
const limits = { maxEvents: 10, maxBytes: 64 * 1024 };
const scope: AuditArchiveScope = {
  ledgerId: '00000000-0000-4000-8000-000000000001', previousCheckpoint: null, throughSequence: '5',
};

function event(sequence: string, previous: string | null, overrides: Partial<AdminAuditRecord> = {}): AdminAuditRecord {
  const record = {
    sequence, id: `event-${sequence}`, occurredAt: new Date('2026-10-30T00:00:00.000Z'),
    staffUserId: null, staffRole: 'bootstrap' as const, action: 'audit.test',
    targetType: 'audit', targetId: 'one', workspaceId: null, reason: null,
    before: null, after: { nested: { z: 1, a: ['\u0142\u00f3d\u017a', 'line\n"quoted"'] } },
    requestId: 'request-1', ipAddress: null, userAgent: null, prevHash: previous, hash: '',
    ...overrides,
  };
  return { ...record, hash: hashAdminAuditEvent(record) };
}

function events() {
  const first = event('1', null);
  // PostgreSQL sequences can skip rolled-back values; occurrence times are not ordering keys.
  return [first, event('5', first.hash, { occurredAt: '2026-10-01T00:00:00.000Z' })];
}

function checkpointBytes(value: unknown) {
  return Buffer.from(`${JSON.stringify(value)}\n`);
}

async function fixture() {
  const archive = await buildAdminAuditArchive(events(), scope, limits);
  const verified = verifyAdminAuditArchive(archive.ndjson, archive.checkpoint, scope, limits);
  return { ...archive, value: verified.checkpoint };
}

describe('admin audit archive format', () => {
  it('round-trips full UTF-8 evidence with sequence gaps and backdated events', async () => {
    const archive = await fixture();
    expect(archive.value).toMatchObject({
      version: 1, eventCount: 2, firstSequence: '1', throughSequence: '5',
      byteLength: archive.ndjson.length, sha256: digest(archive.ndjson), headHash: events()[1].hash,
    });
    expect(archive.checkpointSHA256).toBe(digest(archive.checkpoint));
    const lines = archive.ndjson.toString('utf8').trimEnd().split('\n').map(line => JSON.parse(line));
    expect(lines[0].after).toEqual(events()[0].after);
    expect(lines[0].occurredAt).toBe('2026-10-30T00:00:00.000Z');
    expect(lines[1].occurredAt).toBe('2026-10-01T00:00:00.000Z');
    expect(archive.ndjson.length).toBeGreaterThan(archive.ndjson.toString('utf8').length);
  });

  it('produces identical bytes for retries and differently ordered JSON keys', async () => {
    const source = events();
    const alternate = source.map(record => ({
      ...record, occurredAt: new Date(record.occurredAt).toISOString(),
      after: { nested: { a: ['\u0142\u00f3d\u017a', 'line\n"quoted"'], z: 1 } },
    }));
    const one = await buildAdminAuditArchive(source, scope, limits);
    const two = await buildAdminAuditArchive(alternate, scope, limits);
    expect(two).toEqual(one);
  });

  it('continues from an externally supplied checkpoint digest and head', async () => {
    const previous = await fixture();
    const nextScope: AuditArchiveScope = {
      ...scope, throughSequence: '9007199254740993',
      previousCheckpoint: {
        checkpointSHA256: previous.checkpointSHA256,
        throughSequence: previous.value.throughSequence, headHash: previous.value.headHash,
      },
    };
    async function* source() {
      yield event('9007199254740993', previous.value.headHash);
    }
    const next = await buildAdminAuditArchive(source(), nextScope, limits);
    expect(verifyAdminAuditArchive(next.ndjson, next.checkpoint, nextScope, limits).checkpoint)
      .toMatchObject({ firstSequence: '9007199254740993', previousCheckpoint: nextScope.previousCheckpoint });
    expect(() => verifyAdminAuditArchive(next.ndjson, next.checkpoint, {
      ...nextScope, previousCheckpoint: { ...nextScope.previousCheckpoint!, checkpointSHA256: 'a'.repeat(64) },
    }, limits)).toThrow('independently supplied scope');
    await expect(buildAdminAuditArchive([event('6', null)], {
      ...nextScope, throughSequence: '6',
    }, limits)).rejects.toThrow('previous-hash link');
  });

  it('rejects changed bytes before trusting recorded checksums', async () => {
    const archive = await fixture();
    const corrupt = Buffer.from(archive.ndjson);
    corrupt[20] ^= 1;
    for (const data of [corrupt, archive.ndjson.subarray(0, -1), Buffer.concat([archive.ndjson, Buffer.from('\n')])]) {
      expect(() => verifyAdminAuditArchive(data, archive.checkpoint, scope, limits)).toThrow('checksum');
    }
  });

  it('recomputes every event hash even if the object checksum has been replaced', async () => {
    const archive = await fixture();
    const data = Buffer.from(archive.ndjson.toString('utf8').replace('audit.test', 'audit.evil'));
    const checkpoint = checkpointBytes({ ...archive.value, byteLength: data.length, sha256: digest(data) });
    expect(() => verifyAdminAuditArchive(data, checkpoint, scope, limits)).toThrow('hash');
  });

  it('rejects wrong ledger/scope, missing tail, reordered, duplicate or omitted records', async () => {
    const archive = await fixture();
    expect(() => verifyAdminAuditArchive(archive.ndjson, archive.checkpoint, {
      ...scope, ledgerId: '00000000-0000-4000-8000-000000000002',
    }, limits)).toThrow('scope');
    expect(() => verifyAdminAuditArchive(archive.ndjson, archive.checkpoint, {
      ...scope, throughSequence: '6',
    }, limits)).toThrow('scope');
    const [first, last] = events();
    for (const source of [[last, first], [first, first, last], [last]]) {
      await expect(buildAdminAuditArchive(source, scope, limits)).rejects.toThrow();
    }
    await expect(buildAdminAuditArchive([first], scope, limits)).rejects.toThrow('captured sequence bound');
    await expect(buildAdminAuditArchive([], scope, limits)).rejects.toThrow('empty');
    await expect(buildAdminAuditArchive([first, last, event('6', last.hash)], scope, limits))
      .rejects.toThrow('outside the ordered scope');
    const middle = event('3', first.hash);
    const tail = event('5', middle.hash);
    await expect(buildAdminAuditArchive([first, tail], scope, limits)).rejects.toThrow('hash');
  });

  it('rejects forged checkpoint counts, first sequence and head hash', async () => {
    const archive = await fixture();
    for (const patch of [{ eventCount: 1 }, { firstSequence: '2' }, { headHash: 'a'.repeat(64) }]) {
      expect(() => verifyAdminAuditArchive(
        archive.ndjson, checkpointBytes({ ...archive.value, ...patch }), scope, limits,
      )).toThrow('evidence');
    }
  });

  it('enforces exact byte/event thresholds on both production and verification', async () => {
    const archive = await fixture();
    const exact = { maxEvents: 2, maxBytes: archive.ndjson.length };
    expect(await buildAdminAuditArchive(events(), scope, exact)).toEqual({
      ndjson: archive.ndjson, checkpoint: archive.checkpoint, checkpointSHA256: archive.checkpointSHA256,
    });
    expect(() => verifyAdminAuditArchive(archive.ndjson, archive.checkpoint, scope, exact)).not.toThrow();
    for (const bound of [{ ...exact, maxBytes: exact.maxBytes - 1 }, { ...exact, maxEvents: 1 }]) {
      await expect(buildAdminAuditArchive(events(), scope, bound)).rejects.toThrow('limit');
      expect(() => verifyAdminAuditArchive(archive.ndjson, archive.checkpoint, scope, bound)).toThrow('limit');
    }
  });

  it('rejects invalid limits, imprecise numbers and source errors without returning partial files', async () => {
    for (const invalid of [0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) {
      await expect(buildAdminAuditArchive(events(), scope, { ...limits, maxEvents: invalid })).rejects.toThrow('limits');
      expect(() => verifyAdminAuditArchive(Buffer.alloc(0), Buffer.alloc(0), scope, {
        ...limits, maxBytes: invalid,
      })).toThrow('limits');
    }
    await expect(buildAdminAuditArchive([event('1', null, { sequence: Number.MAX_SAFE_INTEGER + 1 })], scope, limits))
      .rejects.toThrow('imprecise');
    async function* source() {
      yield events()[0];
      throw new Error('Source read failed.');
    }
    await expect(buildAdminAuditArchive(source(), scope, limits)).rejects.toThrow('Source read failed');
  });

  it('rejects unsupported, oversized, malformed or noncanonical checkpoint bytes', async () => {
    const archive = await fixture();
    for (const bytes of [
      Buffer.from('not JSON'), Buffer.alloc(16 * 1024 + 1),
      Buffer.from(JSON.stringify(archive.value)),
      checkpointBytes({ ...archive.value, version: 2 }),
      Buffer.from(`${JSON.stringify({ ...archive.value, protected: true })}\n`),
      Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), archive.checkpoint]),
      Buffer.from([0xff]),
    ]) expect(() => verifyAdminAuditArchive(archive.ndjson, bytes, scope, limits)).toThrow();
  });

  it('rejects blank lines, missing final newline, duplicate JSON keys and invalid UTF-8 even with matching checksums', async () => {
    const archive = await fixture();
    const text = archive.ndjson.toString('utf8');
    for (const data of [
      Buffer.from(`${text}\n`), Buffer.from(text.slice(0, -1)),
      Buffer.from(text.replace('{"action":', '{"sequence":"1","action":')),
      Buffer.from(text.replace('"audit.test"', '"audit.test" ')),
      Buffer.concat([Buffer.from([0xff]), archive.ndjson.subarray(1)]),
      Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), archive.ndjson]),
    ]) {
      expect(() => verifyAdminAuditArchive(data, checkpointBytes({
        ...archive.value, byteLength: data.length, sha256: digest(data),
      }), scope, limits)).toThrow();
    }
  });

  it('keeps archive serialization separate from the hash-covered payload', () => {
    const record = events()[0];
    expect(record.hash).toBe('b3eb4366d22dff765e702584a87fa99a397e2b4b32b86ccb147672ab26b02136');
    expect(hashAdminAuditEvent({ ...record, occurredAt: '2026-10-30T00:00:00.000Z' })).toBe(record.hash);
    expect(JSON.parse(serializeAdminAuditRecord(record)).hash).toBe(record.hash);
    expect(hashAdminAuditEvent({ ...record, action: 'changed' })).not.toBe(record.hash);
  });
});
