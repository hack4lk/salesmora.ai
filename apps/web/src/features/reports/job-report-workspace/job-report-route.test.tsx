import { describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => mocks }));
import { JobReportRoute } from './job-report-page';
import { initialJobQuery, jobReadResponse } from './job-read.fixtures';

describe('Jobs report detail route bridge', () => {
  it('preserves authorized native UUID/workspace in the existing Job route and reloads current authority', () => {
    const initial = jobReadResponse(initialJobQuery);
    const route = JobReportRoute({ initial });
    expect(route.props.initial).toBe(initial);
    const id = initial.report.rows[0]!.recordId;
    route.props.onRecord(id);
    expect(mocks.push).toHaveBeenCalledWith(`/jobs/${id}?workspace=${initial.workspaceId}`);
    route.props.onReload();
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
});
