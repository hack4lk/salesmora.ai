'use client';

import { useId } from 'react';
import MuiPagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import { paginationData as copy } from './pagination.data';

export type PaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  pageSizeOptions?: readonly number[];
  label?: string;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  /** Consumer applies the new size and resets the page to 1 in a single update. */
  onPageSizeChange: (pageSize: number) => void;
};

const positiveInteger = (value: number) => Number.isSafeInteger(value) && value > 0;

/** Generic presentation; the consumer owns URL state, scoped totals and loading. */
export function Pagination({ total, page, pageSize, pageSizeOptions = [25, 50, 100], label = copy.label, disabled = false, onPageChange, onPageSizeChange }: PaginationProps) {
  const id = useId();
  const safeTotal = Number.isSafeInteger(total) && total >= 0 ? total : 0;
  const size = positiveInteger(pageSize) ? pageSize : 25;
  const pages = Math.max(1, Math.ceil(safeTotal / size));
  const current = positiveInteger(page) ? Math.min(page, pages) : 1;
  const sizes = [...new Set([...pageSizeOptions.filter(positiveInteger), size])].sort((left, right) => left - right);

  return <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
    <p role="status" aria-atomic="true" className="m-0 text-sm text-muted">{copy.range(safeTotal === 0 ? 0 : (current - 1) * size + 1, Math.min(current * size, safeTotal), safeTotal)}</p>
    <div className="flex min-w-0 max-w-full flex-wrap items-center gap-4">
      <label htmlFor={id} className="flex flex-wrap items-center gap-3 text-sm text-muted">{copy.pageSize}
        <select id={id} value={size} disabled={disabled} onChange={event => {
          const value = Number(event.target.value);
          if (!disabled && sizes.includes(value) && value !== size) onPageSizeChange(value);
        }} className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-3 py-2 text-base font-semibold text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted">
          {sizes.map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <MuiPagination aria-label={label} count={pages} page={current} siblingCount={0} boundaryCount={1} disabled={disabled || safeTotal === 0}
        className="max-w-full [&_.MuiPagination-ul]:gap-1" getItemAriaLabel={copy.item}
        onChange={(_event, value) => { if (!disabled && safeTotal > 0 && value !== current) onPageChange(value); }}
        renderItem={item => <PaginationItem {...item} className={item.type.includes('ellipsis')
          ? 'm-0 flex h-11 min-w-6 items-center justify-center px-0 text-muted'
          : 'm-0 min-h-11 min-w-11 cursor-pointer rounded-xl px-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring [&.Mui-selected]:bg-primary [&.Mui-selected]:text-paper [&.Mui-selected:hover]:bg-primary-dark disabled:cursor-not-allowed'}/>}/>
    </div>
  </div>;
}
