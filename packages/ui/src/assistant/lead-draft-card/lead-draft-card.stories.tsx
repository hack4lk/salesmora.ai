import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LeadDraftCard, type LeadDraftProposal, type LeadDraftCardProps } from './lead-draft-card';
import { leadDraftCardData as copy } from './lead-draft-card.data';
const draft: LeadDraftProposal = { id: '00000000-0000-4000-8000-000000000001', inputHash: '0'.repeat(64), state: 'pending', expiresAt: new Date(Date.now() + 900000).toISOString(), ownerName: '',
  lead: { name: copy.stories.name, service: copy.stories.service, email: copy.stories.email, phone: '', address: copy.stories.address, details: copy.stories.details, notes: '', source: 'other', stage: 'new', ownerId: '' } };
const meta = { title: 'Assistant/LeadDraftCard', component: LeadDraftCard, decorators: [(Story) => <main className="mx-auto w-full max-w-3xl bg-assistant-surface p-4 text-assistant-foreground"><Story /></main>], args: { draft, onDecide: fn<NonNullable<LeadDraftCardProps['onDecide']>>(async () => ({ ok: true })) } } satisfies Meta<typeof LeadDraftCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.stories.name)).toBeVisible(); await expect(c.getByText(copy.unassigned)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.confirm })); await expect(args.onDecide).toHaveBeenCalledWith(draft, 'confirm');
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: copy.cancel })); await expect(args.onDecide).toHaveBeenCalledWith(draft, 'cancel'); } };
export const Saving: Story = { args: { onDecide: fn<NonNullable<LeadDraftCardProps['onDecide']>>(() => new Promise(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.dblClick(c.getByRole('button', { name: copy.confirm })); await expect(args.onDecide).toHaveBeenCalledTimes(1); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled();
} };
export const FailedDecision: Story = { args: { onDecide: fn<NonNullable<LeadDraftCardProps['onDecide']>>(async () => ({ ok: false, message: copy.stories.error })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm })); await expect(c.getByRole('alert')).toHaveTextContent(copy.stories.error);
} };
export const Confirmed: Story = { args: { draft: { ...draft, state: 'confirmed', leadId: '00000000-0000-4000-8000-000000000002' } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument(); } };
export const Cancelled: Story = { args: { draft: { ...draft, state: 'cancelled' } } };
export const Expired: Story = { args: { draft: { ...draft, state: 'expired' } } };
export const Superseded: Story = { args: { draft: { ...draft, state: 'superseded' } } };
