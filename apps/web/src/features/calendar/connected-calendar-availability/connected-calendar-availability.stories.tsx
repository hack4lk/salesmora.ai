import { StrictMode, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ApiQueryScopeBoundary } from '../../api/api-query-provider';
import { ConnectedCalendarAvailability } from './connected-calendar-availability';
import { calendarAvailabilityExample as example } from '../calendar-availability-dialog/calendar-availability-dialog.data';
import { jobButton } from '../../jobs/job-ui';

const workspaceId = 'cfa48c88-3b22-48ed-b540-0c9b07c57f13', viewerId = 'storybook-viewer', personId = 'alex';
const reads = fn(), commands = fn();
let writeStatus = 200, version = 'a'.repeat(64), availability = example;
const meta = { title: 'Calendar/ConnectedCalendarAvailability', component: ConnectedCalendarAvailability, parameters: { layout: 'fullscreen' },
  args: { workspaceId, viewerId, personId, onClose: fn(), onSaved: fn() },
  render: function Render(args) { const [open, setOpen] = useState(true); return <StrictMode><ApiQueryScopeBoundary scope={{ workspaceId, viewerId }}>
    <main className="min-h-screen bg-canvas p-5 text-ink"><h1 className="m-0 text-heading font-semibold">Calendar</h1>
      <button type="button" className={`${jobButton} mt-5`} onClick={() => setOpen(true)}>Availability for Alex Parker</button>
      {open && <ConnectedCalendarAvailability {...args} onClose={() => { args.onClose(); setOpen(false); }} onSaved={() => { args.onSaved(); setOpen(false); }}/>}
    </main></ApiQueryScopeBoundary></StrictMode>; },
  beforeEach: () => {
    reads.mockClear(); commands.mockClear(); writeStatus = 200; version = 'a'.repeat(64); availability = example;
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/calendar/availability/')) return original(input, init);
      if (init?.method === 'PATCH') {
        const command = JSON.parse(String(init.body)); commands(command);
        if (writeStatus !== 200) return Response.json({ error: writeStatus === 409 ? 'Availability changed. Reload the latest values before saving.' : 'Availability could not be saved.', code: writeStatus === 409 ? 'conflict' : undefined }, { status: writeStatus });
        availability = command.availability; version = 'b'.repeat(64);
      } else reads(String(input));
      return Response.json({ person: { id: personId, name: 'Alex Parker' }, revision: version, timezone: 'America/New_York', availability, canEdit: true });
    };
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof ConnectedCalendarAvailability>;
export default meta;
type Story = StoryObj<typeof meta>;
const dialogFor = async (canvas: HTMLElement) => {
  const d = within(canvas.ownerDocument.body);
  await d.findByLabelText('Monday start'); return within(d.getByRole('dialog'));
};
export const LocalEdits: Story = { play: async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement); await userEvent.click(d.getByLabelText('Monday'));
  await userEvent.click(d.getByLabelText('Tuesday')); await expect(reads).toHaveBeenCalledTimes(1); await expect(commands).not.toHaveBeenCalled();
} };
export const SaveAndReopen: Story = { play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement); await userEvent.click(d.getByLabelText('Monday')); await userEvent.click(d.getByRole('button', { name: 'Save availability' }));
  await waitFor(() => expect(args.onSaved).toHaveBeenCalledOnce()); await expect(commands).toHaveBeenCalledTimes(1);
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Availability for Alex Parker' }));
  const reopened = within(await within(canvasElement.ownerDocument.body).findByRole('dialog'));
  await expect(reopened.getByLabelText('Monday')).not.toBeChecked(); await expect(reads).toHaveBeenCalledTimes(1);
} };
export const RetrySameSubmission: Story = { play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement); writeStatus = 503;
  await userEvent.click(d.getByLabelText('Monday')); await userEvent.click(d.getByRole('button', { name: 'Save availability' }));
  await waitFor(() => expect(d.getByRole('button', { name: 'Save availability' })).toBeEnabled()); await expect(commands).toHaveBeenCalledTimes(1);
  writeStatus = 200; await userEvent.click(d.getByRole('button', { name: 'Save availability' }));
  await waitFor(() => expect(args.onSaved).toHaveBeenCalledOnce()); await expect(commands).toHaveBeenCalledTimes(2);
  await expect(commands.mock.calls[0]).toEqual(commands.mock.calls[1]);
} };
export const ConflictReload: Story = { play: async ({ canvasElement }) => {
  let d = await dialogFor(canvasElement); writeStatus = 409;
  await userEvent.click(d.getByLabelText('Monday')); await userEvent.click(d.getByRole('button', { name: 'Save availability' }));
  await waitFor(() => expect(d.getByRole('button', { name: 'Reload latest values' })).toBeEnabled()); await expect(d.getByLabelText('Tuesday start')).toBeDisabled();
  version = 'c'.repeat(64); writeStatus = 200; await userEvent.click(d.getByRole('button', { name: 'Reload latest values' }));
  d = await dialogFor(canvasElement); await waitFor(() => expect(d.getByLabelText('Monday start')).toHaveValue('08:00'));
  await expect(reads).toHaveBeenCalledTimes(2); await expect(commands).toHaveBeenCalledTimes(1);
} };
export const RevokedWrite: Story = { play: async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement); writeStatus = 404;
  await userEvent.click(d.getByLabelText('Monday')); await userEvent.click(d.getByRole('button', { name: 'Save availability' }));
  await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByLabelText('Tuesday start')).not.toBeInTheDocument());
  await expect(commands).toHaveBeenCalledTimes(1);
} };
