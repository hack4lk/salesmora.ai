import { describe, expect, it } from 'vitest';
import { leadReportExportGenerationSchema } from './lead-export';

const generation = { id: '00000000-0000-4000-8000-000000000001', workspaceId: '00000000-0000-4000-8000-000000000002',
  policyRevision: 2, scope: 'assigned', archiveVisibility: 'excluded', asOf: '2026-11-08T12:00:00Z',
  today: '2026-11-08', timezone: 'Europe/Warsaw', dateBasis: 'current-snapshot', count: 0,
  limits: { rows: 50000, bytes: 33554432, durationMs: 30000 } };
describe('compact Leads CSV generation metadata', () => {
  it('supports exact fresh context and zero rows without input/actor/cell fields', () => {
    expect(leadReportExportGenerationSchema.parse(generation)).toEqual(generation);
    for (const patch of [{ id: 'invalid' }, { count: -1 }, { count: 50001 }, { count: Number.MAX_SAFE_INTEGER + 1 },
      { today: '2026-11-09' }, { timezone: 'invalid' },
      { actorId: 'forged' }, { input: {} }, { notes: 'private' }, { limits: { ...generation.limits, durationMs: 0 } }]) {
      expect(leadReportExportGenerationSchema.safeParse({ ...generation, ...patch }).success).toBe(false);
    }
  });
});
