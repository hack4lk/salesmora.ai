import { describe, expect, it } from 'vitest';
import { reportSelectionSchema } from '@salesmora/contracts';
import { reportSelectionExamples } from '../../../../../packages/contracts/src/reports/assistant-query.fixtures';
import { reportHref } from './report-navigation';

describe('canonical report deep links', () => {
  it.each(reportSelectionExamples)('round-trips $area / $query.view without losing filters or evidence', selection => {
    const url = new URL(reportHref(selection), 'http://127.0.0.1:3000');
    expect(url.pathname).toBe(`/reports/${selection.area}`);
    expect(url.searchParams.get('workspace')).toBe(selection.query.workspaceId);
    expect(reportSelectionSchema.parse({ area: selection.area, query: JSON.parse(url.searchParams.get('query')!) })).toEqual(selection);
    expect([...url.searchParams.keys()]).toEqual(['workspace', 'query']);
  });
});
