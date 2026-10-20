import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { SideDrawer, Toast } from '@salesmora/ui';
import { LeadCard, type LeadCardProps } from './lead-card';
import { leadCardData as copy } from './lead-card.data';

function Preview(args: LeadCardProps) {
  const [opened, setOpened] = useState(false), [requested, setRequested] = useState(false);
  return <>
    <LeadCard {...args} onOpen={args.onOpen ? lead => { args.onOpen?.(lead); setOpened(true); } : undefined}
      onRequestMove={args.onRequestMove ? lead => { args.onRequestMove?.(lead); setRequested(true); } : undefined}/>
    <SideDrawer open={opened} title={args.lead.name} description={args.lead.service} onClose={() => setOpened(false)}><p className="m-0 leading-6 text-muted">{copy.stories.quickView}</p></SideDrawer>
    <Toast open={requested} kind="success" message={copy.stories.requested} autoHideMs={null} onClose={() => setRequested(false)}/>
  </>;
}
const meta = { title: 'Leads/LeadCard', component: Preview, parameters: { layout: 'fullscreen' },
  args: { lead: copy.stories.lead, now: copy.stories.now, timezone: copy.stories.timezone, recordHref: copy.stories.href, onOpen: fn(), onRequestMove: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 text-muted">{copy.stories.description}</p><h2 className="sr-only">{copy.stories.preview}</h2><div className="w-full max-w-xs"><Story/></div></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Unassigned: Story = { args: { lead: { ...copy.stories.lead, owner: null, needsAttention: true } } };
export const NeedsAttention: Story = { args: { lead: { ...copy.stories.lead, createdAt: '2026-10-01T14:00:00.000Z', needsAttention: true } } };
export const ReadOnly: Story = { args: { lead: { ...copy.stories.lead, canMove: false } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: copy.more(copy.stories.lead.name) })).not.toBeInTheDocument();
} };
export const Updating: Story = { args: { disabled: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('button', { name: copy.more(copy.stories.lead.name) })).toBeDisabled();
  await userEvent.click(c.getByRole('article'));
  await expect(args.onOpen).not.toHaveBeenCalled();
  await expect(args.onRequestMove).not.toHaveBeenCalled();
} };
export const Archived: Story = { args: { lead: { ...copy.stories.lead, archived: true, canMove: false } } };
export const LongContent: Story = { args: { lead: { ...copy.stories.lead, name: copy.stories.longName, service: copy.stories.longService, owner: { id: 'taylor', name: copy.stories.longOwner }, needsAttention: true } } };
export const Narrow: Story = { ...LongContent, parameters: { viewport: { value: 'mobile1' } } };
export const RequestMove: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.more(copy.stories.lead.name) }));
  await userEvent.click(body.getByRole('menuitem', { name: copy.move }));
  await waitFor(() => expect(args.onRequestMove).toHaveBeenCalledWith(args.lead));
  await expect(args.onOpen).not.toHaveBeenCalled();
} };
export const LinkDoesNotOpenDrawer: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('link', { name: copy.stories.lead.name }));
  await expect(args.onOpen).not.toHaveBeenCalled();
} };
