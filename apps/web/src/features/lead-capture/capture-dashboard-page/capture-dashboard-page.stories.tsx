import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { CaptureDashboardPagePreview, type CaptureDashboardPagePreviewProps } from './capture-dashboard-page-preview';
import { captureDashboardFixture } from './capture-dashboard-page.fixtures';
import { captureDashboardPageData as copy } from './capture-dashboard-page.data';
import { captureSourceDetailsData as details } from '../capture-source-details/capture-source-details.data';
import { capturePauseResumeDialogData as intake } from '../capture-pause-resume-dialog/capture-pause-resume-dialog.data';
import { captureArchiveRestoreDialogData as archive } from '../capture-archive-restore-dialog/capture-archive-restore-dialog.data';
import { captureDuplicateDialogData as duplicate } from '../capture-duplicate-dialog/capture-duplicate-dialog.data';
import { captureLaunchChangeDialogData as schedule } from '../capture-launch-change-dialog/capture-launch-change-dialog.data';
import { capturePublicationInstructionsData as publication } from '../capture-publication-instructions/capture-publication-instructions.data';
import { captureDashboardSummaryData as summary } from '../capture-dashboard-summary/capture-dashboard-summary.data';
const meta = { title: 'Lead Capture/CaptureDashboardPage', render: (args: CaptureDashboardPagePreviewProps) => <CaptureDashboardPagePreview {...args} />, parameters: { layout: 'fullscreen' }, args: { onRequest: fn(), onEdit: fn(), onManageConnection: fn(), onBack: fn(), onCopy: fn() } } satisfies Meta<CaptureDashboardPagePreviewProps>;
export default meta;
type Story = StoryObj<typeof meta>;
const body = (element: HTMLElement) => within(element.ownerDocument.body);
async function closeDialog(element: HTMLElement) { await waitFor(() => expect(body(element).queryByRole('alertdialog')).not.toBeInTheDocument()); }
async function openActions(element: HTMLElement) {
  const existing = body(element).queryByRole('menu');
  if (existing) { await waitFor(() => expect(existing).toBeVisible()); return within(existing); }
  await userEvent.click(within(element).getByRole('button', { name: copy.actionsLabel }));
  const menu = await body(element).findByRole('menu'); await waitFor(() => expect(menu).toBeVisible()); return within(menu);
}
async function chooseAction(element: HTMLElement, action: keyof typeof copy.actions) {
  const menu = await openActions(element); await userEvent.click(menu.getByRole('menuitem', { name: copy.actions[action] }));
  const dialog = await body(element).findByRole('alertdialog'); await waitFor(() => expect(dialog).toBeVisible());
}
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), menu = await openActions(canvasElement), link = menu.getByRole('menuitem', { name: summary.review }); await expect(link).toHaveAttribute('href', '/storybook/intake-review?source=source-one'); await userEvent.click(link); await expect(c.getByText(copy.stories.intake)).toBeVisible(); await waitFor(() => expect(body(canvasElement).queryByRole('menu')).not.toBeInTheDocument());
} };
export const Settings: Story = { args: { initialTab: 'settings' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: details.edit })); await expect(args.onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'source-one', version: 4, configuration: expect.objectContaining({ kind: 'approved', version: 2 }) }));
  await userEvent.click(c.getByRole('button', { name: details.publicationAction })); await expect(c.getByRole('textbox', { name: publication.url })).toBeVisible();
} };
export const Publication: Story = { args: { initialTab: 'publication' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: publication.copyCode })); await expect(args.onCopy).toHaveBeenCalledWith(publication.stories.code);
} };
export const GmailSettings: Story = { args: { initialSource: captureDashboardFixture('gmail'), initialTab: 'settings' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.queryByRole('tab', { name: copy.tabs.publication })).not.toBeInTheDocument(); await userEvent.click(c.getByRole('button', { name: details.connectionAction })); await expect(args.onManageConnection).toHaveBeenCalledWith(expect.objectContaining({ type: 'gmail', version: 4 }));
} };
export const ReconnectRequired: Story = { args: { initialSource: { ...captureDashboardFixture('gmail', 'paused'), resumeReadiness: 'blocked', availability: { type: 'gmail', status: 'reconnect-required', email: details.stories.email } }, initialTab: 'settings' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(details.reconnectDescription)).toBeVisible(); await chooseAction(canvasElement, 'resume'); await expect(body(canvasElement).getByRole('button', { name: intake.confirm.resume })).toBeDisabled();
} };
export const UnpublishedRevision: Story = { args: { initialSource: { ...captureDashboardFixture(), draftVersion: 3 }, initialTab: 'settings' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByText(details.draftNotice)).toBeVisible(); await userEvent.click(c.getByRole('button', { name: details.continueDraft })); await expect(args.onEdit).toHaveBeenCalledWith(expect.objectContaining({ draftVersion: 3, configuration: expect.objectContaining({ version: 2 }) }));
} };
export const Draft: Story = { args: { initialSource: captureDashboardFixture('website', 'draft'), initialTab: 'settings' } };
export const PauseAndResume: Story = { play: async ({ canvasElement, args }) => {
  await chooseAction(canvasElement, 'pause'); await userEvent.click(body(canvasElement).getByRole('button', { name: intake.confirm.pause })); await closeDialog(canvasElement);
  await expect(args.onRequest).toHaveBeenLastCalledWith(expect.objectContaining({ action: 'pause', source: expect.objectContaining({ version: 4 }) }));
  await chooseAction(canvasElement, 'resume'); await userEvent.click(body(canvasElement).getByRole('button', { name: intake.confirm.resume })); await closeDialog(canvasElement);
  await expect(args.onRequest).toHaveBeenLastCalledWith(expect.objectContaining({ action: 'resume', source: expect.objectContaining({ version: 5, approved: details.stories.rows }) })); await expect((await openActions(canvasElement)).getByRole('menuitem', { name: copy.actions.pause })).toBeEnabled(); await userEvent.keyboard('{Escape}'); await waitFor(() => expect(body(canvasElement).queryByRole('menu')).not.toBeInTheDocument());
} };
export const ArchiveAndRestore: Story = { play: async ({ canvasElement, args }) => {
  await chooseAction(canvasElement, 'archive'); await userEvent.click(body(canvasElement).getByRole('button', { name: archive.confirm.archive })); await closeDialog(canvasElement);
  await chooseAction(canvasElement, 'restore'); await userEvent.click(body(canvasElement).getByRole('button', { name: archive.confirm.restore })); await closeDialog(canvasElement);
  await expect(args.onRequest).toHaveBeenLastCalledWith(expect.objectContaining({ action: 'restore', to: 'paused', source: expect.objectContaining({ version: 5 }) })); const menu = await openActions(canvasElement); await expect(menu.getByRole('menuitem', { name: copy.actions.resume })).toBeVisible(); await expect(menu.queryByRole('menuitem', { name: copy.actions.pause })).not.toBeInTheDocument(); await userEvent.keyboard('{Escape}'); await waitFor(() => expect(body(canvasElement).queryByRole('menu')).not.toBeInTheDocument());
} };
export const ArchivedDraftRestore: Story = { args: { initialSource: { ...captureDashboardFixture('website', 'draft'), status: 'archived' }, initialTab: 'settings' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await chooseAction(canvasElement, 'restore'); await userEvent.click(body(canvasElement).getByRole('button', { name: archive.confirm.restore })); await closeDialog(canvasElement);
  await expect(c.getByRole('heading', { name: details.draftConfiguration })).toBeVisible(); await expect((await openActions(canvasElement)).queryByRole('menuitem', { name: copy.actions.resume })).not.toBeInTheDocument(); await userEvent.keyboard('{Escape}'); await waitFor(() => expect(body(canvasElement).queryByRole('menu')).not.toBeInTheDocument()); await waitFor(() => expect(body(canvasElement).queryByRole('menu')).not.toBeInTheDocument()); await expect(c.getByRole('button', { name: details.edit })).toBeEnabled();
} };
export const ScheduledLaunchNow: Story = { args: { initialSource: captureDashboardFixture('website', 'scheduled') }, play: async ({ canvasElement, args }) => {
  await chooseAction(canvasElement, 'change-launch'); const d = body(canvasElement); await userEvent.click(d.getByRole('radio', { name: schedule.now })); await userEvent.click(d.getByRole('button', { name: schedule.launchNow })); await closeDialog(canvasElement);
  await expect(args.onRequest).toHaveBeenCalledWith(expect.objectContaining({ timing: { kind: 'now' }, source: expect.objectContaining({ version: 4 }) })); await expect((await openActions(canvasElement)).getByRole('menuitem', { name: copy.actions.pause })).toBeVisible(); await userEvent.keyboard('{Escape}'); await waitFor(() => expect(body(canvasElement).queryByRole('menu')).not.toBeInTheDocument());
} };
export const Reschedule: Story = { args: { initialSource: captureDashboardFixture('website', 'scheduled') }, play: async ({ canvasElement, args }) => {
  await chooseAction(canvasElement, 'change-launch'); const d = body(canvasElement), input = d.getByLabelText(new RegExp(schedule.date));
  fireEvent.change(input, { target: { value: copy.stories.nextLocal } }); await userEvent.click(d.getByRole('button', { name: schedule.confirm })); await closeDialog(canvasElement);
  await expect(args.onRequest).toHaveBeenCalledWith(expect.objectContaining({ timing: { kind: 'scheduled', at: copy.stories.nextAt, timezone: copy.stories.timezone, localDateTime: copy.stories.nextLocal } }));
} };
export const Duplicate: Story = { play: async ({ canvasElement, args }) => {
  await chooseAction(canvasElement, 'duplicate'); await userEvent.click(body(canvasElement).getByRole('button', { name: duplicate.confirm })); await closeDialog(canvasElement);
  await expect(args.onRequest).toHaveBeenCalledWith(expect.objectContaining({ sourceId: 'source-one', expectedVersion: 4, configuration: { kind: 'approved', version: 2 }, to: 'draft', requestId: expect.any(String) })); await expect(within(canvasElement).getByText(copy.stories.copied)).toBeVisible();
} };
export const ActionPending: Story = { args: { holdActions: true }, play: async ({ canvasElement, args }) => {
  await chooseAction(canvasElement, 'pause'); await userEvent.click(body(canvasElement).getByRole('button', { name: intake.confirm.pause }));
  await expect(body(canvasElement).getByRole('button', { name: intake.cancel })).toBeDisabled(); fireEvent.click(body(canvasElement).getByRole('button', { name: intake.pending.pause })); await expect(args.onRequest).toHaveBeenCalledTimes(1);
} };
export const ActionFailure: Story = { args: { failActions: true }, play: async ({ canvasElement }) => {
  await chooseAction(canvasElement, 'pause'); await userEvent.click(body(canvasElement).getByRole('button', { name: intake.confirm.pause })); await expect(await body(canvasElement).findByText(intake.failed)).toBeVisible();
} };
export const ConflictReload: Story = { args: { conflict: true }, play: async ({ canvasElement, args }) => {
  await chooseAction(canvasElement, 'pause'); const d = body(canvasElement); await expect(d.getByRole('button', { name: intake.confirm.pause })).toBeDisabled(); await userEvent.click(d.getByRole('button', { name: intake.reload })); await userEvent.click(d.getByRole('button', { name: intake.confirm.pause })); await closeDialog(canvasElement); await expect(args.onRequest).toHaveBeenCalledWith(expect.objectContaining({ source: expect.objectContaining({ version: 5 }) }));
} };
export const RestoreBlocked: Story = { args: { initialSource: { ...captureDashboardFixture('website', 'archived'), restoreReadiness: 'blocked' } }, play: async ({ canvasElement, args }) => {
  await chooseAction(canvasElement, 'restore'); await expect(body(canvasElement).getByRole('button', { name: archive.confirm.restore })).toBeDisabled(); await expect(args.onRequest).not.toHaveBeenCalled();
} };
export const OfficeArchive: Story = { args: { office: true, initialTab: 'settings' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.queryByRole('button', { name: details.edit })).not.toBeInTheDocument(); await expect((await openActions(canvasElement)).queryByRole('menuitem', { name: copy.actions.pause })).not.toBeInTheDocument(); await chooseAction(canvasElement, 'archive'); await userEvent.click(body(canvasElement).getByRole('button', { name: archive.confirm.archive })); await closeDialog(canvasElement); await expect(args.onRequest).toHaveBeenCalledWith(expect.objectContaining({ action: 'archive' }));
} };
export const ReadOnly: Story = { args: { readOnly: true, initialTab: 'settings' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByRole('button', { name: details.edit })).not.toBeInTheDocument(); const menu = await openActions(canvasElement); await expect(menu.getAllByRole('menuitem')).toHaveLength(1); await expect(menu.getByRole('menuitem', { name: summary.review })).toBeVisible(); await userEvent.keyboard('{Escape}'); await waitFor(() => expect(body(canvasElement).queryByRole('menu')).not.toBeInTheDocument());
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByText(details.stories.name)).not.toBeInTheDocument(); await expect(c.queryByRole('button', { name: copy.actionsLabel })).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: 'loading' } };
export const ErrorRetry: Story = { args: { state: 'error' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(c.getByRole('heading', { name: details.stories.name })).toBeVisible();
} };
export const TotalsError: Story = { args: { totalsError: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(summary.error); await userEvent.click(c.getByRole('button', { name: summary.retry })); await expect(c.queryByRole('alert')).not.toBeInTheDocument();
} };
export const PublicationMismatch: Story = { args: { initialTab: 'publication', wrongPublication: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.publicationInvalid); await expect(c.queryByRole('textbox', { name: publication.url })).not.toBeInTheDocument();
} };
export const PermissionBoundaries: Story = { args: { initialTab: 'publication', noPublicationAccess: true, noIntakeAccess: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByRole('tab', { name: copy.tabs.publication })).not.toBeInTheDocument(); await expect(c.queryByRole('button', { name: details.publicationAction })).not.toBeInTheDocument(); await expect(c.queryByRole('textbox', { name: publication.url })).not.toBeInTheDocument(); await userEvent.click(c.getByRole('tab', { name: copy.tabs.overview })); await expect(c.queryByRole('link', { name: summary.review })).not.toBeInTheDocument();
} };

export const DraftPublication: Story = { args: { initialSource: captureDashboardFixture('website', 'draft'), initialTab: 'publication' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(publication.draft)).toBeVisible(); await expect(c.queryByRole('alert')).not.toBeInTheDocument(); await expect(c.queryByRole('textbox', { name: publication.url })).not.toBeInTheDocument();
} };

export const ActionsMenuKeyboard: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), trigger = c.getByRole('button', { name: copy.actionsLabel });
  trigger.focus(); await userEvent.keyboard('{Enter}'); const menu = await body(canvasElement).findByRole('menu');
  await expect(within(menu).getAllByRole('menuitem')).toHaveLength(4); await expect(within(menu).getByRole('menuitem', { name: summary.review })).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}'); await expect(within(menu).getByRole('menuitem', { name: copy.actions.pause })).toHaveFocus();
  await userEvent.keyboard('{Escape}'); await waitFor(() => expect(body(canvasElement).queryByRole('menu')).not.toBeInTheDocument()); await waitFor(() => expect(body(canvasElement).queryByRole('menu')).not.toBeInTheDocument()); await expect(trigger).toHaveFocus(); await expect(args.onRequest).not.toHaveBeenCalled();
} };

export const TabsKeyboard: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), overview = c.getByRole('tab', { name: copy.tabs.overview });
  overview.focus(); await userEvent.keyboard('{ArrowRight}'); await expect(c.getByRole('tab', { name: copy.tabs.settings })).toHaveFocus(); await expect(c.getByRole('tab', { name: copy.tabs.settings })).toHaveAttribute('aria-selected', 'true');
  await expect(c.getByRole('tabpanel', { name: copy.tabs.settings })).toBeVisible(); await userEvent.keyboard('{End}'); await expect(c.getByRole('tab', { name: copy.tabs.publication })).toHaveFocus(); await userEvent.keyboard('{Home}'); await expect(overview).toHaveFocus(); await expect(overview).toHaveAttribute('aria-selected', 'true');
} };
