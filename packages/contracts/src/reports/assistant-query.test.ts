import { describe, expect, it } from 'vitest';
import { reportSelectionExamples } from './assistant-query.fixtures';
import { reportAssistantContextSchema, reportAssistantSnapshotSchema, reportSelectionSchema } from './assistant-query';
import { reportTemplateAreas } from './template';
import { chatPageContextSchema, chatTurnRequestSchema } from '../chat';

describe('Reports assistant native selection and applied context', () => {
  it('covers all nine areas and every native view', () => {
    expect(new Set(reportSelectionExamples.map(value => value.area))).toEqual(new Set(reportTemplateAreas));
    expect(new Set(reportSelectionExamples.map(value => value.query.view)).size).toBe(21);
  });
  it.each(reportSelectionExamples)('retains the native $area / $query.view selection', selection => {
    expect(reportSelectionSchema.parse(selection)).toEqual(selection);
    const period = 'period' in selection.query ? { preset: 'custom', ...selection.query.period } : null;
    expect(reportAssistantContextSchema.parse({ selection, period })).toEqual({ selection, period });
  });
  it('validates relative presets without losing the applied exact dates or individual-day selection', () => {
    for (const selection of reportSelectionExamples.filter(item => 'period' in item.query)) {
      const preset = selection.area === 'calendar' ? 'next7days' : 'last30days';
      expect(reportAssistantContextSchema.safeParse({ selection, period: { preset } }).success).toBe(true);
      expect(reportAssistantContextSchema.safeParse({ selection, period: { preset: preset === 'next7days' ? 'last30days' : 'next7days' } }).success).toBe(false);
    }
  });
  it('rejects mismatched periods, areas, client authority and unsupported filters', () => {
    for (const selection of reportSelectionExamples) {
      const period = 'period' in selection.query ? { preset: 'custom', ...selection.query.period } : null;
      const dated = period !== null;
      expect(reportAssistantContextSchema.safeParse({ selection, period: dated ? null : { preset: 'last30days' } }).success).toBe(false);
      expect(reportAssistantContextSchema.safeParse({ selection, period: { preset: 'custom', from: '2026-01-01', to: '2026-01-02' } }).success).toBe(false);
      expect(reportAssistantContextSchema.safeParse({ selection, period, results: [] }).success).toBe(false);
      expect(reportSelectionSchema.safeParse({ ...selection, query: { ...selection.query, scope: 'workspace' } }).success).toBe(false);
      expect(reportSelectionSchema.safeParse({ ...selection, area: selection.area === 'overview' ? 'jobs' : 'overview' }).success).toBe(false);
    }
  });
  it('bounds historical periods even when a native query permits a longer range', () => {
    const value = reportSelectionExamples.find(item => item.area === 'leads' && item.query.view === 'intake')!;
    expect(reportSelectionSchema.safeParse({ ...value, query: { ...value.query, period: { from: '2025-01-01', to: '2026-11-09' } } }).success).toBe(false);
  });
  it('accepts configuration-only turn context and rejects another workspace', () => {
    const selection = reportSelectionExamples[0]!;
    const period = { preset: 'last30days' };
    const reportContext = { selection, period };
    expect(chatPageContextSchema.safeParse({ reportContext }).success).toBe(true);
    expect(chatTurnRequestSchema.safeParse({
      workspaceId: selection.query.workspaceId, clientTurnId: '00000000-0000-4000-8000-000000000003',
      surfaceKey: 'home', message: 'Explain this report', reportContext,
    }).success).toBe(true);
    expect(chatTurnRequestSchema.safeParse({
      workspaceId: '00000000-0000-4000-8000-000000000099', clientTurnId: '00000000-0000-4000-8000-000000000003',
      surfaceKey: 'home', message: 'Explain this report', reportContext,
    }).success).toBe(false);
  });
  it('binds result area and exact period to its selection, not just its display label', () => {
    const selection = reportSelectionExamples[0]!;
    const result = {
      id: 'snapshot', area: 'overview', timezone: 'Europe/Warsaw',
      period: { from: '2026-10-11', to: '2026-11-09' }, filterLabels: [],
      sections: [{ id: 'period', label: 'Leads', scopeLabel: 'Authorized scope', basisLabel: 'Lead creation',
        asOf: '2026-11-09T15:00:00.000Z', metrics: [{ id: 'created', label: 'Created', value: { kind: 'count', value: 12 } }] }],
      coverage: ['Separate native snapshots.'],
    };
    expect(reportAssistantSnapshotSchema.safeParse({ selection, result }).success).toBe(true);
    for (const change of [{ area: 'financial' }, { period: null }, { period: { from: '2026-10-12', to: '2026-11-09' } }]) {
      expect(reportAssistantSnapshotSchema.safeParse({ selection, result: { ...result, ...change } }).success).toBe(false);
    }
  });
});
