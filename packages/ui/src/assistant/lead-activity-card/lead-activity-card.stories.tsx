import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LeadActivityCard, type LeadActivityEntry, type LeadActivityCardProps, type LeadActivityResult } from './lead-activity-card';
import { leadActivityCardData as copy } from './lead-activity-card.data';
const common = { actorName: copy.stories.actor, createdAt: '2026-10-17T13:00:00.000Z' };
const note: LeadActivityEntry = { ...common, id: 'note', kind: 'note', body: copy.stories.note, viaAssistant: true };
const entries: LeadActivityEntry[] = [
  { ...common, id: 'restored', kind: 'restored', createdAt: '2026-10-17T14:00:00.000Z' },
  note,
  { ...common, id: 'stage', kind: 'stage', from: 'new', to: 'contacted', createdAt: '2026-10-17T12:00:00.000Z' },
  { ...common, id: 'edit', kind: 'edited', changes: [{ field: 'phone', before: copy.stories.oldPhone, after: copy.stories.newPhone }], createdAt: '2026-10-17T11:00:00.000Z' },
  { ...common, id: 'assign', kind: 'assigned', from: null, to: { name: copy.stories.teammate }, createdAt: '2026-10-17T10:00:00.000Z' },
  { ...common, id: 'archive', kind: 'archived', createdAt: '2026-10-17T13:30:00.000Z' },
  { ...common, id: 'create', kind: 'created', source: 'website', createdAt: '2026-10-17T08:00:00.000Z' },
];
const result: LeadActivityResult = { id: 'history-preview', mode: 'activity', scope: 'workspace', retrievedAt: copy.stories.now,
  lead: { id: 'lead-preview', number: copy.stories.number, name: copy.stories.name, archived: false }, entries, total: entries.length };
function Preview(args: LeadActivityCardProps) {
  const [notice, setNotice] = useState<string>();
  return <><LeadActivityCard {...args} onOpenLead={args.onOpenLead ? id => { args.onOpenLead!(id); setNotice(copy.stories.opened(id)); } : undefined}/>{notice && <p role="status" className="text-sm text-ink wrap-anywhere">{notice}</p>}</>;
}
const meta = { title: 'Assistant/LeadActivityCard', component: LeadActivityCard, args: { result, onOpenLead: fn() }, render: args => <Preview {...args}/>,
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-3xl bg-canvas p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mt-3 text-base leading-6 text-muted">{copy.stories.description}</p><Story/></main>],
} satisfies Meta<typeof LeadActivityCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getAllByRole('listitem')).toHaveLength(7);
  for (const kind of Object.keys(copy.events) as (keyof typeof copy.events)[]) await expect(c.getByRole('heading', { name: copy.events[kind] })).toBeVisible();
  await expect(c.getByText(copy.assistant(copy.stories.actor))).toBeVisible();
  await expect(c.getByText(copy.stories.oldPhone)).toBeVisible(); await expect(c.getByText(copy.stories.newPhone)).toBeVisible();
  await expect(c.queryByRole('link')).not.toBeInTheDocument();
} };
export const TeamNotes: Story = { args: { result: { ...result, mode: 'notes', entries: [note], total: 1 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('region', { name: copy.titles.notes })).toBeVisible(); await expect(c.getByText(copy.notesNotice)).toBeVisible(); await expect(c.getAllByRole('listitem')).toHaveLength(1);
} };
export const MoreHistory: Story = { args: { result: { ...result, entries: Array.from({ length: 10 }, (_, index) => ({ ...note, id: `note-${index}` })), total: 46 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getAllByRole('listitem')).toHaveLength(10); await expect(c.getByText(copy.count(10, 46))).toBeVisible(); await expect(c.getByText(copy.more)).toBeVisible();
} };
export const EmptyActivity: Story = { args: { result: { ...result, entries: [], total: 0 } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(copy.empty.activity)).toBeVisible(); } };
export const EmptyTeamNotes: Story = { args: { result: { ...result, mode: 'notes', entries: [], total: 0 } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(copy.empty.notes)).toBeVisible(); } };
export const AssignedScope: Story = { args: { result: { ...result, scope: 'assigned' } } };
export const Archived: Story = { args: { result: { ...result, lead: { ...result.lead, archived: true } } } };
export const LostReason: Story = { args: { result: { ...result, entries: [{ ...common, id: 'lost', kind: 'stage', from: 'estimate-sent', to: 'lost', reason: copy.stories.lostReason }], total: 1 } } };
export const FormerAndUnassigned: Story = { args: { result: { ...result, entries: [{ ...common, id: 'former', kind: 'assigned', from: { name: copy.stories.plain, former: true }, to: null }], total: 1 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.former)).toBeVisible(); await expect(c.getByText(copy.unassigned)).toBeVisible(); await expect(c.queryByText(copy.stories.plain)).not.toBeInTheDocument();
} };
export const ClearedFields: Story = { args: { result: { ...result, entries: [{ ...common, id: 'clear', kind: 'edited', changes: [{ field: 'phone', before: copy.stories.oldPhone, after: '' }, { field: 'source', before: 'other', after: 'phone' }] }], total: 1 } } };
export const MissingActor: Story = { args: { result: { ...result, entries: [{ ...note, actorName: '' }], total: 1 } } };
export const LongContent: Story = { args: { result: { ...result, lead: { ...result.lead, name: copy.stories.longName }, entries: [{ ...note, actorName: copy.stories.longName, body: copy.stories.longText.repeat(10) }], total: 1 } } };
export const MaximumNote: Story = { args: { result: { ...result, entries: [{ ...note, body: copy.stories.longText.repeat(50).slice(0, 5000) }], total: 1 } } };
export const PlainText: Story = { args: { result: { ...result, entries: [{ ...note, body: copy.stories.plain }], total: 1 } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.stories.plain, { normalizer: value => value })).toBeVisible(); await expect(canvasElement.querySelector('script, img, a')).toBeNull();
} };
export const NewestFirst: Story = { args: { result: { ...result, entries: [...entries].reverse() } }, play: async ({ canvasElement }) => {
  const rows = within(canvasElement).getAllByRole('listitem'); await expect(within(rows[0]).getByText(copy.events.restored)).toBeVisible(); await expect(within(rows[6]).getByText(copy.events.created)).toBeVisible();
} };
export const OpenRecord: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.openLabel(copy.stories.number) })); await expect(args.onOpenLead).toHaveBeenCalledWith(result.lead.id);
} };
export const KeyboardOpen: Story = { play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: copy.openLabel(copy.stories.number) }); button.focus(); await expect(button).toHaveFocus(); await expect(parseFloat(getComputedStyle(button).outlineWidth)).toBeGreaterThanOrEqual(3); await userEvent.keyboard('{Enter}'); await expect(args.onOpenLead).toHaveBeenCalledWith(result.lead.id);
} };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: copy.openLabel(copy.stories.number) }); await expect(button).toBeDisabled(); await userEvent.click(button); await expect(args.onOpenLead).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { onOpenLead: undefined }, play: async ({ canvasElement }) => { await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument(); } };
async function hidden(canvasElement: HTMLElement) {
  const c = within(canvasElement); await expect(c.getByRole('status')).toBeVisible(); await expect(c.queryByText(`${copy.stories.number} · ${copy.stories.name}`)).not.toBeInTheDocument(); await expect(c.queryByRole('list')).not.toBeInTheDocument(); await expect(c.queryByRole('button')).not.toBeInTheDocument();
}
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => hidden(canvasElement) };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement }) => hidden(canvasElement) };
export const Forbidden: Story = { args: { state: 'forbidden' }, play: async ({ canvasElement }) => hidden(canvasElement) };
export const Stale: Story = { args: { state: 'stale' }, play: async ({ canvasElement }) => hidden(canvasElement) };
export const Unavailable: Story = { args: { state: 'notFound' }, play: async ({ canvasElement }) => hidden(canvasElement) };
export const MissingResult: Story = { args: { result: undefined }, play: async ({ canvasElement }) => hidden(canvasElement) };
export const InvalidTimestamp: Story = { args: { result: { ...result, entries: [{ ...note, createdAt: 'invalid' }], total: 1 } }, play: async ({ canvasElement }) => hidden(canvasElement) };
export const FutureEvent: Story = { args: { result: { ...result, entries: [{ ...note, createdAt: '2027-01-01T00:00:00.000Z' }], total: 1 } }, play: async ({ canvasElement }) => hidden(canvasElement) };
export const InconsistentCount: Story = { args: { result: { ...result, total: 6 } }, play: async ({ canvasElement }) => hidden(canvasElement) };
export const MixedNotesResult: Story = { args: { result: { ...result, mode: 'notes' } }, play: async ({ canvasElement }) => hidden(canvasElement) };
export const DuplicateEntries: Story = { args: { result: { ...result, entries: [note, note], total: 2 } }, play: async ({ canvasElement }) => hidden(canvasElement) };
export const TooManyEntries: Story = { args: { result: { ...result, entries: Array.from({ length: 11 }, (_, index) => ({ ...note, id: `note-${index}` })), total: 11 } }, play: async ({ canvasElement }) => hidden(canvasElement) };
export const RevokedWhileOpen: Story = { render: function WithdrawPreview(args) { const [revoked, setRevoked] = useState(false); return <><button type="button" onClick={() => setRevoked(true)} className="min-h-11 cursor-pointer rounded-xl border border-line px-4 py-2 text-ink focus-visible:focus-ring">{copy.stories.withdraw}</button><LeadActivityCard {...args} state={revoked ? 'forbidden' : 'ready'}/></>; }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('list')).toBeVisible(); await userEvent.click(c.getByRole('button', { name: copy.stories.withdraw })); await expect(c.getByRole('status')).toHaveTextContent(copy.states.forbidden); await expect(c.queryByRole('list')).not.toBeInTheDocument(); await expect(c.queryByRole('button', { name: copy.openLabel(copy.stories.number) })).not.toBeInTheDocument();
} };
