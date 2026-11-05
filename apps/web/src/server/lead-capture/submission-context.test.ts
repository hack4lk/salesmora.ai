import { expect, it } from 'vitest';
import { createCaptureSubmissionContext, readCaptureSubmissionContext, verifyCaptureSubmissionContext } from './submission-context';
const secret = Buffer.alloc(32, 17).toString('base64'), origin = 'https://forms.salesmora.ai', now = new Date('2026-10-31T19:00:00Z');
const binding = { publicKey: 'a'.repeat(64), publicationVersion: 2, configurationVersion: 3 };
it('issues an expiring public-only context with a unique request identity', () => {
  const token = createCaptureSubmissionContext(binding, origin, secret, now), verified = verifyCaptureSubmissionContext(token, binding, origin, secret, now);
  expect(verified).toMatchObject(binding); expect(verified?.purpose).toBe('capture_submission'); expect(verified?.submissionId).toMatch(/^[a-f0-9-]{36}$/);
  expect(verified).not.toHaveProperty('workspaceId'); expect(verified).not.toHaveProperty('sourceId');
  expect(createCaptureSubmissionContext(binding, origin, secret, now)).not.toBe(token);
});
it('rejects tampering, another origin/source/revision/key, malformed and expired contexts', () => {
  const token = createCaptureSubmissionContext(binding, origin, secret, now);
  expect(verifyCaptureSubmissionContext(token.replace(/^./, token[0] === 'a' ? 'b' : 'a'), binding, origin, secret, now)).toBeNull();
  for (const other of [{ ...binding, publicKey: 'b'.repeat(64) }, { ...binding, publicationVersion: 3 }, { ...binding, configurationVersion: 4 }]) expect(verifyCaptureSubmissionContext(token, other, origin, secret, now)).toBeNull();
  expect(verifyCaptureSubmissionContext(token, binding, 'https://other.example', secret, now)).toBeNull(); expect(verifyCaptureSubmissionContext(token, binding, origin, Buffer.alloc(32, 18).toString('base64'), now)).toBeNull();
  expect(verifyCaptureSubmissionContext(token, binding, origin, secret, new Date(now.getTime() + 1800000))).toBeNull(); expect(verifyCaptureSubmissionContext(token, binding, origin, secret, new Date(now.getTime() - 1000))).toBeNull();
  for (const bad of ['invalid', `${token}.extra`, '.'.repeat(3001), `${token}=`]) expect(verifyCaptureSubmissionContext(bad, binding, origin, secret, now)).toBeNull();
  expect(() => createCaptureSubmissionContext(binding, origin, 'missing', now)).toThrow();
});
it('allows only signed expired contexts to identify a committed receipt, without granting current admission', () => {
  const token = createCaptureSubmissionContext(binding, origin, secret, now), later = new Date(now.getTime() + 1800001);
  expect(verifyCaptureSubmissionContext(token, binding, origin, secret, later)).toBeNull(); expect(readCaptureSubmissionContext(token, origin, secret, later, true)?.submissionId).toBeTruthy(); expect(readCaptureSubmissionContext('forged', origin, secret, later, true)).toBeNull();
});
