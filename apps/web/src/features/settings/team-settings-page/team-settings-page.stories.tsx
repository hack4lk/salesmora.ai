import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { TeamSettingsPage } from './team-settings-page';
import { calendarAvailabilityExample } from '../../calendar/calendar-availability-dialog/calendar-availability-dialog.data';
const members = [
  { id: 'alex', name: 'Alex Parker', role: 'Field worker', revision: 'availability-1', coverageRevision: 'coverage-1', timezone: 'America/New_York', availability: calendarAvailabilityExample, workZipCodes: ['10001', '10002', '10003', '10004', '10005'] },
  { id: 'morgan', name: 'Morgan Ellis', role: 'Owner', revision: 'availability-2', coverageRevision: 'coverage-2', timezone: 'America/New_York', availability: calendarAvailabilityExample, workZipCodes: ['10001', '10002'] },
  { id: 'skyler', name: 'Skyler Grant', role: 'Field worker', revision: 'availability-3', coverageRevision: 'coverage-3', timezone: 'America/New_York', availability: { weeklyHours: null, unavailableDates: [] }, workZipCodes: [] },
];
const meta = { title: 'Settings/Team', component: TeamSettingsPage, parameters: { layout: 'fullscreen' },
  render: function TeamStory(args) {
    const [rows, setRows] = useState(args.members);
    return <TeamSettingsPage {...args} members={rows} onSaveMember={async input => {
      await args.onSaveMember(input);
      setRows(previous => previous.map(member => member.id === input.personId ? { ...member,
        ...(input.coverage ? { workZipCodes: input.coverage.postalCodes, coverageRevision: `${member.coverageRevision}-saved` } : {}),
        ...(input.availability ? { availability: input.availability.value, revision: `${member.revision}-saved` } : {}),
      } : member));
    }}/>;
  },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><div className="mx-auto max-w-5xl"><Story/></div></main>],
  args: { settingsHref: '/settings?workspace=example', members, total: 3, page: 1, pageSize: 10, canManage: true,
    onPageChange: fn(), onPageSizeChange: fn(), onReload: fn(), onSaveMember: fn(async () => {}) },
} satisfies Meta<typeof TeamSettingsPage>;
export default meta;
type Story = StoryObj<typeof meta>;
async function openEditor(canvas: HTMLElement, tab: 'Availability' | 'Work ZIP codes' = 'Work ZIP codes') {
  const doc = within(canvas.ownerDocument.body);
  await userEvent.click(within(canvas).getByRole('button', { name: 'Options for Alex Parker' }));
  await userEvent.click(doc.getByRole('menuitem', { name: tab }));
  return within(await doc.findByRole('dialog'));
}
export const Overview: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('heading', { name: 'Team' })).toBeVisible();
  await expect(c.getAllByText('Not set').length).toBeGreaterThan(0);
} };
export const WorkZipCodes: Story = { play: async ({ canvasElement }) => { const d = await openEditor(canvasElement); await expect(d.getByLabelText('Work ZIP codes')).toHaveValue('10001, 10002, 10003, 10004, 10005'); } };
export const SaveCoverage: Story = { play: async ({ canvasElement, args }) => {
  const d = await openEditor(canvasElement); await userEvent.clear(d.getByLabelText('Work ZIP codes'));
  await userEvent.type(d.getByLabelText('Work ZIP codes'), '10001, 10001-1234, 00501');
  await expect(args.onSaveMember).not.toHaveBeenCalled();
  await userEvent.click(d.getByRole('button', { name: 'Save changes' }));
  await expect(args.onSaveMember).toHaveBeenCalledWith({ personId: 'alex', coverage: { revision: 'coverage-1', countryCode: 'US', postalCodes: ['10001', '00501'] } });
  await expect(await within(canvasElement).findByText('Team member updated.')).toBeVisible();
} };
export const InvalidCoverage: Story = { play: async ({ canvasElement, args }) => {
  const d = await openEditor(canvasElement); await userEvent.type(d.getByLabelText('Work ZIP codes'), ', Manhattan');
  await expect(d.getByRole('button', { name: 'Save changes' })).toBeDisabled(); await expect(args.onSaveMember).not.toHaveBeenCalled();
} };
export const ClearCoverage: Story = { play: async ({ canvasElement, args }) => {
  const d = await openEditor(canvasElement); await userEvent.clear(d.getByLabelText('Work ZIP codes'));
  await expect(d.getByText(/No coverage set/)).toBeVisible(); await userEvent.click(d.getByRole('button', { name: 'Save changes' }));
  await expect(args.onSaveMember).toHaveBeenCalledWith({ personId: 'alex', coverage: { revision: 'coverage-1', countryCode: 'US', postalCodes: [] } });
} };
export const Availability: Story = { play: async ({ canvasElement }) => {
  const d = await openEditor(canvasElement, 'Availability'); await expect(d.getByText('Shared with Calendar.')).toBeVisible();
  await expect(d.getByLabelText('Monday start')).toHaveValue('08:00');
} };
export const PreserveTabEdits: Story = { play: async ({ canvasElement }) => {
  const d = await openEditor(canvasElement); await userEvent.type(d.getByLabelText('Work ZIP codes'), ', 00501');
  await userEvent.click(d.getByRole('tab', { name: 'Availability' })); await userEvent.click(d.getByLabelText('Monday'));
  await userEvent.click(d.getByRole('tab', { name: 'Work ZIP codes' })); await expect(d.getByLabelText('Work ZIP codes')).toHaveValue('10001, 10002, 10003, 10004, 10005, 00501');
  await userEvent.click(d.getByRole('tab', { name: 'Availability' })); await expect(d.getByLabelText('Monday')).not.toBeChecked();
} };
export const SaveBothTabs: Story = { play: async ({ canvasElement, args }) => {
  const d = await openEditor(canvasElement); await userEvent.clear(d.getByLabelText('Work ZIP codes'));
  await userEvent.type(d.getByLabelText('Work ZIP codes'), '00501');
  await userEvent.click(d.getByRole('tab', { name: 'Availability' })); await userEvent.click(d.getByLabelText('Monday'));
  await userEvent.click(d.getByRole('button', { name: 'Save changes' }));
  await expect(args.onSaveMember).toHaveBeenCalledWith({ personId: 'alex',
    coverage: { revision: 'coverage-1', countryCode: 'US', postalCodes: ['00501'] },
    availability: { revision: 'availability-1', timezone: 'America/New_York', value: { ...calendarAvailabilityExample, weeklyHours: { ...calendarAvailabilityExample.weeklyHours, monday: null } } },
  });
  await expect(args.onSaveMember).toHaveBeenCalledOnce();
} };
export const SaveAvailability: Story = { play: async ({ canvasElement, args }) => {
  const d = await openEditor(canvasElement, 'Availability'); await userEvent.click(d.getByLabelText('Monday'));
  await userEvent.click(d.getByRole('button', { name: 'Save changes' }));
  await expect(args.onSaveMember).toHaveBeenCalledWith({ personId: 'alex', availability: { revision: 'availability-1', timezone: 'America/New_York', value: { ...calendarAvailabilityExample, weeklyHours: { ...calendarAvailabilityExample.weeklyHours, monday: null } } } });
  await expect(args.onSaveMember).toHaveBeenCalledOnce();
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  const d = await openEditor(canvasElement); await userEvent.clear(d.getByLabelText('Work ZIP codes'));
  await userEvent.click(d.getByRole('button', { name: 'Cancel' })); await expect(args.onSaveMember).not.toHaveBeenCalled();
  await expect((await openEditor(canvasElement)).getByLabelText('Work ZIP codes')).toHaveValue('10001, 10002, 10003, 10004, 10005');
} };
export const SaveFailure: Story = { args: { onSaveMember: fn(async () => { throw Error('offline'); }) }, play: async ({ canvasElement }) => {
  const d = await openEditor(canvasElement); await userEvent.type(d.getByLabelText('Work ZIP codes'), ', 00501');
  await userEvent.click(d.getByRole('button', { name: 'Save changes' }));
  await expect(await d.findByRole('alert')).toBeVisible(); await expect(d.getByLabelText('Work ZIP codes')).toHaveValue('10001, 10002, 10003, 10004, 10005, 00501');
} };
export const ReadOnly: Story = { args: { canManage: false }, play: async ({ canvasElement }) => {
  const d = await openEditor(canvasElement); await expect(d.getByLabelText('Work ZIP codes')).toBeDisabled();
  await expect(d.getByRole('button', { name: 'Save changes' })).toBeDisabled();
} };
export const Conflict: Story = { args: { conflict: true }, play: async ({ canvasElement, args }) => {
  const d = await openEditor(canvasElement); await expect(d.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  await userEvent.click(d.getByRole('button', { name: 'Reload latest values' })); await expect(args.onReload).toHaveBeenCalledOnce();
} };
export const Loading: Story = { args: { state: 'loading', members: [] } };
export const LoadError: Story = { args: { state: 'error', members: [] } };
export const Empty: Story = { args: { members: [], total: 0 } };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const MobileEditor: Story = { globals: { viewport: { value: 'phone', isRotated: false } }, play: async ({ canvasElement }) => {
  const d = await openEditor(canvasElement); await expect(d.getByLabelText('Work ZIP codes')).toBeVisible();
  const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog'); await expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth + 1);
} };
