import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ReportAreaCatalog } from './report-area-catalog';
import { reportAreaCatalogAreas as areas } from './report-area-catalog.fixtures';
import { reportAreaCatalogData as copy } from './report-area-catalog.data';

const meta = {
  title: 'Reports/ReportAreaCatalog',
  component: ReportAreaCatalog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical nine-area catalog from the connected prototype. Hosts supply authorized report availability, safe access explanations and current-user/workspace template counts. No report totals, access inference, API or navigation implementation. Non-ready and denied states suppress stale cards and counts.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-6xl"><Story /></div></main>],
  args: { areas, canRead: true, onOpen: fn(), onRetry: fn() },
} satisfies Meta<typeof ReportAreaCatalog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  expect(c.queryByText(/Showing your currently authorized/)).not.toBeInTheDocument();
  expect(c.queryByText('All standard reports are available on every plan, subject to access.')).not.toBeInTheDocument();
  await expect(c.getAllByRole('article')).toHaveLength(9);
  await expect(c.getByText('1 personal template')).toBeVisible();
  for (const card of c.getAllByRole('article')) {
    await expect(within(card).getByRole('button', { name: /^View my templates:/ })).toHaveTextContent(copy.templates);
  }
  for (const area of areas.filter(item => item.access.allowed)) {
    await userEvent.click(c.getByRole('button', { name: copy.action(area.label) }));
    await expect(args.onOpen).toHaveBeenLastCalledWith(area.id);
  }
  await expect(args.onOpen).toHaveBeenCalledTimes(8);
} };
export const OverviewShortcut: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.overviewAction }));
  await expect(args.onOpen).toHaveBeenCalledWith('overview');
} };
export const KeyboardNavigation: Story = { play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: copy.action(areas[1].label) });
  button.focus();
  await userEvent.keyboard('{Enter}');
  await expect(args.onOpen).toHaveBeenCalledWith('leads');
} };
export const AllAreasAvailable: Story = { args: { areas: areas.map(area => ({ ...area, access: { allowed: true, templateCount: 0 } })) }, play: async ({ canvasElement }) => {
  for (const button of within(canvasElement).getAllByRole('button')) await expect(button).toBeEnabled();
} };
export const RestrictedArea: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  const button = c.getByRole('button', { name: copy.action(areas[8].label) });
  await expect(button).toBeDisabled();
  await userEvent.click(button);
  await expect(args.onOpen).not.toHaveBeenCalled();
  await expect(c.getByText('Financial report and applicable money permissions required.')).toBeVisible();
} };
export const AssignedScope: Story = { args: { areas: areas.slice(1,4) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getAllByRole('article')).toHaveLength(3);
  await expect(c.queryByRole('button', { name: copy.overviewAction })).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(c.queryByRole('article')).not.toBeInTheDocument();
  await expect(c.queryByText('2 personal templates')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.failed);
  await expect(c.queryByRole('article')).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.retry }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const Empty: Story = { args: { areas: [] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.empty)).toBeVisible();
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(c.queryByRole('article')).not.toBeInTheDocument();
  await expect(c.queryByText(areas[0].label)).not.toBeInTheDocument();
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.pending);
  for (const button of c.getAllByRole('button').filter(button => !button.hasAttribute('aria-haspopup'))) {
    await expect(button).toBeDisabled();
    await userEvent.click(button);
  }
  await expect(args.onOpen).not.toHaveBeenCalled();
  await expect(c.getByRole('button', { name: copy.overviewHelp })).toBeEnabled();
} };
export const TitleTooltips: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  for (const [label, description] of [
    [copy.overviewHelp, copy.overviewDescription],
    ...areas.map(area => [copy.areaHelp(area.label), area.description]),
  ]) {
    await expect(c.queryByText(description)).not.toBeInTheDocument();
    const trigger = c.getByRole('button', { name: label });
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', { name: label });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(within(dialog).getByText(description)).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  }
  await userEvent.keyboard('{Enter}');
  const keyboardDialog = await body.findByRole('dialog', { name: copy.areaHelp(areas[8].label) });
  await waitFor(() => expect(keyboardDialog).toBeVisible());
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(args.onOpen).not.toHaveBeenCalled();
} };
export const LongContent: Story = { args: { areas: [{ ...areas[0], label: 'Business-overview-'.repeat(12), description: 'Period-intake-and-current-operations-'.repeat(15) }] } };
