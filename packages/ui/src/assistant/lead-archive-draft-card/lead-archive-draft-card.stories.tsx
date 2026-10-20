import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LeadArchiveDraftCard, type LeadArchiveDraftCardProps, type LeadArchiveProposal } from './lead-archive-draft-card';
import { leadArchiveDraftCardData as copy } from './lead-archive-draft-card.data';

const draft: LeadArchiveProposal = {
  id: '00000000-0000-4000-8000-000000000001', inputHash: '0'.repeat(64),
  expiresAt: new Date(Date.now() + 900000).toISOString(), state: 'pending',
  lead: { id: '00000000-0000-4000-8000-000000000002', number: copy.stories.number, name: copy.stories.name },
  from: false, to: true,
};
function Preview(args: LeadArchiveDraftCardProps) {
  const [outcome, setOutcome] = useState<LeadArchiveProposal['state']>();
  return <LeadArchiveDraftCard {...args} draft={{ ...args.draft, state: outcome ?? args.draft.state }} onDecide={args.onDecide ? async (proposal, decision) => {
    const result = await args.onDecide!(proposal, decision);
    if (result.ok) setOutcome(decision === 'confirm' ? 'confirmed' : 'cancelled');
    return result;
  } : undefined}/>;
}
const meta = {
  title: 'Assistant/LeadArchiveDraftCard', component: LeadArchiveDraftCard,
  args: { draft, onDecide: fn<NonNullable<LeadArchiveDraftCardProps['onDecide']>>(async () => ({ ok: true })) },
  render: args => <Preview key={`${args.draft.id}:${args.draft.state}`} {...args}/>,
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-3xl bg-canvas p-4 sm:p-8">
    <h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1>
    <p className="mt-3 text-base leading-6 text-muted">{copy.stories.description}</p><Story/>
  </main>],
} satisfies Meta<typeof LeadArchiveDraftCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = {};
export const Confirm: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.archive.confirm }));
  await expect(args.onDecide).toHaveBeenCalledWith(draft, 'confirm');
  await expect(c.getByRole('status')).toHaveTextContent(copy.archive.confirmed);
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.cancel }));
  await expect(args.onDecide).toHaveBeenCalledWith(draft, 'cancel');
  await expect(c.getByRole('status')).toHaveTextContent(copy.states.cancelled);
} };
export const KeyboardConfirm: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); c.getByRole('button', { name: copy.archive.confirm }).focus();
  await userEvent.keyboard('{Enter}'); await expect(args.onDecide).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('status')).toHaveTextContent(copy.archive.confirmed);
} };
export const Saving: Story = { args: { onDecide: fn<NonNullable<LeadArchiveDraftCardProps['onDecide']>>(() => new Promise(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.dblClick(c.getByRole('button', { name: copy.archive.confirm }));
  await expect(args.onDecide).toHaveBeenCalledTimes(1); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled();
  await expect(c.getByRole('status')).toHaveTextContent(copy.saving);
} };
export const FailedDecision: Story = { args: { onDecide: fn<NonNullable<LeadArchiveDraftCardProps['onDecide']>>(async () => ({ ok: false, message: copy.stories.error })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.archive.confirm }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.stories.error);
  await expect(c.getByRole('button', { name: copy.archive.confirm })).toBeEnabled();
} };
export const Restore: Story = { args: { draft: { ...draft, from: true, to: false } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('region', { name: copy.restore.title })).toBeVisible();
  await expect(c.getByRole('button', { name: copy.restore.confirm })).toBeEnabled();
  await expect(c.getByText(copy.restore.description)).toBeVisible();
} };
export const ConfirmRestore: Story = { args: { draft: { ...draft, from: true, to: false } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.restore.confirm }));
  await expect(args.onDecide).toHaveBeenCalledWith(expect.objectContaining({ from: true, to: false }), 'confirm');
  await expect(c.getByRole('status')).toHaveTextContent(copy.restore.confirmed);
} };
export const CancelRestore: Story = { args: { draft: { ...draft, from: true, to: false } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.cancel }));
  await expect(args.onDecide).toHaveBeenCalledWith(expect.objectContaining({ to: false }), 'cancel');
  await expect(c.getByRole('status')).toHaveTextContent(copy.states.cancelled);
} };
export const LongContent: Story = { args: { draft: { ...draft, lead: { ...draft.lead, name: copy.stories.longName } } } };
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
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.archive.confirm })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled(); await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { onDecide: undefined }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument();
} };
export const AlreadyArchived: Story = { args: { draft: { ...draft, from: true, to: true } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.archive.confirm })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.cancel })).toBeEnabled();
} };

export const AlreadyActive: Story = { args: { draft: { ...draft, from: false, to: false } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('button', { name: copy.restore.confirm })).toBeDisabled();
  await expect(c.getByText(copy.restore.unchanged)).toBeVisible();
} };
export const PlainText: Story = { args: { draft: { ...draft, lead: { ...draft.lead, name: copy.stories.plainText } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.stories.plainText)).toBeVisible();
  await expect(canvasElement.querySelector('script')).toBeNull();
} };
export const InvalidDeadline: Story = { args: { draft: { ...draft, expiresAt: 'invalid' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.states.expired);
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };

export const Restored: Story = { args: { draft: { ...draft, from: true, to: false, state: 'confirmed' } } };
export const KeyboardRestore: Story = { args: { draft: { ...draft, from: true, to: false } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); c.getByRole('button', { name: copy.restore.confirm }).focus();
  await userEvent.keyboard('{Enter}'); await expect(args.onDecide).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('status')).toHaveTextContent(copy.restore.confirmed);
} };
