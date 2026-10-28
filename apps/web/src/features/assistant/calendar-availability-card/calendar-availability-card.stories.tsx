import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CalendarAvailabilityCard, type CalendarAvailabilityResult, type CalendarAvailabilityCardProps } from './calendar-availability-card';
import { calendarAvailabilityCardData as copy } from './calendar-availability-card.data';
const result: CalendarAvailabilityResult = {
  id: 'preview-date-result', from: copy.stories.from, to: copy.stories.to, timezone: copy.stories.timezone,
  checkedAt: copy.stories.checkedAt, scope: 'workspace', viewerId: 'sam', people: [{ id:'sam',name:copy.stories.person }], arrivalWindow: '09:00-11:00', total: 3,
  suggestions: copy.stories.dates.map((date, index) => ({ id: `suggestion-${index}`, date, person: { id: 'sam', name: copy.stories.person }, visitCount: index, unknownWindowCount: index === 1 ? 1 : 0, timing: index === 1 ? 'not-checked' : 'no-known-overlap' })),
};
function Preview(args: CalendarAvailabilityCardProps) {
  const [notice,setNotice] = useState('');
  return <main className="mx-auto w-full max-w-2xl p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.heading}</h1><p className="mb-4 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><CalendarAvailabilityCard {...args}
    onOpenDate={args.onOpenDate ? (id, suggestionId) => { args.onOpenDate?.(id,suggestionId); setNotice(copy.stories.openedDate); } : undefined}
    onOpenCalendar={args.onOpenCalendar ? id => { args.onOpenCalendar?.(id); setNotice(copy.stories.openedCalendar); } : undefined}/>{notice && <p role="status" className="mt-4 text-sm leading-6">{notice}</p>}</main>;
}
const meta = { title: 'Assistant/CalendarAvailabilityCard', component: CalendarAvailabilityCard, parameters: { layout: 'fullscreen' },
  args: { result, onOpenDate: fn(), onOpenCalendar: fn() }, render: args => <Preview {...args}/> } satisfies Meta<typeof CalendarAvailabilityCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement,args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(copy.basis)).toBeVisible(); await expect(canvas.getByText(copy.limitations)).toBeVisible();
  await expect(canvas.getByText(copy.shown(3,3))).toBeVisible();
  await userEvent.click(canvas.getAllByRole('button',{ name:/^Review .* in Calendar$/ })[0]);
  await expect(args.onOpenDate).toHaveBeenCalledWith(result.id,result.suggestions[0].id);
  await expect(canvas.getByText(copy.stories.openedDate)).toBeVisible();
  await userEvent.click(canvas.getByRole('button',{ name:copy.openCalendar })); await expect(args.onOpenCalendar).toHaveBeenCalledWith(result.id);
} };
export const OwnSchedule: Story = { args: { result: { ...result, scope:'own' } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(copy.scope.own)).toBeVisible(); } };
export const CountOnly: Story = { args: { result: { ...result, arrivalWindow:null, suggestions: result.suggestions.map(s => ({ ...s, timing:'not-checked' })) } }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement); await expect(canvas.getByText(copy.countOnly)).toBeVisible(); await expect(canvas.queryByText(copy.noKnownOverlap)).not.toBeInTheDocument();
} };
export const UnknownTiming: Story = { args: { result: { ...result, total:1, suggestions:[{ ...result.suggestions[0], visitCount:2, unknownWindowCount:2, timing:'not-checked' }] } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(copy.unknown(2))).toBeVisible(); } };
export const TimingNotChecked: Story = { args: { result: { ...result, total:1, suggestions:[{ ...result.suggestions[0], timing:'not-checked' }] } }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement); await expect(canvas.getByText(copy.notChecked)).toBeVisible(); await expect(canvas.queryByText(copy.noKnownOverlap)).not.toBeInTheDocument();
} };
export const BusyDay: Story = { args: { result: { ...result, total:1, suggestions:[{ ...result.suggestions[0], visitCount:4, unknownWindowCount:1 }] } }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await expect(canvas.getByText(copy.busy)).toBeVisible(); await expect(canvas.getByText(copy.busyDetail)).toBeVisible(); } };
export const MoreDates: Story = { args: { result: { ...result,total:5 } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(copy.shown(3,5))).toBeVisible(); } };
export const NoMatches: Story = { args: { result: { ...result,total:0,suggestions:[] } }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await expect(canvas.getByText(copy.empty)).toBeVisible(); await expect(canvas.queryByRole('button',{ name:/^Review .* in Calendar$/ })).not.toBeInTheDocument(); } };
export const Loading: Story = { args: { state:'loading' }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await expect(canvas.getByText(copy.states.loading)).toBeVisible(); await expect(canvas.queryByText(copy.stories.person)).not.toBeInTheDocument(); await expect(canvas.queryByRole('button')).not.toBeInTheDocument(); } };
export const Error: Story = { args: { state:'error' } };
export const AccessChanged: Story = { args: { state:'unavailable' }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await expect(canvas.getByText(copy.states.unavailable)).toBeVisible(); await expect(canvas.queryByText(copy.stories.person)).not.toBeInTheDocument(); await expect(canvas.queryByRole('button')).not.toBeInTheDocument(); } };
export const Disabled: Story = { args: { disabled:true }, play: async ({ canvasElement,args }) => { for (const button of within(canvasElement).getAllByRole('button')) { await expect(button).toBeDisabled(); await userEvent.click(button); } await expect(args.onOpenDate).not.toHaveBeenCalled(); await expect(args.onOpenCalendar).not.toHaveBeenCalled(); } };
export const InvalidOwnScope: Story = { args: { result: { ...result, scope:'own', viewerId:'other-person' } }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await expect(canvas.getByText(copy.states.error)).toBeVisible(); await expect(canvas.queryByText(copy.stories.person)).not.toBeInTheDocument(); await expect(canvas.queryByRole('button')).not.toBeInTheDocument(); } };
export const InvalidRange: Story = { args: { result: { ...result, from: result.to,to: result.from } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(copy.states.error)).toBeVisible(); } };
export const LongContent: Story = { args: { result: { ...result, people:[{ id:'long-name',name:copy.stories.longPerson }], total:1, suggestions:[{ ...result.suggestions[0], person: { id:'long-name',name:copy.stories.longPerson },visitCount:4,unknownWindowCount:1 }] } } };
export const Keyboard: Story = { play: async ({ canvasElement,args }) => { const button = within(canvasElement).getAllByRole('button',{ name:/^Review .* in Calendar$/ })[0]; button.focus(); await expect(button).toHaveFocus(); await userEvent.keyboard('{Enter}'); await expect(args.onOpenDate).toHaveBeenCalledWith(result.id,result.suggestions[0].id); } };

export const PartialTiming: Story = { args: { result: { ...result, total:1, suggestions:[{ ...result.suggestions[0], visitCount:2, unknownWindowCount:1 }] } }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await expect(canvas.getByText(copy.noKnownOverlap)).toBeVisible(); await expect(canvas.getByText(copy.unknown(1))).toBeVisible(); } };
export const InvalidTimingClaim: Story = { args: { result: { ...result, total:1, suggestions:[{ ...result.suggestions[0], visitCount:2, unknownWindowCount:2 }] } }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await expect(canvas.getByText(copy.states.error)).toBeVisible(); await expect(canvas.queryByText(copy.stories.person)).not.toBeInTheDocument(); } };
