import { expect, it } from 'vitest';
import type { IntakeDetailView } from '@salesmora/contracts';
import { intakeEvidence } from './intake-adapters';
it('evidence uses the retained source and quotes, never corrected answers', () => {
  const view = { item: { id: 'item', version: 2, answers: { name: 'Corrected' } }, source: { name: 'Gmail' }, configuration: { fields: [{ id: 'name', label: 'Name' }] }, receipt: { receivedAt: '2026-11-04T17:00:00.000Z', evidence: { type: 'gmail', from: 'sender@example.test', subject: 'Quote', body: 'Original Alex', fields: [{ fieldId: 'name', uncertain: true, origin: { kind: 'email', location: 'body', quote: 'Original Alex' } }] } } } as unknown as IntakeDetailView;
  expect(intakeEvidence(view)).toEqual({ intakeId: 'item', version: 2, sourceName: 'Gmail', receivedAt: view.receipt.receivedAt, type: 'gmail', from: 'sender@example.test', subject: 'Quote', body: 'Original Alex', fields: [{ id: 'name', label: 'Name', uncertain: true, origin: { kind: 'email', location: 'body', quote: 'Original Alex' } }] });
});
