import { useState } from 'react';
import { copy as dialogCopy } from '../../jobs/job-dialog/job-dialog.data';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CalendarScheduleDialog, type CalendarScheduleDialogProps } from './calendar-schedule-dialog';
import { calendarScheduleDialogData as copy, calendarScheduleTargets as targets } from './calendar-schedule-dialog.data';

function Preview(args: CalendarScheduleDialogProps) {
  const [open, setOpen] = useState(args.open);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6"><h1 className="m-0 text-heading font-semibold">{copy.stories.heading}</h1>
    <button type="button" className="mt-6 min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-primary focus-visible:focus-ring" onClick={() => setOpen(true)}>{copy.stories.open}</button>
    <CalendarScheduleDialog {...args} open={open} onClose={() => { args.onClose(); setOpen(false); }}/>
  </main>;
}
const meta = {
  title: 'Calendar/CalendarScheduleDialog', component: CalendarScheduleDialog, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args}/>,
  args: { open: true, targets, initialVisitId: targets[0].id, today: copy.stories.today, onClose: fn(), onConfirm: fn(), onDraftChange: fn(), onReload: fn() },
} satisfies Meta<typeof CalendarScheduleDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
const dialogFor = async (canvas: HTMLElement) => {
  const dialog = within(canvas.ownerDocument.body).getByRole('dialog');
  await waitFor(() => expect(dialog).toBeVisible());
  return within(dialog);
};
const changeDate = async (canvas: HTMLElement) => {
  const d = await dialogFor(canvas), user = userEvent.setup({ document: canvas.ownerDocument });
  const input = d.getByLabelText(copy.date);
  await user.clear(input); await user.type(input, copy.stories.nextDate);
  return d;
};
export const Default: Story = { play: async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement);
  await expect(d.getByRole('button', { name: copy.review })).toBeDisabled();
  await expect(d.getByText('J-1042')).toBeVisible(); await expect(d.getByText('WO-1007')).toBeVisible();
} };
export const Review: Story = { play: async ({ canvasElement, args }) => {
  const d = await changeDate(canvasElement);
  await userEvent.click(d.getByRole('button', { name: copy.review }));
  await expect(d.getByText(copy.from)).toBeVisible(); await expect(d.getByText(copy.to)).toBeVisible();
  await expect(args.onConfirm).not.toHaveBeenCalled();
  await expect(d.getByRole('button', { name: copy.confirm })).toBeEnabled();
} };
export const NewVisit: Story = { args: { initialVisitId: targets[1].id, initialDate: copy.stories.nextDate }, play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement);
  await userEvent.click(d.getByRole('button', { name: copy.review }));
  await userEvent.click(d.getByRole('button', { name: copy.confirm }));
  await expect(args.onConfirm).toHaveBeenCalledWith({ visitId: targets[1].id, revision: targets[1].revision, scheduledDate: copy.stories.nextDate, arrivalWindow: null });
} };
export const WorkOrderOnly: Story = { args: { targets: [targets[2]], initialVisitId: targets[2].id } };
export const ClearSchedule: Story = { play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement);
  await userEvent.click(d.getByRole('button', { name: copy.clear }));
  await expect(d.getByText(copy.clearHelp)).toBeVisible();
  await expect(args.onConfirm).not.toHaveBeenCalled();
  await expect(d.getByRole('button', { name: copy.confirmClear })).toBeEnabled();
} };
export const ReadOnly: Story = { args: { targets: [{ ...targets[0], canReschedule: false }] }, play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement);
  await expect(d.getByRole('button', { name: copy.review })).toBeDisabled();
  await expect(d.getByLabelText(copy.date)).toBeDisabled(); await expect(d.getByText(copy.readOnly)).toBeVisible();
  await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const FieldScoped: Story = { args: { targets: [{ ...targets[2], crew: [targets[2].crew[0]] }], initialVisitId: targets[2].id }, play: async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement); await expect(d.queryByText('J-1042')).toBeNull(); await expect(d.queryByText(/Alex Chen/)).toBeNull();
} };
export const ClosedHistory: Story = { args: { targets: [{ ...targets[0], records: [{ ...targets[0].records[0], type: 'job', status: 'completed' }, targets[0].records[1]] }] }, play: async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement), affected = within(d.getByRole('region', { name: copy.affected }));
  await expect(affected.queryByText('J-1042')).toBeNull(); await expect(affected.getByText('WO-1007')).toBeVisible();
  await expect(d.getByText(copy.history)).toBeVisible();
} };
export const Warnings: Story = { args: { today: '2026-10-24', advisories: { visitId: targets[0].id, revision: targets[0].revision, scheduledDate: '2026-10-25', arrivalWindow: targets[0].arrivalWindow, messages: [copy.stories.overlap, copy.stories.load] } }, play: async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement), user = userEvent.setup({ document: canvasElement.ownerDocument }), input = d.getByLabelText(copy.date);
  await user.clear(input); await user.type(input, '2026-10-25');
  await expect(d.getByText(copy.after)).toBeVisible(); await expect(d.getByText(copy.stories.overlap)).toBeVisible();
  await expect(d.getByRole('button', { name: copy.review })).toBeEnabled();
  await user.selectOptions(d.getByLabelText(copy.window), '10:00-12:00');
  await expect(d.queryByText(copy.stories.overlap)).toBeNull();
} };
export const InvalidDate: Story = { args: { initialVisitId: targets[1].id }, play: async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement); await expect(d.getByRole('button', { name: copy.review })).toBeDisabled();
} };
export const Error: Story = { args: { error: copy.stories.failure }, play: async ({ canvasElement }) => {
  const d = await changeDate(canvasElement); await expect(d.getByLabelText(copy.date)).toHaveValue(copy.stories.nextDate);
} };
export const Conflict: Story = { args: { conflict: true }, play: async ({ canvasElement, args }) => {
  const d = await changeDate(canvasElement); await expect(d.getByRole('button', { name: copy.review })).toBeDisabled();
  await userEvent.click(d.getByRole('button', { name: dialogCopy.reload })); await expect(args.onReload).toHaveBeenCalledTimes(1);
  await expect(d.getByLabelText(copy.date)).toHaveValue(copy.stories.nextDate);
} };
export const Saving: Story = { args: { pending: true }, play: async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement); await expect(d.getByLabelText(copy.date)).toBeDisabled(); await expect(d.getByRole('button', { name: dialogCopy.close })).toBeDisabled();
} };
export const Empty: Story = { args: { targets: [] } };
export const Keyboard: Story = { args: { open: false }, play: async ({ canvasElement }) => {
  const user = userEvent.setup({ document: canvasElement.ownerDocument }), c = within(canvasElement), launch = c.getByRole('button', { name: copy.stories.open });
  launch.focus(); await user.keyboard('{Enter}'); await dialogFor(canvasElement); await user.keyboard('{Escape}');
  await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).toBeNull()); await expect(launch).toHaveFocus();
} };

export const ClearConfirmed: Story = { play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement);
  await userEvent.click(d.getByRole('button', { name: copy.clear }));
  await userEvent.click(d.getByRole('button', { name: copy.confirmClear }));
  await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  await expect(args.onConfirm).toHaveBeenCalledWith({ visitId: targets[0].id, revision: targets[0].revision, scheduledDate: null, arrivalWindow: null });
} };
export const PastDate: Story = { args: { today: '2026-10-24' }, play: async ({ canvasElement }) => {
  const d = await changeDate(canvasElement);
  await expect(d.getByText(copy.past)).toBeVisible(); await expect(d.getByRole('button', { name: copy.review })).toBeEnabled();
} };
export const ConfirmationFailure: Story = { args: { onConfirm: fn(async () => { throw new globalThis.Error('preview failure'); }) }, play: async ({ canvasElement }) => {
  const d = await changeDate(canvasElement);
  await userEvent.click(d.getByRole('button', { name: copy.review }));
  await userEvent.click(d.getByRole('button', { name: copy.confirm }));
  await waitFor(() => expect(d.getByText(dialogCopy.error)).toBeVisible());
  await userEvent.click(d.getByRole('button', { name: copy.back }));
  await expect(d.getByLabelText(copy.date)).toHaveValue(copy.stories.nextDate);
} };
