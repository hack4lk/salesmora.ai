'use client';

import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { filterChipData as copy } from './filter-chip.data';

export type FilterChipProps = {
  label: string;
  onRemove: () => void;
  disabled?: boolean;
};

/** One active filter. The owning feature updates its query and fetches scoped results. */
export function FilterChip({ label, onRemove, disabled = false }: FilterChipProps) {
  return <button type="button" disabled={disabled} onClick={onRemove} aria-label={copy.remove(label)}
    className="inline-flex min-h-11 max-w-full min-w-0 cursor-pointer items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-left text-sm leading-5 font-semibold text-primary-dark hover:bg-primary/20 focus-visible:focus-ring disabled:cursor-not-allowed disabled:border-line disabled:bg-canvas disabled:text-muted">
    <span className="min-w-0 wrap-anywhere">{label}</span>
    <CloseOutlined aria-hidden="true" className="size-4 shrink-0"/>
  </button>;
}
