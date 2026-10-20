'use client';
import type { MaterialStatus } from '@salesmora/contracts';
import { woButton, woPrimary } from '../../work-orders/work-order-ui';
import { copy } from './material-status-tabs.data';

export type MaterialStatusTabsProps = { status: MaterialStatus; pendingProposals: number; canManage: boolean; disabled?: boolean; onChange: (status: MaterialStatus) => void };

/** Managers see the proposal queue; proposers also see their rejected items. */
export function MaterialStatusTabs({ status, pendingProposals, canManage, disabled = false, onChange }: MaterialStatusTabsProps) {
  const tabs = (['active', 'proposed', 'rejected'] as const).filter(tab => tab !== 'rejected' || !canManage);
  return (
    <div role="group" aria-label={copy.label} className="flex flex-wrap gap-2">
      {tabs.map(tab => (
        <button key={tab} type="button" disabled={disabled} aria-pressed={status === tab} className={status === tab ? woPrimary : woButton} onClick={() => onChange(tab)}>
          {copy[tab]}{tab === 'proposed' && pendingProposals > 0 && ` · ${copy.pending(pendingProposals)}`}
        </button>
      ))}
    </div>
  );
}
