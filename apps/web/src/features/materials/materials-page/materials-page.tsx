'use client';
import { DataTable, Pagination } from '@salesmora/ui';
import type { MaterialListResult, MaterialView } from '@salesmora/contracts';
import { MaterialCard } from '../material-card/material-card';
import { MaterialNameCell } from '../material-name-cell/material-name-cell';
import { MaterialRowActions } from '../material-row-actions/material-row-actions';
import { MaterialStatusTabs } from '../material-status-tabs/material-status-tabs';
import { MaterialsFilters } from '../materials-filters/materials-filters';
import { MaterialsToolbar } from '../materials-toolbar/materials-toolbar';
import { formatMoney } from '../material-money';
import type { MaterialsPageFilters, MaterialsPageSort, MaterialsRowHandlers } from '../materials-page.types';
import { copy } from './materials-page.data';

export type MaterialsPageProps = Pick<MaterialListResult, 'rows' | 'total' | 'page' | 'pageSize' | 'options' | 'pendingProposals' | 'canManage' | 'canPropose' | 'canExport' | 'canViewPrices' | 'canViewCosts'> & MaterialsRowHandlers & {
  filters: MaterialsPageFilters; sort: MaterialsPageSort; state?: 'ready' | 'loading' | 'error'; exporting?: boolean; pendingId?: string;
  onFilters: (filters: MaterialsPageFilters) => void; onSort: (sort: MaterialsPageSort) => void; onPage: (page: number) => void; onPageSize: (size: number) => void;
  onAdd: () => void; onExport?: () => void; onRetry?: () => void;
};

/** Composes the catalog: tabs, filters, toolbar, table (cards on mobile) and pagination. */
export function MaterialsPage(props: MaterialsPageProps) {
  const { rows, total, page, pageSize, options, pendingProposals, canManage, canPropose, canExport, canViewPrices, canViewCosts, filters, sort, state = 'ready', exporting = false, pendingId } = props;
  const disabled = state === 'loading', catalog = filters.status === 'active';
  const filtered = filters.q !== '' || filters.category !== 'all' || filters.supplier !== 'all' || filters.archived;
  const empty = filtered ? copy.noMatch : filters.status === 'proposed' ? copy.emptyProposals : filters.status === 'rejected' ? copy.emptyRejected : canManage ? copy.empty : canPropose ? copy.emptyPropose : copy.emptyReadOnly;
  const actions = (row: MaterialView) => <MaterialRowActions row={row} canManage={canManage} pending={pendingId === row.id} onEdit={props.onEdit} onArchive={props.onArchive} onRestore={props.onRestore} onApprove={props.onApprove} onReject={props.onReject} onWithdraw={props.onWithdraw} />;
  const columns = [
    { id: 'name', label: copy.columns.name, sortable: true, render: (row: MaterialView) => <MaterialNameCell name={row.name} sku={row.sku} archived={row.archived} imageUrl={row.imageUrl} /> },
    { id: 'category', label: copy.columns.category, sortable: true, render: (row: MaterialView) => row.category || copy.none },
    { id: 'supplier', label: copy.columns.supplier, render: (row: MaterialView) => row.supplier || copy.none },
    { id: 'unit', label: copy.columns.unit, render: (row: MaterialView) => copy.units[row.unit] },
    ...(canViewCosts ? [{ id: 'cost', label: copy.columns.cost, render: (row: MaterialView) => formatMoney(row.costCents) }] : []),
    ...(canViewPrices ? [{ id: 'price', label: copy.columns.price, sortable: true, render: (row: MaterialView) => formatMoney(row.priceCents) }] : []),
    ...(canViewCosts && canViewPrices ? [{ id: 'margin', label: copy.columns.margin, render: (row: MaterialView) => (row.marginPercent === null ? copy.none : `${row.marginPercent}%`) }] : []),
    ...(catalog ? []
      : filters.status === 'proposed' ? [{ id: 'proposedBy', label: copy.columns.proposedBy, render: (row: MaterialView) => <div className="grid gap-1"><span>{row.proposedByName ?? copy.none}</span>{row.duplicateOf && <span className="text-xs font-semibold text-error">{copy.duplicateOf(row.duplicateOf)}</span>}</div> }]
        : [{ id: 'reason', label: copy.columns.reason, render: (row: MaterialView) => row.rejectionReason || copy.none }]),
    { id: 'actions', label: copy.columns.actions, render: actions },
  ];
  return (
    <div className="grid min-w-0 gap-6">
      {(canManage || canPropose) && <MaterialStatusTabs status={filters.status} pendingProposals={pendingProposals} canManage={canManage} disabled={disabled} onChange={status => props.onFilters({ ...filters, status, archived: false })} />}
      <MaterialsFilters filters={filters} options={options} canManage={canManage} disabled={disabled} onFilters={props.onFilters} />
      <MaterialsToolbar total={total} canManage={canManage} canPropose={canPropose} canExport={canExport && catalog} exporting={exporting} disabled={disabled} onAdd={props.onAdd} onExport={props.onExport} />
      {!canManage && !canPropose && <p className="m-0 rounded-2xl border border-line bg-paper p-4 text-sm text-muted">{copy.readOnly}</p>}
      <DataTable caption={copy.caption} rows={rows} getRowId={row => row.id} getRowLabel={row => row.name} onRowOpen={canManage && catalog ? row => !row.archived && props.onEdit(row) : undefined}
        sort={sort} onSort={(column, direction) => props.onSort({ column: column as MaterialsPageSort['column'], direction })} state={state} onRetry={props.onRetry} emptyMessage={empty} errorMessage={copy.error}
        renderCard={row => <MaterialCard material={row} canViewCosts={canViewCosts} canViewPrices={canViewPrices} actions={actions(row)} />} columns={columns} />
      <Pagination total={total} page={page} pageSize={pageSize} disabled={disabled} onPageChange={props.onPage} onPageSizeChange={props.onPageSize} />
    </div>
  );
}
