import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SideDrawer, StatusBadge, Toast } from '@salesmora/ui';
import { LeadsTable, type LeadTableRow, type LeadsTableProps } from './leads-table';
import { leadsTableData as copy } from './leads-table.data';

type PreviewProps = Omit<LeadsTableProps, 'total' | 'selection'> & { selectable?: boolean; selectedIds?: readonly string[]; allMatching?: boolean };
const many: LeadTableRow[] = Array.from({ length: 62 }, (_, index) => ({ ...copy.stories.rows[index % copy.stories.rows.length], id: `lead-${index + 1}`, name: copy.stories.name(copy.stories.rows[index % copy.stories.rows.length].name, index + 1), createdAt: new Date(Date.parse(copy.stories.now) - index * 86400000).toISOString() }));
function Preview(args: PreviewProps) {
  const [page, setPage] = useState(args.page), [size, setSize] = useState(args.pageSize), [sort, setSort] = useState(args.sort);
  const [selected, setSelected] = useState<readonly string[]>(args.selectedIds ?? []), [allMatching, setAllMatching] = useState(args.allMatching ?? false);
  const [opened, setOpened] = useState<LeadTableRow | null>(null), [notice, setNotice] = useState('');
  const ordered = [...args.rows].sort((left, right) => {
    if (sort.column === 'owner' && (!left.owner || !right.owner)) return !left.owner ? !right.owner ? left.id.localeCompare(right.id) : 1 : -1;
    const value = (row: LeadTableRow) => sort.column === 'stage' ? copy.stages.findIndex(stage => stage.value === row.stage) : sort.column === 'created' ? Date.parse(row.createdAt) : sort.column === 'owner' ? row.owner?.name ?? '' : row[sort.column];
    const a = value(left), b = value(right);
    const compared = typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b));
    return (sort.direction === 'asc' ? compared : -compared) || left.id.localeCompare(right.id);
  });
  const clearPageSelection = () => { if (!allMatching) setSelected([]); };
  return <>
    <LeadsTable {...args} rows={ordered.slice((page - 1) * size, page * size)} total={args.rows.length} page={page} pageSize={size} sort={sort}
      onSort={args.onSort ? next => { args.onSort?.(next); setSort(next); setPage(1); clearPageSelection(); } : undefined}
      selection={args.selectable ? { ids: selected, allMatching, onChange: ids => { setAllMatching(false); setSelected(ids); }, onClear: () => { setAllMatching(false); setSelected([]); }, onSelectAllMatching: () => setAllMatching(true) } : undefined}
      onPageChange={value => { args.onPageChange(value); setPage(value); clearPageSelection(); }}
      onPageSizeChange={value => { args.onPageSizeChange(value); setSize(value); setPage(1); clearPageSelection(); }}
      onRowOpen={args.onRowOpen ? row => { args.onRowOpen?.(row); setOpened(row); } : undefined}
      onRestore={args.onRestore ? row => { args.onRestore?.(row); setNotice(copy.stories.restored); } : undefined}
      onRetry={args.onRetry ? () => { args.onRetry?.(); setNotice(copy.stories.retryRequested); } : undefined}
      onClearFilters={args.onClearFilters ? () => { args.onClearFilters?.(); setNotice(copy.stories.filtersCleared); } : undefined}/>
    <SideDrawer open={!!opened} title={opened?.name ?? copy.caption} description={opened?.service} onClose={() => setOpened(null)}>
      <p className="m-0 leading-6 text-muted">{copy.stories.quickView}</p>
      {opened && <div className="mt-6"><StatusBadge label={copy.stages.find(stage => stage.value === opened.stage)!.label}/></div>}
    </SideDrawer>
    <Toast open={!!notice} kind="success" message={notice} autoHideMs={null} onClose={() => setNotice('')}/>
  </>;
}
const meta = { title: 'Leads/LeadsTable', component: Preview, parameters: { layout: 'fullscreen' },
  args: { rows: copy.stories.rows, page: 1, pageSize: 25, sort: { column: 'created', direction: 'desc' }, now: copy.stories.now, timezone: copy.stories.timezone,
    getLeadHref: row => copy.stories.href(row.id), onSort: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRowOpen: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 text-muted">{copy.stories.description}</p><Story/></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const ManyRows: Story = { args: { rows: many, selectable: true } };
export const Unassigned: Story = { args: { rows: [copy.stories.rows[2]] } };
export const Archived: Story = { args: { rows: copy.stories.rows.slice(0, 2).map((row, index) => ({ ...row, archived: true, canRestore: index === 0 })), onRestore: fn() } };
export const Selected: Story = { args: { selectable: true, selectedIds: ['jordan', 'alex'] } };
export const AllMatching: Story = { args: { rows: many, selectable: true, allMatching: true } };
export const FieldRole: Story = { args: { rows: copy.stories.rows.filter(row => row.owner?.id === 'sam') } };
export const Loading: Story = { args: { state: 'loading', selectable: true } };
export const Empty: Story = { args: { rows: [] } };
export const EmptyAfterFilter: Story = { args: { rows: [], filtered: true, onClearFilters: fn() } };
export const Error: Story = { args: { state: 'error', onRetry: fn() } };
export const Narrow: Story = { ...Selected, parameters: { viewport: { value: 'mobile1' } } };
export const SelectionInteraction: Story = { ...ManyRows, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('checkbox', { name: 'Select all rows on this page' }));
  await expect(c.getByText(copy.selected(25))).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.selectAll(62) }));
  await expect(c.getByText(copy.allSelected(62))).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.clearSelection }));
  await expect(c.queryByRole('region', { name: copy.selectionLabel })).not.toBeInTheDocument();
} };
export const LinkDoesNotOpenDrawer: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('link', { name: copy.stories.rows[0].name }));
  await expect(args.onRowOpen).not.toHaveBeenCalled();
  await expect(c.queryByRole('dialog')).not.toBeInTheDocument();
} };
