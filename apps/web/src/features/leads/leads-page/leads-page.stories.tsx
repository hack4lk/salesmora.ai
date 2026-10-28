import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { RelatedEstimatesCard } from '../../estimates/related-estimates-card/related-estimates-card';
import { relatedEstimateFixtures } from '../../estimates/related-estimates-card/related-estimates-card.data';
import { LeadsPagePreview } from './leads-page-preview';
import { exportLeadsDialogData as exportCopy } from '../export-leads-dialog/export-leads-dialog.data';
import { leadsPageData as copy } from './leads-page.data';

const meta = { title: 'Leads/LeadsPage', component: LeadsPagePreview, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof LeadsPagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const List: Story = { args: { initialView: 'list' } };
export const Detail: Story = { args: { initialRecord: 'jordan' } };
export const WithEstimates: Story = {
  args: { initialRecord: 'jordan', onCreateEstimate: fn(),
    relatedEstimates: <RelatedEstimatesCard recordType="lead" estimates={relatedEstimateFixtures} total={3} canRead canCreate onCreate={fn()} />,
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: 'Estimates' })).toBeVisible();
    await expect(c.getAllByRole('link', { name: /^Open estimate EST-/ })).toHaveLength(3);
    await userEvent.click(c.getAllByRole('button', { name: 'Create estimate' })[0]);
    await expect(args.onCreateEstimate).toHaveBeenCalledOnce();
  },
};
export const Field: Story = { args: { assignedOnly: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('button', { name: 'Add lead' })).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: 'Show archived' })).not.toBeInTheDocument();
} };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Empty: Story = { args: { empty: true } };
export const FilteredEmpty: Story = { args: { filteredEmpty: true } };
export const Loading: Story = { args: { state: 'loading' } };
export const Error: Story = { args: { state: 'error' } };
export const PlanLimit: Story = { args: { limitReached: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: 'Add lead' }));
  await expect(body.getByRole('button', { name: 'Create lead' })).toBeDisabled();
} };
export const Narrow: Story = { parameters: { viewport: { value: 'phone' } } };
export const DetailNarrow: Story = { ...Detail, parameters: { viewport: { value: 'phone' } } };
export const ToggleView: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('button', { name: 'Pipeline' })).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(c.getByRole('button', { name: 'List' }));
  await expect(c.getByRole('button', { name: 'Open record · Jordan Lee', hidden: true })).toBeInTheDocument();
  await expect(c.queryByRole('checkbox', { name: /Select all rows/ })).not.toBeInTheDocument();
} };
export const SearchAndClear: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.type(c.getByRole('textbox', { name: /^Search leads/ }), copy.stories.missingSearch);
  await expect(c.getByRole('heading', { name: 'No leads match your filters' })).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: 'Clear filters' }));
  await expect(c.getByRole('button', { name: 'Pipeline' })).toHaveAttribute('aria-pressed', 'true');
  await expect(c.getByRole('textbox', { name: /^Search leads/ })).toHaveValue('');
} };
export const QuickView: Story = { ...List, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const mobile = c.queryByRole('button', { name: 'Open record · Jordan Lee' });
  await userEvent.click(mobile ?? within(c.getByRole('link', { name: 'Jordan Lee' }).closest('tr')!).getByText('Kitchen sink repair'));
  await expect(body.getByRole('dialog')).toBeVisible();
  await userEvent.click(body.getByRole('link', { name: 'Open full lead record' }));
  await expect(c.getByRole('heading', { name: 'Jordan Lee', level: 1 })).toBeVisible();
  await expect(body.queryByRole('dialog')).not.toBeInTheDocument();
} };
export const DeleteFlow: Story = { ...Detail, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: 'Delete' }));
  await userEvent.type(body.getByRole('textbox', { name: 'Lead number' }), 'LD-1042');
  await userEvent.click(body.getByRole('button', { name: 'Delete lead' }));
  await waitFor(() => expect(c.getByRole('heading', { name: 'Leads', level: 1 })).toBeVisible());
  await expect(c.queryByRole('link', { name: 'Jordan Lee' })).not.toBeInTheDocument();
} };
export const ArchiveAndRestore: Story = { ...Detail, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: 'Archive' }));
  await userEvent.click(body.getByRole('button', { name: 'Archive lead' }));
  await waitFor(() => expect(c.getByRole('button', { name: 'Restore' })).toBeVisible());
  await userEvent.click(c.getByRole('button', { name: 'Restore' }));
  await userEvent.click(body.getByRole('button', { name: 'Restore lead' }));
  await waitFor(() => expect(c.getByRole('button', { name: 'Archive' })).toBeVisible());
} };
export const FailedArchive: Story = { args: { initialRecord: 'jordan', failActions: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: 'Archive' }));
  await userEvent.click(body.getByRole('button', { name: 'Archive lead' }));
  await waitFor(() => expect(body.getByRole('alertdialog')).toBeVisible());
  await expect(body.getByRole('button', { name: 'Archive lead' })).toBeEnabled();
} };
export const ExportReview: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: 'Export' }));
  await waitFor(() => expect(body.getByText('All 64 matching leads')).toBeVisible());
  await userEvent.click(body.getByRole('button', { name: 'Export CSV' }));
  await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
} };
export const FollowUp: Story = { ...Detail, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: 'Prepare follow-up' }));
  const input = body.getByRole('textbox', { name: 'Ask the SalesMora assistant' });
  await expect((input as HTMLTextAreaElement).value).toContain('LD-1042');
  await expect(body.queryByText(copy.stories.reply)).not.toBeInTheDocument();
  await userEvent.click(body.getByRole('button', { name: 'Close chat' }));
} };
export const CreateFlow: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: 'Add lead' }));
  await userEvent.type(body.getByRole('textbox', { name: 'Lead name' }), copy.stories.newName);
  await userEvent.type(body.getByRole('textbox', { name: 'Service requested' }), copy.stories.newService);
  await userEvent.click(body.getByRole('button', { name: 'Create lead' }));
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(c.getByRole('link', { name: copy.stories.newName })).toBeVisible();
} };
export const MoveFlow: Story = { ...Detail, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.move }));
  await userEvent.selectOptions(body.getByRole('combobox', { name: 'New stage' }), 'contacted');
  await userEvent.click(body.getByRole('button', { name: 'Confirm move' }));
  await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
  await expect(within(c.getByRole('heading', { name: 'Jordan Lee', level: 1 }).closest('header')!).getByText('Contacted')).toBeVisible();
} };
export const AssignFlow: Story = { ...Detail, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.assign }));
  await userEvent.selectOptions(body.getByRole('combobox', { name: 'Lead owner' }), 'ava');
  await userEvent.click(body.getByRole('button', { name: copy.assignConfirm }));
  await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
  await expect(within(c.getByRole('region', { name: 'Contact details' })).getByText('Ava Morgan')).toBeVisible();
} };
export const NoteFlow: Story = { ...Detail, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.type(c.getByRole('textbox', { name: 'Add a team note' }), copy.stories.teamNote);
  await userEvent.click(c.getByRole('button', { name: 'Add note' }));
  await waitFor(() => expect(c.getByRole('textbox', { name: 'Add a team note' })).toHaveValue(''));
  await expect(c.getAllByText(copy.stories.teamNote)).toHaveLength(2);
} };
export const EditFlow: Story = { ...Detail, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: 'Edit lead' }));
  const input = body.getByRole('textbox', { name: 'Service requested' });
  await userEvent.clear(input); await userEvent.type(input, copy.stories.updatedService);
  await userEvent.click(body.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(c.getByRole('heading', { name: copy.stories.updatedService })).toBeVisible();
} };
export const EditDiscardGuard: Story = { ...Detail, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: 'Edit lead' }));
  const input = body.getByRole('textbox', { name: 'Service requested' });
  await userEvent.clear(input); await userEvent.type(input, copy.stories.updatedService);
  await userEvent.click(body.getByRole('button', { name: 'Close panel' }));
  await waitFor(() => expect(body.getByRole('alertdialog', { name: copy.discardTitle })).toBeVisible());
  await userEvent.click(body.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(body.getByRole('textbox', { name: 'Service requested' })).toHaveValue(copy.stories.updatedService));
  await userEvent.click(body.getByRole('button', { name: 'Close panel' }));
  await userEvent.click(body.getByRole('button', { name: copy.discard }));
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(c.queryByRole('heading', { name: copy.stories.updatedService })).not.toBeInTheDocument();
} };

export const ExportCountLoading: Story = { args: { exportPreviewState: 'loading' }, play: async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Export' }));
  const body = within(canvasElement.ownerDocument.body);
  await waitFor(() => expect(body.getByText(exportCopy.loading)).toBeVisible());
  await expect(body.getByRole('button', { name: exportCopy.confirm })).toBeDisabled();
} };
export const ExportCountFailed: Story = { args: { exportPreviewState: 'error' }, play: async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Export' }));
  const body = within(canvasElement.ownerDocument.body);
  await waitFor(() => expect(body.getByText(exportCopy.unavailable)).toBeVisible());
  await expect(body.getByRole('button', { name: exportCopy.confirm })).toBeDisabled();
} };
export const ExportCountReady: Story = { args: { exportPreviewState: 'ready' }, play: async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Export' }));
  const body = within(canvasElement.ownerDocument.body);
  await waitFor(() => expect(body.getByText(exportCopy.count(64))).toBeVisible());
  await expect(body.getByRole('button', { name: exportCopy.confirm })).toBeEnabled();
} };
