import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { WorkOrderVisitDialog, type WorkOrderVisitDialogProps } from './work-order-visit-dialog';
import { workOrderVisitDialogData as copy, workOrderVisitDialogFixtures as fixtures } from './work-order-visit-dialog.data';
const meta = { title: 'Work Orders/WorkOrderVisitDialog', component: WorkOrderVisitDialog,
  args: { open: true, mode: 'join', today: copy.stories.today, workOrder: fixtures.workOrder, source: fixtures.independent, target: fixtures.job, onClose: fn(), onConfirm: fn(), onReload: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><Story/></main>], parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof WorkOrderVisitDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
const body = (canvas: HTMLElement) => within(canvas.ownerDocument.body);
async function review(canvas: HTMLElement) { await userEvent.click(body(canvas).getByRole('button', { name: copy.review })); }
export const Default: Story = { play: async ({ args, canvasElement }) => { await expect(body(canvasElement).getByRole('button', { name: copy.review })).toBeEnabled(); await expect(args.onConfirm).not.toHaveBeenCalled(); } };
export const JoinReview: Story = { play: async ({ args, canvasElement }) => {
  await review(canvasElement); await waitFor(() => expect(body(canvasElement).getByLabelText(copy.summary)).toHaveFocus());
  await expect(args.onConfirm).not.toHaveBeenCalled(); await expect(args.onClose).not.toHaveBeenCalled();
} };
export const JoinConfirmation: Story = { play: async ({ args, canvasElement }) => {
  await review(canvasElement); await userEvent.click(body(canvasElement).getByRole('button', { name: copy.confirmJoin }));
  await expect(args.onConfirm).toHaveBeenCalledTimes(1); await expect(args.onConfirm).toHaveBeenCalledWith({ kind: 'join', workOrderId: fixtures.workOrder.id, sourceVisitId: fixtures.independent.id, sourceRevision: fixtures.independent.revision, visitId: fixtures.job.id, revision: fixtures.job.revision });
} };
export const Separate: Story = { args: { mode: 'separate', source: fixtures.shared } };
export const SeparateReview: Story = { args: { mode: 'separate', source: fixtures.shared }, play: async ({ canvasElement, args }) => {
  await userEvent.clear(body(canvasElement).getByLabelText(copy.date)); await userEvent.type(body(canvasElement).getByLabelText(copy.date), copy.stories.nextDate);
  await review(canvasElement); await expect(args.onConfirm).not.toHaveBeenCalled(); await expect(body(canvasElement).getByRole('region', { name: copy.remains })).toHaveTextContent(fixtures.shared.records[0].number);
} };
export const SeparateConfirmation: Story = { args: { mode: 'separate', source: fixtures.shared }, play: async ({ canvasElement, args }) => {
  await review(canvasElement); await userEvent.click(body(canvasElement).getByRole('button', { name: copy.confirmSeparate }));
  await expect(args.onConfirm).toHaveBeenCalledTimes(1); await expect(args.onConfirm).toHaveBeenCalledWith({ kind: 'separate', workOrderId: fixtures.workOrder.id, visitId: fixtures.shared.id, revision: fixtures.shared.revision, scheduledDate: fixtures.shared.scheduledDate, arrivalWindow: fixtures.shared.arrivalWindow });
} };
export const LeaveUnscheduled: Story = { args: { mode: 'separate', source: fixtures.shared }, play: async ({ canvasElement, args }) => {
  await userEvent.click(body(canvasElement).getByRole('checkbox', { name: copy.unscheduled })); await review(canvasElement);
  await userEvent.click(body(canvasElement).getByRole('button', { name: copy.confirmSeparate }));
  await expect(args.onConfirm).toHaveBeenCalledTimes(1); await expect(args.onConfirm).toHaveBeenCalledWith({ kind: 'separate', workOrderId: fixtures.workOrder.id, visitId: fixtures.shared.id, revision: fixtures.shared.revision, scheduledDate: null, arrivalWindow: null });
} };
export const BackToEditing: Story = { args: { mode: 'separate', source: fixtures.shared }, play: async ({ canvasElement }) => {
  await review(canvasElement); await userEvent.click(body(canvasElement).getByRole('button', { name: copy.back }));
  await expect(body(canvasElement).getByLabelText(copy.date)).toHaveValue(fixtures.shared.scheduledDate); await waitFor(() => expect(body(canvasElement).getByLabelText(copy.date)).toHaveFocus());
} };
export const ReadOnly: Story = { args: { source: { ...fixtures.independent, canReschedule: false } }, play: async ({ canvasElement, args }) => { await expect(body(canvasElement).getByRole('button', { name: copy.review })).toBeDisabled(); await expect(args.onConfirm).not.toHaveBeenCalled(); } };
export const TargetReadOnly: Story = { args: { target: { ...fixtures.job, canReschedule: false } } };
export const AlreadyShared: Story = { args: { source: fixtures.shared } };
export const WrongJob: Story = { args: { workOrder: { ...fixtures.workOrder, jobId: 'other-job' } } };
export const UnscheduledTarget: Story = { args: { target: { ...fixtures.job, scheduledDate: null, arrivalWindow: null } } };
export const ClosedWorkOrder: Story = { args: { source: { ...fixtures.independent, records: [{ ...fixtures.independent.records[0], type: 'work_order', status: 'completed' }] } } };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => { await expect(body(canvasElement).queryByText(fixtures.workOrder.number)).not.toBeInTheDocument(); } };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => { await userEvent.click(body(canvasElement).getByRole('button', { name: copy.reload })); await expect(args.onReload).toHaveBeenCalledOnce(); } };
export const Saving: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => { await userEvent.keyboard('{Escape}'); await waitFor(() => expect(body(canvasElement).getByRole('dialog')).toBeVisible()); await expect(args.onClose).not.toHaveBeenCalled(); } };
export const FailedConfirmation: Story = { args: { onConfirm: fn(async () => { throw new globalThis.Error(copy.stories.failure); }), error: copy.stories.failure }, play: async ({ canvasElement, args }) => {
  await review(canvasElement); await userEvent.click(body(canvasElement).getByRole('button', { name: copy.confirmJoin })); await expect(args.onClose).not.toHaveBeenCalled(); await expect(body(canvasElement).getByRole('button', { name: copy.confirmJoin })).toBeEnabled();
} };
export const Conflict: Story = { args: { mode: 'separate', source: fixtures.shared, conflict: true } };
export const LongContent: Story = { args: { workOrder: { ...fixtures.workOrder, title: copy.stories.longTitle } } };
function ChangedPreview(args: WorkOrderVisitDialogProps) {
  const [changed, setChanged] = useState(false);
  useEffect(() => { const change = () => setChanged(value => !value); window.addEventListener('preview-visit-authority-changed', change); return () => window.removeEventListener('preview-visit-authority-changed', change); }, []);
  return <WorkOrderVisitDialog {...args} source={args.source ? { ...args.source, canReschedule: !changed } : null}/>;
}
export const PermissionChanged: Story = { render: args => <ChangedPreview {...args}/>, play: async ({ canvasElement, args }) => {
  await review(canvasElement); canvasElement.ownerDocument.defaultView?.dispatchEvent(new Event('preview-visit-authority-changed'));
  await waitFor(() => expect(body(canvasElement).getByRole('button', { name: copy.review })).toBeDisabled());
  canvasElement.ownerDocument.defaultView?.dispatchEvent(new Event('preview-visit-authority-changed'));
  await waitFor(() => expect(body(canvasElement).getByRole('button', { name: copy.review })).toBeEnabled()); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const Keyboard: Story = { play: async ({ canvasElement }) => {
  const reviewButton = body(canvasElement).getByRole('button', { name: copy.review }); reviewButton.focus(); await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(body(canvasElement).getByLabelText(copy.summary)).toHaveFocus());
  await userEvent.tab(); await expect(body(canvasElement).getByRole('button', { name: copy.back })).toHaveFocus();
} };
export const InvalidDate: Story = { args: { mode: 'separate', source: fixtures.shared }, play: async ({ canvasElement, args }) => {
  await userEvent.clear(body(canvasElement).getByLabelText(copy.date)); await expect(body(canvasElement).getByRole('button', { name: copy.review })).toBeDisabled(); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const HistoricalRecord: Story = { args: { mode: 'separate', source: { ...fixtures.shared, records: [...fixtures.shared.records, { ...fixtures.shared.records[1], id: 'historical-order', number: 'WO-1008', type: 'work_order', status: 'completed' }] } }, play: async ({ canvasElement }) => {
  await review(canvasElement); await expect(body(canvasElement).getByRole('region', { name: copy.remains })).not.toHaveTextContent('WO-1008'); await waitFor(() => expect(body(canvasElement).getByText(copy.history)).toBeVisible());
} };
function RevisionPreview(args: WorkOrderVisitDialogProps) {
  const [changed, setChanged] = useState(false);
  useEffect(() => { const change = () => setChanged(true); window.addEventListener('preview-visit-revision-changed', change); return () => window.removeEventListener('preview-visit-revision-changed', change); }, []);
  return <WorkOrderVisitDialog {...args} source={args.source ? { ...args.source, revision: changed ? copy.stories.changedRevision : args.source.revision } : null}/>;
}
export const RevisionChanged: Story = { render: args => <RevisionPreview {...args}/>, play: async ({ canvasElement, args }) => {
  await review(canvasElement); canvasElement.ownerDocument.defaultView?.dispatchEvent(new Event('preview-visit-revision-changed'));
  await waitFor(() => expect(body(canvasElement).getByRole('button', { name: copy.review })).toBeEnabled()); await expect(body(canvasElement).queryByRole('button', { name: copy.confirmJoin })).not.toBeInTheDocument(); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
