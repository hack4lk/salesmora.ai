import { describe, expect, it } from 'vitest';
import { reportAssistantToolInputSchema, reportAssistantModelParameters, reportNativeReadSchema } from './assistant-tool';
import { reportSelectionExamples } from './assistant-query.fixtures';
import { reportTemplateAreas } from './template';

function explicit(selection: typeof reportSelectionExamples[number]) {
  const query = Object.fromEntries(Object.entries(selection.query)
    .filter(([key]) => !['workspaceId', 'page', 'pageSize'].includes(key)));
  return { request: { mode: 'query', selection: { area: selection.area, query } } };
}
describe('bounded report tool contracts', () => {
  it.each(reportSelectionExamples.map((selection, index) => ({ selection, index })))(
    'accepts native configuration $index ($selection.area) without server-owned keys', ({ selection }) => {
      expect(reportAssistantToolInputSchema.parse(explicit(selection)).request.mode).toBe('query');
    },
  );
  it.each(reportTemplateAreas)('offers a documented default for %s without inventing scope', area => {
    expect(reportAssistantToolInputSchema.parse({ request: { mode: 'default', area, period: null } }).request)
      .toEqual({ mode: 'default', area, period: null });
  });
  it('distinguishes applied context from explicit queries, and rejects authority/pagination overrides including null', () => {
    expect(reportAssistantToolInputSchema.parse({ request: { mode: 'current_report' } })).toEqual({ request: { mode: 'current_report' } });
    const value = explicit(reportSelectionExamples[1]);
    for (const [key, item] of Object.entries({
      workspaceId: reportSelectionExamples[0].query.workspaceId, viewerId: 'other', scope: 'workspace',
      page: 2, pageSize: 100, sql: 'SELECT 1', workspace: null, permission: null,
    })) {
      expect(reportAssistantToolInputSchema.safeParse({ request: { ...value.request,
        selection: { ...value.request.selection, query: { ...value.request.selection.query, [key]: item } } } }).success).toBe(false);
    }
    for (const value of [
      { request: { mode: 'current_report', area: 'leads' } },
      { request: { mode: 'default', area: 'jobs', period: { preset: 'next7days' } } },
      { request: { mode: 'default', area: 'calendar', period: { preset: 'last30days' } } },
      { request: { mode: 'default', area: 'team', period: { preset: 'last30days' } } },
      { request: { mode: 'default', area: 'team' } },
      { request: { mode: 'default', area: 'leads', period: null }, workspaceId: null },
    ]) expect(reportAssistantToolInputSchema.safeParse(value).success).toBe(false);
  });
  it('normalizes only optional null fields; unknown and required null fields remain invalid', () => {
    const value = explicit(reportSelectionExamples[1]);
    const selection = value.request.selection;
    expect(reportAssistantToolInputSchema.parse({ request: { ...value.request,
      selection: { ...selection, query: { ...selection.query, trendBucket: null } } } })).toEqual(value);
    for (const patch of [{ filters: null }, { period: null }, { page: null }, { workspaceId: null }, { unknown: null }]) {
      expect(reportAssistantToolInputSchema.safeParse({ request: { ...value.request,
        selection: { ...selection, query: { ...selection.query, ...patch } } } }).success).toBe(false);
    }
    expect(reportAssistantToolInputSchema.parse({ request: { mode: 'query', selection: {
      area: 'team', query: { view: 'team-leads', filters: null,
        selected: { kind: 'owner', id: 'member:alex', stage: null, inactiveOnly: null } },
    } } }).request.mode).toBe('query');
  });
  it('enforces exact native validation and a 366-date ceiling', () => {
    const example = explicit(reportSelectionExamples[0]);
    for (const period of [
      { from: '2026-01-01', to: '2027-01-02' }, { from: '2026-02-29', to: '2026-03-01' },
      { from: '2026-11-02', to: '2026-11-01' },
    ]) expect(reportAssistantToolInputSchema.safeParse({ request: { ...example.request,
      selection: { ...example.request.selection, query: { ...example.request.selection.query, period } } } }).success).toBe(false);
    expect(reportAssistantToolInputSchema.safeParse({ request: { mode: 'default', area: 'leads',
      period: { preset: 'custom', from: '2024-01-01', to: '2024-12-31' } } }).success).toBe(true);
    const team = reportSelectionExamples.find(item => item.area === 'team');
    expect(team).toBeDefined();
    expect(reportNativeReadSchema.safeParse({ area: 'team', read: { query: team?.query } }).success).toBe(false);
  });
  it('emits a closed strict model schema with all fields required, no server authority or loose records', () => {
    let objects = 0;
    const visit = (value: unknown) => {
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value)) { value.forEach(visit); return; }
      if ('properties' in value && value.properties && typeof value.properties === 'object') {
        objects++;
        expect(value).toHaveProperty('additionalProperties', false);
        expect(value).toHaveProperty('required', Object.keys(value.properties));
        for (const key of ['workspaceId', 'viewerId', 'policyRevision', 'page', 'pageSize', 'scope', 'sql']) {
          expect(Object.hasOwn(value.properties, key)).toBe(false);
        }
      }
      Object.values(value).forEach(visit);
    };
    visit(reportAssistantModelParameters);
    expect(objects).toBeGreaterThan(30);
    expect(reportAssistantModelParameters.type).toBe('object');
    expect(reportAssistantModelParameters.anyOf).toBeUndefined();
  });
});
