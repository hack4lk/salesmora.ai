import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LeadDetailsCard, type LeadDetailsCardProps, type LeadDetailsResult } from './lead-details-card';
import { leadDetailsCardData as copy } from './lead-details-card.data';
const result: LeadDetailsResult = {
  id: '00000000-0000-4000-8000-000000000001', scope: 'workspace', retrievedAt: copy.stories.retrievedAt,
  lead: { id: '00000000-0000-4000-8000-000000000002', number: copy.stories.number, name: copy.stories.name,
    service: copy.stories.service, stage: 'contacted', source: 'website', ownerName: copy.stories.owner, archived: false,
    email: copy.stories.email, phone: copy.stories.phone, address: copy.stories.address, details: copy.stories.details, notes: copy.stories.notes },
};
function Preview(args: LeadDetailsCardProps) {
  const [notice, setNotice] = useState<string>();
  return <><LeadDetailsCard {...args} onOpenLead={args.onOpenLead ? id => { args.onOpenLead!(id); setNotice(copy.stories.opened(id)); } : undefined}/>
    {notice && <p role="status" className="text-sm leading-6 text-ink wrap-anywhere">{notice}</p>}</>;
}
const meta = {
  title: 'Assistant/LeadDetailsCard', component: LeadDetailsCard,
  args: { result, onOpenLead: fn() }, render: args => <Preview {...args}/>,
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-3xl bg-canvas p-4 sm:p-8">
    <h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1>
    <p className="mt-3 text-base leading-6 text-muted">{copy.stories.description}</p><Story/>
  </main>],
} satisfies Meta<typeof LeadDetailsCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText(`${copy.stories.number} · ${copy.stories.name}`)).toBeVisible();
  for (const value of [copy.stories.email, copy.stories.phone, copy.stories.details, copy.stories.notes]) await expect(c.getByText(value, { exact: true, normalizer: text => text })).toBeVisible();
  await expect(c.getByRole('button', { name: copy.openLabel(copy.stories.number) })).toBeEnabled();
  await expect(c.queryByRole('link')).not.toBeInTheDocument();
} };
export const OpenRecord: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.openLabel(copy.stories.number) }));
  await expect(args.onOpenLead).toHaveBeenCalledTimes(1); await expect(args.onOpenLead).toHaveBeenCalledWith(result.lead.id);
  await expect(c.getByRole('status')).toHaveTextContent(copy.stories.opened(result.lead.id));
} };
export const KeyboardOpen: Story = { play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: copy.openLabel(copy.stories.number) }); button.focus();
  await userEvent.keyboard('{Enter}'); await expect(args.onOpenLead).toHaveBeenCalledWith(result.lead.id);
} };
export const AssignedScope: Story = { args: { result: { ...result, scope: 'assigned' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.assigned)).toBeVisible();
} };
export const Unassigned: Story = { args: { result: { ...result, lead: { ...result.lead, ownerName: null } } } };
export const FormerTeammate: Story = { args: { result: { ...result, lead: { ...result.lead, ownerName: copy.stories.former } } } };
export const Archived: Story = { args: { result: { ...result, lead: { ...result.lead, archived: true } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.archiveNotice)).toBeVisible();
} };
export const MissingContact: Story = { args: { result: { ...result, lead: { ...result.lead, email: '', phone: '', address: '' } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getAllByText(copy.missing)).toHaveLength(3);
} };
export const MissingRequestAndNotes: Story = { args: { result: { ...result, lead: { ...result.lead, details: '', notes: '' } } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.noDetails)).toBeVisible(); await expect(c.getByText(copy.noNotes)).toBeVisible();
} };
export const MissingService: Story = { args: { result: { ...result, lead: { ...result.lead, service: '' } } } };
export const LongContent: Story = { args: { result: { ...result, lead: { ...result.lead, name: copy.stories.longName, service: copy.stories.longService, ownerName: copy.stories.longOwner,
  email: copy.stories.longEmail, address: copy.stories.longAddress, details: copy.stories.longDetails.repeat(5), notes: copy.stories.notes.repeat(5) } } } };
export const MaximumText: Story = { args: { result: { ...result, lead: { ...result.lead, details: copy.stories.longDetails.repeat(100).slice(0, 10000), notes: copy.stories.notes.repeat(100).slice(0, 10000) } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.openLabel(copy.stories.number) })).toBeVisible();
} };
export const PlainText: Story = { args: { result: { ...result, lead: { ...result.lead, details: copy.stories.plainText, notes: copy.stories.plainText, phone: 'javascript:alert(1)', email: '<img src=x onerror=alert(1)>@example.test' } } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getAllByText(copy.stories.plainText, { exact: true, normalizer: text => text })).toHaveLength(2);
  await expect(canvasElement.querySelector('script, img, a')).toBeNull();
} };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement, args }) => {
  await expect(within(canvasElement).getByRole('button')).toBeDisabled(); await expect(args.onOpenLead).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { onOpenLead: undefined }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByRole('button')).not.toBeInTheDocument(); await expect(c.getByText(copy.stories.email)).toBeVisible();
} };
const hidden: NonNullable<Story['play']> = async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const text of [copy.stories.name, copy.stories.email, copy.stories.phone, copy.stories.details, copy.stories.notes]) await expect(c.queryByText(text, { exact: false, normalizer: value => value })).not.toBeInTheDocument();
  await expect(c.queryByRole('button')).not.toBeInTheDocument(); await expect(c.queryByText(copy.workspace)).not.toBeInTheDocument();
  await expect(canvasElement.querySelector('time')).toBeNull(); await expect(args.onOpenLead).not.toHaveBeenCalled();
};
export const Loading: Story = { args: { state: 'loading' }, play: hidden };
export const Failed: Story = { args: { state: 'error' }, play: hidden };
export const Forbidden: Story = { args: { state: 'forbidden' }, play: hidden };
export const Stale: Story = { args: { state: 'stale' }, play: hidden };
export const UnavailableLead: Story = { args: { state: 'notFound' }, play: hidden };
export const MissingResult: Story = { args: { result: undefined }, play: hidden };
export const MissingIdentity: Story = { args: { result: { ...result, lead: { ...result.lead, id: '' } } }, play: hidden };
export const MissingNumber: Story = { args: { result: { ...result, lead: { ...result.lead, number: '' } } }, play: hidden };
export const InvalidTimestamp: Story = { args: { result: { ...result, retrievedAt: 'invalid' } }, play: hidden };
export const EveryStage: Story = { render: args => <div className="grid gap-4">{(Object.keys(copy.stages) as Array<keyof typeof copy.stages>).map(stage => <LeadDetailsCard {...args} key={stage} result={{ ...result, lead: { ...result.lead, stage } }}/>)}</div> };
export const EverySource: Story = { render: args => <div className="grid gap-4">{(Object.keys(copy.sources) as Array<keyof typeof copy.sources>).map(source => <LeadDetailsCard {...args} key={source} result={{ ...result, lead: { ...result.lead, source } }}/>)}</div> };

function WithdrawalPreview(args: LeadDetailsCardProps) {
  const [withdrawn, setWithdrawn] = useState(false);
  return <><button type="button" onClick={() => setWithdrawn(true)} className="min-h-11 cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring">{copy.stories.withdraw}</button>
    <LeadDetailsCard {...args} state={withdrawn ? 'forbidden' : 'ready'}/></>;
}
export const RevokedWhileOpen: Story = { render: args => <WithdrawalPreview {...args}/>, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.stories.email)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.stories.withdraw }));
  const card = within(c.getByRole('region', { name: copy.title }));
  await expect(card.getByRole('status')).toHaveTextContent(copy.states.forbidden);
  await expect(card.queryByText(copy.stories.email)).not.toBeInTheDocument(); await expect(card.queryByRole('button')).not.toBeInTheDocument();
  await expect(args.onOpenLead).not.toHaveBeenCalled();
} };
export const MissingName: Story = { args: { result: { ...result, lead: { ...result.lead, name: '   ' } } }, play: hidden };
export const InvalidStage: Story = { args: { result: { ...result, lead: { ...result.lead, stage: '__proto__' as LeadDetailsResult['lead']['stage'] } } }, play: hidden };
