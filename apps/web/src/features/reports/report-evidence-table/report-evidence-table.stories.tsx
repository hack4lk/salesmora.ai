import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ReportEvidenceTable } from './report-evidence-table';
import { reportEvidenceTableData as copy } from './report-evidence-table.data';

const rows = [
  { id: 'l1', label: 'Kitchen inquiry', recordId: 'lead-1', cells: { date: 'Oct 12, 2026', owner: 'Me', source: 'Referral' } },
  { id: 'l2', label: 'Hallway repair', recordId: 'lead-2', cells: { date: 'Oct 25, 2026', owner: 'Teammate A', source: 'Phone' } },
];
const meta = {
  title: 'Reports/ReportEvidenceTable',
  component: ReportEvidenceTable,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical evidence view composing shared DataTable, Pagination and ReportResultState. Fictional host-supplied pages only. Columns/cells, total and record references must reflect current authorized projection and same snapshot. Host owns cursor/page retrieval, page-size reset, formatting and CSV permission revalidation; CSV covers all matching rows, not just displayed page. Null cells explicitly mean unknown, never zero. No bulk selection, client sorting, API or persistence.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="max-w-6xl"><Story /></div></main>],
  args: { viewLabel: 'New leads', contextLabel: 'Lead creation date / Oct 7 to Nov 5, 2026 / Europe/Warsaw / All authorized assignments', columns: [{ id: 'date', label: 'Basis date' }, { id: 'owner', label: 'Assignment / actor' }, { id: 'source', label: 'Source' }], rows, total: 2, page: 1, pageSize: 25, canRead: true, canExport: true, canEdit: true, onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof ReportEvidenceTable>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  const record = c.getAllByRole('button', { name: copy.record('Kitchen inquiry') }).find(button => button.getBoundingClientRect().height > 0)!;
  await userEvent.click(record);
  await expect(args.onRecord).toHaveBeenCalledWith('lead-1');
  await userEvent.click(c.getByRole('button', { name: copy.export }));
  await expect(args.onExport).toHaveBeenCalledTimes(1);
  await expect(c.queryByText(copy.exportHelp)).not.toBeInTheDocument();
  const trigger = c.getByRole('button', { name: copy.exportHelpLabel });
  await userEvent.click(trigger);
  const body = within(canvasElement.ownerDocument.body);
  const dialog = await body.findByRole('dialog', { name: copy.exportHelpLabel });
  await waitFor(() => expect(dialog).toBeVisible());
  await expect(within(dialog).getByText(copy.exportHelp)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
export const PaginationActions: Story = { args: { rows: Array.from({ length: 25 }, (_, index) => ({ ...rows[0], id: `l${index}`, label: `Lead ${index}` })), total: 27 }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: 'Go to page 2' }));
  await expect(args.onPageChange).toHaveBeenCalledWith(2);
  await userEvent.selectOptions(c.getByRole('combobox'), '50');
  await expect(args.onPageSizeChange).toHaveBeenCalledWith(50);
} };
export const LastPage: Story = { args: { total: 27, page: 2 } };
export const Empty: Story = { args: { total: 0, rows: [] }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.export })).toBeDisabled();
} };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByText('Kitchen inquiry')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.queryByText('Kitchen inquiry')).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: 'Retry report' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(c.queryByText('Kitchen inquiry')).not.toBeInTheDocument();
} };
export const ExportDenied: Story = { args: { canExport: false }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('button', { name: copy.export })).toBeDisabled();
  await expect(c.getByText(copy.exportDenied)).toBeVisible();
  await expect(args.onExport).not.toHaveBeenCalled();
} };
export const NoRecordAccess: Story = { args: { rows: rows.map(row => ({ ...row, recordId: undefined })) }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: /^View record:/ })).not.toBeInTheDocument();
} };
export const InvalidPage: Story = { args: { page: 3 }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(copy.invalid);
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  for (const button of c.getAllByRole('button').filter(button => !button.hasAttribute('aria-haspopup'))) await expect(button).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.exportHelpLabel })).toBeEnabled();
} };
export const UnknownAndZero: Story = { args: { columns: [{ id: 'cost', label: 'Recorded cost' }], rows: [{ ...rows[0], cells: { cost: null } }, { ...rows[1], cells: { cost: 'PLN 0.00' } }] }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getAllByText(copy.unknown)).toHaveLength(2);
  await expect(within(canvasElement).getAllByText('PLN 0.00')).toHaveLength(2);
} };
export const LongContent: Story = { args: { rows: rows.map(row => ({ ...row, label: 'Authorized-record-name-'.repeat(20) })), contextLabel: 'Authorized-context-'.repeat(30) } };
