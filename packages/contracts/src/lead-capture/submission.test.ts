import { expect, it } from 'vitest';
import { capturePublicSubmissionSchema, captureSubmissionResponseSchema } from './submission';
const input = { context: 'signed-context', requestId: '00000000-0000-4000-8000-000000000001', answers: { name: 'Visitor' }, consent: null, website: '' };
it('accepts only bounded public answers and transport proof, never actor/workspace/capability claims', () => {
  expect(capturePublicSubmissionSchema.safeParse(input).success).toBe(true);
  for (const extra of [{ workspaceId: input.requestId }, { actor: 'owner' }, { challengeVerified: true }, { receipt: 'accepted' }]) expect(capturePublicSubmissionSchema.safeParse({ ...input, ...extra }).success).toBe(false);
  expect(capturePublicSubmissionSchema.safeParse({ ...input, challengeToken: 'x'.repeat(2049) }).success).toBe(false);
});
it('never projects private lead or duplicate details in public acknowledgement', () => {
  expect(captureSubmissionResponseSchema.safeParse({ state: 'accepted', requestId: input.requestId }).success).toBe(true);
  for (const extra of [{ leadId: input.requestId }, { duplicate: true }, { admission: 'review' }]) expect(captureSubmissionResponseSchema.safeParse({ state: 'accepted', requestId: input.requestId, ...extra }).success).toBe(false);
});
