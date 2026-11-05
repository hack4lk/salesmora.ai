import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IntakeReviewList, type IntakeReviewListRow } from './intake-review-list';
import { intakeReviewListData as copy } from './intake-review-list.data';
import { dataTableData } from '../../../../../../packages/ui/src/data-display/data-table/data-table.data';
const rows: IntakeReviewListRow[] = copy.stories.names.map((name, i) => ({ id: `item-${i}`, name, contact: copy.stories.contacts[i], summary: copy.stories.summaries[i], source: { id: i % 2 ? 'website' : 'gmail', name: copy.stories.sourceNames[i % 2], type: i % 2 ? 'website' : 'gmail' }, status: 'awaiting', flags: i === 0 ? ['duplicate'] : i === 1 ? ['missing', 'uncertain'] : i === 3 ? ['capacity'] : [], receivedAt: '2026-10-29T14:30:00Z', canOpen: true, canReview: true }));
const meta = {
  title: 'Lead Capture/IntakeReviewList', component: IntakeReviewList, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><h1 className="m-0 text-heading font-semibold">{copy.stories.title}</h1><p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p><Story /></main>],
  args: { rows, canRead: true, timezone: 'America/New_York', onOpen: fn(), onRetry: fn() },
} satisfies Meta<typeof IntakeReviewList>;
export default meta;
type Story = StoryObj<typeof meta>;
const visibleContent = (canvas: HTMLElement) => { const c = within(canvas); return within(c.queryByRole('table') ?? c.getAllByRole('article')[0]); };
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.actionLabel(copy.review, rows[0].name!) })); await expect(args.onOpen).toHaveBeenCalledWith(rows[0]); await expect(c.queryByRole('checkbox')).not.toBeInTheDocument();
} };
export const Website: Story = { args: { rows: [rows[1]] } };
export const History: Story = { args: { rows: [{ ...rows[0], status: 'approved', source: { ...rows[0].source, name: copy.stories.sourceNames[2] } }, { ...rows[1], status: 'dismissed' }] }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.queryByRole('button', { name: copy.actionLabel(copy.review, rows[0].name!) })).not.toBeInTheDocument(); await userEvent.click(c.getByRole('button', { name: copy.actionLabel(copy.view, rows[0].name!) })); await expect(args.onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: rows[0].id, status: 'approved' }));
} };
export const ReadOnly: Story = { args: { rows: [{ ...rows[0], canReview: false }] }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.queryByRole('button', { name: copy.actionLabel(copy.review, rows[0].name!) })).not.toBeInTheDocument(); await userEvent.click(c.getByRole('button', { name: copy.actionLabel(copy.view, rows[0].name!) })); await expect(args.onOpen).toHaveBeenCalledWith(expect.objectContaining({ canReview: false }));
} };
export const RestrictedDetails: Story = { args: { rows: [{ ...rows[0], canOpen: false }] }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.queryByRole('button')).not.toBeInTheDocument(); await expect(visibleContent(canvasElement).getByText(copy.restricted)).toBeVisible(); } };
export const MissingValues: Story = { args: { rows: [{ ...rows[0], name: '', contact: undefined, summary: '', receivedAt: null, flags: ['missing'] }] }, play: async ({ canvasElement }) => { for (const text of [copy.unnamed, copy.noContact, copy.noSummary, copy.unknownDate]) await expect(visibleContent(canvasElement).getByText(text, { exact: true })).toBeVisible(); } };
export const Pending: Story = { args: { rows: [rows[0]], pendingIds: [rows[0].id] }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); const button = c.getByRole('button'); await expect(button).toBeDisabled(); await userEvent.click(button); await expect(args.onOpen).not.toHaveBeenCalled(); } };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('region', { name: copy.caption })).toHaveAttribute('aria-busy', 'true'); await expect(c.queryByText(rows[0].name!)).not.toBeInTheDocument(); } };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.error); await userEvent.click(c.getByRole('button', { name: dataTableData.retry })); await expect(args.onRetry).toHaveBeenCalledTimes(1); await expect(c.queryByText(rows[0].name!)).not.toBeInTheDocument(); } };
export const Empty: Story = { args: { rows: [] } };
export const NoMatches: Story = { args: { rows: [], filtered: true } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByText(rows[0].name!)).not.toBeInTheDocument(); await expect(c.queryByRole('button')).not.toBeInTheDocument(); } };
export const InvalidTimestamp: Story = { args: { rows: [{ ...rows[0], receivedAt: 'invalid' }] }, play: async ({ canvasElement }) => { await expect(visibleContent(canvasElement).getByText(copy.unknownDate)).toBeVisible(); } };
export const InvalidTimezone: Story = { args: { rows: [rows[0]], timezone: 'invalid/zone' }, play: async ({ canvasElement }) => { await expect(visibleContent(canvasElement).getByText(copy.unknownDate)).toBeVisible(); } };
export const UntrustedContent: Story = { args: { rows: [{ ...rows[0], name: copy.stories.untrusted, summary: copy.stories.untrusted }] }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(visibleContent(canvasElement).getAllByText(copy.stories.untrusted)).toHaveLength(2); await expect(c.queryByRole('img')).not.toBeInTheDocument(); } };
export const LongContent: Story = { args: { rows: [{ ...rows[0], name: copy.stories.long.repeat(2), contact: `long${'contact'.repeat(10)}@example.com`, summary: copy.stories.long.repeat(3), source: { ...rows[0].source, name: copy.stories.long }, flags: ['duplicate', 'missing', 'uncertain', 'capacity'] }] } };
export const Keyboard: Story = { args: { rows: [rows[0]] }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); const button = c.getByRole('button', { name: copy.actionLabel(copy.review, rows[0].name!) }); button.focus(); await userEvent.keyboard('{Enter}'); await expect(args.onOpen).toHaveBeenCalledTimes(1); } };
