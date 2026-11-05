import { Readable } from 'node:stream';
import { ReadableStream } from 'node:stream/web';
import { describe, expect, it, vi } from 'vitest';
import type { S3ClientConfig } from '@aws-sdk/client-s3';
import { createAuditR2Storage, createAuditR2Verifier, createAuditR2Writer } from './admin-audit-r2';
import { auditArchiveObjectKeys, deliverAdminAuditArchive } from './admin-audit-delivery';
import { buildAdminAuditArchive } from './admin-audit-archive';
import { hashAdminAuditEvent, type AdminAuditRecord } from './admin-audit';

const target = { accountId: 'a'.repeat(32), bucket: 'audit-fixture', jurisdiction: 'default' as const };
const writerCredentials = { accessKeyId: 'FICTIONAL_WRITER', secretAccessKey: 'fictional-writer-secret' };
const readerCredentials = { accessKeyId: 'FICTIONAL_READER', secretAccessKey: 'fictional-reader-secret' };
const token = 'fictional-lock-read-token';
const key = auditArchiveObjectKeys('00000000-0000-4000-8000-000000000001', 'b'.repeat(64), 'c'.repeat(64)).objectKey;
const signal = () => AbortSignal.timeout(10_000);
interface Request {
  method: string;
  hostname: string;
  path: string;
  headers: Record<string, string>;
  body?: unknown;
}
interface TestResponse {
  status?: number;
  headers?: Record<string, string>;
  body?: Readable;
  error?: Error;
}

function transport(response: TestResponse, requests: Request[] = []): S3ClientConfig['requestHandler'] {
  return {
    async handle(request: Request) {
      requests.push(request);
      if (response.error) throw response.error;
      return { response: {
        statusCode: response.status ?? 200, headers: response.headers ?? {},
        body: response.body ?? Readable.from([]),
      } };
    },
  };
}
const response = (bytes: Buffer = Buffer.from('fictional')): TestResponse => ({
  headers: { 'content-length': String(bytes.length), 'last-modified': 'Fri, 30 Oct 2026 00:00:00 GMT' },
  body: Readable.from([bytes]),
});
const errorResponse = (status: number, code: string): TestResponse => ({
  status, headers: { 'content-type': 'application/xml' },
  body: Readable.from([Buffer.from(`<Error><Code>${code}</Code><Message>Fictional failure</Message></Error>`)]),
});
const lockResponse = () => new Response(JSON.stringify({
  success: true, errors: [], messages: [], result: {
    rules: [{ id: 'one-year', enabled: true, prefix: 'admin-audit/', condition: { type: 'Age', maxAgeSeconds: 31_536_000 } }],
  },
}));

describe('dedicated audit R2 adapters', () => {
  it('constructs a verifier without writer credentials and a writer without read/config credentials', async () => {
    const reads: Request[] = [], writes: Request[] = [];
    const verifier = createAuditR2Verifier(target, readerCredentials, token, {
      reader: transport(response(), reads), fetch: async () => lockResponse(),
    });
    const uploader = createAuditR2Writer(target, writerCredentials, transport({}, writes));
    try {
      expect('writer' in verifier || 'reader' in uploader || 'locks' in uploader).toBe(false);
      await verifier.reader.get(key, 9, signal());
      await verifier.locks.rules(signal());
      await uploader.writer.create(key, Buffer.from('x'), 'text/plain', signal());
      expect(reads[0].headers.authorization).toContain('FICTIONAL_READER');
      expect(writes[0].headers.authorization).toContain('FICTIONAL_WRITER');
    } finally { verifier.close(); uploader.close(); }
  });

  it('uses distinct signed identities and restricts writes to conditional creation', async () => {
    const writes: Request[] = [], reads: Request[] = [];
    const clients = createAuditR2Storage(target, writerCredentials, readerCredentials, token, {
      writer: transport({}, writes), reader: transport(response(), reads), fetch: async () => lockResponse(),
    });
    try {
      expect(await clients.writer.create(key, Buffer.from('fictional'), 'application/x-ndjson', signal())).toBe('created');
      expect((await clients.reader.get(key, 9, signal()))?.bytes.toString()).toBe('fictional');
      expect(writes[0]).toMatchObject({
        method: 'PUT', hostname: `${target.accountId}.r2.cloudflarestorage.com`,
        headers: { 'if-none-match': '*' },
      });
      expect(writes[0].headers.authorization).toContain('Credential=FICTIONAL_WRITER/');
      expect(reads[0].headers.authorization).toContain('Credential=FICTIONAL_READER/');
      expect(reads[0].method).toBe('GET');
      expect('delete' in clients.writer || 'put' in clients.reader || 'update' in clients.locks).toBe(false);
    } finally { clients.close(); }
  });

  it('refuses shared credentials, malformed targets and arbitrary object keys', async () => {
    expect(() => createAuditR2Storage(target, writerCredentials, writerCredentials, token)).toThrow('invalid_configuration');
    for (const patch of [{ accountId: 'bad' }, { bucket: '../customer' }, { bucket: 'AuditBucket' }]) {
      expect(() => createAuditR2Storage({ ...target, ...patch }, writerCredentials, readerCredentials, token)).toThrow('configuration');
    }
    const calls: Request[] = [];
    const clients = createAuditR2Storage(target, writerCredentials, readerCredentials, token, { writer: transport({}, calls) });
    try {
      for (const bad of ['customer/private.csv', '../secret', key + '?token=secret']) {
        await expect(clients.writer.create(bad, Buffer.from('x'), 'text/plain', signal())).rejects.toThrow('invalid_key');
      }
      expect(calls).toEqual([]);
    } finally { clients.close(); }
  });

  it('reads lock config with GET-only authorization and the matching jurisdiction', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => lockResponse());
    const clients = createAuditR2Storage({ ...target, jurisdiction: 'eu' }, writerCredentials, readerCredentials, token, { fetch: fetcher });
    try {
      expect(await clients.locks.rules(signal())).toHaveLength(1);
      expect(fetcher).toHaveBeenCalledWith(
        `https://api.cloudflare.com/client/v4/accounts/${target.accountId}/r2/buckets/${target.bucket}/lock`,
        expect.objectContaining({
          method: 'GET', redirect: 'error',
          headers: expect.objectContaining({ Authorization: `Bearer ${token}`, 'cf-r2-jurisdiction': 'eu' }),
        }),
      );
    } finally { clients.close(); }
  });

  it('uses jurisdiction-specific S3 endpoints without reusing general storage configuration', async () => {
    const calls: Request[] = [];
    const clients = createAuditR2Storage({ ...target, jurisdiction: 'us' }, writerCredentials, readerCredentials, token, {
      reader: transport(response(), calls),
    });
    try {
      await clients.reader.get(key, 9, signal());
      expect(calls[0].hostname).toBe(`${target.accountId}.us.r2.cloudflarestorage.com`);
    } finally { clients.close(); }
  });

  it('returns missing only for an actual NoSuchKey, not permissions or missing buckets', async () => {
    for (const [status, code, missing] of [
      [404, 'NoSuchKey', true], [404, 'NoSuchBucket', false], [403, 'AccessDenied', false], [500, 'InternalError', false],
    ] as const) {
      const calls: Request[] = [];
      const clients = createAuditR2Storage(target, writerCredentials, readerCredentials, token, {
        reader: transport(errorResponse(status, code), calls),
      });
      try {
        if (missing) expect(await clients.reader.get(key, 9, signal())).toBeNull();
        else await expect(clients.reader.get(key, 9, signal())).rejects.toThrow('read_failed');
        expect(calls).toHaveLength(1);
      } finally { clients.close(); }
    }
  });

  it('enforces exact streamed sizes and stops/cancels oversized or malformed reads', async () => {
    const cases: TestResponse[] = [
      { ...response(), headers: { ...response().headers, 'content-length': '10' } },
      { ...response(), headers: { ...response().headers, 'content-length': '8' } },
      { ...response(), headers: { 'content-length': '9' } },
      { ...response(), headers: { 'last-modified': 'invalid' } },
      { headers: { 'last-modified': 'Fri, 30 Oct 2026 00:00:00 GMT' }, body: Readable.from([Buffer.alloc(5), Buffer.alloc(5)]) },
    ];
    for (const config of cases) {
      const clients = createAuditR2Storage(target, writerCredentials, readerCredentials, token, { reader: transport(config) });
      try {
        await expect(clients.reader.get(key, 9, signal())).rejects.toThrow(/response_too_large|invalid_object_response|read_failed/);
        expect(config.body?.destroyed).toBe(true);
      } finally { clients.close(); }
    }
    const clients = createAuditR2Storage(target, writerCredentials, readerCredentials, token, {
      reader: transport({ headers: { 'last-modified': 'Fri, 30 Oct 2026 00:00:00 GMT' }, body: Readable.from([Buffer.alloc(9)]) }),
    });
    try { expect((await clients.reader.get(key, 9, signal()))?.bytes.length).toBe(9); }
    finally { clients.close(); }
  });

  it('classifies conditional conflicts and locked objects for mandatory read-back', async () => {
    for (const [code, status, outcome] of [
      ['PreconditionFailed', 412, 'exists'], ['ObjectLockedByBucketPolicy', 409, 'exists'],
      ['ConditionalRequestConflict', 409, 'uncertain'], ['InternalError', 500, 'uncertain'],
    ] as const) {
      const calls: Request[] = [];
      const clients = createAuditR2Storage(target, writerCredentials, readerCredentials, token, {
        writer: transport(errorResponse(status, code), calls),
      });
      try {
        expect(await clients.writer.create(key, Buffer.from('x'), 'text/plain', signal())).toBe(outcome);
        expect(calls).toHaveLength(1);
      } finally { clients.close(); }
    }
  });

  it('does not retry permission failures and treats timeout as uncertain rather than successful', async () => {
    for (const [config, uncertain] of [
      [errorResponse(403, 'AccessDenied'), false],
      [{ error: Object.assign(new Error('fictional timeout'), { name: 'TimeoutError' }) }, true],
      [{ error: Object.assign(new Error('fictional reset'), { code: 'ECONNRESET' }) }, true],
    ] as const) {
      const calls: Request[] = [];
      const clients = createAuditR2Storage(target, writerCredentials, readerCredentials, token, { writer: transport(config, calls) });
      try {
        if (uncertain) expect(await clients.writer.create(key, Buffer.from('x'), 'text/plain', signal())).toBe('uncertain');
        else await expect(clients.writer.create(key, Buffer.from('x'), 'text/plain', signal())).rejects.toThrow('write_failed');
        expect(calls).toHaveLength(1);
      } finally { clients.close(); }
    }
  });

  it('fails closed on invalid, failure, unsupported or missing lock data', async () => {
    for (const body of [
      'not-json', JSON.stringify({ success: false, errors: [], result: { rules: [] } }),
      JSON.stringify({ success: true, errors: [{ code: 1 }], result: { rules: [] } }),
      JSON.stringify({ success: true, errors: [], result: { rules: [{ id: 'unknown', enabled: true, condition: { type: 'Unknown' } }] } }),
      JSON.stringify({ success: true, errors: [], result: { rules: [{ id: 'unknown', enabled: true }] } }),
    ]) {
      const clients = createAuditR2Storage(target, writerCredentials, readerCredentials, token, {
        fetch: async () => new Response(body),
      });
      try { await expect(clients.locks.rules(signal())).rejects.toThrow(/lock_read_failed|invalid_lock_response/); }
      finally { clients.close(); }
    }
    const clients = createAuditR2Storage(target, writerCredentials, readerCredentials, token, {
      fetch: async () => new Response(JSON.stringify({ success: true, errors: [], result: {} })),
    });
    try { expect(await clients.locks.rules(signal())).toEqual([]); } finally { clients.close(); }
  });

  it('bounds lock response bytes with and without advertised sizes and rejects HTTP failures', async () => {
    for (const fetcher of [
      async () => new Response('denied', { status: 403 }),
      async () => new Response('{}', { headers: { 'content-length': '1048577' } }),
      async () => new Response('x'.repeat(1048577)),
      async () => new Response('{}', { headers: { 'content-length': 'bad' } }),
      async () => new Response('{}', { headers: { 'content-length': '3' } }),
      async () => new Response('{}', { headers: { 'content-encoding': 'gzip' } }),
    ]) {
      const clients = createAuditR2Storage(target, writerCredentials, readerCredentials, token, { fetch: fetcher });
      try { await expect(clients.locks.rules(signal())).rejects.toThrow(/lock_read_failed|response_too_large|invalid_lock_response/); }
      finally { clients.close(); }
    }
  });

  it('honors cancellation before any requests and rejects unsafe bounds', async () => {
    const calls: Request[] = [];
    const fetcher = vi.fn<typeof fetch>(async () => lockResponse());
    const clients = createAuditR2Storage(target, writerCredentials, readerCredentials, token, {
      writer: transport({}, calls), reader: transport(response(), calls), fetch: fetcher,
    });
    try {
      const abort = AbortSignal.abort(new Error('Cancelled'));
      await expect(clients.reader.get(key, 9, abort)).rejects.toThrow('Cancelled');
      await expect(clients.writer.create(key, Buffer.from('x'), 'text/plain', abort)).rejects.toThrow('Cancelled');
      await expect(clients.locks.rules(abort)).rejects.toThrow('Cancelled');
      for (const max of [0, -1, 1.5, Infinity, 33_554_433]) {
        await expect(clients.reader.get(key, max, signal())).rejects.toThrow('configuration');
      }
      expect(calls).toEqual([]);
      expect(fetcher).not.toHaveBeenCalled();
    } finally { clients.close(); }
  });

  it('allows exactly 32 MiB through the signed SDK and rejects larger uploads/responses', async () => {
    const maximum = 32 * 1024 * 1024;
    const payload = Buffer.alloc(maximum);
    const writes: Request[] = [];
    const clients = createAuditR2Storage(target, writerCredentials, readerCredentials, token, {
      writer: transport({}, writes), reader: transport(response(payload)),
    });
    try {
      expect(await clients.writer.create(key, payload, 'application/x-ndjson', signal())).toBe('created');
      expect((await clients.reader.get(key, maximum, signal()))?.bytes.length).toBe(maximum);
      await expect(clients.writer.create(key, Buffer.alloc(maximum + 1), 'application/x-ndjson', signal()))
        .rejects.toThrow('invalid_configuration');
      expect(writes).toHaveLength(1);
    } finally { clients.close(); }
    const oversized = createAuditR2Verifier(target, readerCredentials, token, {
      reader: transport({
        headers: { 'content-length': String(maximum + 1), 'last-modified': 'Fri, 30 Oct 2026 00:00:00 GMT' },
        body: Readable.from([]),
      }),
    });
    try { await expect(oversized.reader.get(key, maximum, signal())).rejects.toThrow('response_too_large'); }
    finally { oversized.close(); }
  });

  it('allows exactly 1 MiB of valid configuration JSON', async () => {
    const envelope = { success: true, errors: [], result: { rules: [] }, padding: '' };
    const emptySize = Buffer.byteLength(JSON.stringify(envelope));
    envelope.padding = 'x'.repeat(1024 * 1024 - emptySize);
    const bytes = JSON.stringify(envelope);
    expect(Buffer.byteLength(bytes)).toBe(1024 * 1024);
    const verifier = createAuditR2Verifier(target, readerCredentials, token, {
      fetch: async () => new Response(bytes, { headers: { 'content-length': String(1024 * 1024) } }),
    });
    try { expect(await verifier.locks.rules(signal())).toEqual([]); }
    finally { verifier.close(); }
  });

  it('interrupts a stalled object stream after headers instead of waiting for another chunk', async () => {
    const body = new Readable({ read() {} });
    const controller = new AbortController();
    const clients = createAuditR2Storage(target, writerCredentials, readerCredentials, token, {
      reader: transport({ headers: { 'last-modified': 'Fri, 30 Oct 2026 00:00:00 GMT' }, body }),
    });
    try {
      const operation = clients.reader.get(key, 9, controller.signal);
      const rejected = expect(operation).rejects.toThrow('Cancelled stalled read');
      await vi.waitFor(() => expect(body.listenerCount('readable')).toBeGreaterThan(0));
      controller.abort(new Error('Cancelled stalled read'));
      await rejected;
      expect(body.destroyed).toBe(true);
    } finally { clients.close(); }
  });

  it('enforces a 15-second lock-body deadline even if a transport stops yielding bytes', async () => {
    vi.useFakeTimers();
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockImplementation(milliseconds => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(new Error('Request deadline exceeded.')), milliseconds);
      return controller.signal;
    });
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({ cancel() { cancelled = true; } });
    let started: () => void = () => {};
    const requested = new Promise<void>(resolve => { started = resolve; });
    const clients = createAuditR2Storage(target, writerCredentials, readerCredentials, token, {
      fetch: async () => { started(); return new Response(stream); },
    });
    try {
      const operation = clients.locks.rules(new AbortController().signal);
      const rejected = expect(operation).rejects.toThrow('lock_read_failed');
      await requested;
      await vi.advanceTimersByTimeAsync(15_001);
      await rejected;
      expect(cancelled).toBe(true);
      expect(timeout).toHaveBeenCalledWith(15_000);
    } finally { clients.close(); timeout.mockRestore(); vi.useRealTimers(); }
  });

  it('runs checkpoint-last delivery through actual signed SDK serialization with uncertain writes', async () => {
    const record: AdminAuditRecord = {
      sequence: '1', id: 'fictional-id', occurredAt: '2026-10-31T00:00:00.000Z',
      staffUserId: null, staffRole: 'bootstrap', action: 'audit.fixture', targetType: 'fixture',
      targetId: 'fixture', workspaceId: null, reason: null, before: null, after: null,
      requestId: 'fixture', ipAddress: null, userAgent: null, prevHash: null, hash: '',
    };
    record.hash = hashAdminAuditEvent(record);
    const scope = { ledgerId: '00000000-0000-4000-8000-000000000001', previousCheckpoint: null, throughSequence: '1' };
    const limits = { maxEvents: 50_000, maxBytes: 32 * 1024 * 1024 };
    const archive = await buildAdminAuditArchive([record], scope, limits);
    const objects = new Map<string, Buffer>();
    const calls: Request[] = [];
    const handler = {
      async handle(request: Request) {
        calls.push(request);
        if (request.method === 'PUT') {
          if (!(request.body instanceof Uint8Array)) throw new Error('Expected binary upload.');
          if (request.headers['if-none-match'] !== '*') throw new Error('Missing create-only condition.');
          objects.set(request.path, Buffer.from(request.body));
          const failed = errorResponse(500, 'InternalError');
          return { response: { statusCode: 500, headers: failed.headers ?? {}, body: failed.body! } };
        }
        const object = objects.get(request.path);
        const result = object ? response(object) : errorResponse(404, 'NoSuchKey');
        return { response: { statusCode: result.status ?? 200, headers: result.headers ?? {}, body: result.body! } };
      },
    };
    const clients = createAuditR2Storage(target, writerCredentials, readerCredentials, token, {
      writer: handler, reader: handler, fetch: async () => lockResponse(),
    });
    try {
      const verified = await deliverAdminAuditArchive(archive, scope, limits, clients.writer, clients.reader, clients.locks, signal());
      expect(verified.state).toBe('snapshot_checked');
      expect(objects.size).toBe(2);
      expect(calls.filter(call => call.method === 'PUT').map(call => call.path.split('/').at(-1)))
        .toEqual([verified.objectKey.split('/').at(-1), verified.checkpointKey.split('/').at(-1)]);
      expect(calls.filter(call => call.method === 'PUT')).toHaveLength(2);
    } finally { clients.close(); }
  });
});
