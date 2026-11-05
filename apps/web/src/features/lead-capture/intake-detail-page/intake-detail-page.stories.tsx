import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { IntakeDetailPagePreview, type IntakeDetailPagePreviewProps } from './intake-detail-page-preview';
import { intakeDetailPageData as copy } from './intake-detail-page.data';
import { intakeDecisionReviewData as decisionCopy } from '../intake-decision-review/intake-decision-review.data';

const meta = {
  title: 'Lead Capture/IntakeDetailPage', component: IntakeDetailPagePreview, parameters: { layout: 'fullscreen' },
  args: { onConfirm: fn<IntakeDetailPagePreviewProps['onConfirm']>(async () => ({ ok: true })), onLeave: fn() },
} satisfies Meta<typeof IntakeDetailPagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
const review = async (canvas: HTMLElement) => { await userEvent.click(within(canvas).getByRole('button', { name: copy.review })); };
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('heading', { name: 'Original email' })).toBeVisible();
  await expect(c.getByRole('heading', { name: 'Proposed lead details' })).toBeVisible(); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const Website: Story = { args: { website: true } };
export const ApproveCreate: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await review(canvasElement); await expect(args.onConfirm).not.toHaveBeenCalled();
  await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.create }));
  await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ kind: 'create', intakeId: 'intake-detail', expectedVersion: 1, definitionVersion: 1, workflowVersion: 1 }));
  await expect(c.getByRole('heading', { name: copy.completed })).toBeVisible();
} };
export const CorrectAndReview: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), field = c.getByRole('textbox', { name: copy.stories.labels.service });
  await userEvent.clear(field); await userEvent.type(field, copy.stories.corrected); await review(canvasElement);
  await expect(c.getByText(copy.stories.corrected, { exact: true })).toBeVisible();
  await expect(c.getByText((_text, element) => element?.tagName === 'P' && element.textContent === copy.stories.body)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: decisionCopy.back }));
  await expect(c.getByRole('textbox', { name: copy.stories.labels.service })).toHaveValue(copy.stories.corrected); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const MissingFields: Story = { args: { missingFields: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await review(canvasElement); await expect(c.getByText(decisionCopy.issues.fields)).toBeVisible();
  await expect(c.queryByRole('button', { name: decisionCopy.confirm.create })).not.toBeInTheDocument(); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const CorrectRequiredFields: Story = { args: { missingFields: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await review(canvasElement);
  await userEvent.type(c.getByRole('textbox', { name: copy.stories.labels.name }), copy.stories.name);
  await userEvent.type(c.getByRole('textbox', { name: 'Email (optional)' }), copy.stories.email);
  await review(canvasElement); await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.create }));
  await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ answers: expect.objectContaining({ name: copy.stories.name, email: copy.stories.email }) }));
} };
export const DismissAtCapacity: Story = { args: { missingFields: true, capacity: 'exhausted', dismissOnly: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('radio', { name: copy.dismiss })); await review(canvasElement);
  await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.dismiss }));
  await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ kind: 'dismiss' })); await expect(c.getByRole('heading', { name: copy.completed })).toBeVisible();
} };
export const Duplicate: Story = { args: { duplicate: true } };
export const DuplicateChoiceRequired: Story = { args: { duplicate: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await review(canvasElement); await expect(c.getByText(decisionCopy.issues.choice)).toBeVisible(); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const LinkSelectedChanges: Story = { args: { duplicate: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('radio', { name: /^Update \/ link existing/ }));
  await userEvent.click(c.getByRole('checkbox', { name: 'Apply change: Phone' })); await review(canvasElement);
  await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.link }));
  await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ kind: 'link', leadId: 'existing-lead', expectedLeadVersion: 3, changeIds: ['phone'] }));
} };
export const LinkOnlyAtCapacity: Story = { args: { duplicate: true, missingFields: true, capacity: 'exhausted' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('radio', { name: /^Update \/ link existing/ })); await review(canvasElement);
  await expect(c.getByText(decisionCopy.linkOnly)).toBeVisible(); await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.link }));
  await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ kind: 'link', changeIds: [] }));
} };
export const SeparateLead: Story = { args: { duplicate: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('radio', { name: /^Create separate lead/ })); await review(canvasElement);
  await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.separate })); await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ kind: 'separate' }));
} };
export const ChangedCorrectionRequiresChoice: Story = { args: { duplicate: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('radio', { name: /^Update \/ link existing/ })); await userEvent.click(c.getByRole('checkbox', { name: 'Apply change: Phone' }));
  const field = c.getByRole('textbox', { name: copy.stories.labels.service }); await userEvent.clear(field); await userEvent.type(field, copy.stories.corrected);
  await review(canvasElement); await expect(c.getByText(decisionCopy.issues.choice)).toBeVisible(); await expect(args.onConfirm).not.toHaveBeenCalled();
  await userEvent.click(c.getByRole('radio', { name: /^Update \/ link existing/ })); await expect(c.getByRole('checkbox', { name: 'Apply change: Phone' })).not.toBeChecked();
} };
export const MatchesUnavailable: Story = { args: { duplicate: true, canReadMatches: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByText(copy.stories.existing)).not.toBeInTheDocument();
  await expect(c.getByRole('radio', { name: /^Update \/ link existing/ })).toBeDisabled();
} };
export const MatchesErrorAndRetry: Story = { args: { duplicate: true, matchesState: 'error' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByText(copy.stories.existing)).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: 'Try again' })); await expect(c.getByText(copy.stories.existing)).toBeVisible();
} };
export const CapacityExhausted: Story = { args: { capacity: 'exhausted' }, play: async ({ canvasElement }) => {
  await review(canvasElement); await expect(within(canvasElement).getByText(decisionCopy.issues.capacity)).toBeVisible();
} };
export const AccessChecking: Story = { args: { access: 'checking' } };
export const ReadOnly: Story = { args: { readOnly: true, duplicate: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('textbox', { name: copy.stories.labels.name })).toHaveAttribute('readonly');
  await expect(c.queryByRole('button', { name: copy.review })).not.toBeInTheDocument(); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const Resolved: Story = { args: { resolved: true } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByText(copy.stories.body)).not.toBeInTheDocument(); await expect(c.queryByRole('textbox')).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { onConfirm: fn<IntakeDetailPagePreviewProps['onConfirm']>(() => new Promise(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await review(canvasElement); await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.create }));
  const submit = c.getByRole('button', { name: decisionCopy.pending }); await expect(submit).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.back })).toBeDisabled(); await expect(c.getByRole('button', { name: decisionCopy.back })).toBeDisabled();
  fireEvent.submit(submit.closest('form')!); await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  const unload = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(unload); await expect(unload.defaultPrevented).toBe(true);
} };
export const RetryAcrossReview: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); args.onConfirm.mockRejectedValueOnce(new Error('network'));
  await review(canvasElement); await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.create })); await expect(c.getByRole('alert')).toHaveTextContent(decisionCopy.failure);
  await userEvent.click(c.getByRole('button', { name: decisionCopy.back })); await review(canvasElement); await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.create }));
  await expect(args.onConfirm).toHaveBeenCalledTimes(2); await expect(args.onConfirm.mock.calls[0][0]).toEqual(args.onConfirm.mock.calls[1][0]);
} };
export const ConflictAndReload: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); args.onConfirm.mockResolvedValueOnce({ ok: false, kind: 'conflict' });
  await review(canvasElement); await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.create })); await expect(c.getByRole('button', { name: decisionCopy.confirm.create })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: decisionCopy.reload })); await expect(c.getByRole('textbox', { name: copy.stories.labels.name })).toBeVisible();
  await review(canvasElement); await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.create }));
  await expect(args.onConfirm).toHaveBeenLastCalledWith(expect.objectContaining({ expectedVersion: 2 })); await expect(args.onConfirm.mock.calls[0][0].requestId).not.toBe(args.onConfirm.mock.calls[1][0].requestId);
} };
export const CapacityRace: Story = { args: { onConfirm: fn<IntakeDetailPagePreviewProps['onConfirm']>(async () => ({ ok: false, kind: 'capacity' })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await review(canvasElement); await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.create }));
  await expect(c.getByRole('alert')).toHaveTextContent(decisionCopy.issues.capacity); await expect(c.getByRole('button', { name: decisionCopy.confirm.create })).toBeDisabled();
} };
export const PermissionRevokedDuringConfirmation: Story = { args: { revokeWhileConfirming: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await review(canvasElement); await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.create }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByRole('heading', { name: copy.completed })).not.toBeInTheDocument();
} };
export const ChangedItemDuringConfirmation: Story = { args: { changeWhileConfirming: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await review(canvasElement); await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.create }));
  await expect(c.getByText(copy.changed)).toBeVisible(); await waitFor(() => expect(args.onConfirm).toHaveBeenCalledTimes(1));
  await expect(c.getByRole('textbox', { name: copy.stories.labels.name })).toBeEnabled(); await expect(c.queryByRole('heading', { name: copy.completed })).not.toBeInTheDocument();
} };
export const KeepCorrections: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); const field = c.getByRole('textbox', { name: copy.stories.labels.service }); await userEvent.clear(field); await userEvent.type(field, copy.stories.corrected);
  await userEvent.click(c.getByRole('button', { name: copy.back })); const dialog = within(canvasElement.ownerDocument.body).getByRole('alertdialog');
  await userEvent.click(within(dialog).getByRole('button', { name: copy.keep })); await expect(field).toHaveValue(copy.stories.corrected); await expect(args.onLeave).not.toHaveBeenCalled();
} };
export const DiscardCorrections: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); const field = c.getByRole('textbox', { name: copy.stories.labels.service }); await userEvent.clear(field); await userEvent.type(field, copy.stories.corrected);
  await userEvent.click(c.getByRole('button', { name: copy.back })); const dialog = within(canvasElement.ownerDocument.body).getByRole('alertdialog');
  await userEvent.click(within(dialog).getByRole('button', { name: copy.discard })); await expect(args.onLeave).toHaveBeenCalledTimes(1); await expect(c.getByText(copy.stories.returned)).toBeVisible();
} };
export const Loading: Story = { args: { state: 'loading' } };
export const ErrorAndRetry: Story = { args: { state: 'error' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(c.getByRole('textbox', { name: copy.stories.labels.name })).toBeVisible();
} };
export const Missing: Story = { args: { state: 'missing' } };
export const MismatchedEvidence: Story = { args: { mismatch: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.invalid); await expect(c.queryByRole('textbox')).not.toBeInTheDocument();
} };
export const UntrustedContent: Story = { args: { untrusted: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('textbox', { name: copy.stories.labels.service })).toHaveValue(copy.stories.untrusted);
  await expect(c.queryByRole('img', { name: '' })).not.toBeInTheDocument();
} };
export const LongContent: Story = { args: { longContent: true, duplicate: true } };
export const ConflictSurvivesCorrections: Story = { args: { reloadRevisionOnly: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); args.onConfirm.mockResolvedValueOnce({ ok: false, kind: 'conflict' });
  await review(canvasElement); await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.create }));
  await userEvent.click(c.getByRole('button', { name: decisionCopy.back }));
  const field = c.getByRole('textbox', { name: copy.stories.labels.service }); await userEvent.clear(field); await userEvent.type(field, copy.stories.corrected);
  await expect(c.getByRole('button', { name: copy.review })).toBeDisabled(); await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  await userEvent.click(c.getByRole('button', { name: decisionCopy.reload })); await expect(c.getByRole('button', { name: copy.review })).toBeEnabled();
} };
export const DismissAfterCapacityRace: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); args.onConfirm.mockResolvedValueOnce({ ok: false, kind: 'capacity' });
  await review(canvasElement); await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.create }));
  await userEvent.click(c.getByRole('button', { name: decisionCopy.back })); await expect(c.getByRole('button', { name: copy.review })).toBeDisabled();
  await userEvent.click(c.getByRole('radio', { name: copy.dismiss })); await review(canvasElement); await userEvent.click(c.getByRole('button', { name: decisionCopy.confirm.dismiss }));
  await expect(args.onConfirm).toHaveBeenLastCalledWith(expect.objectContaining({ kind: 'dismiss' }));
} };
