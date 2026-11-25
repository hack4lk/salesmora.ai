import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { TeamSettingsSnapshot } from '@salesmora/contracts';
import { TeamSettingsRoute } from './team-settings-route';
import { calendarAvailabilityExample } from '../../calendar/calendar-availability-dialog/calendar-availability-dialog.data';
const initial: TeamSettingsSnapshot = { workspaceId: 'e82fe2f4-aa1e-47e9-b2c6-52f77a069254', canManage: true, page: 1, pageSize: 10, total: 1,
  members: [{ id: 'alex', name: 'Alex Parker', role: 'field', revision: 'a'.repeat(64), coverageRevision: 'b'.repeat(64), timezone: 'America/New_York', availability: calendarAvailabilityExample, workZipCodes: ['10001'] }] };
const writes = fn(), reads = fn();
const meta = { title: 'Settings/Connected Team', component: TeamSettingsRoute, args: { initial }, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="mx-auto max-w-5xl bg-canvas p-6"><Story/></main>],
  beforeEach: () => {
    writes.mockClear(); reads.mockClear(); let saved = structuredClone(initial);
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/settings/team')) return original(input, init);
      if (init?.method === 'PUT') {
        const body = JSON.parse(String(init.body)); writes(body); const command = body.command;
        saved = { ...saved, members: saved.members.map(member => member.id === command.personId ? { ...member,
          ...(command.coverage ? { workZipCodes: command.coverage.postalCodes, coverageRevision: 'c'.repeat(64) } : {}),
          ...(command.availability ? { availability: command.availability.value, revision: 'd'.repeat(64) } : {}),
        } : member) };
        return Response.json(saved.members[0]);
      }
      reads(input); return Response.json(saved);
    };
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof TeamSettingsRoute>;
export default meta; type Story = StoryObj<typeof meta>;
async function open(canvas: HTMLElement) {
  await userEvent.click(within(canvas).getByRole('button', { name: 'Options for Alex Parker' }));
  await userEvent.click(within(canvas.ownerDocument.body).getByRole('menuitem', { name: 'Work ZIP codes' }));
  return within(await within(canvas.ownerDocument.body).findByRole('dialog'));
}
export const Coverage: Story = { play: async ({ canvasElement }) => {
  let d = await open(canvasElement); await userEvent.type(d.getByLabelText('Work ZIP codes'), ', 00501');
  await expect(writes).not.toHaveBeenCalled(); await expect(reads).not.toHaveBeenCalled();
  await userEvent.click(d.getByRole('button', { name: 'Save changes' }));
  await expect(await within(canvasElement).findByText('10001, 00501')).toBeVisible();
  await expect(writes).toHaveBeenCalledTimes(1); await expect(writes).toHaveBeenCalledWith(expect.objectContaining({ workspaceId: initial.workspaceId, requestId: expect.any(String), command: { personId: 'alex', coverage: { revision: initial.members[0].coverageRevision, countryCode: 'US', postalCodes: ['10001', '00501'] } } }));
  d = await open(canvasElement); await expect(d.getByLabelText('Work ZIP codes')).toHaveValue('10001, 00501');
  await expect(reads).not.toHaveBeenCalled();
} };
export const BothTabs: Story = { play: async ({ canvasElement }) => {
  const d = await open(canvasElement); await userEvent.type(d.getByLabelText('Work ZIP codes'), ', 00501');
  await userEvent.click(d.getByRole('tab', { name: 'Availability' })); await userEvent.click(d.getByLabelText('Monday'));
  await userEvent.click(d.getByRole('button', { name: 'Save changes' }));
  await expect(writes).toHaveBeenCalledTimes(1); await expect(writes).toHaveBeenCalledWith(expect.objectContaining({ command: expect.objectContaining({ coverage: expect.any(Object), availability: expect.objectContaining({ value: expect.objectContaining({ weeklyHours: expect.objectContaining({ monday: null }) }) }) }) }));
  await expect(await within(canvasElement).findByText('4 working days / week')).toBeVisible();
} };
export const Conflict: Story = { beforeEach: () => {
  const original = globalThis.fetch; globalThis.fetch = async (input, init) => String(input).startsWith('/api/settings/team') && init?.method === 'PUT'
    ? Response.json({ error: 'Member settings changed. Reload before saving.' }, { status: 409 }) : original(input, init);
  return () => { globalThis.fetch = original; };
}, play: async ({ canvasElement }) => {
  const d = await open(canvasElement); await userEvent.type(d.getByLabelText('Work ZIP codes'), ', 00501'); await userEvent.click(d.getByRole('button', { name: 'Save changes' }));
  await expect(await d.findByRole('button', { name: 'Reload latest values' })).toBeVisible(); await expect(d.getByRole('button', { name: 'Save changes' })).toBeDisabled();
} };
export const ReadOnly: Story = { args: { initial: { ...initial, canManage: false } }, play: async ({ canvasElement }) => {
  const d = await open(canvasElement); await expect(d.getByLabelText('Work ZIP codes')).toBeDisabled();
} };
