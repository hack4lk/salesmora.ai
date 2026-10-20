import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LeadActivityTimeline, type LeadActivityTimelineProps, type LeadActivityEvent } from './lead-activity-timeline';
import { leadActivityTimelineData as copy, activityPreviewEvents } from './lead-activity-timeline.data';

function Preview(args: LeadActivityTimelineProps) {
  const [events, setEvents] = useState(args.events);
  return <LeadActivityTimeline {...args} events={events} onLoadMore={args.onLoadMore ? () => {
    args.onLoadMore?.();
    setEvents(current => [...current, ...Array.from({ length: Math.min(20, args.total - current.length) }, (_, index): LeadActivityEvent => ({
      id: `older-${current.length + index}`, kind: 'note', body: copy.stories.longText, actorName: copy.stories.actor,
      createdAt: new Date(Date.parse(copy.stories.now) - (current.length + index + 1) * 86400000).toISOString(),
    }))]);
  } : undefined}/>;
}
const meta = { title: 'Leads/LeadActivityTimeline', component: Preview, parameters: { layout: 'fullscreen' },
  args: { events: activityPreviewEvents, total: activityPreviewEvents.length, now: copy.stories.now, timezone: copy.stories.timezone, onLoadMore: fn(), onRetry: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="w-full max-w-3xl"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 leading-6 text-muted">{copy.stories.description}</p><Story/></div></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { events: [], total: 0 } };
export const Loading: Story = { args: { events: [], total: 0, loading: true } };
export const Error: Story = { args: { events: [], error: copy.stories.error }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.retry }));await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const BeforeAfter: Story = { args: { events: activityPreviewEvents.filter(event => event.kind === 'edited'), total: 1 }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);await expect(c.getAllByText(copy.before)).toHaveLength(2);await expect(c.getAllByText(copy.after)).toHaveLength(2);await expect(c.getByText(copy.missing)).toBeInTheDocument();
} };
export const AssistantConfirmed: Story = { args: { events: activityPreviewEvents.filter(event => event.viaAssistant), total: 1 } };
export const FormerOwner: Story = { args: { events: [{ id: 'former', kind: 'assigned', from: { name: copy.stories.longActor, former: true }, to: null, actorName: copy.stories.actor, createdAt: copy.stories.now }], total: 1 } };
export const ReopenedLost: Story = { args: { events: [{ id: 'reopen', kind: 'stage', from: 'lost', to: 'new', actorName: copy.stories.actor, createdAt: copy.stories.now }], total: 1 } };
export const Many: Story = { args: { total: 47, events: Array.from({ length: 20 }, (_, index): LeadActivityEvent => ({ id: `note-${index}`, kind: 'note', body: copy.stories.longText, actorName: copy.stories.actor, createdAt: new Date(Date.parse(copy.stories.now) - index * 86400000).toISOString() })) } };
export const LoadingOlder: Story = { args: { ...Many.args, loading: true }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.older })).toBeDisabled();
} };
export const OlderError: Story = { args: { ...Many.args, error: copy.stories.error } };
export const PageOlder: Story = { args: Many.args, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);await userEvent.click(c.getByRole('button', { name: copy.older }));await expect(c.getAllByRole('listitem')).toHaveLength(40);await expect(args.onLoadMore).toHaveBeenCalledTimes(1);
  await userEvent.click(c.getByRole('button', { name: copy.older }));await expect(c.getAllByRole('listitem')).toHaveLength(47);await expect(c.queryByRole('button', { name: copy.older })).not.toBeInTheDocument();
} };
export const PlainText: Story = { args: { events: [{ id: 'plain', kind: 'note', body: copy.stories.plainText, actorName: copy.stories.actor, createdAt: copy.stories.now }], total: 1 }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('link')).not.toBeInTheDocument();await expect(canvasElement.querySelector('script')).toBeNull();
} };
export const LongChanges: Story = { args: { total: 1, events: [{ id: 'long', kind: 'edited', changes: [{ field: 'details', before: copy.stories.plainText, after: copy.stories.longText }], actorName: copy.stories.longActor, viaAssistant: true, createdAt: copy.stories.now }] } };
export const Narrow: Story = { ...LongChanges, parameters: { viewport: { value: 'phone' } } };
export const NewestFirst: Story = { args: { events: [...activityPreviewEvents].reverse() }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getAllByRole('listitem')[0]).toHaveTextContent(copy.events.restored);
} };
