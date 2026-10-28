import { useEffect, useState } from 'react';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CreateWorkOrderDialog, type CreateWorkOrderDialogProps, type CreateWorkOrderVisitContext } from './create-work-order-dialog';
import { createWorkOrderJob, createWorkOrderSources, workOrderMembers } from '../work-order-preview.data';
import { copy } from './create-work-order-dialog.data';
import { workOrderVisitChoiceData as visitCopy } from '../work-order-visit-choice/work-order-visit-choice.data';
const visit = { id: copy.stories.visitId, revision: copy.stories.revision, scheduledDate: copy.stories.date, arrivalWindow: '09:00-11:00' as const,
  timezone: copy.stories.timezone, canJoin: true, references: [createWorkOrderJob.number, copy.stories.workOrder] };
const visitContext: CreateWorkOrderVisitContext = { state: 'ready', visit };
const meta = { title: 'Work Orders/CreateWorkOrderDialog', component: CreateWorkOrderDialog,
  args: { open: true, job: createWorkOrderJob, members: workOrderMembers, sources: createWorkOrderSources, canCreate: true, visitContext, onClose: fn(), onConfirm: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><Story/></main>], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof CreateWorkOrderDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
const body = (element: HTMLElement) => within(element.ownerDocument.body);
async function review(element: HTMLElement, choice: 'job' | 'separate') {
  const b = body(element);
  await userEvent.click(b.getByRole('radio', { name: choice === 'job' ? visitCopy.useJob : visitCopy.separate }));
  await userEvent.click(b.getByRole('button', { name: copy.review }));
  await expect(b.getByRole('heading', { name: copy.reviewTitle })).toBeVisible();
  return b;
}
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const b = body(canvasElement); await expect(b.getByRole('button', { name: copy.review })).toBeDisabled();
  await expect(b.getByRole('radio', { name: visitCopy.useJob })).not.toBeChecked();
  await expect(b.getByRole('radio', { name: visitCopy.separate })).not.toBeChecked();
  await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const SharedVisitReview: Story = { play: async ({ canvasElement, args }) => {
  const b = await review(canvasElement, 'job'); await expect(b.getByLabelText(copy.reviewSummary)).toHaveFocus();
  await expect(b.getByText(copy.sharedReview)).toBeVisible(); await expect(b.getByText(copy.stories.workOrder)).toBeVisible();
  await expect(args.onConfirm).not.toHaveBeenCalled(); await expect(args.onClose).not.toHaveBeenCalled();
} };
export const SharedVisitConfirmation: Story = { play: async ({ canvasElement, args }) => {
  const b = await review(canvasElement, 'job'); await userEvent.click(b.getByRole('button', { name: copy.confirm }));
  await expect(args.onConfirm).toHaveBeenCalledOnce();
  await expect(args.onConfirm).toHaveBeenCalledWith({ jobId: createWorkOrderJob.id, title: createWorkOrderJob.title, assigneeId: createWorkOrderJob.ownerId,
    source: { kind: 'blank' }, visit: { kind: 'job', visitId: visit.id, revision: visit.revision } });
} };
export const SeparateVisitReview: Story = { play: async ({ canvasElement, args }) => {
  const b = await review(canvasElement, 'separate'); await waitFor(() => expect(b.getByText(copy.unscheduled, { exact: true })).toBeVisible());
  await expect(b.queryByText(copy.stories.workOrder)).not.toBeInTheDocument(); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const SeparateVisitConfirmation: Story = { play: async ({ canvasElement, args }) => {
  const b = await review(canvasElement, 'separate'); await userEvent.click(b.getByRole('button', { name: copy.confirm }));
  await expect(args.onConfirm).toHaveBeenCalledWith({ jobId: createWorkOrderJob.id, title: createWorkOrderJob.title, assigneeId: createWorkOrderJob.ownerId, source: { kind: 'blank' }, visit: { kind: 'separate' } });
} };
export const UnscheduledJob: Story = { args: { visitContext: { state: 'ready', visit: null } }, play: async ({ canvasElement, args }) => {
  const b = body(canvasElement); await expect(b.queryByRole('radio')).not.toBeInTheDocument(); await userEvent.click(b.getByRole('button', { name: copy.review }));
  await waitFor(() => expect(b.getByText(copy.unscheduled, { exact: true })).toBeVisible()); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const NoArrivalWindow: Story = { args: { visitContext: { state: 'ready', visit: { ...visit, arrivalWindow: null } } } };
export const JoiningUnavailable: Story = { args: { visitContext: { state: 'ready', visit: { ...visit, canJoin: false, references: [createWorkOrderJob.number] } } }, play: async ({ canvasElement, args }) => {
  const b = body(canvasElement); await expect(b.getByRole('radio', { name: visitCopy.useJob })).toBeDisabled();
  await review(canvasElement, 'separate'); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const LoadingVisit: Story = { args: { visitContext: { ...visitContext, state: 'loading' } }, play: async ({ canvasElement }) => {
  const b = body(canvasElement); await expect(b.getByRole('button', { name: copy.review })).toBeDisabled(); await expect(b.queryByRole('radio')).not.toBeInTheDocument();
} };
export const VisitError: Story = { args: { visitContext: { ...visitContext, state: 'error', onReload: fn() } }, play: async ({ canvasElement, args }) => {
  const b = body(canvasElement); await expect(b.getByRole('button', { name: copy.review })).toBeDisabled();
  await userEvent.click(b.getByRole('button', { name: visitCopy.retry })); await expect(args.visitContext?.onReload).toHaveBeenCalledOnce();
} };
export const BackToEditing: Story = { play: async ({ canvasElement, args }) => {
  const b = body(canvasElement); await userEvent.clear(b.getByLabelText(copy.titleLabel)); await userEvent.type(b.getByLabelText(copy.titleLabel), copy.stories.longTitle.slice(0, 80));
  await review(canvasElement, 'separate'); await userEvent.click(b.getByRole('button', { name: copy.edit }));
  await waitFor(() => expect(b.getByLabelText(copy.titleLabel)).toHaveFocus()); await expect(b.getByLabelText(copy.titleLabel)).toHaveValue(copy.stories.longTitle.slice(0, 80));
  await expect(b.getByRole('radio', { name: visitCopy.separate })).toBeChecked(); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
function ChangedVisitPreview(args: CreateWorkOrderDialogProps) {
  const [context, setContext] = useState(args.visitContext);
  useEffect(() => { const change = (event: Event) => setContext((event as CustomEvent<boolean>).detail ? visitContext : { state: 'ready', visit: { ...visit, revision: `${visit.revision}-changed`, canJoin: false } });
    window.addEventListener('preview-work-order-visit-changed', change); return () => window.removeEventListener('preview-work-order-visit-changed', change); }, []);
  return <CreateWorkOrderDialog {...args} visitContext={context}/>;
}
export const VisitChangedDuringReview: Story = { render: ChangedVisitPreview, play: async ({ canvasElement, args }) => {
  const b = await review(canvasElement, 'job');
  canvasElement.ownerDocument.defaultView?.dispatchEvent(new Event('preview-work-order-visit-changed'));
  await waitFor(async () => expect(b.getByRole('heading', { name: copy.title })).toBeVisible());
  await expect(b.getByRole('button', { name: copy.review })).toBeDisabled(); await expect(b.getByRole('radio', { name: visitCopy.useJob })).not.toBeChecked();
  await expect(b.getByRole('radio', { name: visitCopy.separate })).not.toBeChecked(); await expect(args.onConfirm).not.toHaveBeenCalled();
  canvasElement.ownerDocument.defaultView?.dispatchEvent(new CustomEvent('preview-work-order-visit-changed', { detail: true }));
  await waitFor(() => expect(b.getByRole('radio', { name: visitCopy.useJob })).toBeEnabled());
  await expect(b.getByRole('radio', { name: visitCopy.useJob })).not.toBeChecked(); await expect(b.getByRole('button', { name: copy.review })).toBeDisabled();
} };
export const FailedConfirmation: Story = { args: { onConfirm: fn(async () => { throw new globalThis.Error(copy.stories.failure); }) }, play: async ({ canvasElement, args }) => {
  const b = await review(canvasElement, 'job'); await userEvent.click(b.getByRole('button', { name: copy.confirm }));
  await expect(b.getByRole('alert')).toBeVisible(); await expect(b.getByLabelText(copy.reviewSummary)).toBeVisible(); await expect(args.onClose).not.toHaveBeenCalled();
} };
export const NoSources: Story = { args: { sources: [] } };
export const JobWithoutOwner: Story = { args: { job: { ...createWorkOrderJob, ownerId: null } } };
export const Saving: Story = { args: { pending: true } };
export const Error: Story = { args: { error: copy.stories.failure } };
export const NoPermission: Story = { args: { canCreate: false } };
export const JobClosed: Story = { args: { jobClosed: true } };
export const LongContent: Story = { args: { initialTitle: copy.stories.longTitle, visitContext: { state: 'ready', visit: { ...visit, references: [createWorkOrderJob.number, copy.stories.longReference] } } } };
export const Keyboard: Story = { play: async ({ canvasElement, args }) => {
  const b = body(canvasElement); b.getByRole('radio', { name: visitCopy.useJob }).focus(); await userEvent.keyboard(' ');
  await userEvent.keyboard('{ArrowDown}'); await expect(b.getByRole('radio', { name: visitCopy.separate })).toBeChecked();
  b.getByRole('button', { name: copy.review }).focus(); await userEvent.keyboard('{Enter}'); await expect(b.getByLabelText(copy.reviewSummary)).toHaveFocus(); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const ExistingLiveFlow: Story = { args: { visitContext: undefined }, play: async ({ canvasElement, args }) => {
  const b = body(canvasElement); await userEvent.selectOptions(b.getByLabelText(copy.start), 'estimate:est-2041');
  await expect(await b.findByText(/Prices are not copied/)).toBeInTheDocument(); await userEvent.click(b.getByRole('button', { name: copy.create }));
  await expect(args.onConfirm).toHaveBeenCalledWith({ jobId: createWorkOrderJob.id, title: createWorkOrderJob.title, assigneeId: createWorkOrderJob.ownerId, source: { kind: 'estimate', estimateId: 'est-2041' } });
} };
