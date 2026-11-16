import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CalendarRoute } from './calendar-route';
import { calendarFixture } from '../../api/api-workflow.fixtures';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateWorkspaceResources } from '../../api/api-read-options';
import { ApiRequestError } from '../../api/api-request';
import { calendarRouteData } from './calendar-route.data';

const reads = fn();
let failure = 0;
const meta = {
  title: 'Calendar/CalendarRoute', component: CalendarRoute,
  parameters: { layout: 'fullscreen', nextjs: { navigation: { pathname: '/calendar', query: { workspace: calendarFixture.query.workspaceId, date: '2026-10-19' } } } },
  decorators: [Story => <div className="p-4 sm:p-8"><Story/></div>],
  args: { initial: calendarFixture, initialUpdatedAt: Date.now() },
  beforeEach: () => {
    reads.mockClear(); failure = 0;
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const path = String(input);
      if (!path.startsWith('/api/calendar')) return original(input, init);
      reads(path);
      if (failure) { const status = failure; failure = 0; return Response.json({ error: 'Read failed.' }, { status }); }
      return Response.json(path.startsWith('/api/calendar?') ? calendarFixture : calendarFixture.unscheduled[0]);
    };
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof CalendarRoute>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ServerSnapshot: Story = { play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('heading', { name: 'Calendar' })).toBeVisible();
  await expect(reads).not.toHaveBeenCalled();
} };
export const Retry: Story = { args: { initialUpdatedAt: 1 }, beforeEach: () => { failure = 500; }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click((await c.findAllByRole('button', { name: 'Try again' }))[0]);
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(2));
} };
export const VisitPeek: Story = {
  parameters: { nextjs: { navigation: { pathname: '/calendar', query: { workspace: calendarFixture.query.workspaceId, date: '2026-10-19', visit: calendarFixture.unscheduled[0].id } } } },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement.ownerDocument.body).findByRole('dialog')).toBeVisible();
    await expect(reads).toHaveBeenCalledTimes(1);
  },
};
export const RevokedAccess: Story = {
  render: function Revocation(props) {
    const client = useQueryClient();
    return <><button className="min-h-11 rounded-xl border p-3" onClick={() => {
      failure = 403;
      void invalidateWorkspaceResources(client, calendarFixture.query.workspaceId, ['calendar']).catch(error => {
        if (!(error instanceof ApiRequestError) || error.status !== 403) throw error;
      });
    }}>Revoke access</button><CalendarRoute {...props}/></>;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Revoke access' }));
    await expect(await c.findByText(calendarRouteData.unavailable)).toBeVisible();
    await expect(c.queryByText('Kitchen sink repair')).not.toBeInTheDocument();
    await expect(c.queryByRole('button', { name: 'Schedule visit' })).not.toBeInTheDocument();
  },
};
