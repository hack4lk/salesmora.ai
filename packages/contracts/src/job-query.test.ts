import { describe, expect, it } from 'vitest';
import { jobQueryFromURL } from './job';
const workspace = '6d8bf181-eef9-42af-927d-7dba9d4b1ce5';
describe('Jobs URL query boundary', () => {
  it('projects only known filters and bounds collection requests', () => {
    const query = jobQueryFromURL(workspace, new URLSearchParams('workspace=ignored&service=Plumbing&deadline=overdue&sort=service&direction=desc&mine=true&pageSize=50&sql=DROP'));
    expect(query).toMatchObject({ workspaceId: workspace, service: 'Plumbing', deadline: 'overdue', sort: 'service', direction: 'desc', mine: true, pageSize: 50 });
    expect(query).not.toHaveProperty('sql');
  });
  it('rejects unknown sort columns, unbounded pages and impossible local dates', () => {
    for (const params of ['sort=workspaceId', 'pageSize=100000', 'page=-1', 'createdAfter=2026-02-30', 'deadline=everything', 'status=unknown'])
      expect(() => jobQueryFromURL(workspace, new URLSearchParams(params))).toThrow();
  });
});
