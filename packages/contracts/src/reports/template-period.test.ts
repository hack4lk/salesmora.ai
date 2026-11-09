import { describe, expect, it } from 'vitest';
import { reportTemplatePeriodSchema } from './template-period';

describe('saved report period', () => {
  it('accepts relative presets without cached dates and fixed valid custom dates', () => {
    for (const period of [{ preset: 'last30days' }, { preset: 'next7days' },
      { preset: 'custom', from: '2024-01-01', to: '2024-12-31' }]) {
      expect(reportTemplatePeriodSchema.safeParse(period).success).toBe(true);
    }
  });
  it('rejects cached preset dates, extra authority, invalid or excessive ranges', () => {
    for (const period of [
      { preset: 'last30days', from: '2026-01-01', to: '2026-01-30' },
      { preset: 'next7days', scope: 'workspace' },
      { preset: 'custom', from: '2026-02-29', to: '2026-03-01' },
      { preset: 'custom', from: '2026-03-02', to: '2026-03-01' },
      { preset: 'custom', from: '2024-01-01', to: '2025-01-01' },
      { preset: 'custom', from: '0000-01-01', to: '0000-01-01' },
    ]) expect(reportTemplatePeriodSchema.safeParse(period).success).toBe(false);
  });
});
