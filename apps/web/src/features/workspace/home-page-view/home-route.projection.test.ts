import { describe, expect, it, vi } from 'vitest';
import type { HomeSnapshot } from '../../../server/home/read';
import { homeRouteProps } from './home-route.projection';
import type { HomePageViewProps } from './home-page-view';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const shell: HomePageViewProps['shell'] = {
  workspaceId, workspaceName: 'Fixture', user: { name: 'Sam', email: 'sam@example.test', role: 'owner' }, onSignOut: async () => {},
};
const initial: HomeSnapshot = {
  today: '2026-11-15', timezone: 'America/New_York', canCreateLead: true,
  leads: { status: 'ready', data: { scope: 'workspace', pipeline: { new: 2, contacted: 0, 'estimate-sent': 0, won: 0, lost: 0 }, newLeads: 1, unassignedTotal: 1, attention: [
    { id: 'lead-1', number: 'LD-0001', name: 'Lead customer', service: 'Unassigned lead', createdAt: new Date('2026-11-10T14:00:00Z') },
  ] } },
  jobs: { status: 'ready', data: { scope: 'workspace', active: 2, attention: 2, jobs: [], attentionItems: [
    { id: 'job-2', number: 'J-0002', title: 'Waiting job', customerName: 'Customer', ownerName: 'Sam', status: 'waiting', completionDeadline: null, scheduledDate: null, updatedAt: new Date('2026-11-01T14:00:00Z'), overdue: false },
    { id: 'job-1', number: 'J-0001', title: 'Overdue job', customerName: 'Customer', ownerName: 'Sam', status: 'waiting', completionDeadline: '2026-11-13', scheduledDate: null, updatedAt: new Date('2026-11-12T14:00:00Z'), overdue: true },
  ] } },
  intake: { status: 'ready', data: { workspaceId, timezone: 'America/New_York', page: 1, pageSize: 25, sources: [], total: 3, flaggedTotal: 1, rows: [
    { id: 'intake-1', name: 'Incoming customer', contact: '', summary: 'Flagged intake', source: { id: 'source-1', name: 'Website', type: 'website' }, status: 'awaiting', flags: ['missing'], receivedAt: '2026-11-14T14:00:00Z', canOpen: true, canReview: false },
  ] } },
  schedule: { status: 'ready', data: { total: 0, visits: [], scope: 'workspace' } },
  activity: { status: 'ready', data: [] }, workload: undefined,
};
const project = (snapshot: HomeSnapshot = initial, selectedShell = shell) => homeRouteProps(snapshot, selectedShell, vi.fn(), false, 'created');
describe('live Home projection', () => {
  it('orders distinct attention records by the approved priority and preserves complete totals', () => {
    const props = project(), attention = props.attention?.state;
    expect(attention?.status).toBe('ready');
    if (attention?.status !== 'ready') throw new Error('Expected attention');
    expect(attention.items.map(item => item.id)).toEqual(['job:job-1', 'intake:intake-1', 'lead:lead-1', 'job:job-2']);
    expect(attention.total).toBe(4);
    expect(attention.items[1].action).toBe('View details');
    expect(props.metrics.find(metric => metric.id === 'attentionJobs')).toMatchObject({ state: 'ready', value: 2 });
    expect(props.metrics.find(metric => metric.id === 'awaitingIntake')).toMatchObject({ state: 'ready', value: 3 });
    expect(props.onboarding).toBeUndefined();
  });
  it('never substitutes zero counts or onboarding for failed data', () => {
    const props = project({ ...initial, leads: { status: 'error' } });
    expect(props.metrics.find(metric => metric.id === 'newLeads')).toMatchObject({ state: 'error' });
    expect(props.attention?.state.status).toBe('error');
    expect(props.pipeline?.status).toBe('error');
    expect(props.jobs?.state.status).toBe('ready');
    expect(props.onboarding).toBeUndefined();
  });
  it('omits unreadable sections and retains authorized Create lead in the menu', () => {
    const props = project({ ...initial, leads: undefined, intake: undefined, schedule: undefined, activity: undefined });
    expect(props.pipeline).toBeUndefined(); expect(props.intake).toBeUndefined(); expect(props.schedule).toBeUndefined();
    expect(props.metrics.map(metric => metric.id)).toEqual(['activeJobs', 'attentionJobs']);
    expect(props.actions.map(action => action.id)).toEqual(['createLead']);
  });
  it('uses assigned metrics and workspace-scoped canonical destinations for Field', () => {
    const props = project({ ...initial, canCreateLead: false, leads: undefined, intake: undefined }, { ...shell, user: { ...shell.user, role: 'field' } });
    expect(props.metrics.map(metric => metric.id)).toEqual(['visitsToday', 'activeJobs', 'attentionJobs']);
    expect(props.actions.map(action => action.id)).toEqual(['todaySchedule', 'myJobs']);
    expect(props.schedule?.calendarHref).toContain(`workspace=${workspaceId}&date=2026-11-15&person=me`);
    expect(props.jobs?.jobsHref).toBe(`/jobs?workspace=${workspaceId}&mine=true`);
  });
  it('shows onboarding only for genuinely empty authorized data', () => {
    if (initial.leads?.status !== 'ready') throw new Error('Expected leads fixture');
    const snapshot: HomeSnapshot = { ...initial, leads: { status: 'ready', data: { ...initial.leads.data, pipeline: { new: 0, contacted: 0, 'estimate-sent': 0, won: 0, lost: 0 }, newLeads: 0, unassignedTotal: 0, attention: [] } }, jobs: undefined, intake: undefined };
    expect(project(snapshot).onboarding?.canCreateLead).toBe(true);
    expect(project({ ...snapshot, activity: { status: 'error' } }).onboarding).toBeUndefined();
  });
});
