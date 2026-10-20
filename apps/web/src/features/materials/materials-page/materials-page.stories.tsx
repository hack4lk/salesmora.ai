'use client';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { MaterialsPage, type MaterialsPageProps } from './materials-page';
import { defaultMaterialsFilters, defaultMaterialsSort, type MaterialsPageFilters, type MaterialsPageSort } from '../materials-page.types';
import { MaterialDialog, type MaterialDialogMode } from '../material-dialog/material-dialog';
import { MaterialRejectDialog } from '../material-reject-dialog/material-reject-dialog';
import { MaterialArchiveDialog } from '../material-archive-dialog/material-archive-dialog';
import { filterMaterials, materialFixtures, materialOptions, materialsMany, materialsPreviewData } from '../materials-preview.data';
import type { MaterialView } from '@salesmora/contracts';

type Props = Partial<MaterialsPageProps> & { data?: MaterialView[]; initialStatus?: MaterialsPageFilters['status'] };
const access = { canManage: true, canPropose: true, canExport: true, canViewPrices: true, canViewCosts: true };

function Stateful({ data: initial = materialFixtures, initialStatus = 'active', ...rest }: Props) {
  const [data, setData] = useState(initial), [filters, setFilters] = useState<MaterialsPageFilters>({ ...defaultMaterialsFilters, status: initialStatus }), [sort, setSort] = useState<MaterialsPageSort>(defaultMaterialsSort);
  const [page, setPage] = useState(1), [pageSize, setPageSize] = useState(25), [last, setLast] = useState('');
  const [dialog, setDialog] = useState<{ mode: MaterialDialogMode; row?: MaterialView } | null>(null), [rejecting, setRejecting] = useState<MaterialView | null>(null), [archiving, setArchiving] = useState<MaterialView | null>(null);
  const matched = filterMaterials(data, filters, sort), flags = { ...access, ...rest };
  const update = (row: MaterialView, patch: Partial<MaterialView>) => setData(current => current.map(item => (item.id === row.id ? { ...item, ...patch } : item)));
  return (
    <>
      <MaterialsPage rows={matched.slice((page - 1) * pageSize, page * pageSize)} total={matched.length} page={page} pageSize={pageSize} options={materialOptions(data)} pendingProposals={data.filter(row => row.status === 'proposed').length}
        filters={filters} sort={sort} {...flags} onFilters={next => { setFilters(next); setPage(1); }} onSort={next => { setSort(next); setPage(1); }} onPage={setPage} onPageSize={size => { setPageSize(size); setPage(1); }}
        onAdd={() => setDialog({ mode: flags.canManage ? 'create' : 'propose' })} onEdit={row => setDialog({ mode: 'edit', row })} onArchive={setArchiving} onRestore={row => update(row, { archived: false })}
        onApprove={row => setDialog({ mode: 'approve', row })} onReject={setRejecting} onWithdraw={row => setData(current => current.filter(item => item.id !== row.id))} onExport={() => setLast('export')} onRetry={() => setLast('retry')} />
      <MaterialDialog open={!!dialog} mode={dialog?.mode ?? 'create'} material={dialog?.row} canViewCosts={flags.canViewCosts!} canViewPrices={flags.canViewPrices!} {...materialOptions(data)} existingNames={data.map(row => row.name)}
        onClose={() => setDialog(null)} onSubmit={values => { if (dialog?.row) update(dialog.row, { name: values.name, status: dialog.mode === 'approve' ? 'active' : dialog.row.status }); setLast(`saved ${values.name}`); setDialog(null); }} />
      <MaterialRejectDialog open={!!rejecting} name={rejecting?.name ?? ''} onClose={() => setRejecting(null)} onSubmit={reason => { if (rejecting) update(rejecting, { status: 'rejected', rejectionReason: reason }); setRejecting(null); }} />
      <MaterialArchiveDialog open={!!archiving} name={archiving?.name ?? ''} onClose={() => setArchiving(null)} onConfirm={() => { if (archiving) update(archiving, { archived: true }); setArchiving(null); }} />
      <p role="status" aria-label="Last action" className="mt-4 text-xs text-muted">{last}</p>
    </>
  );
}

const meta = {
  title: 'Materials/MaterialsPage', component: MaterialsPage, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{materialsPreviewData.workspace}</h1><Story /></main>],
} satisfies Meta<typeof MaterialsPage>;
export default meta;
type Story = StoryObj<typeof meta>;
const render = (props: Props = {}) => ({ render: () => <Stateful {...props} /> }) as Pick<Story, 'render'>;
const noop = { onFilters: fn(), onSort: fn(), onPage: fn(), onPageSize: fn(), onAdd: fn(), onEdit: fn(), onArchive: fn(), onRestore: fn(), onApprove: fn(), onReject: fn(), onWithdraw: fn() };
const base = { rows: [], total: 0, page: 1, pageSize: 25, options: { categories: [], suppliers: [] }, pendingProposals: 0, filters: defaultMaterialsFilters, sort: defaultMaterialsSort, ...access, ...noop };

export const Catalog: Story = {
  args: base, ...render(),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByLabelText('Search materials'), 'copper');
    await expect(await c.findByText('2 items in this view', {}, { timeout: 4000 })).toBeVisible();
    await expect(c.getAllByText(/\$39.00/)[0]).toBeInTheDocument();
  },
};
export const AddMaterial: Story = {
  args: base, ...render(),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Add material' }));
    const dialog = within(document.body);
    await userEvent.click(await dialog.findByRole('button', { name: 'Add to catalog' }));
    await expect(await dialog.findByText('Enter a name.')).toBeInTheDocument();
    await userEvent.type(dialog.getByRole('textbox', { name: /^Name/ }), 'PVC cement, 8 oz');
    await expect(await dialog.findByText(/already has an item named/)).toBeInTheDocument();
    await userEvent.type(dialog.getByLabelText('Cost per unit ($)'), '10');
    await userEvent.type(dialog.getByLabelText('Markup %'), '50');
    await userEvent.click(dialog.getByRole('button', { name: 'Set price from cost' }));
    await expect(dialog.getByLabelText('Price per unit ($)')).toHaveValue('15.00');
    await expect(dialog.getByText('Margin 33.3%')).toBeInTheDocument();
  },
};
export const ArchiveItem: Story = {
  args: base, ...render(),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getAllByRole('button', { name: 'Archive' })[0]);
    await expect(await within(document.body).findByText('Archive material')).toBeInTheDocument();
  },
};
export const Proposals: Story = {
  args: base, ...render({ initialStatus: 'proposed' }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByText('Matches “PVC cement, 8 oz”')[0]).toBeInTheDocument();
    await userEvent.click(c.getAllByRole('button', { name: 'Reject' })[0]);
    await userEvent.type(await within(document.body).findByLabelText('Reason'), 'Duplicate');
    await userEvent.click(within(document.body).getByRole('button', { name: 'Reject proposal' }));
    await waitFor(() => expect(c.getByText('1 item in this view')).toBeVisible());
  },
};
export const OfficeProposer: Story = { args: base, ...render({ canManage: false, canViewCosts: false, canViewPrices: false, initialStatus: 'proposed', data: materialFixtures.map(row => (row.status === 'proposed' ? { ...row, costCents: null, priceCents: null, marginPercent: null } : row)) }) };
export const ReadOnlyNoPrices: Story = { args: base, ...render({ canManage: false, canPropose: false, canExport: false, canViewCosts: false, canViewPrices: false }) };
export const ManyPages: Story = { args: base, ...render({ data: materialsMany }) };
export const Empty: Story = { args: base, ...render({ data: [] }) };
export const Loading: Story = { args: { ...base, state: 'loading' } };
export const ErrorState: Story = { args: { ...base, state: 'error' } };
export const Mobile: Story = { args: base, ...render(), parameters: { viewport: { defaultViewport: 'mobile1' } } };
