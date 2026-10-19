'use client';

import type { ReactNode } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { DataTable, StatusBadge, Pagination, type DataTableColumn, type StatusBadgeTone } from '@salesmora/ui';
import { leadsTableData as copy } from './leads-table.data';
import { createLeadDateFormatter } from '../lead-date';

export type LeadTableRow = {
  id: string; name: string; service: string;
  stage: typeof copy.stages[number]['value']; source: typeof copy.sources[number]['value'];
  owner: { id: string; name: string } | null; createdAt: string; archived: boolean; canRestore: boolean;
};
export type LeadTableSort = { column: typeof copy.columns[number]['id']; direction: 'asc' | 'desc' };
export type LeadsTableProps = {
  rows: readonly LeadTableRow[]; total: number; page: number; pageSize: number;
  now: string; timezone: string;
  sort: LeadTableSort;
  state?: 'ready' | 'loading' | 'error'; filtered?: boolean;
  selection?: { ids: readonly string[]; allMatching?: boolean; onChange: (ids: string[]) => void; onClear: () => void; onSelectAllMatching?: () => void };
  getLeadHref: (row: LeadTableRow) => string;
  onRowOpen?: (row: LeadTableRow) => void;
  onRestore?: (row: LeadTableRow) => void;
  onSort?: (sort: LeadTableSort) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onClearFilters?: () => void; onRetry?: () => void;
};
const tones: Record<LeadTableRow['stage'], StatusBadgeTone> = { new: 'neutral', contacted: 'info', 'estimate-sent': 'warning', won: 'success', lost: 'error' };
const action = 'min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring';

/** Lead results are already authorized, sorted and paged by the caller. */
export function LeadsTable({ rows, total, page, pageSize, now, timezone, sort, state = 'ready', filtered = false, selection, getLeadHref, onRowOpen, onRestore, onSort, onPageChange, onPageSizeChange, onClearFilters, onRetry }: LeadsTableProps) {
  const formatCreated = createLeadDateFormatter(now, timezone);
  function created(row: LeadTableRow) {
    const value = formatCreated(row.createdAt);
    if (!value) return <span className="text-muted">{copy.dateUnavailable}</span>;
    const { age, exact } = value;
    const relative = age === 0 ? copy.today : age === 1 ? copy.yesterday : age > 1 ? copy.daysAgo(age) : value.displayDate;
    return <Tooltip title={exact} describeChild><time dateTime={row.createdAt} tabIndex={0} aria-label={copy.dateLabel(relative, exact)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') event.stopPropagation(); }} className="inline-block rounded-lg text-muted focus-visible:focus-ring">{relative}</time></Tooltip>;
  }
  function lead(row: LeadTableRow) {
    return <div className="grid min-w-0 gap-2"><a href={getLeadHref(row)} className="w-fit max-w-full rounded-lg font-semibold text-primary wrap-anywhere hover:underline focus-visible:focus-ring">{row.name}</a>
      {row.archived && <div className="flex flex-wrap items-center gap-2"><StatusBadge label={copy.archived}/>{row.canRestore && onRestore && <button type="button" className={action} onClick={() => onRestore(row)}>{copy.restore}</button>}</div>}
    </div>;
  }
  const stage = (row: LeadTableRow) => <StatusBadge label={copy.stages.find(stage => stage.value === row.stage)!.label} tone={tones[row.stage]} dot/>;
  const owner = (row: LeadTableRow) => row.owner ? <span>{row.owner.name}</span> : <StatusBadge label={copy.unassigned}/>;
  const render: Record<LeadTableSort['column'], (row: LeadTableRow) => ReactNode> = { name: lead, service: row => row.service, stage,
    source: row => <StatusBadge label={copy.sources.find(source => source.value === row.source)!.label}/>, owner, created };
  const columns: DataTableColumn<LeadTableRow>[] = copy.columns.map(column => ({ ...column, sortable: true, render: render[column.id] }));
  const selectedIds = selection?.allMatching ? rows.map(row => row.id) : selection?.ids ?? [];
  const pageSelected = rows.length > 0 && rows.every(row => selectedIds.includes(row.id));
  const count = selection?.allMatching ? total : selectedIds.length;

  return <div className="grid min-w-0 gap-4">
    {state === 'ready' && selection && count > 0 && <section aria-label={copy.selectionLabel} className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-4">
      <p role="status" className="m-0 text-sm font-semibold text-primary-dark">{selection.allMatching ? copy.allSelected(total) : copy.selected(count)}</p>
      {!selection.allMatching && pageSelected && total > rows.length && selection.onSelectAllMatching && <button type="button" className={action} onClick={selection.onSelectAllMatching}>{copy.selectAll(total)}</button>}
      <button type="button" className={action} onClick={selection.onClear}>{copy.clearSelection}</button>
    </section>}
    {state === 'ready' && rows.length > 0 && onSort && <div className="flex flex-wrap items-center gap-3 md:hidden">
      <label className="flex flex-wrap items-center gap-3 text-sm text-muted">{copy.sortBy}<select value={sort.column} onChange={event => onSort({ column: event.target.value as LeadTableSort['column'], direction: sort.direction })} className="min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-3 py-2 text-ink focus-visible:focus-ring">{copy.columns.map(column => <option key={column.id} value={column.id}>{column.label}</option>)}</select></label>
      <button type="button" className={action} aria-label={copy.reverseSort(sort.direction)} onClick={() => onSort({ ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' })}>{sort.direction === 'asc' ? copy.ascending : copy.descending}</button>
    </div>}
    <DataTable caption={copy.caption} rows={rows} columns={columns} getRowId={row => row.id} getRowLabel={row => row.name} sort={sort}
      onSort={onSort ? (column, direction) => { if (copy.columns.some(item => item.id === column)) onSort({ column: column as LeadTableSort['column'], direction }); } : undefined}
      selectedIds={selectedIds} onSelectionChange={selection?.onChange} onRowOpen={onRowOpen} state={state} onRetry={onRetry}
      emptyMessage={filtered ? copy.filteredEmpty : copy.empty} errorMessage={copy.error}
      renderCard={row => <div className="grid min-w-0 gap-3">{lead(row)}<p className="m-0 text-sm text-muted">{row.service}</p><dl className="m-0 grid gap-3 text-sm">{(['stage', 'owner', 'created'] as const).map(key => <div key={key} className="flex flex-wrap items-center justify-between gap-2"><dt className="text-muted">{copy.columns.find(column => column.id === key)!.label}</dt><dd className="m-0 max-w-full">{render[key](row)}</dd></div>)}</dl></div>}/>
    {state === 'ready' && rows.length === 0 && filtered && onClearFilters && <div><button type="button" className={action} onClick={onClearFilters}>{copy.clearFilters}</button></div>}
    {state === 'ready' && <Pagination total={total} page={page} pageSize={pageSize} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}/>}
  </div>;
}
