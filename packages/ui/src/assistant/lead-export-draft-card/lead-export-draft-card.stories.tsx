import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LeadExportDraftCard, type LeadExportDraftCardProps, type LeadExportProposal } from './lead-export-draft-card';
import { leadExportDraftCardData as copy } from './lead-export-draft-card.data';

const draft: LeadExportProposal = {
  id: '00000000-0000-4000-8000-000000000001', inputHash: '0'.repeat(64),
  expiresAt: new Date(Date.now() + 900000).toISOString(), state: 'pending',
  scope: 'workspace', filterLabels: copy.stories.filters, includeArchived: false, count: 248, rowLimit: 10000,
};
function Preview(args: LeadExportDraftCardProps) {
  const [outcome, setOutcome] = useState<LeadExportProposal['state']>();
  return <LeadExportDraftCard {...args} draft={{ ...args.draft, state: outcome ?? args.draft.state }} onDecide={args.onDecide ? async (proposal, decision) => {
    const result = await args.onDecide!(proposal, decision);
    if (result.ok) setOutcome(decision === 'confirm' ? 'confirmed' : 'cancelled');
    return result;
  } : undefined}/>;
}
const meta = {
  title: 'Assistant/LeadExportDraftCard', component: LeadExportDraftCard,
  args: { draft, onDecide: fn<NonNullable<LeadExportDraftCardProps['onDecide']>>(async () => ({ ok: true })) },
  render: args => <Preview key={`${args.draft.id}:${args.draft.state}`} {...args}/>,
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-3xl bg-canvas p-4 sm:p-8">
    <h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1>
    <p className="mt-3 text-base leading-6 text-muted">{copy.stories.description}</p><Story/>
  </main>],
} satisfies Meta<typeof LeadExportDraftCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = {};
export const Confirm: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(args.onDecide).toHaveBeenCalledWith(draft, 'confirm');
  await expect(c.getByRole('status')).toHaveTextContent(copy.states.confirmed);
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.cancel }));
  await expect(args.onDecide).toHaveBeenCalledWith(draft, 'cancel');
  await expect(c.getByRole('status')).toHaveTextContent(copy.states.cancelled);
} };
export const KeyboardConfirm: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); c.getByRole('button', { name: copy.confirm }).focus();
  await userEvent.keyboard('{Enter}'); await expect(args.onDecide).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('status')).toHaveTextContent(copy.states.confirmed);
} };
export const Saving: Story = { args: { onDecide: fn<NonNullable<LeadExportDraftCardProps['onDecide']>>(() => new Promise(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.dblClick(c.getByRole('button', { name: copy.confirm }));
  await expect(args.onDecide).toHaveBeenCalledTimes(1); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled();
  await expect(c.getByRole('status')).toHaveTextContent(copy.saving);
} };
export const FailedDecision: Story = { args: { onDecide: fn<NonNullable<LeadExportDraftCardProps['onDecide']>>(async () => ({ ok: false, message: copy.stories.error })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.stories.error);
  await expect(c.getByRole('button', { name: copy.confirm })).toBeEnabled();
} };
export const Confirmed: Story = { args: { draft: { ...draft, state: 'confirmed' } } };
export const Cancelled: Story = { args: { draft: { ...draft, state: 'cancelled' } } };
export const Expired: Story = { args: { draft: { ...draft, expiresAt: '2020-01-01T00:00:00.000Z' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.states.expired);
  await expect(c.queryByRole('button')).not.toBeInTheDocument(); await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const Superseded: Story = { args: { draft: { ...draft, state: 'superseded' } } };
export const Conflict: Story = { args: { draft: { ...draft, state: 'conflict' } } };
export const Forbidden: Story = { args: { draft: { ...draft, state: 'forbidden' } } };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled(); await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { onDecide: undefined }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument();
} };
export const AssignedScope: Story = { args: { draft: { ...draft, scope: 'assigned', count: 5 } } };
export const IncludesArchived: Story = { args: { draft: { ...draft, includeArchived: true } } };
export const NoFilters: Story = { args: { draft: { ...draft, filterLabels: [] } } };
export const Empty: Story = { args: { draft: { ...draft, count: 0 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.cancel })).toBeEnabled(); await expect(c.getByText(copy.empty)).toBeVisible();
} };
export const OverLimit: Story = { args: { draft: { ...draft, count: 10001 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
  await expect(c.getByText(copy.overLimit(10000))).toBeVisible();
} };
export const AtLimit: Story = { args: { draft: { ...draft, count: 10000 } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.confirm })).toBeEnabled();
} };
export const CountUnavailable: Story = { args: { draft: { ...draft, count: null } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
  await expect(c.getByText(copy.unavailable)).toBeVisible();
} };
export const InvalidLimit: Story = { args: { draft: { ...draft, rowLimit: 0 } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.confirm })).toBeDisabled();
} };
export const LongFilters: Story = { args: { draft: { ...draft, filterLabels: [...copy.stories.filters, copy.stories.longFilter] } } };
export const PlainText: Story = { args: { draft: { ...draft, filterLabels: [copy.stories.plainText] } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.stories.plainText)).toBeVisible();
  await expect(canvasElement.querySelector('script')).toBeNull();
} };
export const Columns: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByText(copy.columnsLabel));
  await expect(c.getByText(copy.columns)).toBeVisible(); await expect(c.getByText(copy.notes)).toBeVisible();
} };
export const InvalidDeadline: Story = { args: { draft: { ...draft, expiresAt: 'invalid' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.states.expired);
  await expect(c.queryByRole('button')).not.toBeInTheDocument(); await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const Retry: Story = { args: { onDecide: fn<NonNullable<LeadExportDraftCardProps['onDecide']>>()
  .mockResolvedValueOnce({ ok: false, message: copy.stories.error }).mockResolvedValue({ ok: true }) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.stories.error);
  await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(args.onDecide).toHaveBeenCalledTimes(2); await expect(c.getByRole('status')).toHaveTextContent(copy.states.confirmed);
} };
