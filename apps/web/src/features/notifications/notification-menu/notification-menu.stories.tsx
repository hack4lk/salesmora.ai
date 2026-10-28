import { jobNotificationItem } from './job-notification-item';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { NotificationMenu, type NotificationMenuProps } from './notification-menu';
import { notificationMenuData as copy } from './notification-menu.data';

const fixture = { id: 'preview-notification', title: copy.stories.title, description: copy.stories.description, createdAt: copy.stories.date, read: false, href: copy.stories.leadHref };
function Preview(args: NotificationMenuProps) {
  const [items, setItems] = useState(args.items);
  const [count, setCount] = useState(args.unreadCount);
  const [state, setState] = useState(args.state);
  const [hasMore, setHasMore] = useState(args.hasMore);
  return <NotificationMenu {...args} items={items} unreadCount={count} state={state} hasMore={hasMore}
    onRetry={() => { args.onRetry(); setState('ready'); }}
    onMarkRead={id => { args.onMarkRead(id); setItems(current => current.map(item => item.id === id ? { ...item, read: true } : item)); setCount(current => current === null ? null : Math.max(0, current - 1)); }}
    onLoadMore={() => { args.onLoadMore(); setItems(current => [...current, { ...fixture, id: 'preview-older', read: true, createdAt: copy.stories.olderDate }]); setHasMore(false); }}/>;
}
async function open(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: /^Open notifications/ }));
  const panel = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: copy.title });
  await waitFor(() => expect(panel).toBeVisible());
  return panel;
}
const meta = {
  title: 'Notifications/NotificationMenu', component: NotificationMenu, parameters: { layout: 'fullscreen' },
  args: { workspaceName: copy.stories.workspace, unreadCount: 1, items: [fixture], state: 'ready', preferencesHref: copy.stories.preferencesHref, onOpen: fn(), onRetry: fn(), onMarkRead: fn(), onLoadMore: fn() },
  render: args => <Preview {...args}/>,
  decorators: [Story => <main className="min-h-screen p-4 sm:p-8"><h1 className="mb-4 mt-0 text-heading font-semibold text-ink">{copy.stories.heading}</h1><p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.notice}</p><div className="flex justify-end rounded-2xl border border-line bg-paper p-4"><Story/></div></main>],
} satisfies Meta<typeof NotificationMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const dialog = within(await open(canvasElement));
  await expect(dialog.getByText(copy.stories.description)).toBeVisible();
  await expect(dialog.getByRole('link', { name: copy.view })).toHaveAttribute('href', copy.stories.leadHref);
  await expect(dialog.getByRole('link', { name: copy.preferences })).toHaveAttribute('href', copy.stories.preferencesHref);
  await expect(args.onOpen).toHaveBeenCalledOnce();
} };
export const WorkOrderEvent: Story = {
  args: { items: [{ id: 'preview-wo', title: copy.workOrderTitles.issued, description: copy.workOrderDescription('Alex Rivera', 'WO-0042', 'Replace kitchen faucet'), createdAt: copy.stories.date, read: false, href: '/work-orders/preview-wo?workspace=preview-workspace', actionLabel: copy.viewWorkOrder }] },
  play: async ({ canvasElement }) => {
    const dialog = within(await open(canvasElement));
    await expect(dialog.getByRole('link', { name: copy.viewWorkOrder })).toHaveAttribute('href', '/work-orders/preview-wo?workspace=preview-workspace');
  },
};
export const EstimateEvent: Story = {
  args: { items: [{
    id: 'preview-estimate-notification',
    title: copy.estimateTitles.viewed,
    description: copy.estimateDescription('EST-1042', 'Kitchen faucet replacement', 'sent'),
    createdAt: copy.stories.date,
    read: false,
    href: copy.stories.estimateHref,
    actionLabel: copy.viewEstimate,
  }] },
  play: async ({ canvasElement }) => {
    const dialog = within(await open(canvasElement));
    await expect(dialog.getByText(copy.estimateTitles.viewed)).toBeVisible();
    await expect(dialog.getByText('EST-1042 · Kitchen faucet replacement · Sent')).toBeVisible();
    await expect(dialog.getByRole('link', { name: copy.viewEstimate })).toHaveAttribute('href', copy.stories.estimateHref);
  },
};
export const MaterialRejected: Story = {
  args: { items: [{ id: 'preview-mat', title: copy.materialTitles.rejected, description: copy.materialDescription('rejected', 'Alex Rivera', '12/2 Romex wire', 'Already listed under a different SKU.'), createdAt: copy.stories.date, read: false, href: copy.stories.materialHref, actionLabel: copy.viewMaterials }], unreadCount: 1 },
  play: async ({ canvasElement }) => {
    const dialog = within(await open(canvasElement));
    await expect(dialog.getByRole('link', { name: copy.viewMaterials })).toHaveAttribute('href', copy.stories.materialHref);
    await expect(dialog.getByText(/Already listed under a different SKU/)).toBeVisible();
  },
};
export const MaterialProposed: Story = {
  args: { items: [{ id: 'preview-mat-proposed', title: copy.materialTitles.proposed, description: copy.materialDescription('proposed', 'Sam Lee', '3/4 PVC elbow', ''), createdAt: copy.stories.date, read: false, href: copy.stories.materialHref, actionLabel: copy.viewMaterials }], unreadCount: 1 },
  play: async ({ canvasElement }) => {
    const dialog = within(await open(canvasElement));
    await expect(dialog.getByText(copy.materialTitles.proposed)).toBeVisible();
    await expect(dialog.getByText(/Sam Lee proposed 3\/4 PVC elbow/)).toBeVisible();
  },
};
export const MaterialApprovedWithChanges: Story = {
  args: { items: [{ id: 'preview-mat-edited', title: copy.materialTitles.edited, description: copy.materialDescription('edited', 'Alex Rivera', '12/2 Romex wire', ''), createdAt: copy.stories.date, read: false, href: copy.stories.materialHref, actionLabel: copy.viewMaterials }], unreadCount: 1 },
  play: async ({ canvasElement }) => {
    const dialog = within(await open(canvasElement));
    await expect(dialog.getByText(copy.materialTitles.edited)).toBeVisible();
    await expect(dialog.getByText(/approved, with edits, 12\/2 Romex wire/)).toBeVisible();
  },
};
export const Closed: Story = {};
export const Empty: Story = { args: { items: [], unreadCount: 0 }, play: async ({ canvasElement }) => {
  const dialog = within(await open(canvasElement));
  await expect(dialog.getByRole('heading', { name: copy.emptyTitle })).toBeVisible();
  await expect(dialog.queryByRole('link', { name: copy.view })).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: 'loading', unreadCount: null }, play: async ({ canvasElement }) => {
  const dialog = within(await open(canvasElement));
  await expect(dialog.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(dialog.queryByText(copy.stories.description)).not.toBeInTheDocument();
} };
export const LoadError: Story = { args: { state: 'error', unreadCount: null }, play: async ({ canvasElement }) => {
  const dialog = within(await open(canvasElement));
  await expect(dialog.getByRole('alert')).toHaveTextContent(copy.loadErrorTitle);
  await expect(dialog.queryByText(copy.stories.description)).not.toBeInTheDocument();
} };
export const Retry: Story = { args: { state: 'error', unreadCount: null }, play: async ({ canvasElement, args }) => {
  const dialog = within(await open(canvasElement));
  await userEvent.click(dialog.getByRole('button', { name: copy.retry }));
  await expect(args.onRetry).toHaveBeenCalledOnce();
  await expect(dialog.getByText(copy.stories.description)).toBeVisible();
} };
export const MarkRead: Story = { play: async ({ canvasElement, args }) => {
  const dialog = within(await open(canvasElement));
  await userEvent.click(dialog.getByRole('button', { name: copy.markRead }));
  await expect(args.onMarkRead).toHaveBeenCalledWith(fixture.id);
  await expect(args.onMarkRead).toHaveBeenCalledOnce();
  await expect(dialog.queryByRole('button', { name: copy.markRead })).not.toBeInTheDocument();
  await expect(dialog.getByText(copy.read, { exact: true })).toBeVisible();
  await userEvent.click(dialog.getByRole('button', { name: copy.close }));
  await expect(within(canvasElement).getByRole('button', { name: copy.open(0) })).toHaveFocus();
} };
export const MarkingRead: Story = { args: { pendingId: fixture.id }, play: async ({ canvasElement, args }) => {
  const dialog = within(await open(canvasElement));
  await expect(dialog.getByRole('button', { name: copy.marking })).toBeDisabled();
  await expect(args.onMarkRead).not.toHaveBeenCalled();
} };
export const ReadError: Story = { args: { actionError: true }, play: async ({ canvasElement }) => {
  const dialog = within(await open(canvasElement));
  await expect(dialog.getByRole('alert')).toHaveTextContent(copy.actionErrorTitle);
  await expect(dialog.getByRole('button', { name: copy.markRead })).toBeEnabled();
} };
export const OlderNotifications: Story = { args: { hasMore: true }, play: async ({ canvasElement, args }) => {
  const dialog = within(await open(canvasElement));
  await userEvent.click(dialog.getByRole('button', { name: copy.older }));
  await expect(args.onLoadMore).toHaveBeenCalledOnce();
  await expect(dialog.getAllByRole('link', { name: copy.view })).toHaveLength(2);
} };
export const LoadingOlder: Story = { args: { hasMore: true, loadingMore: true }, play: async ({ canvasElement }) => {
  const dialog = within(await open(canvasElement));
  await expect(dialog.getByRole('button', { name: copy.loadingOlder })).toBeDisabled();
} };
export const LongContent: Story = { args: { workspaceName: copy.stories.longWorkspace, unreadCount: 123, items: Array.from({ length: 5 }, (_, i) => ({ ...fixture, id: `preview-${i}`, description: copy.stories.longDescription })) }, play: async ({ canvasElement }) => { await open(canvasElement); } };
export const Keyboard: Story = { play: async ({ canvasElement }) => {
  const button = within(canvasElement).getByRole('button', { name: copy.open(1) });
  button.focus(); await userEvent.keyboard('{Enter}');
  const dialog = within(await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: copy.title }));
  await expect(dialog.getByRole('button', { name: copy.close })).toHaveFocus();
  await userEvent.tab({ shift: true });
  await expect(dialog.getByRole('link', { name: copy.preferences })).toHaveFocus();
  await userEvent.tab();
  await expect(dialog.getByRole('button', { name: copy.close })).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect(button).toHaveFocus();
} };
export const Narrow: Story = { globals: { viewport: { value: 'phone', isRotated: false } }, play: async ({ canvasElement }) => { await open(canvasElement); } };


const visitDetails = [
  { label: copy.visitBefore, value: copy.visitStories.before }, { label: copy.visitAfter, value: copy.visitStories.after },
  { label: copy.visitTimezone, value: copy.visitStories.timezone },
];
const visitNotification = { id: 'preview-visit-notification', title: copy.visitTitles.rescheduled, description: copy.visitStories.rescheduled,
  createdAt: copy.stories.date, read: false, href: copy.visitStories.visitHref, actionLabel: copy.viewVisit,
  details: visitDetails, recordLabels: [copy.visitStories.job, copy.visitStories.order] };
export const SharedVisitRescheduled: Story = { args: { items: [visitNotification], unreadCount: 1 }, play: async ({ canvasElement }) => {
  const panel = within(await open(canvasElement));
  await expect(panel.getAllByRole('listitem')).toHaveLength(3);
  await expect(panel.getByRole('region', { name: copy.visitRecords })).toHaveTextContent(copy.visitStories.job);
  await expect(panel.getByRole('region', { name: copy.visitRecords })).toHaveTextContent(copy.visitStories.order);
  await expect(panel.getByText(copy.visitStories.timezone)).toBeVisible();
  await expect(panel.getByRole('link', { name: copy.viewVisit })).toHaveAttribute('href', copy.visitStories.visitHref);
} };
export const VisitScheduleCleared: Story = { args: { items: [{ ...visitNotification, title: copy.visitTitles.cleared, description: copy.visitStories.cleared,
  details: visitDetails.map(d => d.label === copy.visitAfter ? { ...d, value: copy.visitStories.noDate } : d) }] }, play: async ({ canvasElement }) => {
  const panel = within(await open(canvasElement)); await expect(panel.getByText(copy.visitStories.noDate)).toBeVisible();
} };
export const WorkOrderOnlyVisit: Story = { args: { items: [{ ...visitNotification, recordLabels: [copy.visitStories.order], href: copy.visitStories.orderHref, actionLabel: copy.viewWorkOrder }] }, play: async ({ canvasElement }) => {
  const panel = within(await open(canvasElement)); await expect(panel.queryByText(copy.visitStories.job)).not.toBeInTheDocument();
  await expect(panel.getByRole('link', { name: copy.viewWorkOrder })).toHaveAttribute('href', copy.visitStories.orderHref);
  await expect(panel.getAllByRole('listitem')).toHaveLength(2);
} };
export const WorkOrderJoinedVisit: Story = { args: { items: [{ ...visitNotification, title: copy.visitTitles.joined, description: copy.visitStories.joined, recordLabels: [copy.visitStories.order] }] }, play: async ({ canvasElement }) => { await open(canvasElement); } };
export const WorkOrderSeparatedVisit: Story = { args: { items: [{ ...visitNotification, title: copy.visitTitles.separated, description: copy.visitStories.separated, recordLabels: [copy.visitStories.order], href: copy.visitStories.orderHref, actionLabel: copy.viewWorkOrder }] }, play: async ({ canvasElement }) => { await open(canvasElement); } };
export const VisitMarkRead: Story = { args: { items: [visitNotification], unreadCount: 1 }, play: async ({ canvasElement, args }) => {
  const panel = within(await open(canvasElement)); await userEvent.click(panel.getByRole('button', { name: copy.markRead }));
  await expect(args.onMarkRead).toHaveBeenCalledOnce(); await expect(args.onMarkRead).toHaveBeenCalledWith(visitNotification.id);
  await expect(panel.queryByRole('button', { name: copy.markRead })).not.toBeInTheDocument();
  await userEvent.click(panel.getByRole('button', { name: copy.close }));
  await expect(within(canvasElement).getByRole('button', { name: copy.open(0) })).toHaveFocus();
} };
export const LongVisitDetails: Story = { args: { workspaceName: copy.stories.longWorkspace, items: [{ ...visitNotification, recordLabels: [copy.visitStories.job, copy.visitStories.longOrder] }] }, play: async ({ canvasElement }) => { await open(canvasElement); } };

const deadlineNotice = {
  id: 'preview-deadline-notification', title: copy.deadlineStories.title, description: copy.deadlineStories.description,
  createdAt: copy.stories.date, read: false, href: copy.deadlineStories.href, actionLabel: copy.viewJob,
  details: [{ label: copy.deadlineDate, value: copy.deadlineStories.deadline }, { label: copy.deadlineReminderDate, value: copy.deadlineStories.reminderDate }, { label: copy.visitTimezone, value: copy.visitStories.timezone }],
};
export const DeadlineReminder: Story = { args: { items: [deadlineNotice], unreadCount: 1 }, play: async ({ canvasElement }) => {
  const panel = within(await open(canvasElement));
  await expect(panel.getByText(copy.deadlineStories.title)).toBeVisible();
  await expect(panel.getByRole('link', { name: copy.viewJob })).toHaveAttribute('href', copy.deadlineStories.href);
} };
export const DeadlineMarkRead: Story = { args: { items: [deadlineNotice], unreadCount: 1 }, play: async ({ canvasElement, args }) => {
  const panel = within(await open(canvasElement));
  await userEvent.click(panel.getByRole('button', { name: copy.markRead }));
  await expect(args.onMarkRead).toHaveBeenCalledWith(deadlineNotice.id);
  await expect(panel.queryByRole('button', { name: copy.markRead })).not.toBeInTheDocument();
} };

const createdJobNotice = { id: 'preview-job-created', title: copy.jobTitles.created, description: copy.jobStories.description, createdAt: copy.stories.date,
  read: false, href: copy.jobStories.href, actionLabel: copy.viewJob };
export const JobCreated: Story = { args: { items: [createdJobNotice], unreadCount: 1 }, play: async ({ canvasElement }) => {
  const panel = within(await open(canvasElement));
  await expect(panel.getByText(copy.jobStories.description)).toBeVisible();
  await expect(panel.getByRole('link', { name: copy.viewJob })).toHaveAttribute('href', copy.jobStories.href);
} };
export const JobCreatedMarkRead: Story = { args: { items: [createdJobNotice], unreadCount: 1 }, play: async ({ canvasElement, args }) => {
  const panel = within(await open(canvasElement));
  await userEvent.click(panel.getByRole('button', { name: copy.markRead }));
  await expect(args.onMarkRead).toHaveBeenCalledOnce(); await expect(args.onMarkRead).toHaveBeenCalledWith(createdJobNotice.id);
  await expect(panel.queryByRole('button', { name: copy.markRead })).not.toBeInTheDocument();
} };


const statusJobNotice = { ...createdJobNotice, id: 'preview-job-status', title: copy.jobStatusTitles.changed, description: copy.jobStatusStories.description,
  details: [{ label: copy.jobBeforeStatus, value: copy.jobStatusLabels.scheduled }, { label: copy.jobAfterStatus, value: copy.jobStatusLabels['in-progress'] }] };
export const JobStatusChanged: Story = { args: { items: [statusJobNotice], unreadCount: 1 }, play: async ({ canvasElement }) => {
  const panel = within(await open(canvasElement));
  await expect(panel.getByText(copy.jobStatusLabels.scheduled, { exact: true })).toBeVisible();
  await expect(panel.getByText(copy.jobStatusLabels['in-progress'], { exact: true })).toBeVisible();
  await expect(panel.getByRole('link', { name: copy.viewJob })).toHaveAttribute('href', copy.jobStories.href);
} };
export const JobCompleted: Story = { args: { items: [{ ...statusJobNotice, title: copy.jobStatusTitles.completed,
  details: [{ label: copy.jobBeforeStatus, value: copy.jobStatusLabels['in-progress'] }, { label: copy.jobAfterStatus, value: copy.jobStatusLabels.completed }] }] }, play: async ({ canvasElement }) => { await open(canvasElement); } };
export const JobCanceled: Story = { args: { items: [{ ...statusJobNotice, title: copy.jobStatusTitles.canceled,
  details: [{ label: copy.jobBeforeStatus, value: copy.jobStatusLabels.scheduled }, { label: copy.jobAfterStatus, value: copy.jobStatusLabels.canceled }] }] }, play: async ({ canvasElement }) => { await open(canvasElement); } };
export const JobReopened: Story = { args: { items: [{ ...statusJobNotice, title: copy.jobStatusTitles.reopened,
  details: [{ label: copy.jobBeforeStatus, value: copy.jobStatusLabels.completed }, { label: copy.jobAfterStatus, value: copy.jobStatusLabels['needs-scheduling'] }] }] }, play: async ({ canvasElement }) => { await open(canvasElement); } };
export const JobStatusMarkRead: Story = { args: { items: [statusJobNotice], unreadCount: 1 }, play: async ({ canvasElement, args }) => {
  const panel = within(await open(canvasElement)); await userEvent.click(panel.getByRole('button', { name: copy.markRead }));
  await expect(args.onMarkRead).toHaveBeenCalledWith(statusJobNotice.id);
  await expect(panel.queryByRole('button', { name: copy.markRead })).not.toBeInTheDocument();
} };

const assignmentFixture = { kind: 'job' as const, event: 'assignment' as const, id: 'assignment-preview', jobNumber: copy.jobAssignmentStories.number, createdAt: copy.stories.date, read: false };
function assignmentStory(change: 'primary' | 'team' | 'updated' | 'removed'): Story {
  return { args: { items: [jobNotificationItem({ ...assignmentFixture, access: 'current', change, jobId: 'preview-assignment', jobTitle: copy.jobAssignmentStories.title, actorName: copy.jobAssignmentStories.actor }, 'preview-workspace', copy.stories.workspace)] },
    play: async ({ canvasElement }) => {
      const panel = within(await open(canvasElement));
      await expect(panel.getByRole('heading', { name: copy.jobAssignmentTitles[change] })).toBeVisible();
      await expect(panel.getByRole('link', { name: copy.viewJob })).toHaveAttribute('href', '/jobs/preview-assignment?workspace=preview-workspace');
    } };
}
export const JobPrimaryAssigned = assignmentStory('primary');
export const JobTeamAdded = assignmentStory('team');
export const JobAssignmentUpdated = assignmentStory('updated');
export const JobRemovedWithWorkspaceAccess = assignmentStory('removed');
export const JobAssignmentEnded: Story = {
  args: { items: [jobNotificationItem({ ...assignmentFixture, access: 'ended', change: 'removed' }, 'preview-workspace', copy.stories.workspace)] },
  play: async ({ canvasElement }) => {
    const panel = within(await open(canvasElement));
    await expect(panel.getByRole('heading', { name: copy.jobAssignmentTitles.removed })).toBeVisible();
    await expect(panel.queryByText(/Kitchen plumbing|Alex Rivera/)).not.toBeInTheDocument();
    await expect(panel.queryByRole('link', { name: copy.viewJob })).not.toBeInTheDocument();
    await expect(panel.getByRole('link', { name: copy.openHome })).toHaveAttribute('href', '/home?workspace=preview-workspace');
    await userEvent.click(panel.getByRole('button', { name: copy.markRead }));
    await expect(panel.getByText(copy.read, { exact: true })).toBeVisible();
  },
};

function deadlineStory(before: string | null, after: string | null): Story {
  return { args: { items: [jobNotificationItem({ ...assignmentFixture, event: 'deadline', before, after, timezone: copy.jobDeadlineStories.timezone,
    jobId: 'preview-deadline', jobTitle: copy.jobAssignmentStories.title, actorName: copy.jobAssignmentStories.actor }, 'preview-workspace', copy.stories.workspace)] },
    play: async ({ canvasElement }) => {
      const panel = within(await open(canvasElement));
      await expect(panel.getByRole('heading', { name: copy.jobDeadlineTitle(before, after) })).toBeVisible();
      await expect(panel.getByText(copy.jobPreviousDeadline)).toBeVisible();
      await expect(panel.getByText(copy.jobNewDeadline)).toBeVisible();
      await expect(panel.getByText(copy.jobDeadlineDate(before))).toBeVisible();
      await expect(panel.getByText(copy.jobDeadlineDate(after))).toBeVisible();
      await expect(panel.getByText(copy.jobDeadlineStories.timezone)).toBeVisible();
      await expect(panel.getByRole('link', { name: copy.viewJob })).toHaveAttribute('href', '/jobs/preview-deadline?workspace=preview-workspace');
      await userEvent.click(panel.getByRole('button', { name: copy.markRead }));
      await expect(panel.getByText(copy.read, { exact: true })).toBeVisible();
    } };
}
export const JobDeadlineChanged = deadlineStory(copy.jobDeadlineStories.before, copy.jobDeadlineStories.after);
export const JobDeadlineAdded = deadlineStory(null, copy.jobDeadlineStories.after);
export const JobDeadlineRemoved = deadlineStory(copy.jobDeadlineStories.before, null);
