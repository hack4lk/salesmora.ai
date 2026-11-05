import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { captureGmailCredentialBindingSchema as bindingSchema, captureGmailEnvelopeSchema, captureGmailKeyIdSchema as keyId, captureGmailKeyringSchema, captureGmailTokenSecretsSchema as tokenSchema, captureGmailOAuthSecretsSchema as oauthSchema, captureGmailSampleSecretsSchema as sampleSchema, type CaptureGmailCredentialBinding, type CaptureGmailTokens } from '@salesmora/contracts/lead-capture/gmail-secrets';
export type { CaptureGmailCredentialBinding, CaptureGmailTokens } from '@salesmora/contracts/lead-capture/gmail-secrets';
export class CaptureGmailCustodyError extends Error {
  constructor() { super('Gmail credential custody is unavailable or the encrypted record is invalid.'); }
}

/** Keys remain in this closure; no process defaults, file-key fallback or credential-bearing errors. */
export function createCaptureGmailCipher(env: Record<string, string | undefined>) {
  let active: string;
  const keys = new Map<string, Buffer>();
  try {
    active = keyId.parse(env.CAPTURE_GMAIL_ACTIVE_KEY_ID);
    const raw = captureGmailKeyringSchema.parse(JSON.parse(env.CAPTURE_GMAIL_CREDENTIAL_KEYS ?? ''));
    if (Object.keys(raw).length > 10) throw Error();
    for (const [id, encoded] of Object.entries(raw)) {
      const key = Buffer.from(encoded, 'base64');
      if (key.length !== 32 || key.toString('base64') !== encoded) throw Error();
      keys.set(id, key);
    }
    if (!keys.has(active)) throw Error();
  } catch { throw new CaptureGmailCustodyError(); }
  function aad(binding: CaptureGmailCredentialBinding, purpose: string, id: string) {
    const value = bindingSchema.parse(binding);
    return Buffer.from(JSON.stringify(['salesmora.gmail', 1, id, purpose, value.environment, value.workspaceId, value.recordId]));
  }
  function seal(binding: CaptureGmailCredentialBinding, purpose: string, value: unknown) {
    try {
      const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', keys.get(active)!, iv);
      cipher.setAAD(aad(binding, purpose, active));
      const plaintext = Buffer.from(JSON.stringify(value));
      try {
        const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
        return captureGmailEnvelopeSchema.parse({ schemaVersion: 1, keyId: active, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), ciphertext: ciphertext.toString('base64') });
      } finally { plaintext.fill(0); }
    } catch { throw new CaptureGmailCustodyError(); }
  }
  function open(binding: CaptureGmailCredentialBinding, purpose: string, raw: unknown): unknown {
    try {
      const envelope = captureGmailEnvelopeSchema.parse(raw), key = keys.get(envelope.keyId);
      if (!key) throw Error();
      for (const value of [envelope.iv, envelope.tag, envelope.ciphertext]) if (Buffer.from(value, 'base64').toString('base64') !== value) throw Error();
      const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.iv, 'base64'));
      decipher.setAAD(aad(binding, purpose, envelope.keyId));
      decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
      const plaintext = Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, 'base64')), decipher.final()]);
      try { return JSON.parse(plaintext.toString('utf8')); } finally { plaintext.fill(0); }
    } catch { throw new CaptureGmailCustodyError(); }
  }
  return Object.freeze({
    sealSample(binding: CaptureGmailCredentialBinding, input: unknown) {
      try { return seal(binding, 'sample', sampleSchema.parse(input)); } catch { throw new CaptureGmailCustodyError(); }
    },
    openSample(binding: CaptureGmailCredentialBinding, envelope: unknown) {
      try { return sampleSchema.parse(open(binding, 'sample', envelope)); } catch { throw new CaptureGmailCustodyError(); }
    },
    sealTokens(binding: CaptureGmailCredentialBinding, input: unknown) {
      try { return seal(binding, 'tokens', tokenSchema.parse(input)); } catch { throw new CaptureGmailCustodyError(); }
    },
    openTokens(binding: CaptureGmailCredentialBinding, envelope: unknown): CaptureGmailTokens {
      try { return tokenSchema.parse(open(binding, 'tokens', envelope)); } catch { throw new CaptureGmailCustodyError(); }
    },
    sealOAuth(binding: CaptureGmailCredentialBinding, input: unknown) {
      try { return seal(binding, 'oauth', oauthSchema.parse(input)); } catch { throw new CaptureGmailCustodyError(); }
    },
    openOAuth(binding: CaptureGmailCredentialBinding, envelope: unknown) {
      try { return oauthSchema.parse(open(binding, 'oauth', envelope)); } catch { throw new CaptureGmailCustodyError(); }
    },
  });
}
