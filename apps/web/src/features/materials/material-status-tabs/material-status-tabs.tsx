'use client';
import { useId, type ReactNode } from 'react';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import type { MaterialStatus } from '@salesmora/contracts';
import { copy } from './material-status-tabs.data';

export type MaterialStatusTabsProps = { status: MaterialStatus; pendingProposals: number; disabled?: boolean; onChange: (status: MaterialStatus) => void; children?: ReactNode };

const tabs = ['active', 'proposed'] as const;

export function MaterialStatusTabs({ status, pendingProposals, disabled = false, onChange, children }: MaterialStatusTabsProps) {
  const id = useId();
  const selected = status === 'active' ? 'active' : 'proposed';
  return (
    <div className="min-w-0">
      <Tabs
        value={selected}
        onChange={(_, next: (typeof tabs)[number]) => onChange(next)}
        aria-label={copy.label}
        className="border-b border-line"
      >
        {tabs.map(tab => (
          <Tab
            key={tab}
            id={`${id}-${tab}`}
            value={tab}
            disabled={disabled}
            aria-controls={`${id}-panel`}
            label={tab === 'proposed' && pendingProposals > 0 ? `${copy[tab]} · ${copy.pending(pendingProposals)}` : copy[tab]}
          />
        ))}
      </Tabs>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${selected}`} tabIndex={0} className="mt-6 min-w-0 focus-visible:focus-ring">
        {children}
      </div>
    </div>
  );
}
