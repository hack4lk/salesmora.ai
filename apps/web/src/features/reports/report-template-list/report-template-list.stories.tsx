import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ReportTemplateList, type ReportTemplateListItem } from './report-template-list';
import { reportTemplateListData as copy } from './report-template-list.data';

const templates: readonly ReportTemplateListItem[] = [
  { id: 'my-leads', name: 'My lead intake', viewLabel: 'New leads', periodLabel: 'Last 30 days, including today', assignmentLabel: 'Me', groupLabel: 'Source', allowedActions: ['run', 'edit', 'rename', 'delete'] },
  { id: 'monthly-review', name: 'October team review', viewLabel: 'New leads', periodLabel: '1 Oct 2026 to 31 Oct 2026 (fixed dates)', assignmentLabel: 'All authorized', groupLabel: 'Teammate', allowedActions: ['run', 'edit', 'rename', 'delete'] },
];
const meta = {
  title: 'Reports/ReportTemplateList',
  component: ReportTemplateList,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Personal saved configurations for one report area. Presentation and action requests only: no API, persistence or result snapshots. The host must provide currently authorized templates/capabilities, revalidate every run, and open reviewed editor or deletion-confirmation flows. Loading/error/denied states never expose supplied stale rows. Relative periods are named presets; custom periods are fixed dates.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><div className="max-w-4xl"><Story /></div></main>],
  args: { templates, canRead: true, canCreate: true, onCreate: fn(), onAction: fn(), onRetry: fn() },
} satisfies Meta<typeof ReportTemplateList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getAllByRole('article')).toHaveLength(2);
  await expect(c.getByText('Last 30 days, including today')).toBeVisible();
  await expect(c.getByText('1 Oct 2026 to 31 Oct 2026 (fixed dates)')).toBeVisible();
  for (const action of ['run', 'edit', 'rename', 'delete'] as const) {
    if (action === 'run') await userEvent.click(c.getByRole('button', { name: copy.actionLabel(copy.actions[action], templates[0].name) }));
    else {
      await userEvent.click(c.getByRole('button', { name: copy.menu(templates[0].name) }));
      await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole('menuitem', { name: copy.actions[action] }));
    }
    await expect(args.onAction).toHaveBeenLastCalledWith(templates[0], action);
  }
  await userEvent.click(c.getByRole('button', { name: copy.create }));
  await expect(args.onCreate).toHaveBeenCalledTimes(1);
  await expect(c.getAllByRole('article')).toHaveLength(2);
} };
export const Empty: Story = { args: { templates: [] }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('heading', { name: copy.emptyTitle })).toBeVisible();
  await expect(c.getAllByRole('button', { name: copy.create })).toHaveLength(1);
  await userEvent.click(c.getByRole('button', { name: copy.create }));
  await expect(args.onCreate).toHaveBeenCalledTimes(1);
} };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(c.queryByRole('article')).not.toBeInTheDocument();
  await expect(c.getAllByRole('button')).toHaveLength(1);
  await expect(c.getByRole('button', { name: copy.help })).toBeVisible();
} };
export const LoadFailure: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.failed);
  await expect(c.queryByRole('article')).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.retry }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(c.queryByRole('article')).not.toBeInTheDocument();
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
  await expect(c.queryByText(templates[0].name)).not.toBeInTheDocument();
} };
export const RunOnly: Story = { args: { canCreate: false, templates: [{ ...templates[0], allowedActions: ['run'] }] }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(within(c.getByRole('article')).queryByRole('button', { name: copy.menu(templates[0].name) })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.actionLabel(copy.actions.run, templates[0].name) }));
  await expect(args.onAction).toHaveBeenCalledWith(args.templates[0], 'run');
} };
export const RunUnavailable: Story = { args: { templates: [{ ...templates[0], allowedActions: ['edit', 'rename', 'delete'] }] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('button', { name: copy.actionLabel(copy.actions.run, templates[0].name) })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.menu(templates[0].name) }));
  const body = within(canvasElement.ownerDocument.body);
  await expect(await body.findByRole('menuitem', { name: copy.actions.edit })).toBeEnabled();
  await userEvent.keyboard('{Escape}');
} };
export const NoActions: Story = { args: { canCreate: false, templates: [{ ...templates[0], allowedActions: [] }] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('article')).toBeVisible();
  await expect(c.queryByRole('button', { name: copy.menu(templates[0].name) })).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: copy.actionLabel(copy.actions.run, templates[0].name) })).not.toBeInTheDocument();
} };
export const EmptyWithoutCreateAccess: Story = { args: { templates: [], canCreate: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.emptyReadOnly)).toBeVisible();
  await expect(c.queryByRole('button', { name: copy.create })).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { pendingIds: [templates[0].id] }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), cards = c.getAllByRole('article');
  for (const button of [
    within(cards[0]).getByRole('button', { name: copy.menu(templates[0].name) }),
    within(cards[0]).getByRole('button', { name: copy.actionLabel(copy.actions.run, templates[0].name) }),
  ]) {
    await expect(button).toBeDisabled();
    await userEvent.click(button);
  }
  await expect(args.onAction).not.toHaveBeenCalled();
  await expect(within(cards[0]).getByRole('status')).toHaveTextContent(copy.pending);
  await userEvent.click(within(cards[1]).getByRole('button', { name: copy.actionLabel(copy.actions.run, templates[1].name) }));
  await expect(args.onAction).toHaveBeenCalledWith(templates[1], 'run');
} };
export const KeyboardActions: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  c.getByRole('button', { name: copy.create }).focus();
  await userEvent.tab();
  await expect(c.getByRole('button', { name: copy.templateHelp(templates[0].name) })).toHaveFocus();
  await userEvent.tab();
  await expect(c.getByRole('button', { name: copy.actionLabel(copy.actions.run, templates[0].name) })).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(args.onAction).toHaveBeenCalledWith(templates[0], 'run');
  await userEvent.tab();
  const trigger = c.getByRole('button', { name: copy.menu(templates[0].name) });
  await expect(trigger).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  const body = within(canvasElement.ownerDocument.body);
  await expect(await body.findByRole('menuitem', { name: copy.actions.edit })).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}{Enter}');
  await expect(args.onAction).toHaveBeenLastCalledWith(templates[0], 'rename');
  await waitFor(() => expect(body.queryByRole('menu')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
export const TemplateHelp: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await expect(c.queryByText(copy.description)).not.toBeInTheDocument();
  for (const label of [copy.help, copy.templateHelp(templates[0].name)]) {
    const trigger = c.getByRole('button', { name: label });
    await userEvent.click(trigger);
    await expect(await body.findByRole('dialog', { name: label })).toHaveTextContent(copy.description);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  }
} };
export const LongContent: Story = { args: { templates: [{
  ...templates[0],
  name: 'Weekly review for the installation and service follow-up team / '.repeat(3),
  viewLabel: 'LongReportViewNameWithoutWordBreaks'.repeat(4),
  assignmentLabel: 'A teammate with a long display name for responsive layout review',
  groupLabel: 'A descriptive grouping label for the selected report view',
}] } };
export const Narrow: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
