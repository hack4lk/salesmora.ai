import { expect, it } from 'vitest';
import { leadToolParameters, leadsProposeActionSchema, leadsQuerySchema } from './lead-capabilities';
it('validates the exact operation/input pairing and rejects SQL, identity and unsupported actions', () => {
  const stage = { request: { operation: 'change_stage', input: { leadRef: '', to: 'estimate-sent', reason: '' } } };
  expect(leadsProposeActionSchema.safeParse(stage).success).toBe(true);
  expect(leadsQuerySchema.safeParse(stage).success).toBe(false);
  for (const patch of [{ role: 'owner' }, { workspaceId: 'forged' }, { sql: 'SELECT * FROM leads' }]) expect(leadsProposeActionSchema.safeParse({ ...stage, ...patch }).success).toBe(false);
  for (const operation of ['create', 'update', 'delete', '__proto__']) expect(leadsProposeActionSchema.safeParse({ request: { ...stage.request, operation } }).success).toBe(false);
});
it('generates closed schemas with only authorized operation branches', () => {
  const stage = JSON.stringify(leadToolParameters('leads_propose_action', ['pipeline_summary', 'change_stage']));
  expect(stage).toContain('change_stage'); expect(stage).not.toContain('ownerId'); expect(stage).not.toContain('pipeline_summary');
  expect(() => leadToolParameters('leads_propose_action', ['pipeline_summary'])).toThrow();
  const both = JSON.stringify(leadToolParameters('leads_propose_action', ['create', 'change_stage']));
  expect(both).toContain('anyOf'); expect(both).toContain('ownerId'); expect(both).toContain('change_stage');
});

it('accepts only explicit, unique editable field patches and excludes identity, stage and ownership', () => {
  const input = { leadRef: '', changes: [{ field: 'phone', value: '' }] };
  expect(leadsProposeActionSchema.safeParse({ request: { operation: 'update', input } }).success).toBe(true);
  for (const changes of [[], [{ field: 'stage', value: 'won' }], [{ field: 'ownerId', value: 'forged' }], [input.changes[0], input.changes[0]]]) {
    expect(leadsProposeActionSchema.safeParse({ request: { operation: 'update', input: { ...input, changes } } }).success).toBe(false);
  }
  const parameters = JSON.stringify(leadToolParameters('leads_propose_action', ['update']));
  expect(parameters).toContain('changes'); expect(parameters).not.toContain('expectedVersion'); expect(parameters).not.toContain('ownerId');
});

it('validates combined edits as one closed operation requiring both inputs', () => {
  const input = { leadRef: '', changes: [{ field: 'phone', value: '1-1800-666-6666' }], stage: { to: 'contacted', reason: '' } };
  expect(leadsProposeActionSchema.safeParse({ request: { operation: 'update_with_stage', input } }).success).toBe(true);
  for (const bad of [{ ...input, stage: { to: 'invented', reason: '' } }, { ...input, changes: [] }, { ...input, expectedVersion: 1 }, { ...input, stage: { to: 'contacted', reason: '', ownerId: 'forged' } }]) {
    expect(leadsProposeActionSchema.safeParse({ request: { operation: 'update_with_stage', input: bad } }).success).toBe(false);
  }
  const parameters = JSON.stringify(leadToolParameters('leads_propose_action', ['update_with_stage']));
  expect(parameters).toContain('update_with_stage'); expect(parameters).toContain('stage'); expect(parameters).not.toContain('expectedVersion');
});
