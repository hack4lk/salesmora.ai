import { describe, expect, it } from 'vitest';
import { reportTemplateAreas } from '@salesmora/contracts';
import { reportAssistantExamples as examples } from './report-result.fixtures';
import { reportAssistantResultSchema as schema } from '@salesmora/contracts';

describe('Reports assistant presentation snapshots', () => {
  it.each(reportTemplateAreas)('accepts the bounded %s review example', area => {
    expect(schema.parse(examples[area].result).area).toBe(area);
  });
  it('keeps period results and current snapshots separately attributed', () => {
    const result = schema.parse(examples.overview.result);
    expect(result.period).not.toBeNull();
    expect(result.sections[0].asOf).not.toBe(result.sections[1].asOf);
    expect(result.sections[1].basisLabel).toContain('not restricted by the selected period');
    expect(schema.parse(examples.team.result).period).toBeNull();
  });
  it.each([
    { timezone: 'Invalid/Timezone' },
    { period: { from: '2026-11-09', to: '2026-11-01' } },
    { period: { from: '2026-02-30', to: '2026-03-01' } },
    { sections: [] },
    { sections: [examples.leads.result.sections[0], examples.leads.result.sections[0]] },
  ])('rejects invalid metadata: %j', change => {
    expect(schema.safeParse({ ...examples.leads.result, ...change }).success).toBe(false);
  });
  it.each([-1, 0.1, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid count %s', value => {
    const section = examples.leads.result.sections[0];
    expect(schema.safeParse({ ...examples.leads.result, sections: [{
      ...section, metrics: [{ id: 'count', label: 'Leads created', value: { kind: 'count', value } }],
    }] }).success).toBe(false);
  });
  it('does not accept navigation URLs as part of presentation evidence', () => {
    expect(schema.safeParse({ ...examples.leads.result, href: 'https://example.test' }).success).toBe(false);
  });
  it('bounds independently timestamped Overview sections without merging or dropping native reads', () => {
    const section = examples.leads.result.sections[0]!;
    const sections = Array.from({ length: 12 }, (_, index) => ({ ...section, id: `native-${index}` }));
    expect(schema.safeParse({ ...examples.leads.result, sections }).success).toBe(true);
    expect(schema.safeParse({ ...examples.leads.result, sections: [...sections, { ...section, id: 'too-many' }] }).success).toBe(false);
  });
});
