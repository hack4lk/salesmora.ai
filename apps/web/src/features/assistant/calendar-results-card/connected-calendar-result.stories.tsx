import type { CalendarChatResult } from '@salesmora/contracts';
import { calendarAvailabilityCardData as adviceCopy } from '../calendar-availability-card/calendar-availability-card.data';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ConnectedCalendarResult } from './connected-calendar-result';
import { calendarConnectedResult as result, calendarConnectedAdvice as advice, calendarConnectedWorkspace as workspaceId, calendarConnectedTurn as turnId } from './connected-calendar-result.fixtures';
import { calendarResultsCardData as copy } from './calendar-results-card.data';
function mock(mode: 'ready'|'access'|'mismatch'|'unsafe'|'wrongDate' = 'ready', payload: CalendarChatResult = result) {
  const original = globalThis.fetch; let reads = 0;
  globalThis.fetch = fn(async (input, options) => {
    const url = String(input); if (!url.startsWith('/api/chat/calendar')) throw Error('Unexpected preview request.');
    if (options?.method === 'POST') {
      const body = JSON.parse(String(options.body));
      if (payload.mode === 'availability') {
        const suggestion = payload.suggestions.find(s => s.id === body.suggestionId);
        const query = new URLSearchParams({ workspace:workspaceId,date:mode === 'wrongDate' ? '2026-10-23' : suggestion?.date ?? payload.from,person:payload.scope === 'own' ? 'me' : `member:${payload.people[0].id}`, recordType:'all',status:'all',customerQuery:'' });
        return Response.json({ href:`/calendar?${query}` });
      }
      return Response.json({ href: mode === 'unsafe' ? 'https://example.test/forged' : `/calendar?workspace=${workspaceId}${body.visitId ? `&visit=${body.visitId}` : ''}` });
    }
    reads++; if (mode === 'access' && reads > 1) return Response.json({ error: 'access_denied' },{ status:403 });
    return Response.json({ result: mode === 'mismatch' ? { ...payload, id: turnId } : payload });
  });
  return () => { globalThis.fetch = original; };
}
const meta = { title: 'Assistant/ConnectedCalendarResult', component: ConnectedCalendarResult,
  args: { result, workspaceId, turnId, disabled: false, onNavigate: fn() }, parameters: { layout:'fullscreen' }, beforeEach: () => mock(),
  decorators: [Story => <main className="mx-auto w-full max-w-2xl p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold">{copy.stories.heading}</h1><p className="text-sm leading-6 text-muted">{copy.stories.notice}</p><Story/></main>],
} satisfies Meta<typeof ConnectedCalendarResult>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement), open = await canvas.findByRole('button',{ name: copy.openCalendar });
  await userEvent.click(open); await expect(args.onNavigate).toHaveBeenCalledWith(`/calendar?workspace=${workspaceId}`);
} };
export const VisitOpen: Story = { play: async ({ canvasElement,args }) => {
  await userEvent.click(await within(canvasElement).findByRole('button',{ name: copy.viewLabel(result.visits[0].title) }));
  await expect(args.onNavigate).toHaveBeenCalledWith(`/calendar?workspace=${workspaceId}&visit=${result.visits[0].id}`);
} };
export const AccessChanged: Story = { beforeEach: () => mock('access'), play: async ({ canvasElement }) => {
  const canvas = within(canvasElement); await canvas.findByRole('button',{ name: copy.openCalendar });
  window.dispatchEvent(new Event('focus'));
  await waitFor(() => expect(canvas.getByText(copy.states.unavailable)).toBeVisible());
  await expect(canvas.queryByText(result.visits[0].title)).not.toBeInTheDocument(); await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
} };
export const MismatchedResponse: Story = { beforeEach: () => mock('mismatch'), play: async ({ canvasElement }) => { await expect(await within(canvasElement).findByText(copy.states.unavailable)).toBeVisible(); } };
export const UnsafeNavigation: Story = { beforeEach: () => mock('unsafe'), play: async ({ canvasElement,args }) => {
  const canvas = within(canvasElement); await userEvent.click(await canvas.findByRole('button',{ name:copy.openCalendar }));
  await expect(await canvas.findByText(copy.states.unavailable)).toBeVisible(); await expect(args.onNavigate).not.toHaveBeenCalled();
} };
export const Disabled: Story = { args: { disabled:true }, play: async ({ canvasElement,args }) => {
  const canvas = within(canvasElement); const open = await canvas.findByRole('button',{ name:copy.openCalendar }); await expect(open).toBeDisabled(); await userEvent.click(open); await expect(args.onNavigate).not.toHaveBeenCalled();
} };

export const DateAdvice: Story = { args:{ result:advice }, beforeEach:() => mock('ready',advice), play:async ({ canvasElement,args }) => {
  const canvas = within(canvasElement); await userEvent.click(await canvas.findByRole('button',{ name:adviceCopy.openDateLabel(adviceCopy.date(advice.suggestions[0].date),advice.people[0].name) }));
  await expect(args.onNavigate).toHaveBeenCalledWith(expect.stringContaining('date=2026-10-22&person=member%3Asam'));
} };
export const AdviceAccessChanged: Story = { args:{ result:advice }, beforeEach:() => mock('access',advice), play:async ({ canvasElement }) => {
  const canvas = within(canvasElement); await canvas.findByRole('button',{ name:adviceCopy.openCalendar }); window.dispatchEvent(new Event('focus'));
  await expect(await canvas.findByText(adviceCopy.states.unavailable)).toBeVisible(); await expect(canvas.queryByText(advice.people[0].name)).not.toBeInTheDocument(); await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
} };
export const AdviceWrongDate: Story = { args:{ result:advice }, beforeEach:() => mock('wrongDate',advice), play:async ({ canvasElement,args }) => {
  const canvas = within(canvasElement); await userEvent.click(await canvas.findByRole('button',{ name:adviceCopy.openCalendar }));
  await expect(await canvas.findByText(adviceCopy.states.unavailable)).toBeVisible(); await expect(args.onNavigate).not.toHaveBeenCalled();
} };
export const AdviceDisabled: Story = { args:{ result:advice,disabled:true }, beforeEach:() => mock('ready',advice), play:async ({ canvasElement,args }) => {
  const canvas = within(canvasElement), open = await canvas.findByRole('button',{ name:adviceCopy.openCalendar }); await expect(open).toBeDisabled(); await userEvent.click(open); await expect(args.onNavigate).not.toHaveBeenCalled();
} };
