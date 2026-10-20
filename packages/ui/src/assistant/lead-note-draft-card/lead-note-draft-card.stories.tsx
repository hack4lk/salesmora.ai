import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LeadNoteDraftCard, type LeadNoteDraftCardProps, type LeadNoteProposal } from './lead-note-draft-card';
import { leadNoteDraftCardData as copy } from './lead-note-draft-card.data';

const draft: LeadNoteProposal = {
  id: '00000000-0000-4000-8000-000000000001', inputHash: '0'.repeat(64),
  expiresAt: new Date(Date.now() + 900000).toISOString(), state: 'pending',
  lead: { id: '00000000-0000-4000-8000-000000000002', number: copy.stories.number, name: copy.stories.name },
  body: copy.stories.body,
};
function Preview(args: LeadNoteDraftCardProps) {
  const [outcome, setOutcome] = useState<LeadNoteProposal['state']>();
  return <LeadNoteDraftCard {...args} draft={{ ...args.draft, state: outcome ?? args.draft.state }} onDecide={args.onDecide ? async (proposal, decision) => {
    const result = await args.onDecide!(proposal, decision);
    if (result.ok) setOutcome(decision === 'confirm' ? 'confirmed' : 'cancelled');
    return result;
  } : undefined}/>;
}
const meta = {
  title: 'Assistant/LeadNoteDraftCard', component: LeadNoteDraftCard,
  args: { draft, onDecide: fn<NonNullable<LeadNoteDraftCardProps['onDecide']>>(async () => ({ ok: true })) },
  render: args => <Preview key={`${args.draft.id}:${args.draft.state}`} {...args}/>,
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-3xl bg-canvas p-4 sm:p-8">
    <h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1>
    <p className="mt-3 text-base leading-6 text-muted">{copy.stories.description}</p><Story/>
  </main>],
} satisfies Meta<typeof LeadNoteDraftCard>;
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
export const Saving: Story = { args: { onDecide: fn<NonNullable<LeadNoteDraftCardProps['onDecide']>>(() => new Promise(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.dblClick(c.getByRole('button', { name: copy.confirm }));
  await expect(args.onDecide).toHaveBeenCalledTimes(1); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled();
  await expect(c.getByRole('status')).toHaveTextContent(copy.saving);
} };
export const FailedDecision: Story = { args: { onDecide: fn<NonNullable<LeadNoteDraftCardProps['onDecide']>>(async () => ({ ok: false, message: copy.stories.error })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.stories.error);
  await expect(c.getByRole('button', { name: copy.confirm })).toBeEnabled();
} };
export const Multiline: Story = { args: { draft: { ...draft, body: copy.stories.multiline } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.stories.multiline, { exact: true, normalizer: value => value })).toBeVisible();
} };
export const LongContent: Story = { args: { draft: { ...draft, lead: { ...draft.lead, name: copy.stories.longName }, body: copy.stories.longBody } } };
export const MaximumLength: Story = { args: { draft: { ...draft, body: copy.stories.repeatedText.repeat(100).slice(0, copy.maxLength) } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.confirm })).toBeEnabled();
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
export const Empty: Story = { args: { draft: { ...draft, body: '' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.cancel })).toBeEnabled();
  await expect(c.getByRole('alert')).toHaveTextContent(copy.emptyError);
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const WhitespaceOnly: Story = { args: { draft: { ...draft, body: '  \n  ' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.confirm })).toBeDisabled();
} };
export const TooLong: Story = { args: { draft: { ...draft, body: copy.stories.repeatedText.repeat(100).slice(0, copy.maxLength + 1) } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
  await expect(c.getByRole('alert')).toHaveTextContent(copy.tooLong);
} };
export const PlainText: Story = { args: { draft: { ...draft, body: copy.stories.plainText } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.stories.plainText, { exact: true, normalizer: value => value })).toBeVisible();
  await expect(canvasElement.querySelector('script')).toBeNull();
  await expect(canvasElement.querySelector('strong')).toBeNull();
} };
export const ThrownFailure: Story = { args: { onDecide: fn<NonNullable<LeadNoteDraftCardProps['onDecide']>>(async () => { throw Error('Fictional callback failure'); }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.failure);
  await expect(c.getByRole('button', { name: copy.confirm })).toBeEnabled();
} };
export const InvalidDeadline: Story = { args: { draft: { ...draft, expiresAt: 'invalid' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.states.expired);
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
