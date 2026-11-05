import { Readable } from 'node:stream';
import { TextDecoder } from 'node:util';
import { GetObjectCommand, PutObjectCommand, S3Client, S3ServiceException, type S3ClientConfig } from '@aws-sdk/client-s3';
import { auditArchiveLockResponseSchema, auditArchiveScopeSchema } from '@salesmora/contracts';
import type { AuditArchiveReader, AuditArchiveWriter, AuditArchiveLockReader, AuditArchiveTarget } from './admin-audit-delivery';

interface R2Credentials {
  accessKeyId: string;
  secretAccessKey: string;
}
interface R2Transports {
  writer?: S3ClientConfig['requestHandler'];
  reader?: S3ClientConfig['requestHandler'];
  fetch?: typeof fetch;
}
export class AuditR2Error extends Error {
  constructor(public readonly code:
    'invalid_configuration' | 'invalid_key' | 'read_failed' | 'write_failed' |
    'invalid_object_response' | 'response_too_large' | 'lock_read_failed' | 'invalid_lock_response') {
    super(`Audit R2 operation failed: ${code}.`);
  }
}

function validateKey(key: string) {
  const match = /^admin-audit\/v1\/([0-9a-f-]{36})\/(?:segments\/[a-f0-9]{64}\.ndjson|checkpoints\/[a-f0-9]{64}\.json)$/.exec(key);
  if (!match || !auditArchiveScopeSchema.safeParse({
    ledgerId: match[1], previousCheckpoint: null, throughSequence: '1',
  }).success) {
    throw new AuditR2Error('invalid_key');
  }
}
function validateBound(maxBytes: number) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > 32 * 1024 * 1024) {
    throw new AuditR2Error('invalid_configuration');
  }
}
function responseLength(value: number | undefined, maxBytes: number) {
  if (value !== undefined && (!Number.isSafeInteger(value) || value < 0)) {
    throw new AuditR2Error('invalid_object_response');
  }
  if (value !== undefined && value > maxBytes) throw new AuditR2Error('response_too_large');
}

async function readWithAbort<T>(read: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  let onAbort = () => {};
  const aborted = new Promise<never>((_resolve, reject) => {
    onAbort = () => reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
  });
  try { return await Promise.race([read, aborted]); }
  finally { signal.removeEventListener('abort', onAbort); }
}

function r2Client(target: AuditArchiveTarget, credentials: R2Credentials, requestHandler?: S3ClientConfig['requestHandler']) {
  if (!/^[a-f0-9]{32}$/.test(target.accountId) ||
    !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(target.bucket) ||
    !['default', 'eu', 'us'].includes(target.jurisdiction) ||
    !credentials.accessKeyId.trim() || !credentials.secretAccessKey.trim()) {
    throw new AuditR2Error('invalid_configuration');
  }
  const jurisdiction = target.jurisdiction === 'default' ? '' : `.${target.jurisdiction}`;
  const endpoint = `https://${target.accountId}${jurisdiction}.r2.cloudflarestorage.com`;
  return new S3Client({
    endpoint, region: 'auto', credentials: { ...credentials }, forcePathStyle: true,
    maxAttempts: 1, requestHandler,
  });
}

export function createAuditR2Verifier(
  targetInput: AuditArchiveTarget,
  readerCredentials: R2Credentials,
  lockReadToken: string,
  transports: Pick<R2Transports, 'reader' | 'fetch'> = {},
): { reader: AuditArchiveReader; locks: AuditArchiveLockReader; close(): void } {
  if (!lockReadToken.trim() || /[\r\n]/.test(lockReadToken)) throw new AuditR2Error('invalid_configuration');
  const target = Object.freeze({ ...targetInput });
  const readClient = r2Client(target, readerCredentials, transports.reader);
  const fetcher = transports.fetch ?? fetch;

  const reader: AuditArchiveReader = {
    target,
    async get(key, maxBytes, signal) {
      validateKey(key);
      validateBound(maxBytes);
      signal.throwIfAborted();
      const boundedSignal = AbortSignal.any([signal, AbortSignal.timeout(15_000)]);
      let rawBody: Readable | undefined;
      try {
        const command = new GetObjectCommand({ Bucket: target.bucket, Key: key });
        // Retain the stream before SDK deserialization, which can reject malformed headers.
        command.middlewareStack.add(next => async args => {
          const result = await next(args);
          const raw = result.response;
          if (raw && typeof raw === 'object' && 'body' in raw && raw.body instanceof Readable) rawBody = raw.body;
          return result;
        }, { step: 'deserialize', priority: 'low', name: 'auditCaptureReadBody' });
        const response = await readClient.send(command, { abortSignal: boundedSignal });
        const body = response.Body;
        if (!(body instanceof Readable)) throw new AuditR2Error('invalid_object_response');
        const abortBody = () => body.destroy(new Error('Audit object read aborted.'));
        boundedSignal.addEventListener('abort', abortBody, { once: true });
        try {
          boundedSignal.throwIfAborted();
          responseLength(response.ContentLength, maxBytes);
          if (!response.LastModified || !Number.isFinite(response.LastModified.getTime())) {
            throw new AuditR2Error('invalid_object_response');
          }
          const chunks: Buffer[] = [];
          let length = 0;
          for await (const chunk of body) {
            boundedSignal.throwIfAborted();
            if (!(chunk instanceof Uint8Array)) throw new AuditR2Error('invalid_object_response');
            length += chunk.byteLength;
            if (length > maxBytes) throw new AuditR2Error('response_too_large');
            chunks.push(Buffer.from(chunk));
          }
          if (response.ContentLength !== undefined && length !== response.ContentLength) {
            throw new AuditR2Error('invalid_object_response');
          }
          boundedSignal.throwIfAborted();
          return { bytes: Buffer.concat(chunks), uploadedAt: response.LastModified.toISOString() };
        } finally {
          boundedSignal.removeEventListener('abort', abortBody);
          body.destroy();
        }
      } catch (error) {
        signal.throwIfAborted();
        if (error instanceof AuditR2Error) throw error;
        if (error instanceof S3ServiceException && error.name === 'NoSuchKey' && error.$metadata.httpStatusCode === 404) {
          return null;
        }
        throw new AuditR2Error('read_failed');
      } finally { rawBody?.destroy(); }
    },
  };
  const locks: AuditArchiveLockReader = {
    target,
    async rules(signal) {
      signal.throwIfAborted();
      const boundedSignal = AbortSignal.any([signal, AbortSignal.timeout(15_000)]);
      try {
        const response = await fetcher(
          `https://api.cloudflare.com/client/v4/accounts/${target.accountId}/r2/buckets/${target.bucket}/lock`,
          {
            method: 'GET', redirect: 'error', signal: boundedSignal,
            headers: {
              Authorization: `Bearer ${lockReadToken}`, 'cf-r2-jurisdiction': target.jurisdiction,
              'Cache-Control': 'no-store', 'Accept-Encoding': 'identity',
            },
          },
        );
        if (!response.ok) {
          await response.body?.cancel();
          throw new AuditR2Error('lock_read_failed');
        }
        if (response.headers.has('content-encoding') && response.headers.get('content-encoding') !== 'identity') {
          await response.body?.cancel();
          throw new AuditR2Error('invalid_lock_response');
        }
        const lengthHeader = response.headers.get('content-length');
        if (lengthHeader !== null && !/^\d+$/.test(lengthHeader)) {
          await response.body?.cancel();
          throw new AuditR2Error('invalid_lock_response');
        }
        const limit = 1024 * 1024;
        if (lengthHeader !== null && Number(lengthHeader) > limit) {
          await response.body?.cancel();
          throw new AuditR2Error('response_too_large');
        }
        if (!response.body) throw new AuditR2Error('invalid_lock_response');
        const body = response.body.getReader();
        try {
          const chunks: Buffer[] = [];
          let length = 0;
          for (;;) {
            boundedSignal.throwIfAborted();
            const next = await readWithAbort(body.read(), boundedSignal);
            if (next.done) break;
            length += next.value.byteLength;
            if (length > limit) throw new AuditR2Error('response_too_large');
            chunks.push(Buffer.from(next.value));
          }
          if (lengthHeader !== null && length !== Number(lengthHeader)) throw new AuditR2Error('invalid_lock_response');
          const text = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
          const parsed = auditArchiveLockResponseSchema.safeParse(JSON.parse(text));
          if (!parsed.success) throw new AuditR2Error('invalid_lock_response');
          // An omitted optional rules property is explicitly an empty configuration, not protection.
          return parsed.data.result.rules ?? [];
        } finally {
          await body.cancel();
          body.releaseLock();
        }
      } catch (error) {
        signal.throwIfAborted();
        if (error instanceof AuditR2Error) throw error;
        throw new AuditR2Error('lock_read_failed');
      }
    },
  };
  return { reader, locks, close() { readClient.destroy(); } };
}

export function createAuditR2Writer(
  targetInput: AuditArchiveTarget,
  credentials: R2Credentials,
  requestHandler?: S3ClientConfig['requestHandler'],
): { writer: AuditArchiveWriter; close(): void } {
  const target = Object.freeze({ ...targetInput });
  const client = r2Client(target, credentials, requestHandler);
  return {
    writer: {
      target,
      async create(key, bytes, contentType, signal) {
        validateKey(key);
        validateBound(bytes.length);
        signal.throwIfAborted();
        const boundedSignal = AbortSignal.any([signal, AbortSignal.timeout(15_000)]);
        try {
          await client.send(new PutObjectCommand({
            Bucket: target.bucket, Key: key, Body: bytes, ContentType: contentType,
            ContentLength: bytes.length, IfNoneMatch: '*',
          }), { abortSignal: boundedSignal });
          return 'created';
        } catch (error) {
          signal.throwIfAborted();
          if (error instanceof S3ServiceException) {
            if ((error.name === 'PreconditionFailed' && error.$metadata.httpStatusCode === 412) ||
              (error.name === 'ObjectLockedByBucketPolicy' && error.$metadata.httpStatusCode === 409)) return 'exists';
            if (error.name === 'ConditionalRequestConflict' && error.$metadata.httpStatusCode === 409) return 'uncertain';
            if ((error.$metadata.httpStatusCode ?? 0) >= 500) return 'uncertain';
          }
          if (error instanceof Error && ['TimeoutError', 'RequestTimeout', 'NetworkingError'].includes(error.name)) return 'uncertain';
          if (error instanceof Error && 'code' in error && typeof error.code === 'string' &&
            ['ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'ECONNABORTED'].includes(error.code)) return 'uncertain';
          throw new AuditR2Error('write_failed');
        }
      },
    },
    close() { client.destroy(); },
  };
}

export function createAuditR2Storage(
  target: AuditArchiveTarget,
  writerCredentials: R2Credentials,
  readerCredentials: R2Credentials,
  lockReadToken: string,
  transports: R2Transports = {},
): { writer: AuditArchiveWriter; reader: AuditArchiveReader; locks: AuditArchiveLockReader; close(): void } {
  if (writerCredentials.accessKeyId === readerCredentials.accessKeyId ||
    writerCredentials.secretAccessKey === readerCredentials.secretAccessKey) {
    throw new AuditR2Error('invalid_configuration');
  }
  const verifier = createAuditR2Verifier(target, readerCredentials, lockReadToken, transports);
  try {
    const uploader = createAuditR2Writer(target, writerCredentials, transports.writer);
    return { writer: uploader.writer, reader: verifier.reader, locks: verifier.locks,
      close() { uploader.close(); verifier.close(); } };
  } catch (error) {
    verifier.close();
    throw error;
  }
}
