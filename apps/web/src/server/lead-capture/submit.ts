import 'server-only';
import { capturePublicSubmissionSchema, type CaptureSubmissionResponse } from '@salesmora/contracts';
import { takeCaptureRequestBudget, prepareCaptureSubmission, recordCaptureChallengeVerification, commitCaptureSubmission, captureChallengeBinding } from '@salesmora/data';
import { database } from '../workspaces/store';
import { captureSubmissionPolicy, captureClientIdentity } from './submission-policy';
import { readCaptureSubmissionContext } from './submission-context';
import { verifyCaptureTurnstile } from './turnstile';
const headers = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' };
export function captureSubmissionReply(result: CaptureSubmissionResponse) {
  const status = result.state === 'accepted' ? 200 : result.state === 'rate-limited' ? 429 : result.state === 'stale' || result.state === 'conflict' ? 409 : result.state === 'unavailable' || result.state === 'retry' ? 503 : result.state === 'challenge-required' ? 403 : 422;
  return Response.json(result, { status, headers: { ...headers, ...(result.state === 'rate-limited' ? { 'Retry-After': String(Math.max(1, Math.ceil((Date.parse(result.retryAt) - Date.now()) / 1000))) } : {}) } });
}
const tooLarge = Symbol('too-large');
async function boundedBody(request: Request) {
  if (!request.body) return null; const reader = request.body.getReader(); let size = 0; const chunks: Uint8Array[] = [];
  try { for (;;) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 262144) { await reader.cancel(); return tooLarge; } chunks.push(part.value); } return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks))); } catch { return null; } finally { reader.releaseLock(); }
}
export async function submitPublicCapture(request: Request, publicKey: string) {
  const policy = captureSubmissionPolicy();
  if (!policy || request.headers.get('host')?.toLowerCase() !== policy.authority) return captureSubmissionReply({ state: 'retry' });
  if (request.headers.get('origin') !== policy.origin || !request.headers.get('content-type')?.startsWith('application/json')) return Response.json({ state: 'invalid' }, { status: 403, headers });
  const client = captureClientIdentity(request.headers, publicKey, policy); if (!client) return captureSubmissionReply({ state: 'retry' });
  try {
    const db = database(), limited = await takeCaptureRequestBudget(db, policy.requestsPerMinute); if (limited) return captureSubmissionReply(limited);
    const body = await boundedBody(request); if (body === tooLarge) return Response.json({ state: 'invalid' }, { status: 413, headers });
    const parsed = capturePublicSubmissionSchema.safeParse(body); if (!parsed.success) return captureSubmissionReply({ state: 'invalid' });
    const now = new Date((await db.raw('SELECT statement_timestamp() AS now')).rows[0].now);
    const proof = readCaptureSubmissionContext(parsed.data.context, policy.origin, process.env.CAPTURE_CONTEXT_SECRET ?? '', now, true);
    if (!proof || proof.publicKey !== publicKey) return captureSubmissionReply({ state: 'stale' });
    const input = { proof, submission: parsed.data, clientHash: client.clientHash, limits: policy.limits };
    const prepared = await prepareCaptureSubmission(db, input); if (prepared.state !== 'ready') return captureSubmissionReply(prepared);
    const challenge = () => ({ state: 'challenge-required' as const, siteKey: policy.siteKey, action: 'capture_submit' as const, cData: captureChallengeBinding(input) });
    if (prepared.challengeRequired && !prepared.tokenHash) return captureSubmissionReply(challenge());
    if (prepared.challengeRequired && !prepared.verified) {
      const expiresAt = await verifyCaptureTurnstile({ token: parsed.data.challengeToken!, idempotencyKey: prepared.verificationId!, cData: prepared.cData, hostname: policy.hostname, secret: policy.providerSecret, endpoint: policy.verifyURL, ip: client.ip });
      if (!expiresAt || !await recordCaptureChallengeVerification(db, prepared.tokenHash!, prepared.verificationId!, expiresAt)) return captureSubmissionReply({ state: 'challenge-error' });
    }
    const committed = await commitCaptureSubmission(db, input, prepared.tokenHash);
    return captureSubmissionReply(committed.state === 'challenge-required' ? challenge() : committed);
  } catch { return captureSubmissionReply({ state: 'retry' }); }
}
