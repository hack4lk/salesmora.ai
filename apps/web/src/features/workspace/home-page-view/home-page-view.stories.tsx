import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { HomePageView, type HomePageViewProps } from './home-page-view';
import { leadPipelineWidgetData } from '../lead-pipeline-widget/lead-pipeline-widget.data';

const workspace = '00000000-0000-4000-8000-000000000001';
const today = '2026-11-15', timezone = 'America/New_York';
const jobsHref = `/jobs?workspace=${workspace}`, calendarHref = `/calendar?workspace=${workspace}`;
const job = { id: '00000000-0000-4000-8000-000000000201', number: 'J-201', title: 'Kitchen repair', customerName: 'Miller', ownerName: 'Sam Rivera', status: 'waiting' as const, completionDeadline: '2026-11-13', scheduledDate: today, overdue: true, href: `/jobs/00000000-0000-4000-8000-000000000201?workspace=${workspace}` };
const leadHref = `/leads/00000000-0000-4000-8000-000000000101?workspace=${workspace}`;
const fixture = {
  shell: { workspaceId: workspace, workspaceName: 'Northside Services', user: { name: 'Sam Rivera', email: 'sam@example.test', role: 'owner' }, authorizedPages: ['home', 'leads', 'jobs', 'intake', 'calendar'], assistantAvailable: true, chatEnabled: false, onSignOut: fn(async () => {}) },
  today, timezone,
  actions: [{ id: 'createLead', href: `/leads/new?workspace=${workspace}` }, { id: 'reviewIntake', href: `/intake?workspace=${workspace}` }, { id: 'openCalendar', href: calendarHref }],
  metrics: [
    { id: 'newLeads', state: 'ready', value: 2, description: 'Today and the preceding 29 calendar dates in America/New_York.' },
    { id: 'activeJobs', state: 'ready', value: 1, description: 'Jobs that are Needs scheduling, Scheduled, In progress, or Waiting.' },
    { id: 'attentionJobs', state: 'ready', value: 1, description: 'Distinct active jobs that are overdue, waiting, or need scheduling.' },
    { id: 'awaitingIntake', state: 'ready', value: 1, description: 'Incoming items awaiting a review decision.' },
  ],
  attention: { state: { status: 'ready', total: 2, items: [
    { id: `job:${job.id}`, title: job.title, reason: 'Overdue completion deadline', metadata: 'Miller · J-201 · Sam Rivera · Nov 13, 2026', overdue: true, action: 'Open job', href: job.href },
    { id: 'intake:301', title: 'Water pressure inquiry', reason: 'Missing details', metadata: 'Parker Gray · Received Nov 14, 2026', overdue: false, action: 'Review intake', href: `/intake/00000000-0000-4000-8000-000000000301?workspace=${workspace}` },
  ] } },
  intake: { timezone, intakeHref: `/intake?workspace=${workspace}`, state: { status: 'ready', total: 1, items: [{ id: '301', status: 'awaiting', name: 'Parker Gray', summary: 'Water pressure inquiry', source: { id: 'website', name: 'Website requests', type: 'website' }, flags: ['missing'], receivedAt: '2026-11-14T14:00:00Z', canReview: true, href: `/intake/00000000-0000-4000-8000-000000000301?workspace=${workspace}` }] } },
  schedule: { today, timezone, calendarHref, state: { status: 'ready', total: 1, visits: [{ id: 'visit-201', title: job.title, customerName: job.customerName, arrivalWindow: '09:00-11:00', location: '240 Oak Avenue', crew: [{ id: 'sam', name: 'Sam Rivera' }], records: [{ id: job.id, type: 'job', number: job.number, title: job.title, status: job.status }], href: `${calendarHref}&date=${today}&visit=visit-201` }] } },
  jobs: { jobsHref, state: { status: 'ready', jobs: [job], total: 1 } },
  workload: { state: { status: 'ready', total: 2, items: [{ id: 'sam', name: 'Sam Rivera', activeJobs: 1, openLeads: 1 }, { id: 'alex', name: 'Alex Chen', activeJobs: 0, openLeads: 1 }] } },
  activity: { timezone, state: { status: 'ready', items: [
    { eventId: 'event-201', domain: 'job', action: 'status-changed', occurredAt: '2026-11-15T18:00:00Z', actor: { kind: 'member', key: 'sam', label: 'Sam Rivera' }, recordId: job.id, recordLabel: 'J-201 · Kitchen repair', href: job.href },
    { eventId: 'event-101', domain: 'lead', action: 'created', occurredAt: '2026-11-15T14:00:00Z', actor: { kind: 'system', key: 'system', label: 'System' }, recordId: '00000000-0000-4000-8000-000000000101', recordLabel: 'L-101 · Heating inquiry', href: leadHref },
  ] } },
  pipeline: { status: 'ready', props: { counts: { new: 1, contacted: 1, 'estimate-sent': 0, won: 0, lost: 0 }, pipelineHref: `/leads?workspace=${workspace}` } },
} satisfies HomePageViewProps;
const meta = {
  title: 'Home/HomePageView', component: HomePageView, parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical composed Home page with fictional authorized inputs and mocked notification API. Live data queries and route integration await page approval.' } } },
  args: fixture,
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => String(input).startsWith('/api/notifications?')
      ? Response.json({ items: [], unreadCount: 0, page: 1, hasMore: false })
      : original(input, init);
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof HomePageView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Owner: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), main = within(c.getByRole('main'));
  await expect(main.getByRole('heading', { level: 1 })).toHaveTextContent('Sam Rivera');
  for (const title of ['Needs your attention', 'Intake review', "Today's schedule", 'Active jobs', 'Team workload', 'Recent activity', leadPipelineWidgetData.title]) await expect(main.getByRole('region', { name: title })).toBeVisible();
  await expect(main.getByRole('button', { name: 'Home actions' })).toBeVisible();
} };
export const Admin: Story = { args: { shell: { ...fixture.shell, user: { ...fixture.shell.user, role: 'admin' } } } };
export const Office: Story = { args: { shell: { ...fixture.shell, user: { ...fixture.shell.user, role: 'office' } }, workload: undefined } };
export const Field: Story = { args: {
  shell: { ...fixture.shell, user: { ...fixture.shell.user, role: 'field' }, authorizedPages: ['home', 'jobs', 'calendar'] },
  actions: [{ id: 'todaySchedule', href: calendarHref }, { id: 'myJobs', href: jobsHref }],
  metrics: [{ id: 'visitsToday', state: 'ready', value: 1, description: 'Assigned to you · Visits today in America/New_York.' }, { id: 'activeJobs', state: 'ready', value: 1, description: 'Assigned to you · Active jobs.' }, { id: 'attentionJobs', state: 'ready', value: 1, description: 'Assigned to you · Distinct active jobs needing attention.' }],
  attention: { state: { status: 'ready', total: 1, items: [fixture.attention.state.items[0]] } },
  intake: undefined, pipeline: undefined, workload: undefined,
  activity: { timezone, state: { status: 'ready', items: [fixture.activity.state.items[0]] } },
}, play: async ({ canvasElement }) => {
  const main = within(within(canvasElement).getByRole('main'));
  for (const title of ['Intake review', leadPipelineWidgetData.title, 'Team workload']) await expect(main.queryByRole('region', { name: title })).not.toBeInTheDocument();
} };
const empty: Partial<HomePageViewProps> = {
  metrics: fixture.metrics.map(metric => ({ ...metric, value: 0 })),
  attention: { state: { status: 'ready', items: [], total: 0 } },
  intake: { ...fixture.intake, state: { status: 'ready', items: [], total: 0 } },
  schedule: { ...fixture.schedule, state: { status: 'ready', visits: [], total: 0 } },
  jobs: { ...fixture.jobs, state: { status: 'ready', jobs: [], total: 0 } },
  workload: { state: { status: 'ready', items: [], total: 0 } },
  activity: { timezone, state: { status: 'ready', items: [] } },
  pipeline: { status: 'ready', props: { counts: { new: 0, contacted: 0, 'estimate-sent': 0, won: 0, lost: 0 }, pipelineHref: `/leads?workspace=${workspace}` } },
};
export const Quiet: Story = { args: empty };
export const NewWorkspace: Story = { args: { ...empty, onboarding: { entry: 'created', activity: { hasLeads: false, hasCampaigns: false, hasActivity: false }, canCreateLead: true, createLeadHref: `/leads/new?workspace=${workspace}` } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('link', { name: 'Create lead' })).toHaveAttribute('href', `/leads/new?workspace=${workspace}`);
} };
export const PermissionLimited: Story = { args: { shell: { ...fixture.shell, assistantAvailable: false, authorizedPages: ['home', 'jobs'] }, actions: [], metrics: [fixture.metrics[1]], attention: undefined, intake: undefined, schedule: undefined, workload: undefined, activity: undefined, pipeline: undefined } };
export const Loading: Story = { args: {
  metrics: fixture.metrics.map(metric => ({ id: metric.id, description: metric.description, state: 'loading' })),
  attention: { state: { status: 'loading' } }, intake: { ...fixture.intake, state: { status: 'loading' } },
  schedule: { ...fixture.schedule, state: { status: 'loading' } }, jobs: { ...fixture.jobs, state: { status: 'loading' } },
  workload: { state: { status: 'loading' } }, activity: { timezone, state: { status: 'loading' } }, pipeline: { status: 'loading' },
} };
export const PartialError: Story = { args: { attention: { state: { status: 'error', onRetry: fn() } }, pipeline: { status: 'error', onRetry: fn() } } };
export const AccountNotices: Story = { args: { notices: <div className="rounded-xl border border-line bg-paper p-4 text-sm leading-6 text-muted">Verify your email before queued invitations can be delivered.</div> } };
export const ActionsKeyboard: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  c.getByRole('button', { name: 'Home actions' }).focus(); await userEvent.keyboard('{Enter}');
  await expect(body.getByRole('menuitem', { name: 'Create lead' })).toHaveAttribute('href', `/leads/new?workspace=${workspace}`);
  await userEvent.keyboard('{Escape}');
} };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const FieldMobile: Story = { args: Field.args, globals: Mobile.globals, play: Field.play };
export const LongContent: Story = { args: { shell: { ...fixture.shell, user: { ...fixture.shell.user, name: 'Alexandra Morgan-Reed Community Services Coordinator' }, workspaceName: 'Northside Community Workshop and Neighborhood Resource Center' } } };
