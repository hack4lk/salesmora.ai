import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LeadUpdateDraftCard, type LeadUpdateDraftCardProps, type LeadUpdateProposal } from './lead-update-draft-card';
import { leadUpdateDraftCardData as copy } from './lead-update-draft-card.data';
const draft: LeadUpdateProposal = {
  id: '00000000-0000-4000-8000-000000000001', inputHash: '0'.repeat(64), expiresAt: new Date(Date.now() + 900000).toISOString(), state: 'pending',
  lead: { id: '00000000-0000-4000-8000-000000000002', number: copy.stories.number, name: copy.stories.name },
  changes: [{ field: 'phone', before: copy.stories.phone, after: copy.stories.newPhone }],
};
function Preview(args: LeadUpdateDraftCardProps) {
  const [outcome, setOutcome] = useState<LeadUpdateProposal['state']>();
  return <LeadUpdateDraftCard {...args} draft={{ ...args.draft, state: outcome ?? args.draft.state }} onDecide={args.onDecide ? async (proposal, decision) => {
    const result = await args.onDecide!(proposal, decision);
    if (result.ok) setOutcome(decision === 'confirm' ? 'confirmed' : 'cancelled');
    return result;
  } : undefined}/>;
}
const meta = {
  title: 'Assistant/LeadUpdateDraftCard', component: LeadUpdateDraftCard,
  args: { draft, onDecide: fn<NonNullable<LeadUpdateDraftCardProps['onDecide']>>(async () => ({ ok: true })) },
  render: args => <Preview key={`${args.draft.id}:${args.draft.state}`} {...args}/>,
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-3xl bg-canvas p-4 sm:p-8">
    <h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1>
    <p className="mt-3 text-base leading-6 text-muted">{copy.stories.description}</p><Story/>
  </main>],
} satisfies Meta<typeof LeadUpdateDraftCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = {};
export const MultipleFields: Story = { args: { draft: { ...draft, changes: [...draft.changes,
  { field: 'email', before: copy.stories.email, after: copy.stories.newEmail },
  { field: 'service', before: copy.stories.service, after: copy.stories.newService },
] } } };
export const AllEditableFields: Story = { args: { draft: { ...draft, changes: [...draft.changes,
  { field: 'name', before: copy.stories.name, after: copy.stories.longName },
  { field: 'email', before: copy.stories.email, after: copy.stories.newEmail },
  { field: 'service', before: copy.stories.service, after: copy.stories.newService },
  { field: 'address', before: copy.stories.address, after: copy.stories.newAddress },
  { field: 'details', before: copy.stories.details, after: copy.stories.newDetails },
  { field: 'notes', before: copy.stories.notes, after: copy.stories.newNotes },
  { field: 'source', before: 'other', after: 'referral' },
] } } };
export const ClearValue: Story = { args: { draft: { ...draft, changes: [{ field: 'phone', before: copy.stories.phone, after: '' }] } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.cleared)).toBeVisible();
} };
export const AddMissingValue: Story = { args: { draft: { ...draft, changes: [{ field: 'phone', before: '', after: copy.stories.newPhone }] } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.empty)).toBeVisible();
} };
export const LongContent: Story = { args: { draft: { ...draft, lead: { ...draft.lead, name: copy.stories.longName }, changes: [{ field: 'details', before: copy.stories.details, after: copy.stories.newDetails }] } } };
export const PlainText: Story = { args: { draft: { ...draft, changes: [{ field: 'notes', before: '', after: copy.stories.plainText }] } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.stories.plainText)).toBeVisible();
  await expect(canvasElement.querySelector('script')).toBeNull();
} };
export const Confirm: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(args.onDecide).toHaveBeenCalledWith(draft, 'confirm'); await expect(c.getByRole('status')).toHaveTextContent(copy.states.confirmed);
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.cancel }));
  await expect(args.onDecide).toHaveBeenCalledWith(draft, 'cancel'); await expect(c.getByRole('status')).toHaveTextContent(copy.states.cancelled);
} };
export const KeyboardConfirm: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), confirm = c.getByRole('button', { name: copy.confirm }); confirm.focus();
  await expect(confirm).toHaveFocus(); await userEvent.keyboard('{Enter}'); await expect(args.onDecide).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('status')).toHaveTextContent(copy.states.confirmed);
} };
export const Saving: Story = { args: { onDecide: fn<NonNullable<LeadUpdateDraftCardProps['onDecide']>>(() => new Promise(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.dblClick(c.getByRole('button', { name: copy.confirm }));
  await expect(args.onDecide).toHaveBeenCalledTimes(1); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled();
} };
export const FailedDecision: Story = { args: { onDecide: fn<NonNullable<LeadUpdateDraftCardProps['onDecide']>>(async () => ({ ok: false, message: copy.stories.error })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.stories.error); await expect(c.getByRole('button', { name: copy.confirm })).toBeEnabled();
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
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled(); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled();
} };
export const ReadOnly: Story = { args: { onDecide: undefined }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument();
} };
export const Unchanged: Story = { args: { draft: { ...draft, changes: [{ field: 'phone', before: copy.stories.phone, after: copy.stories.phone }] } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
  await expect(c.queryByRole('region', { name: copy.fields.phone })).not.toBeInTheDocument(); await expect(c.getByRole('status')).toHaveTextContent(copy.unchanged);
} };

export const StageAndPhone: Story = {
  args: { draft: { ...draft, stage: { from: 'new', to: 'contacted' }, changes: [{ field: 'phone', before: copy.stories.phone, after: copy.stories.combinedPhone }] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: copy.fields.stage })).toHaveTextContent('Contacted');
    await expect(canvas.getByRole('region', { name: copy.fields.phone })).toHaveTextContent(copy.stories.combinedPhone);
    await expect(canvas.getByRole('button', { name: copy.confirm })).toBeEnabled();
  },
};
export const StageOnlyEffectiveChange: Story = { args: { draft: { ...draft, changes: [], stage: { from: 'new', to: 'lost', reason: copy.stories.lostReason } } } };
