import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { HomeTeamWorkloadWidget, type HomeTeamWorkloadItem } from './home-team-workload-widget';
import { homeTeamWorkloadWidgetData as copy } from './home-team-workload-widget.data';

const items: HomeTeamWorkloadItem[] = [
  { id: 'alex', name: 'Alex Morgan', activeJobs: 4, openLeads: 3 },
  { id: 'casey', name: 'Casey Reed', activeJobs: 3, openLeads: 2 },
  { id: 'jordan', name: 'Jordan Lee', activeJobs: 1, openLeads: 1 },
];
const meta = {
  title: 'Home/HomeTeamWorkloadWidget', component: HomeTeamWorkloadWidget, parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="mx-auto w-full max-w-2xl p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story /></main>],
  args: { state: { status: 'ready', items, total: 3 } },
} satisfies Meta<typeof HomeTeamWorkloadWidget>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getAllByRole('listitem')).toHaveLength(3);
  for (const item of items) {
    const element = c.getByRole('heading', { name: item.name }).closest('li');
    if (!element) throw new globalThis.Error('Missing teammate row');
    const row = within(element);
    await expect(row.getByText(copy.jobs(item.activeJobs))).toBeVisible();
    await expect(row.getByText(copy.leads(item.openLeads))).toBeVisible();
  }
  await expect(c.queryByRole('link')).not.toBeInTheDocument();
} };
export const AuthorizedDestinations: Story = { args: { state: { status: 'ready', total: 1, items: [{
  ...items[0],
  jobsHref: `/storybook-workload/jobs?workspace=${copy.stories.workspaceId}&owner=alex`,
  leadsHref: `/storybook-workload/leads?workspace=${copy.stories.workspaceId}&owner=alex`,
}] } }, play: async ({ canvasElement, args }) => {
  if (args.state.status !== 'ready') throw new globalThis.Error('Expected authorized fixture');
  const item = args.state.items[0], c = within(canvasElement);
  await expect(c.getByRole('link', { name: copy.jobsAction(item.name, item.activeJobs) })).toHaveAttribute('href', item.jobsHref);
  await expect(c.getByRole('link', { name: copy.leadsAction(item.name, item.openLeads) })).toHaveAttribute('href', item.leadsHref);
} };
export const ZeroAssignedWork: Story = { args: { state: { status: 'ready', items: [{ ...items[0], activeJobs: 0, openLeads: 0 }], total: 1 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.jobs(0))).toBeVisible(); await expect(c.getByText(copy.leads(0))).toBeVisible();
} };
export const Empty: Story = { args: { state: { status: 'ready', items: [], total: 0 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.empty)).toBeVisible(); await expect(c.queryByRole('list')).not.toBeInTheDocument();
} };
export const Restricted: Story = { args: { state: { status: 'restricted' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByRole('region', { name: copy.title })).not.toBeInTheDocument();
  for (const item of items) await expect(c.queryByText(item.name)).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: { status: 'loading' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(c.getByRole('region', { name: copy.title })).toHaveAttribute('aria-busy', 'true'); await expect(c.queryByRole('list')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: { status: 'error', onRetry: fn() } }, play: async ({ canvasElement, args }) => {
  if (args.state.status !== 'error') throw new globalThis.Error('Expected error fixture');
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.error);
  await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(args.state.onRetry).toHaveBeenCalledTimes(1);
} };
export const Retrying: Story = { args: { state: { status: 'error', onRetry: fn(), retrying: true } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.retry })).toBeDisabled();
} };
export const Keyboard: Story = { args: Error.args, play: async ({ canvasElement, args }) => {
  if (args.state.status !== 'error') throw new globalThis.Error('Expected error fixture');
  within(canvasElement).getByRole('button', { name: copy.retry }).focus(); await userEvent.keyboard('{Enter}');
  await expect(args.state.onRetry).toHaveBeenCalledTimes(1);
} };
export const FiveMemberLimit: Story = { args: { state: { status: 'ready', total: 6, items: Array.from({ length: 6 }, (_, index) => ({ id: `member-${index}`, name: `Teammate ${index + 1}`, activeJobs: 6 - index, openLeads: 1 })) } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getAllByRole('listitem')).toHaveLength(5); await expect(c.queryByText('Teammate 6')).not.toBeInTheDocument();
  await expect(c.getByText(copy.remainder(5, 6))).toBeVisible();
} };
export const DescriptionTooltip: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body), trigger = c.getByRole('button', { name: copy.about });
  trigger.focus(); await userEvent.keyboard('{Enter}'); const dialog = body.getByRole('dialog', { name: copy.about });
  await expect(within(dialog).getByText(copy.description)).toBeVisible(); await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(trigger).toHaveFocus());
} };
export const LongContent: Story = { args: { state: { status: 'ready', items: [{ ...items[0], name: 'Alexandra Morgan-Reed Community Services and Maintenance Coordinator', activeJobs: 123456, openLeads: 987654 }], total: 1 } } };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const LongContentMobile: Story = { args: LongContent.args, globals: Mobile.globals };
