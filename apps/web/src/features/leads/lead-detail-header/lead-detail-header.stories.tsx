import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Toast } from '@salesmora/ui';
import { LeadDetailHeader, type LeadDetailHeaderProps } from './lead-detail-header';
import { leadDetailHeaderData as copy } from './lead-detail-header.data';

function Preview(args: LeadDetailHeaderProps) {
  const [notice, setNotice] = useState<string>();
  return <><LeadDetailHeader {...args} onEdit={args.onEdit ? lead => { args.onEdit?.(lead); setNotice(copy.stories.requested(copy.edit)); } : undefined}
    onRequestArchive={args.onRequestArchive ? lead => { args.onRequestArchive?.(lead); setNotice(copy.stories.requested(copy.archive)); } : undefined}
    onRequestRestore={args.onRequestRestore ? lead => { args.onRequestRestore?.(lead); setNotice(copy.stories.requested(copy.restore)); } : undefined}
    onRequestDelete={args.onRequestDelete ? lead => { args.onRequestDelete?.(lead); setNotice(copy.stories.requested(copy.remove)); } : undefined}/>
    <Toast open={!!notice} kind="success" message={notice ?? ''} autoHideMs={2000} onClose={() => setNotice(undefined)}/></>;
}
const meta = { title: 'Leads/LeadDetailHeader', component: Preview, parameters: { layout: 'fullscreen' },
  args: { lead: copy.stories.lead, permissions: copy.stories.permissions, backHref: copy.stories.backHref, now: copy.stories.now, timezone: copy.stories.timezone,
    onEdit: fn(), onRequestArchive: fn(), onRequestRestore: fn(), onRequestDelete: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><p className="mb-6 mt-0 text-sm text-muted">{copy.stories.description}</p><Story/></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const ReadOnly: Story = { args: { permissions: { canEdit: false, canArchive: false, canRestore: false, canDelete: false, canCreateEstimate: false, canStartJob: false } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument();
} };
export const Archived: Story = { args: { lead: { ...copy.stories.lead, archived: true, needsAttention: false }, permissions: { ...copy.stories.permissions, canEdit: false } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByRole('button', { name: copy.archive })).not.toBeInTheDocument();await expect(c.getByRole('button', { name: copy.restore })).toBeEnabled();
} };
export const Won: Story = { args: { lead: { ...copy.stories.lead, stage: 'won', needsAttention: false } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);await expect(c.getByRole('button', { name: copy.remove })).toBeDisabled();await expect(args.onRequestDelete).not.toHaveBeenCalled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);await expect(c.getByRole('button', { name: copy.edit })).toBeDisabled();await expect(c.getByRole('link', { name: copy.back })).toHaveAttribute('aria-disabled', 'true');await expect(args.onEdit).not.toHaveBeenCalled();
} };
export const LongContent: Story = { args: { lead: { ...copy.stories.lead, name: copy.stories.longName, service: copy.stories.longService, businessName: copy.stories.longBusiness } } };
export const Narrow: Story = { ...LongContent, parameters: { viewport: { value: 'phone' } } };
export const EditRequest: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.edit }));await expect(args.onEdit).toHaveBeenCalledWith(args.lead);
} };
export const ArchiveRequest: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.archive }));await expect(args.onRequestArchive).toHaveBeenCalledWith(args.lead);
} };
export const RestoreRequest: Story = { args: Archived.args, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.restore }));await expect(args.onRequestRestore).toHaveBeenCalledWith(args.lead);
} };
export const DeleteReviewRequest: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.remove }));await expect(args.onRequestDelete).toHaveBeenCalledWith(args.lead);
} };
export const ComingSoon: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);await expect(c.getByRole('button', { name: `${copy.estimate} · ${copy.comingSoon}` })).toBeDisabled();await expect(c.getByRole('button', { name: `${copy.job} · ${copy.comingSoon}` })).toBeDisabled();
} };
