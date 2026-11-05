import { expect, it } from 'vitest';
import { defaultLeadAssignmentRuleSchema, saveLeadAssignmentSettingsSchema } from './lead-assignment-settings';
const valid = { workspaceId: '00000000-0000-4000-8000-000000000001', requestId: '00000000-0000-4000-8000-000000000002', expectedVersion: 1, value: { kind: 'unassigned' } };
it('accepts only explicit unassigned or a bounded selected teammate rule', () => {
  expect(saveLeadAssignmentSettingsSchema.safeParse(valid).success).toBe(true);
  expect(defaultLeadAssignmentRuleSchema.safeParse({ kind: 'teammate', teammateId: 'user' }).success).toBe(true);
  for (const value of [{ kind: 'default' }, { kind: 'teammate', teammateId: '' }, { kind: 'unassigned', teammateId: 'user' }, { kind: 'round-robin' }]) expect(defaultLeadAssignmentRuleSchema.safeParse(value).success).toBe(false);
});
it('rejects unversioned, forged or unbounded setting writes', () => {
  for (const input of [{ ...valid, expectedVersion: 0 }, { ...valid, expectedVersion: 1.5 }, { ...valid, expectedVersion: 2147483647 }, { ...valid, actorId: 'forged' }, { ...valid, value: { kind: 'teammate', teammateId: 'a'.repeat(201) } }]) expect(saveLeadAssignmentSettingsSchema.safeParse(input).success).toBe(false);
});
