import { describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => mocks }));
import { EstimateReportRoute } from './estimate-report-page';
import { initialEstimateQuery, estimateReadResponse } from './estimate-read.fixtures';

describe('Estimates visible revision route bridge', () => {
  it('navigates to native Estimate UUID/workspace and reloads current authority', () => {
    const initial = estimateReadResponse(initialEstimateQuery), route = EstimateReportRoute({ initial });
    expect(route.props.initial).toBe(initial);
    const id = initial.report.rows[0].recordId;
    route.props.onRecord(id);
    expect(mocks.push).toHaveBeenCalledWith(`/estimates/${id}?workspace=${initial.workspaceId}`);
    route.props.onReload();
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
});
