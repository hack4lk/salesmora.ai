'use client';
import { woButton, woPrimary } from '../../work-orders/work-order-ui';
import { copy } from './materials-toolbar.data';

export type MaterialsToolbarProps = { total: number; canManage: boolean; canPropose: boolean; canExport: boolean; exporting?: boolean; disabled?: boolean; onAdd: () => void; onExport?: () => void };

export function MaterialsToolbar({ total, canManage, canPropose, canExport, exporting = false, disabled = false, onAdd, onExport }: MaterialsToolbarProps) {
  if (!canManage && !canPropose && !canExport) return null;
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
        {canExport && <button type="button" className={woButton} disabled={disabled || exporting || total === 0} onClick={onExport}>{exporting ? copy.exporting : copy.export}</button>}
        {(canManage || canPropose) && <button type="button" className={woPrimary} disabled={disabled} onClick={onAdd}>{canManage ? copy.add : copy.propose}</button>}
    </div>
  );
}
