import { describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => mocks }));
import { TeamReportRoute } from './team-report-page';
import { initialTeamQuery, teamReadResponse } from './team-read.fixtures';

describe('Team visible record route bridge', () => {
  it('preserves native typed Lead/Job UUID and workspace routes and reloads authority', () => {
    const initial = teamReadResponse(initialTeamQuery), route = TeamReportRoute({ initial });
    expect(route.props.initial).toBe(initial);
    for (const [type, path] of [['lead', 'leads'], ['job', 'jobs']]) {
      const id = initial.report.rows[0].recordId;
      route.props.onRecord({ type, id });
      expect(mocks.push).toHaveBeenLastCalledWith(`/${path}/${id}?workspace=${initial.workspaceId}`);
    }
    route.props.onReload();
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
});
