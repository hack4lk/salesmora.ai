'use client';

import { MaterialThumb } from '../material-thumb/material-thumb';
import { copy } from './material-name-cell.data';

export type MaterialNameCellProps = { name: string; sku: string; archived?: boolean; imageUrl?: string };

export function MaterialNameCell({ name, sku, archived = false, imageUrl = '' }: MaterialNameCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <MaterialThumb name={name} imageUrl={imageUrl} />
      <div className="grid min-w-0 max-w-56 gap-1">
        <span className="font-semibold wrap-anywhere">{name}{archived && <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-xs font-semibold text-muted">{copy.archived}</span>}</span>
        {sku && <span className="text-xs text-muted">{sku}</span>}
      </div>
    </div>
  );
}
