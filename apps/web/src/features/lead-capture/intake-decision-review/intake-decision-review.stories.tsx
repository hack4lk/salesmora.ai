import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import { IntakeDecisionReview, type IntakeDecisionReviewProps } from './intake-decision-review';
import { intakeDecisionReviewData as copy } from './intake-decision-review.data';
import type { IntakeDecisionReviewModel } from './intake-decision-review.validation';
const review: IntakeDecisionReviewModel = {
  intakeId: 'intake-item', intakeVersion: 1, revision: 'review-1', resolved: false, duplicateRequired: false, decision: 'create', matches: [],
  definitionVersion: 1, definition: { contactRequired: true, fields: [
    { id: 'name', key: 'name', type: 'short_text', label: copy.stories.labels.name, required: true, options: [] },
    { id: 'email', key: 'email', type: 'email', label: copy.stories.labels.email, required: false, options: [] },
    { id: 'service', key: 'service', type: 'short_text', label: copy.stories.labels.service, required: true, options: [] },
  ] }, answers: { name: copy.stories.name, email: copy.stories.email, service: copy.stories.service },
  workflowVersion: 1, workflow: copy.stories.workflow, access: 'ready', capacity: 'available', canCreate: true, canLink: true, canDismiss: true,
};
const duplicate: IntakeDecisionReviewModel = { ...review, duplicateRequired: true,
  matches: [{ id: 'lead-1', version: 3, name: copy.stories.target, contact: copy.stories.email, reason: '', canLink: true, changes: [{ id: 'phone', label: copy.stories.phone, existing: copy.stories.oldPhone, proposed: copy.stories.newPhone }] }],
  decision: { kind: 'link', reviewRevision: review.revision, leadId: 'lead-1', leadVersion: 3, changeIds: ['phone'] },
};
const meta = {
  title: 'Lead Capture/IntakeDecisionReview', component: IntakeDecisionReview, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><p className="mb-6 mt-0 text-sm text-muted">{copy.stories.description}</p><div className="mx-auto max-w-3xl"><Story /></div></main>],
  args: { review, canRead: true, onConfirm: fn<IntakeDecisionReviewProps['onConfirm']>(async () => ({ ok: true })), onBack: fn(), onReload: fn(async () => {}) },
} satisfies Meta<typeof IntakeDecisionReview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const ApproveCreate: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm.create }));
  await expect(args.onConfirm).toHaveBeenCalledWith({ intakeId: review.intakeId, expectedVersion: 1, reviewRevision: review.revision, requestId: expect.any(String), kind: 'create', definitionVersion: 1, workflowVersion: 1, answers: review.answers });
  await expect(c.getByRole('status')).toHaveTextContent(copy.success); await expect(c.getByRole('button', { name: copy.confirm.create })).toBeDisabled();
} };
export const SeparateLead: Story = { args: { review: { ...duplicate, decision: { kind: 'separate', reviewRevision: review.revision } } } };
export const LinkChanges: Story = { args: { review: duplicate }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm.link })); await expect(args.onConfirm).toHaveBeenCalledWith({ intakeId: review.intakeId, expectedVersion: 1, reviewRevision: review.revision, requestId: expect.any(String), kind: 'link', leadId: 'lead-1', expectedLeadVersion: 3, changeIds: ['phone'] });
} };
export const LinkOnlyAtCapacity: Story = { args: { review: { ...duplicate, answers: {}, capacity: 'exhausted', decision: { kind: 'link', reviewRevision: review.revision, leadId: 'lead-1', leadVersion: 3, changeIds: [] } } }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByText(copy.linkOnly)).toBeVisible(); await expect(c.getByRole('button', { name: copy.confirm.link })).toBeEnabled(); } };
export const Dismiss: Story = { args: { review: { ...review, decision: 'dismiss', answers: {}, capacity: 'exhausted', canCreate: false } }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm.dismiss })); await expect(args.onConfirm).toHaveBeenCalledWith({ intakeId: review.intakeId, expectedVersion: 1, reviewRevision: review.revision, requestId: expect.any(String), kind: 'dismiss' }); } };
export const MissingFields: Story = { args: { review: { ...review, answers: {} } }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.issues.fields); await expect(c.getByRole('button', { name: copy.confirm.create })).toBeDisabled(); } };
export const CapacityExhausted: Story = { args: { review: { ...review, capacity: 'exhausted' } } };
export const Checking: Story = { args: { review: { ...review, access: 'checking' } } };
export const PermissionBlocked: Story = { args: { review: { ...review, canCreate: false } } };
export const StaleDuplicate: Story = { args: { review: { ...duplicate, revision: 'review-2' } }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.issues.choice); await expect(c.getByRole('button', { name: copy.confirm.link })).toBeDisabled(); } };
export const Pending: Story = { args: { onConfirm: fn<IntakeDecisionReviewProps['onConfirm']>(() => new Promise(() => {})) }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm.create })); await expect(c.getByRole('button', { name: copy.pending })).toBeDisabled(); await expect(c.getByRole('button', { name: copy.back })).toBeDisabled(); fireEvent.submit(c.getByRole('button', { name: copy.pending }).closest('form')!); await expect(args.onConfirm).toHaveBeenCalledTimes(1); } };
export const RetrySameRequest: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); args.onConfirm.mockRejectedValueOnce(new Error('network'));
  await userEvent.click(c.getByRole('button', { name: copy.confirm.create })); await expect(c.getByRole('alert')).toHaveTextContent(copy.failure); await userEvent.click(c.getByRole('button', { name: copy.confirm.create }));
  await expect(args.onConfirm).toHaveBeenCalledTimes(2); await expect(args.onConfirm.mock.calls[0][0]).toEqual(args.onConfirm.mock.calls[1][0]); await expect(c.getByRole('status')).toHaveTextContent(copy.success);
} };
export const ServiceError: Story = { args: { onConfirm: fn<IntakeDecisionReviewProps['onConfirm']>(async () => ({ ok: false, kind: 'error', message: copy.stories.serverError })) }, play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm.create })); await expect(c.getByRole('alert')).toHaveTextContent(copy.stories.serverError); await expect(c.getByText(copy.stories.name)).toBeVisible(); } };
export const Conflict: Story = { args: { onConfirm: fn<IntakeDecisionReviewProps['onConfirm']>(async () => ({ ok: false, kind: 'conflict' })) }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm.create })); await expect(c.getByRole('button', { name: copy.confirm.create })).toBeDisabled(); await userEvent.click(c.getByRole('button', { name: copy.reload })); await expect(args.onReload).toHaveBeenCalledTimes(1); await expect(c.getByRole('button', { name: copy.confirm.create })).toBeDisabled(); } };
function ReloadPreview(args: IntakeDecisionReviewProps) {
  const [current, setCurrent] = useState(args.review);
  return <IntakeDecisionReview {...args} review={current} onReload={async () => { await args.onReload?.(); setCurrent({ ...current, intakeVersion: 2, revision: 'review-2' }); }} />;
}
export const ReloadConflict: Story = { render: args => <ReloadPreview {...args} />, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); args.onConfirm.mockResolvedValueOnce({ ok: false, kind: 'conflict' }); await userEvent.click(c.getByRole('button', { name: copy.confirm.create })); await userEvent.click(c.getByRole('button', { name: copy.reload })); await expect(c.getByRole('button', { name: copy.confirm.create })).toBeEnabled(); await userEvent.click(c.getByRole('button', { name: copy.confirm.create }));
  await expect(args.onConfirm).toHaveBeenLastCalledWith(expect.objectContaining({ expectedVersion: 2, reviewRevision: 'review-2' })); await expect(args.onConfirm.mock.calls[0][0].requestId).not.toBe(args.onConfirm.mock.calls[1][0].requestId);
} };
export const CapacityRace: Story = { args: { onConfirm: fn<IntakeDecisionReviewProps['onConfirm']>(async () => ({ ok: false, kind: 'capacity' })) }, play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm.create })); await expect(c.getByRole('alert')).toHaveTextContent(copy.issues.capacity); await expect(c.getByRole('button', { name: copy.confirm.create })).toBeDisabled(); } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByText(copy.stories.name)).not.toBeInTheDocument(); await expect(c.queryByRole('button')).not.toBeInTheDocument(); } };
export const Resolved: Story = { args: { review: { ...review, resolved: true } } };
export const LongContent: Story = { args: { review: { ...review, answers: { ...review.answers, service: copy.stories.long.repeat(2) } } } };
