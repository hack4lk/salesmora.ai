import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CalendarAvailabilityDialog, type CalendarAvailabilityDialogProps } from './calendar-availability-dialog';
import { calendarAvailabilityDialogData as copy, calendarAvailabilityExample as example, emptyCalendarWeek } from './calendar-availability-dialog.data';
import { jobButton } from '../../jobs/job-ui';

function Preview(args: CalendarAvailabilityDialogProps) {
  const [open, setOpen] = useState(args.open);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6"><h1 className="m-0 text-heading font-semibold">{copy.stories.heading}</h1>
    <button type="button" className={`${jobButton} mt-6`} onClick={() => setOpen(true)}>{copy.stories.open}</button>
    <CalendarAvailabilityDialog {...args} open={open} onClose={() => { args.onClose(); setOpen(false); }}/>
  </main>;
}
const meta = { title: 'Calendar/CalendarAvailabilityDialog', component: CalendarAvailabilityDialog,
  parameters: { layout: 'fullscreen' }, render: args => <Preview {...args}/>,
  args: { open: true, person: copy.stories.person, revision: copy.stories.revision, timezone: copy.stories.timezone,
    value: { weeklyHours: null, unavailableDates: [] }, canEdit: true, onClose: fn(), onSave: fn(), onReload: fn() },
} satisfies Meta<typeof CalendarAvailabilityDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
const dialogFor = async (canvas: HTMLElement) => {
  const dialog = within(canvas.ownerDocument.body).getByRole('dialog');
  await waitFor(() => expect(dialog).toBeVisible()); return within(dialog);
};
export const NotRecorded: Story = { play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement);
  await expect(d.getByText(copy.unknown)).toBeVisible(); await expect(d.getByRole('button', { name: copy.save })).toBeDisabled();
  await expect(d.queryByLabelText('Monday start')).not.toBeInTheDocument(); await expect(args.onSave).not.toHaveBeenCalled();
} };
export const Recorded: Story = { args: { value: example }, play: async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement); await expect(d.getByLabelText('Monday start')).toHaveValue('08:00');
  await expect(d.getByLabelText('Friday finish')).toHaveValue('17:00'); await expect(d.getByLabelText('Saturday')).not.toBeChecked();
  await expect(d.getByLabelText(copy.from)).toHaveValue('2026-12-24'); await expect(d.getByRole('button', { name: copy.save })).toBeDisabled();
} };
export const SetHours: Story = { play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement), user = userEvent.setup({ document: canvasElement.ownerDocument });
  await user.click(d.getByRole('checkbox', { name: copy.setWeek })); await expect(d.getByText(copy.allOff)).toBeVisible();
  await user.click(d.getByLabelText('Monday')); await expect(d.getByLabelText('Monday start')).toHaveValue('');
  await expect(d.getByRole('button', { name: copy.save })).toBeDisabled();
  await user.type(d.getByLabelText('Monday start'), '08:00'); await user.type(d.getByLabelText('Monday finish'), '17:00');
  await expect(args.onSave).not.toHaveBeenCalled(); await user.click(d.getByRole('button', { name: copy.save }));
  await expect(args.onSave).toHaveBeenCalledWith({ personId: args.person.id, revision: args.revision, timezone: args.timezone,
    availability: { weeklyHours: { ...emptyCalendarWeek, monday: { startTime: '08:00', endTime: '17:00' } }, unavailableDates: [] } });
} };
export const AddUnavailableDates: Story = { play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement), user = userEvent.setup({ document: canvasElement.ownerDocument });
  await user.click(d.getByRole('button', { name: copy.add })); await expect(d.getByRole('button', { name: copy.save })).toBeDisabled();
  await user.type(d.getByLabelText(copy.from), '2026-12-24'); await user.type(d.getByLabelText(copy.through), '2026-12-25');
  await user.click(d.getByRole('button', { name: copy.save }));
  await expect(args.onSave).toHaveBeenCalledWith({ personId: args.person.id, revision: args.revision, timezone: args.timezone,
    availability: { weeklyHours: null, unavailableDates: [{ startDate: '2026-12-24', endDate: '2026-12-25' }] } });
} };
export const RemoveUnavailableDates: Story = { args: { value: example }, play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement); await userEvent.click(d.getByRole('button', { name: copy.remove(0) }));
  await expect(d.getByText(copy.noDates)).toBeVisible(); await userEvent.click(d.getByRole('button', { name: copy.save }));
  await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ availability: { weeklyHours: example.weeklyHours, unavailableDates: [] } }));
} };
export const InvalidHours: Story = { args: { value: { weeklyHours: { ...emptyCalendarWeek, monday: { startTime: '17:00', endTime: '08:00' } }, unavailableDates: [] } }, play: async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement); await expect(d.getByText(copy.invalidHours)).toBeVisible(); await expect(d.getByRole('button', { name: copy.save })).toBeDisabled();
} };
export const OverlappingDates: Story = { args: { value: { ...example, unavailableDates: [{ startDate: '2026-12-24', endDate: '2026-12-26' }, { startDate: '2026-12-25', endDate: '2026-12-25' }] } }, play: async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement); await expect(d.getByText(copy.invalidDates)).toBeVisible(); await expect(d.getByRole('button', { name: copy.save })).toBeDisabled();
} };
export const AllDaysOff: Story = { args: { value: { weeklyHours: emptyCalendarWeek, unavailableDates: [] } }, play: async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement); await expect(d.getByText(copy.allOff)).toBeVisible(); await expect(d.queryByLabelText('Monday start')).not.toBeInTheDocument();
} };
export const Cancel: Story = { args: { value: example }, play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement); await userEvent.click(d.getByLabelText('Monday'));
  await userEvent.click(d.getByRole('button', { name: /^Cancel$/ })); await expect(args.onClose).toHaveBeenCalledOnce();
  await expect(args.onSave).not.toHaveBeenCalled();
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.stories.open }));
  await expect((await dialogFor(canvasElement)).getByLabelText('Monday start')).toHaveValue('08:00');
} };
export const ReadOnly: Story = { args: { value: example, canEdit: false }, play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement); await expect(d.getByText(copy.readOnly)).toBeVisible();
  await expect(d.getByLabelText('Monday start')).toBeDisabled(); await expect(d.getByRole('button', { name: copy.add })).toBeDisabled();
  await expect(d.getByRole('button', { name: copy.save })).toBeDisabled(); await expect(args.onSave).not.toHaveBeenCalled();
} };
export const Pending: Story = { args: { value: example, pending: true }, play: async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement); await expect(d.getByLabelText('Monday start')).toBeDisabled();
  await expect(d.getByRole('button', { name: /^Cancel$/ })).toBeDisabled();
} };
export const Conflict: Story = { args: { value: example, conflict: true }, play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement); await expect(d.getByLabelText('Monday start')).toBeDisabled();
  await expect(d.getByRole('button', { name: copy.save })).toBeDisabled();
  await userEvent.click(d.getByRole('button', { name: 'Reload latest values' })); await expect(args.onReload).toHaveBeenCalledOnce();
} };
export const SaveFailure: Story = { args: { value: example, onSave: fn(async () => { throw Error('Save failed'); }) }, play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement); await userEvent.click(d.getByLabelText('Monday')); await userEvent.click(d.getByRole('button', { name: copy.save }));
  await expect(d.getByRole('alert')).toBeVisible(); await expect(d.getByLabelText('Tuesday start')).toHaveValue('08:00');
  await expect(d.getByRole('button', { name: copy.save })).toBeEnabled(); await expect(args.onClose).not.toHaveBeenCalled();
} };
export const Mobile: Story = { args: { value: example }, globals: { viewport: { value: 'phone', isRotated: false } }, play: async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement); await expect(d.getByLabelText('Monday start')).toBeVisible();
  const paper = within(canvasElement.ownerDocument.body).getByRole('dialog');
  await expect(paper.scrollWidth).toBeLessThanOrEqual(paper.clientWidth + 1);
} };
