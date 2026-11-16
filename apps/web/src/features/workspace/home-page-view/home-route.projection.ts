import type { HomeSnapshot } from '../../../server/home/read';
import type { HomePageViewProps } from './home-page-view';
import type { HomeAttentionItem } from '../home-attention-widget/home-attention-widget';
import type { HomeSummaryMetric } from '../home-summary-metrics/home-summary-metrics';
import type { HomeActivityItem } from '../home-activity-widget/home-activity-widget';

export function homeRouteProps(initial: HomeSnapshot, shell: HomePageViewProps['shell'], onRetry: () => void, retrying: boolean, entry: 'created' | 'joined'): HomePageViewProps {
  const { today, timezone, leads, jobs, intake, schedule, workload, activity } = initial;
  const field = shell.user.role === 'field', workspace = encodeURIComponent(shell.workspaceId);
  const href = (path: string) => `${path}?workspace=${workspace}`;
  const jobsHref = `${href('/jobs')}${field ? '&mine=true' : ''}`;
  const calendarHref = `${href('/calendar')}&date=${today}${field ? '&person=me' : ''}`;
  const error = { status: 'error' as const, onRetry, retrying };
  const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: timezone });
  const metrics: HomeSummaryMetric[] = [];
  function metric(id: HomeSummaryMetric['id'], state: { status: string } | undefined, value: number | undefined, description: string, destination?: string) {
    if (!state) return;
    metrics.push(state.status === 'ready' && value !== undefined
      ? { id, state: 'ready', value, description, href: destination }
      : { id, state: 'error', description, onRetry, retrying });
  }
  const jobScope = jobs?.status === 'ready' && jobs.data.scope === 'workspace' ? '' : field ? 'Assigned to you · ' : 'Accessible work · ';
  const leadScope = leads?.status === 'ready' && leads.data.scope === 'workspace' ? '' : field ? 'Assigned to you · ' : 'Accessible work · ';
  if (field) metric('visitsToday', schedule, schedule?.status === 'ready' ? schedule.data.total : undefined, `Assigned to you · Visits today in ${timezone}.`, calendarHref);
  else metric('newLeads', leads, leads?.status === 'ready' ? leads.data.newLeads : undefined, `${leadScope}Today plus the preceding 29 calendar dates in ${timezone}.`, `${href('/leads')}&created=30days`);
  metric('activeJobs', jobs, jobs?.status === 'ready' ? jobs.data.active : undefined, `${jobScope}Jobs that are Needs scheduling, Scheduled, In progress, or Waiting.`, jobsHref);
  metric('attentionJobs', jobs, jobs?.status === 'ready' ? jobs.data.attention : undefined, `${jobScope}Distinct active jobs that are overdue, waiting, or need scheduling.`, jobsHref);
  if (!field) metric('awaitingIntake', intake, intake?.status === 'ready' ? intake.data.total : undefined, 'Incoming items awaiting a review decision.', `${href('/intake')}&status=awaiting`);
  const attentionItems: (HomeAttentionItem & { priority: number; sort: string })[] = [];
  if (jobs?.status === 'ready') for (const job of jobs.data.attentionItems) {
    if (job.overdue && !job.completionDeadline) throw new Error('An overdue Home job requires a completion deadline.');
    attentionItems.push({
      id: `job:${job.id}`, title: job.title, reason: job.overdue ? 'Overdue completion deadline' : job.status === 'waiting' ? 'Waiting' : 'Needs scheduling',
      metadata: [job.customerName, job.number, job.ownerName, job.completionDeadline ? `Due ${job.completionDeadline}` : undefined].filter(Boolean).join(' · '),
      overdue: job.overdue, action: 'Open job', href: href(`/jobs/${job.id}`), priority: job.overdue ? 0 : 3,
      sort: job.overdue && job.completionDeadline ? job.completionDeadline : job.updatedAt.toISOString(),
    });
  }
  if (intake?.status === 'ready') for (const item of intake.data.rows.filter(row => row.flags.length)) attentionItems.push({
    id: `intake:${item.id}`, title: item.summary.trim() || item.name.trim() || 'Incoming item', reason: 'Flagged intake item',
    metadata: [item.name, item.source.name, `Received ${date.format(new Date(item.receivedAt))}`].filter(Boolean).join(' · '),
    overdue: false, action: item.canReview ? 'Review intake' : 'View details', href: href(`/intake/${item.id}`), priority: 1, sort: item.receivedAt,
  });
  if (leads?.status === 'ready') for (const lead of leads.data.attention) attentionItems.push({
    id: `lead:${lead.id}`, title: lead.service.trim() || lead.name, reason: 'Unassigned open lead',
    metadata: [lead.name, lead.number, `Created ${date.format(lead.createdAt)}`].filter(Boolean).join(' · '),
    overdue: false, action: 'Open lead', href: href(`/leads/${lead.id}`), priority: 2, sort: lead.createdAt.toISOString(),
  });
  attentionItems.sort((a, b) => a.priority - b.priority || a.sort.localeCompare(b.sort) || a.id.localeCompare(b.id));
  const attentionFailed = [leads, jobs, intake].some(state => state?.status === 'error');
  const total = (jobs?.status === 'ready' ? jobs.data.attention : 0) + (leads?.status === 'ready' ? leads.data.unassignedTotal : 0) + (intake?.status === 'ready' ? intake.data.flaggedTotal : 0);
  const events: HomeActivityItem[] = [];
  if (activity?.status === 'ready') for (const event of activity.data) {
    if (event.domain === 'lead' && ['created', 'updated', 'archived', 'stage-changed', 'assignment-changed'].includes(event.action)) {
      const action = event.action;
      if (action === 'created' || action === 'updated' || action === 'archived' || action === 'stage-changed' || action === 'assignment-changed') events.push({ ...event, domain: 'lead', action, href: href(`/leads/${event.recordId}`) });
    } else if (event.domain === 'job') {
      const action = event.action;
      if (action === 'created' || action === 'updated' || action === 'archived' || action === 'assignment-changed' || action === 'status-changed' || action === 'deadline-changed' || action === 'visit-changed' || action === 'completed') events.push({ ...event, domain: 'job', action, href: href(`/jobs/${event.recordId}`) });
      else throw new Error('Unsupported Home job activity action.');
    } else throw new Error('Unsupported Home activity event.');
  }
  const knownEmpty = [leads, jobs, intake, schedule].some(Boolean) && !attentionFailed && schedule?.status !== 'error' &&
    (leads?.status !== 'ready' || Object.values(leads.data.pipeline).every(count => count === 0)) &&
    (jobs?.status !== 'ready' || jobs.data.active === 0) && (intake?.status !== 'ready' || intake.data.total === 0) &&
    (schedule?.status !== 'ready' || schedule.data.total === 0) && activity?.status !== 'error' &&
    (activity?.status !== 'ready' || activity.data.length === 0);
  return {
    shell, today, timezone, metrics,
    actions: [
      ...(initial.canCreateLead ? [{ id: 'createLead' as const, href: href('/leads/new') }] : []),
      ...(field ? [
        ...(schedule ? [{ id: 'todaySchedule' as const, href: calendarHref }] : []),
        ...(jobs ? [{ id: 'myJobs' as const, href: jobsHref }] : []),
      ] : [
        ...(intake ? [{ id: 'reviewIntake' as const, href: `${href('/intake')}&status=awaiting` }] : []),
        ...(schedule ? [{ id: 'openCalendar' as const, href: calendarHref }] : []),
      ]),
    ],
    attention: leads || jobs || intake ? { state: attentionFailed ? error : { status: 'ready', items: attentionItems, total } } : undefined,
    pipeline: leads && (leads.status === 'ready' ? { status: 'ready', props: { counts: leads.data.pipeline, pipelineHref: `${href('/leads')}&view=pipeline` } } : error),
    jobs: jobs && { jobsHref, state: jobs.status === 'ready' ? { status: 'ready', jobs: jobs.data.jobs.map(job => ({ ...job, href: href(`/jobs/${job.id}`) })), total: jobs.data.active } : error },
    intake: intake && { timezone, intakeHref: `${href('/intake')}&status=awaiting`, state: intake.status === 'ready' ? { status: 'ready', total: intake.data.total, items: intake.data.rows.map(item => {
      if (item.status !== 'awaiting') throw new Error('Home intake requires awaiting items.');
      return { ...item, status: 'awaiting' as const, href: href(`/intake/${item.id}`) };
    }) } : error },
    schedule: schedule && { today, timezone, calendarHref, state: schedule.status === 'ready' ? { status: 'ready', total: schedule.data.total, visits: schedule.data.visits.map(visit => ({ ...visit, href: `${calendarHref}&visit=${visit.id}` })) } : error },
    workload: workload && { state: workload.status === 'ready' ? { status: 'ready', ...workload.data } : error },
    activity: activity && { timezone, state: activity.status === 'ready' ? { status: 'ready', items: events } : error },
    onboarding: knownEmpty ? { entry, activity: { hasLeads: false, hasCampaigns: false, hasActivity: false }, canCreateLead: initial.canCreateLead, createLeadHref: href('/leads/new') } : undefined,
  };
}
