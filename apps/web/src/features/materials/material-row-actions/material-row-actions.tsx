'use client';
import type { MaterialView } from '@salesmora/contracts';
import { woButton } from '../../work-orders/work-order-ui';
import type { MaterialsRowHandlers } from '../materials-page.types';
import { copy } from './material-row-actions.data';

export type MaterialRowActionsProps = MaterialsRowHandlers & { row: MaterialView; canManage: boolean; pending?: boolean };
const small = `${woButton} min-h-9 px-3 py-1`;

/** Managers edit, archive and decide on proposals; proposers can only withdraw their own. */
export function MaterialRowActions({ row, canManage, pending = false, onEdit, onArchive, onRestore, onApprove, onReject, onWithdraw }: MaterialRowActionsProps) {
  const button = (label: string, run: () => void) => <button type="button" className={small} disabled={pending} onClick={run}>{label}</button>;
  return (
    <div className="flex flex-wrap gap-2" onClick={event => event.stopPropagation()}>
      {row.status === 'active' && canManage && !row.archived && <>{button(copy.edit, () => onEdit(row))}{button(copy.archive, () => onArchive(row))}</>}
      {row.status === 'active' && canManage && row.archived && button(copy.restore, () => onRestore(row))}
      {row.status === 'proposed' && canManage && <>{button(copy.approve, () => onApprove(row))}{button(copy.reject, () => onReject(row))}</>}
      {row.status === 'proposed' && !canManage && button(copy.withdraw, () => onWithdraw(row))}
    </div>
  );
}
