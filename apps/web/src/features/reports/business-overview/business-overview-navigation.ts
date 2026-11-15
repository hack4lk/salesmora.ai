import { calendarReportQuerySchema, jobReportQuerySchema, leadReportQuerySchema } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import type { OverviewAttentionId } from './business-overview.validation';
import { reportHref } from '../report-navigation';

export function overviewAttentionHref(id: OverviewAttentionId, workspaceId: string, today: string): string {
  const common = { workspaceId, page: 1, pageSize: 25 };
  if (id === 'stale-leads') {
    const query = leadReportQuerySchema.parse({ ...common, view: 'attention', selection: 'inactive',
      filters: { stages: [], owners: [], sources: [] } });
    return reportHref({ area: 'leads', query });
  }
  if (id === 'upcoming-visits') {
    const query = calendarReportQuerySchema.parse({ ...common, view: 'calendar-scheduled', selected: 'visits',
      period: { from: today, to: addCalendarDays(today, 6) }, filters: { participants: [], recordTypes: [] } });
    return reportHref({ area: 'calendar', query });
  }
  const query = jobReportQuerySchema.parse({ ...common, view: 'workload',
    selection: { kind: 'metric', metric: id === 'overdue-jobs' ? 'overdue' : 'waiting' },
    filters: { statuses: [], owners: [], services: [] } });
  return reportHref({ area: 'jobs', query });
}
