import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { CaptureReviewPagePreview } from './capture-review-page-preview';
import { captureReviewPageData as copy } from './capture-review-page.data';
import { captureReviewFixture } from './capture-review-page.fixtures';
import { captureSetupReviewData as review } from '../capture-setup-review/capture-setup-review.data';
import { captureSetupHeaderData as header } from '../capture-setup-header/capture-setup-header.data';
import { capturePublicationInstructionsData as publication } from '../capture-publication-instructions/capture-publication-instructions.data';
const meta = { title: 'Lead Capture/CaptureReviewPage', component: CaptureReviewPagePreview, parameters: { layout: 'fullscreen' }, args: { onLaunch: fn(), onEdit: fn(), onNavigate: fn(), onOpenSource: fn(), onOpenIntake: fn(), onCopy: fn() } } satisfies Meta<typeof CaptureReviewPagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
const scheduled = { mode: 'scheduled', localDateTime: copy.stories.schedule } as const;
async function launch(element: HTMLElement, schedule = false) {
  const c = within(element); await userEvent.click(c.getByRole('checkbox', { name: review.confirm })); await userEvent.click(c.getByRole('button', { name: schedule ? review.schedule : review.launch }));
}
export const Default: Story = {};
export const Gmail: Story = { args: { initialDraft: captureReviewFixture('gmail') } };
export const WebsiteLaunch: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.queryByRole('textbox', { name: publication.url })).not.toBeInTheDocument(); await launch(canvasElement);
  await expect(c.getByRole('heading', { name: copy.active })).toHaveFocus(); await expect(args.onLaunch).toHaveBeenCalledWith(expect.objectContaining({ draft: captureReviewFixture(), timing: { kind: 'now' }, requestId: expect.any(String) }));
  await userEvent.click(c.getByRole('button', { name: publication.copyLink })); await expect(args.onCopy).toHaveBeenCalledWith(publication.stories.url);
  await userEvent.click(c.getByRole('button', { name: copy.source })); await expect(args.onOpenSource).toHaveBeenCalledWith(expect.objectContaining({ sourceId: 'preview-source', sourceVersion: 1 }));
  await expect(c.queryByRole('button', { name: review.launch })).not.toBeInTheDocument();
} };
export const WebsiteSchedule: Story = { args: { initialValue: scheduled }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await launch(canvasElement, true); await expect(c.getByRole('heading', { name: copy.scheduled })).toHaveFocus();
  await expect(args.onLaunch.mock.calls[0][0].timing).toEqual({ kind: 'scheduled', at: '2026-11-03T14:00:00.000Z', timezone: 'America/New_York', localDateTime: copy.stories.schedule });
  await expect(c.getByText(publication.statusHelp.scheduled)).toBeVisible(); await expect(c.getByRole('textbox', { name: publication.url })).toHaveValue(publication.stories.url);
} };
export const GmailLaunch: Story = { args: { initialDraft: captureReviewFixture('gmail') }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await launch(canvasElement); await expect(c.getByText(copy.gmailActive)).toBeVisible(); await expect(c.queryByRole('textbox', { name: publication.url })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.intake })); await expect(args.onOpenIntake).toHaveBeenCalledWith(expect.objectContaining({ source: 'gmail', status: 'active' }));
} };
export const GmailSchedule: Story = { args: { initialDraft: captureReviewFixture('gmail'), initialValue: scheduled }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await launch(canvasElement, true); await expect(c.getByText(copy.gmailScheduled)).toBeVisible(); await expect(c.queryByRole('textbox', { name: publication.code })).not.toBeInTheDocument();
} };
export const EditSections: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); for (const section of ['source', 'fields', 'workflow'] as const) { await userEvent.click(c.getByRole('button', { name: review.edit(review.sections[section]) })); await expect(args.onEdit).toHaveBeenLastCalledWith(section); } await expect(args.onLaunch).not.toHaveBeenCalled();
} };
export const BackNavigation: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: header.back })); await expect(args.onNavigate).toHaveBeenLastCalledWith('intake'); await userEvent.click(c.getByRole('button', { name: header.exit })); await expect(args.onNavigate).toHaveBeenLastCalledWith('list');
} };
export const CapacityBlocked: Story = { args: { initialDraft: { ...captureReviewFixture(), checks: captureReviewFixture().checks.map(check => check.id === 'capacity' ? { ...check, status: 'blocked', detail: review.stories.capacity } : check) } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: review.launch })).toBeDisabled(); await expect(c.getByRole('checkbox', { name: review.confirm })).toBeDisabled(); await expect(args.onLaunch).not.toHaveBeenCalled();
} };
export const CheckingReadiness: Story = { args: { initialDraft: { ...captureReviewFixture(), checks: captureReviewFixture().checks.map(check => check.id === 'access' ? { ...check, status: 'checking' } : check) } } };
export const ApprovalRequired: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: review.launch })).toBeDisabled(); await expect(args.onLaunch).not.toHaveBeenCalled();
} };
export const FailureAndRetry: Story = { args: { failOnce: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await launch(canvasElement); await expect(await c.findByRole('alert')).toHaveTextContent(review.failed); await expect(c.queryByRole('textbox', { name: publication.url })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: review.launch })); await expect(c.getByRole('heading', { name: copy.active })).toBeVisible();
  await expect(args.onLaunch).toHaveBeenCalledTimes(2); await expect(args.onLaunch.mock.calls[0][0].requestId).toBe(args.onLaunch.mock.calls[1][0].requestId);
} };
export const LaunchPending: Story = { args: { holdLaunch: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await launch(canvasElement); await expect(c.getByText(copy.pending)).toBeVisible(); await expect(c.getByRole('button', { name: header.back })).toBeDisabled();
  for (const section of ['source', 'fields', 'workflow'] as const) await expect(c.getByRole('button', { name: review.edit(review.sections[section]) })).toBeDisabled();
  fireEvent.submit(c.getByRole('checkbox', { name: review.confirm }).closest('form')!); await expect(args.onLaunch).toHaveBeenCalledTimes(1);
} };
export const MismatchedResponse: Story = { args: { invalidResult: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await launch(canvasElement); await expect(await c.findByRole('alert')).toHaveTextContent(review.failed); await expect(c.queryByRole('textbox', { name: publication.url })).not.toBeInTheDocument();
} };
export const DraftChangedDuringLaunch: Story = { args: { changeDuringLaunch: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await launch(canvasElement); await waitFor(() => expect(c.getByRole('button', { name: review.launch })).toBeDisabled()); await expect(args.onLaunch).toHaveBeenCalledTimes(1); await expect(c.queryByRole('heading', { name: copy.active })).not.toBeInTheDocument(); await expect(c.queryByRole('textbox', { name: publication.url })).not.toBeInTheDocument();
} };
export const ClipboardFailure: Story = { args: { failCopy: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await launch(canvasElement); await userEvent.click(c.getByRole('button', { name: publication.copyCode })); await expect(await c.findByText(publication.copyFailed)).toBeVisible(); await expect(c.getByRole('textbox', { name: publication.code })).toHaveValue(publication.stories.code);
} };
export const ReadOnly: Story = { args: { canEdit: false, canLaunch: false }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('checkbox', { name: review.confirm })).toBeDisabled(); await expect(c.queryByRole('button', { name: review.edit(review.sections.fields) })).not.toBeInTheDocument(); await expect(args.onLaunch).not.toHaveBeenCalled();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByRole('checkbox')).not.toBeInTheDocument(); await expect(c.queryByText(review.stories.name)).not.toBeInTheDocument();
} };
export const Revision: Story = { args: { revision: true } };
export const PastSchedule: Story = { args: { initialValue: { mode: 'scheduled', localDateTime: '2026-10-20T09:00' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(review.errors.future)).toBeVisible(); await expect(c.getByRole('button', { name: review.schedule })).toBeDisabled();
} };
export const InvalidTimezone: Story = { args: { initialDraft: { ...captureReviewFixture(), timezone: 'Invalid/Zone' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(review.errors.zone); await expect(c.getByRole('button', { name: review.launch })).toBeDisabled();
} };
export const AuthoritativeReceipt: Story = { args: { onApprove: fn(async () => {}) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await launch(canvasElement);
  await expect(args.onApprove).toHaveBeenCalledWith(expect.objectContaining({ requestId: expect.any(String) })); await expect(args.onLaunch).not.toHaveBeenCalled();
  await expect(c.getByText(review.submitted, { exact: true })).toBeVisible(); await expect(c.queryByRole('textbox', { name: publication.url })).not.toBeInTheDocument();
  await expect(c.queryByRole('heading', { name: copy.active })).not.toBeInTheDocument();
} };
