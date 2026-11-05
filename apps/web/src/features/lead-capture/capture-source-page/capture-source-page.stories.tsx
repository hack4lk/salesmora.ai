import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CaptureSourcePagePreview } from './capture-source-page-preview';
import { captureSourcePageData as copy } from './capture-source-page.data';
import { captureSourceListData as list } from '../capture-source-list/capture-source-list.data';
import { captureSourceToolbarData as toolbar } from '../capture-source-toolbar/capture-source-toolbar.data';
import { capturePauseResumeDialogData as intake } from '../capture-pause-resume-dialog/capture-pause-resume-dialog.data';
import { captureArchiveRestoreDialogData as archive } from '../capture-archive-restore-dialog/capture-archive-restore-dialog.data';
import { captureDuplicateDialogData as duplicate } from '../capture-duplicate-dialog/capture-duplicate-dialog.data';
import { dataTableData } from '../../../../../../packages/ui/src/data-display/data-table/data-table.data';
import { paginationData } from '../../../../../../packages/ui/src/data-display/pagination/pagination.data';
const meta = {
  title: 'Lead Capture/CaptureSourcePage', component: CaptureSourcePagePreview, parameters: { layout: 'fullscreen' },
  args: { onCreate: fn(), onOpen: fn(), onSetup: fn(), onRequest: fn() },
} satisfies Meta<typeof CaptureSourcePagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
const rowAction = (action: keyof typeof list.action, name: string) => list.actionLabel(list.action[action], name);
const body = (element: HTMLElement) => within(element.ownerDocument.body);
export const Default: Story = {};
export const SearchAndClear: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.type(c.getByRole('searchbox', { name: toolbar.search }), copy.stories.missing); await expect(c.getByText(list.filteredEmpty)).toBeVisible();
  await userEvent.clear(c.getByRole('searchbox')); await userEvent.selectOptions(c.getByLabelText(toolbar.source), 'gmail'); await expect(c.queryByRole('button', { name: list.open(copy.stories.names[0]) })).not.toBeInTheDocument(); await expect(c.getByRole('button', { name: list.open(copy.stories.names[1]) })).toBeVisible();
} };
export const NavigationCallbacks: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.create })); await expect(args.onCreate).toHaveBeenCalledTimes(1); await userEvent.click(c.getByRole('button', { name: list.open(copy.stories.names[0]) })); await expect(args.onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'source-0' })); await userEvent.click(c.getByRole('button', { name: rowAction('setup', copy.stories.names[4]) })); await expect(args.onSetup).toHaveBeenCalledWith(expect.objectContaining({ id: 'source-4' }));
} };
export const PauseAndResume: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), b = body(canvasElement); await userEvent.click(c.getByRole('button', { name: rowAction('pause', copy.stories.names[0]) })); await expect(b.getByRole('alertdialog')).toHaveAccessibleName(intake.title.pause); await userEvent.click(b.getByRole('button', { name: intake.confirm.pause })); await waitFor(() => expect(b.queryByRole('alertdialog')).not.toBeInTheDocument());
  await expect(args.onRequest).toHaveBeenCalledWith(expect.objectContaining({ action: 'pause', source: expect.objectContaining({ id: 'source-0', version: 1 }) }));
  await userEvent.click(c.getByRole('button', { name: rowAction('resume', copy.stories.names[0]) })); await userEvent.click(b.getByRole('button', { name: intake.confirm.resume })); await waitFor(() => expect(b.queryByRole('alertdialog')).not.toBeInTheDocument()); await expect(c.getByRole('button', { name: rowAction('pause', copy.stories.names[0]) })).toBeVisible();
} };
export const ArchiveAndRestore: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), b = body(canvasElement); await userEvent.click(c.getByRole('button', { name: rowAction('archive', copy.stories.names[0]) })); await userEvent.click(b.getByRole('button', { name: archive.confirm.archive })); await waitFor(() => expect(b.queryByRole('alertdialog')).not.toBeInTheDocument()); await expect(c.queryByRole('button', { name: list.open(copy.stories.names[0]) })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: toolbar.archived })); await userEvent.click(c.getByRole('button', { name: rowAction('restore', copy.stories.names[0]) })); await userEvent.click(b.getByRole('button', { name: archive.confirm.restore })); await waitFor(() => expect(b.queryByRole('alertdialog')).not.toBeInTheDocument()); await expect(args.onRequest).toHaveBeenLastCalledWith(expect.objectContaining({ action: 'restore', to: 'paused' }));
  await userEvent.click(c.getByRole('button', { name: toolbar.current })); await expect(c.getByRole('button', { name: rowAction('resume', copy.stories.names[0]) })).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: rowAction('duplicate', copy.stories.names[0]) })); await expect(b.getByText(`${duplicate.configuration.approved} · ${duplicate.revision(1)}`, { exact: true })).toBeVisible(); await userEvent.click(b.getByRole('button', { name: duplicate.cancel })); await waitFor(() => expect(b.queryByRole('alertdialog')).not.toBeInTheDocument());
} };
export const DuplicateDraft: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), b = body(canvasElement); await userEvent.click(c.getByRole('button', { name: rowAction('duplicate', copy.stories.names[0]) })); const name = b.getByRole('textbox', { name: duplicate.name }); await userEvent.clear(name); await userEvent.type(name, copy.stories.copyName); await userEvent.click(b.getByRole('button', { name: duplicate.confirm })); await waitFor(() => expect(b.queryByRole('alertdialog')).not.toBeInTheDocument()); await expect(c.getByRole('button', { name: list.open(copy.stories.copyName) })).toBeVisible(); await expect(args.onRequest).toHaveBeenCalledWith(expect.objectContaining({ sourceId: 'source-0', expectedVersion: 1, name: copy.stories.copyName, to: 'draft' }));
} };
export const CancelReview: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), b = body(canvasElement); await userEvent.click(c.getByRole('button', { name: rowAction('archive', copy.stories.names[0]) })); await userEvent.click(b.getByRole('button', { name: archive.cancel })); await waitFor(() => expect(b.queryByRole('alertdialog')).not.toBeInTheDocument()); await expect(args.onRequest).not.toHaveBeenCalled(); await expect(c.getByRole('button', { name: rowAction('archive', copy.stories.names[0]) })).toBeVisible();
} };
export const Archived: Story = { args: { initialFilters: { search: '', status: 'all', source: 'all', view: 'archived' } } };
export const Pagination: Story = { args: { many: true, initialPageSize: 5 }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: paginationData.item('next', null, false) })); await expect(c.getByText(paginationData.range(6, 10, 32))).toBeVisible();
  await userEvent.selectOptions(c.getByLabelText(toolbar.status), 'draft'); await expect(c.getByText(paginationData.range(1, 5, 6))).toBeVisible();
  await userEvent.selectOptions(c.getByLabelText(paginationData.pageSize), '25'); await expect(c.getByText(paginationData.range(1, 6, 6))).toBeVisible();
} };
export const ReadOnly: Story = { args: { readOnly: true }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.queryByRole('button', { name: copy.create })).not.toBeInTheDocument(); await expect(c.queryByRole('button', { name: rowAction('archive', copy.stories.names[0]) })).not.toBeInTheDocument(); await expect(c.getByRole('button', { name: list.open(copy.stories.names[0]) })).toBeVisible(); } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByRole('searchbox')).not.toBeInTheDocument(); await expect(c.queryByRole('button', { name: copy.create })).not.toBeInTheDocument(); await expect(c.queryByText(copy.stories.names[0])).not.toBeInTheDocument(); } };
export const Loading: Story = { args: { state: 'loading' } };
export const ErrorRetry: Story = { args: { state: 'error' }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(list.error); await userEvent.click(c.getByRole('button', { name: dataTableData.retry })); await expect(c.getByRole('button', { name: list.open(copy.stories.names[0]) })).toBeVisible(); } };
export const Empty: Story = { args: { empty: true } };
export const FailedAction: Story = { args: { failActions: true }, play: async ({ canvasElement }) => { const c = within(canvasElement), b = body(canvasElement); await userEvent.click(c.getByRole('button', { name: rowAction('pause', copy.stories.names[0]) })); await userEvent.click(b.getByRole('button', { name: intake.confirm.pause })); await expect(within(b.getByRole('alertdialog')).getByRole('alert')).toBeVisible(); await expect(b.getByRole('button', { name: intake.confirm.pause })).toBeEnabled(); } };
export const PendingAction: Story = { args: { holdActions: true }, play: async ({ canvasElement, args }) => { const c = within(canvasElement), b = body(canvasElement); await userEvent.click(c.getByRole('button', { name: rowAction('pause', copy.stories.names[0]) })); await userEvent.click(b.getByRole('button', { name: intake.confirm.pause })); await expect(b.getByRole('button', { name: intake.pending.pause })).toBeDisabled(); await expect(b.getByRole('button', { name: intake.cancel })).toBeDisabled(); await expect(args.onRequest).toHaveBeenCalledTimes(1); } };
export const LongContent: Story = { args: { longContent: true } };

export const ArchivedDraftNeedsReview: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), b = body(canvasElement); const name = copy.stories.names[4];
  await userEvent.click(c.getByRole('button', { name: rowAction('archive', name) })); await userEvent.click(b.getByRole('button', { name: archive.confirm.archive })); await waitFor(() => expect(b.queryByRole('alertdialog')).not.toBeInTheDocument());
  await userEvent.click(c.getByRole('button', { name: toolbar.archived })); await userEvent.click(c.getByRole('button', { name: rowAction('restore', name) })); await userEvent.click(b.getByRole('button', { name: archive.confirm.restore })); await waitFor(() => expect(b.queryByRole('alertdialog')).not.toBeInTheDocument());
  await userEvent.click(c.getByRole('button', { name: toolbar.current })); await expect(c.queryByRole('button', { name: rowAction('resume', name) })).not.toBeInTheDocument(); await expect(c.getByRole('button', { name: rowAction('edit', name) })).toBeVisible();
} };
