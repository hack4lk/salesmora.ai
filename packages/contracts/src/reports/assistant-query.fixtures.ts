import { reportSelectionSchema } from './assistant-query';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const base = { workspaceId, page: 1, pageSize: 25 };
const period = { from: '2026-10-11', to: '2026-11-09' };
const leadFilters = { stages: [], owners: [], sources: [] };
const jobFilters = { statuses: [], owners: [], services: [] };

export const reportSelectionExamples = [
  { area: 'overview', query: { workspaceId, view: 'business-overview', period } },
  { area: 'leads', query: { ...base, view: 'intake', period, filters: leadFilters, currentFilters: leadFilters } },
  ...(['won', 'lost'] as const).map(view => ({ area: 'leads', query: { ...base, view, period, filters: leadFilters } })),
  { area: 'leads', query: { ...base, view: 'pipeline', filters: leadFilters, selection: { kind: 'pipeline' } } },
  { area: 'leads', query: { ...base, view: 'age', filters: leadFilters, selection: { kind: 'age', band: '31+' } } },
  { area: 'leads', query: { ...base, view: 'attention', filters: leadFilters, selection: 'inactive' } },
  ...(['cohort', 'converted', 'accepted-estimates'] as const).map(selected => ({
    area: 'sources', query: { ...base, view: 'lead-source', period, selected },
  })),
  { area: 'calendar', query: { ...base, view: 'calendar-scheduled', period, selected: 'visits' } },
  { area: 'calendar', query: { ...base, view: 'calendar-review', period, selected: 'overlaps' } },
  { area: 'calendar', query: { ...base, view: 'calendar-unscheduled', selected: 'jobs' } },
  { area: 'jobs', query: { ...base, view: 'lifecycle', period, selectedView: 'created' } },
  { area: 'jobs', query: { ...base, view: 'completion', period, selectedDate: period.from } },
  { area: 'jobs', query: { ...base, view: 'workload', filters: jobFilters, selection: { kind: 'metric', metric: 'overdue' } } },
  { area: 'team', query: { ...base, view: 'team-leads', selected: { kind: 'queue', queue: 'inactive' } } },
  { area: 'team', query: { ...base, view: 'team-jobs', selected: { kind: 'member', id: 'alex', responsibility: 'supporting', filter: 'all' },
    filters: { members: ['alex'] } } },
  { area: 'estimates', query: { ...base, view: 'estimate-decisions', period, selected: 'accepted' } },
  { area: 'estimates', query: { ...base, view: 'estimate-first-quoted', period } },
  { area: 'estimates', query: { ...base, view: 'estimate-current', selected: 'awaiting' } },
  { area: 'activity', query: { ...base, view: 'activity', period } },
  ...(['accepted', 'awaiting', 'materials'] as const).map(selected => ({
    area: 'financial', query: { ...base, view: 'financial', period, selected },
  })),
].map(value => reportSelectionSchema.parse(value));
