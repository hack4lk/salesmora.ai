import { describe, expect, it } from 'vitest';
import { estimateWorkspaceResponse, estimateWorkspaceOptions as options, estimateWorkspaceScope as scope } from './estimate-report-workspace.fixtures';
import { validEstimateReportProjection } from './estimate-report-workspace.validation';

const empty = { owners: [], parents: [] };
describe('Estimates workspace matching authorized projections', () => {
  it('accepts each view and OR within owner/parent facets with AND across them', () => {
    for (const view of ['decisions', 'first-quoted', 'current'] as const) {
      for (const filters of [empty, { owners: ['member:a', 'member:b'], parents: ['lead', 'job'] },
        { owners: ['member:b'], parents: ['lead'] }]) {
        expect(validEstimateReportProjection(estimateWorkspaceResponse(view, filters), filters, options, scope, true, true)).toBe(true);
      }
    }
    const projection = estimateWorkspaceResponse('decisions', { owners: ['member:b'], parents: ['job'] });
    if (projection.state.kind !== 'ready' || projection.view !== 'decisions') throw new Error('Expected ready decisions.');
    expect(projection.state.result.counts).toEqual({ accepted: 0, declined: 0 });
  });
  it('rejects stale drafts or scope identities while ignoring selection order', () => {
    const filters = { owners: ['member:a', 'member:b'], parents: ['lead', 'job'] };
    const projection = estimateWorkspaceResponse('decisions', filters);
    expect(validEstimateReportProjection(projection, { owners: [...filters.owners].reverse(), parents: ['job', 'lead'] }, options, scope, true, true)).toBe(true);
    expect(validEstimateReportProjection(projection, empty, options, scope, true, true)).toBe(false);
    expect(validEstimateReportProjection(projection, filters, options, 'new-scope', true, true)).toBe(false);
    expect(validEstimateReportProjection(projection, filters, options, '', true, true)).toBe(false);
  });
  it('rejects duplicate, missing, unavailable or falsely relabeled page attribution', () => {
    const projection = estimateWorkspaceResponse('decisions', empty);
    for (const attribution of [[], [projection.attribution[0]!, projection.attribution[0]!],
      projection.attribution.map(row => ({ ...row, ownerKey: 'hidden' }))]) {
      expect(validEstimateReportProjection({ ...projection, attribution }, empty, options, scope, true, true)).toBe(false);
    }
    const filters = { owners: ['member:b'], parents: [] };
    expect(validEstimateReportProjection({ ...projection, filters }, filters, options, scope, true, true)).toBe(false);
  });
  it('validates every selected page and lead-only handoff metadata', () => {
    for (const page of [1, 2, 3, 4]) expect(validEstimateReportProjection(estimateWorkspaceResponse('first-quoted', empty, 'first-quoted', page, 1), empty, options, scope, false, false)).toBe(true);
    for (const page of [1, 2]) expect(validEstimateReportProjection(estimateWorkspaceResponse('decisions', empty, undefined, page, 1), empty, options, scope, true, true)).toBe(true);
    const projection = estimateWorkspaceResponse('current', empty, 'handoff');
    expect(validEstimateReportProjection(projection, empty, options, scope, true, true)).toBe(true);
    expect(validEstimateReportProjection({ ...projection, attribution: projection.attribution.map(row => ({ ...row, parentType: 'job' })) },
      empty, options, scope, true, true)).toBe(false);
  });
  it('rejects stale first-quoted filters, invalid history and duplicate attribution', () => {
    const projection = estimateWorkspaceResponse('first-quoted', empty);
    expect(validEstimateReportProjection(projection, { owners: ['member:a'], parents: [] }, options, scope, true, true)).toBe(false);
    expect(validEstimateReportProjection({ ...projection, attribution: [] }, empty, options, scope, true, true)).toBe(false);
    if (projection.view !== 'first-quoted' || projection.state.kind !== 'ready') throw new Error('Expected first-quoted fixture.');
    expect(validEstimateReportProjection({ ...projection, state: { kind: 'ready', result: { ...projection.state.result,
      rows: projection.state.result.rows.map(row => ({ ...row, firstIssuedDate: '2026-09-30' })) } } }, empty, options, scope, true, true)).toBe(false);
  });
  it('keeps independent money/handoff revocation without exposing a stale selected handoff', () => {
    const projection = estimateWorkspaceResponse('current', empty, 'handoff');
    expect(validEstimateReportProjection({ ...projection, attribution: [] }, empty, options, scope, false, false)).toBe(true);
    const decisions = estimateWorkspaceResponse('decisions', empty);
    expect(validEstimateReportProjection(decisions, empty, options, scope, false, false)).toBe(true);
  });
  it('accepts loading/error contracts only with matching filters/scope and rejects invalid options', () => {
    for (const kind of ['loading', 'error'] as const) {
      const projection = { view: 'decisions' as const, state: { kind }, filters: empty, scopeKey: scope, attribution: [] };
      expect(validEstimateReportProjection(projection, empty, options, scope, true, true)).toBe(true);
      expect(validEstimateReportProjection(projection, { owners: ['hidden'], parents: [] }, options, scope, true, true)).toBe(false);
    }
    expect(validEstimateReportProjection(estimateWorkspaceResponse('current', empty), empty,
      { owners: [options.owners[0]!, options.owners[0]!] }, scope, true, true)).toBe(false);
  });
});
