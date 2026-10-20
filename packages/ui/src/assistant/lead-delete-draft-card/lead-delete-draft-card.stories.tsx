import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LeadDeleteDraftCard, type LeadDeleteDraftCardProps, type LeadDeleteProposal } from './lead-delete-draft-card';
import { leadDeleteDraftCardData as copy } from './lead-delete-draft-card.data';
const draft: LeadDeleteProposal = {
  id: '00000000-0000-4000-8000-000000000001', inputHash: '0'.repeat(64),
  expiresAt: new Date(Date.now() + 900000).toISOString(), state: 'pending',
  lead: { id: '00000000-0000-4000-8000-000000000002', number: copy.stories.number, name: copy.stories.name },
  stage: 'contacted', archived: false,
};
function Preview(args: LeadDeleteDraftCardProps) {
  const [outcome, setOutcome] = useState<LeadDeleteProposal['state']>();
  return <LeadDeleteDraftCard {...args} draft={{ ...args.draft, state: outcome ?? args.draft.state }} onDecide={args.onDecide ? async (proposal, decision, confirmation) => {
    const result = await args.onDecide!(proposal, decision, confirmation);
    if (result.ok) setOutcome(decision === 'confirm' ? 'confirmed' : 'cancelled');
    return result;
  } : undefined}/>;
}
const meta = {
  title: 'Assistant/LeadDeleteDraftCard', component: LeadDeleteDraftCard,
  args: { draft, onDecide: fn<NonNullable<LeadDeleteDraftCardProps['onDecide']>>(async () => ({ ok: true })) },
  render: args => <Preview key={`${args.draft.id}:${args.draft.state}`} {...args}/>,
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-3xl bg-canvas p-4 sm:p-8">
    <h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1>
    <p className="mt-3 text-base leading-6 text-muted">{copy.stories.description}</p><Story/>
  </main>],
} satisfies Meta<typeof LeadDeleteDraftCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
  await expect(c.getByRole('textbox', { name: copy.confirmation })).toHaveValue(''); await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const ReadyToDelete: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.type(c.getByRole('textbox', { name: copy.confirmation }), draft.lead.number);
  await expect(c.getByRole('button', { name: copy.confirm })).toBeEnabled();
} };
export const Confirm: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.type(c.getByRole('textbox', { name: copy.confirmation }), draft.lead.number);
  await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(args.onDecide).toHaveBeenCalledWith(draft, 'confirm', draft.lead.number);
  await expect(c.getByRole('status')).toHaveTextContent(copy.states.confirmed); await expect(c.queryByRole('button')).not.toBeInTheDocument();
  await expect(c.queryByText(draft.lead.name, { exact: false })).not.toBeInTheDocument();
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.type(c.getByRole('textbox', { name: copy.confirmation }), copy.stories.wrong);
  await userEvent.click(c.getByRole('button', { name: copy.cancel }));
  await expect(args.onDecide).toHaveBeenCalledWith(draft, 'cancel', '');
  await expect(c.getByRole('status')).toHaveTextContent(copy.states.cancelled);
} };
export const ExactMatchOnly: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), input = c.getByRole('textbox', { name: copy.confirmation });
  for (const value of [copy.stories.wrong, draft.lead.number.toLowerCase(), draft.lead.number + ' ', 'yes']) {
    await userEvent.clear(input); await userEvent.type(input, value);
    await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
  }
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const EnterDoesNotDelete: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.type(c.getByRole('textbox', { name: copy.confirmation }), draft.lead.number);
  await userEvent.keyboard('{Enter}'); await expect(args.onDecide).not.toHaveBeenCalled();
  await expect(c.getByRole('button', { name: copy.confirm })).toBeEnabled();
} };
export const KeyboardConfirm: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.type(c.getByRole('textbox', { name: copy.confirmation }), draft.lead.number);
  await userEvent.tab(); await userEvent.keyboard('{Enter}'); await expect(args.onDecide).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('status')).toHaveTextContent(copy.states.confirmed);
} };
export const Saving: Story = { args: { onDecide: fn<NonNullable<LeadDeleteDraftCardProps['onDecide']>>(() => new Promise(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.type(c.getByRole('textbox', { name: copy.confirmation }), draft.lead.number);
  await userEvent.dblClick(c.getByRole('button', { name: copy.confirm })); await expect(args.onDecide).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled(); await expect(c.getByRole('textbox')).toBeDisabled();
  await expect(c.getByRole('status')).toHaveTextContent(copy.saving);
} };
export const FailedDecision: Story = { args: { onDecide: fn<NonNullable<LeadDeleteDraftCardProps['onDecide']>>(async () => ({ ok: false, message: copy.stories.error })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.type(c.getByRole('textbox', { name: copy.confirmation }), draft.lead.number);
  await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.stories.error); await expect(c.getByRole('textbox')).toHaveValue(draft.lead.number);
  await expect(c.getByRole('button', { name: copy.confirm })).toBeEnabled();
} };
export const Retry: Story = { args: { onDecide: fn<NonNullable<LeadDeleteDraftCardProps['onDecide']>>()
  .mockResolvedValueOnce({ ok: false, message: copy.stories.error }).mockResolvedValue({ ok: true }) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.type(c.getByRole('textbox', { name: copy.confirmation }), draft.lead.number);
  await userEvent.click(c.getByRole('button', { name: copy.confirm })); await expect(c.getByRole('alert')).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(args.onDecide).toHaveBeenCalledTimes(2); await expect(c.getByRole('status')).toHaveTextContent(copy.states.confirmed);
} };
export const WonLead: Story = { args: { draft: { ...draft, stage: 'won' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.won)).toBeVisible(); await expect(c.queryByRole('textbox')).not.toBeInTheDocument();
  await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled(); await expect(c.getByRole('button', { name: copy.cancel })).toBeEnabled();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const Archived: Story = { args: { draft: { ...draft, archived: true } } };
export const Lost: Story = { args: { draft: { ...draft, stage: 'lost' } } };
export const Confirmed: Story = { args: { draft: { ...draft, state: 'confirmed', lead: { ...draft.lead, name: '' }, stage: undefined, archived: undefined } } };
export const Cancelled: Story = { args: { draft: { ...draft, state: 'cancelled' } } };
export const Expired: Story = { args: { draft: { ...draft, expiresAt: '2020-01-01T00:00:00.000Z' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.states.expired);
  await expect(c.queryByRole('button')).not.toBeInTheDocument(); await expect(c.queryByRole('textbox')).not.toBeInTheDocument();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const Superseded: Story = { args: { draft: { ...draft, state: 'superseded' } } };
export const Conflict: Story = { args: { draft: { ...draft, state: 'conflict' } } };
export const Forbidden: Story = { args: { draft: { ...draft, state: 'forbidden' } } };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('textbox')).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled(); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { onDecide: undefined }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByRole('button')).not.toBeInTheDocument(); await expect(c.queryByRole('textbox')).not.toBeInTheDocument();
} };
export const MissingNumber: Story = { args: { draft: { ...draft, lead: { ...draft.lead, number: '' } } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.noNumber)).toBeVisible(); await expect(c.queryByRole('textbox')).not.toBeInTheDocument();
  await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
} };
export const LongContent: Story = { args: { draft: { ...draft, lead: { ...draft.lead, name: copy.stories.longName } } } };
export const PlainText: Story = { args: { draft: { ...draft, lead: { ...draft.lead, name: copy.stories.plainText } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.stories.plainText, { exact: false })).toBeVisible();
  await expect(canvasElement.querySelector('script')).toBeNull();
} };
export const InvalidDeadline: Story = { args: { draft: { ...draft, expiresAt: 'invalid' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.states.expired);
  await expect(c.queryByRole('button')).not.toBeInTheDocument(); await expect(args.onDecide).not.toHaveBeenCalled();
} };
function ReplacementPreview(args: LeadDeleteDraftCardProps) {
  const [replacement, setReplacement] = useState(false);
  return <><button type="button" className="min-h-11 cursor-pointer rounded-xl border border-line bg-white px-4 py-2 text-ink focus-visible:focus-ring" onClick={() => setReplacement(true)}>{copy.stories.replace}</button>
    <LeadDeleteDraftCard {...args} draft={replacement ? { ...args.draft, id: '00000000-0000-4000-8000-000000000003', inputHash: '1'.repeat(64) } : args.draft}/></>;
}
export const ReplacementResetsConfirmation: Story = { render: args => <ReplacementPreview {...args}/>, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.type(c.getByRole('textbox', { name: copy.confirmation }), draft.lead.number);
  await expect(c.getByRole('button', { name: copy.confirm })).toBeEnabled();
  await userEvent.click(c.getByRole('button', { name: copy.stories.replace }));
  await expect(c.getByRole('textbox')).toHaveValue(''); await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
} };

export const IncompleteSnapshot: Story = { args: { draft: { ...draft, stage: undefined, archived: undefined } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.incomplete)).toBeVisible();
  await expect(c.queryByRole('textbox')).not.toBeInTheDocument(); await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.cancel })).toBeEnabled();
} };
