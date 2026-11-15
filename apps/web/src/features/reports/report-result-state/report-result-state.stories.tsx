import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ReportResultState } from './report-result-state';
import { reportResultStateData as copy } from './report-result-state.data';

const meta = {
  title: 'Reports/ReportResultState',
  component: ReportResultState,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical report loading, failure and authorized-empty presentation from the connected prototype. The host must remove stale totals/evidence when showing loading, error or denied access; this component neither queries nor interprets rows. An empty result is not a failed or denied query. Only display safe user-facing server messages, never raw errors. Retry/edit are host requests, not direct API calls.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="max-w-4xl"><Story /></div></main>],
  args: { state: { kind: 'loading' }, canRead: true, canEdit: true, onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof ReportResultState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('heading', { name: copy.loadingTitle })).toBeVisible();
  await expect(c.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: { kind: 'error' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.error);
  await userEvent.click(c.getByRole('button', { name: copy.retry }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
  await userEvent.click(c.getByRole('button', { name: copy.edit }));
  await expect(args.onEdit).toHaveBeenCalledTimes(1);
  await expect(c.queryByText(copy.empty)).not.toBeInTheDocument();
} };
export const Empty: Story = { args: { state: { kind: 'empty' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.empty);
  await expect(c.queryByRole('button', { name: copy.retry })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.edit }));
  await expect(args.onEdit).toHaveBeenCalledTimes(1);
  await expect(args.onRetry).not.toHaveBeenCalled();
} };
export const PermissionDenied: Story = { args: { canRead: false, state: { kind: 'error', message: 'Previous report configuration details' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(c.queryByText('Previous report configuration details')).not.toBeInTheDocument();
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { state: { kind: 'error' }, pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.pending);
  for (const button of c.getAllByRole('button')) {
    await expect(button).toBeDisabled();
    await userEvent.click(button);
  }
  await expect(args.onRetry).not.toHaveBeenCalled();
  await expect(args.onEdit).not.toHaveBeenCalled();
} };
export const WithoutEditAccess: Story = { args: { state: { kind: 'error' }, canEdit: false }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('button', { name: copy.edit })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.retry }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const EmptyWithoutEditAccess: Story = { args: { state: { kind: 'empty' }, canEdit: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument();
} };
export const KeyboardRetry: Story = { args: { state: { kind: 'error' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  c.getByRole('button', { name: copy.retry }).focus();
  await userEvent.keyboard('{Enter}');
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
  await userEvent.tab();
  await expect(c.getByRole('button', { name: copy.edit })).toHaveFocus();
} };
export const NarrowSelection: Story = { args: { state: { kind: 'error', message: 'This report took too long to prepare. Narrow the date range or filters and try again.' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText('This report took too long to prepare. Narrow the date range or filters and try again.')).toBeVisible();
} };
export const LongContent: Story = { args: { state: { kind: 'error', message: 'Authorized-selection-guidance-'.repeat(30) } } };
