/** Server-only custody contracts. Deliberately excluded from the public contracts barrel. */
import { z } from 'zod';
export const captureGmailKeyIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/);
const base64 = z.string().min(4).max(65536).refine(value => /^[A-Za-z0-9+/]+={0,2}$/.test(value) && value.length % 4 === 0);
export const captureGmailKeyringSchema = z.record(captureGmailKeyIdSchema, base64);
export const captureGmailEnvelopeSchema = z.object({
  schemaVersion: z.literal(1), keyId: captureGmailKeyIdSchema, iv: base64, tag: base64, ciphertext: base64,
}).strict().refine(value => /^[A-Za-z0-9+/]{16}$/.test(value.iv) && /^[A-Za-z0-9+/]{22}==$/.test(value.tag));
export const captureGmailCredentialBindingSchema = z.object({ environment: z.enum(['local', 'staging', 'production']), workspaceId: z.uuid(), recordId: z.uuid() }).strict();
export const captureGmailTokenSecretsSchema = z.object({
  refreshToken: z.string().min(1).max(8192), accessToken: z.string().min(1).max(8192).nullable(),
  expiresAt: z.iso.datetime().nullable(), tokenType: z.literal('Bearer'),
  scopes: z.array(z.enum(['https://www.googleapis.com/auth/gmail.readonly', 'openid', 'email', 'profile', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'])).min(1).max(6),
}).strict().refine(value => value.scopes.includes('https://www.googleapis.com/auth/gmail.readonly'));
export const captureGmailOAuthSecretsSchema = z.object({ pkceVerifier: z.string().regex(/^[A-Za-z0-9._~-]{43,128}$/), stateToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/).optional() }).strict();
export type CaptureGmailCredentialBinding = z.infer<typeof captureGmailCredentialBindingSchema>;
export type CaptureGmailTokens = z.infer<typeof captureGmailTokenSecretsSchema>;
export type CaptureGmailOAuthSecrets = z.infer<typeof captureGmailOAuthSecretsSchema>;
export const captureGmailSampleSecretsSchema = z.object({
  actorId: z.string().min(1).max(255), sessionHash: z.string().regex(/^[a-f0-9]{64}$/),
  bindingHash: z.string().regex(/^[a-f0-9]{64}$/), messageId: z.string().regex(/^[a-zA-Z0-9_-]{1,200}$/),
  subjectPhrase: z.string().min(3).max(100), expiresAt: z.iso.datetime(),
}).strict();
