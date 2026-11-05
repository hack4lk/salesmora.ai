import { randomBytes } from 'node:crypto';
import { Readable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import {
  createStreamingFileDecryption,
  createStreamingFileEncryption,
} from './encryption';

async function collect(stream: Readable) {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

describe('streaming file decryption', () => {
  it('decrypts the export envelope and authenticates the complete stream', async () => {
    const masterKey = randomBytes(32);
    const plaintext = Buffer.from('large archive stream'.repeat(100));
    const encrypted = createStreamingFileEncryption(masterKey);
    const ciphertext = await collect(Readable.from([
      plaintext.subarray(0, 17),
      plaintext.subarray(17),
    ]).pipe(encrypted.cipher));
    const decryptor = createStreamingFileDecryption(
      masterKey,
      encrypted.dekEnvelope,
      encrypted.fileIv,
      encrypted.cipher.getAuthTag(),
    );
    expect(await collect(Readable.from([ciphertext.subarray(0, 23), ciphertext.subarray(23)]).pipe(decryptor)))
      .toEqual(plaintext);
    masterKey.fill(0);
  });

  it('rejects ciphertext that fails AES-GCM authentication', async () => {
    const masterKey = randomBytes(32);
    const encrypted = createStreamingFileEncryption(masterKey);
    const ciphertext = await collect(Readable.from([Buffer.from('protected data')]).pipe(encrypted.cipher));
    ciphertext[0] ^= 0xff;
    const decryptor = createStreamingFileDecryption(
      masterKey,
      encrypted.dekEnvelope,
      encrypted.fileIv,
      encrypted.cipher.getAuthTag(),
    );
    await expect(collect(Readable.from([ciphertext]).pipe(decryptor))).rejects.toThrow();
    masterKey.fill(0);
  });
});
