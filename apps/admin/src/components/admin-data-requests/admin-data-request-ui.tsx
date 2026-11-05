import type { ReactNode } from 'react';
import { ConfirmDialog } from '@salesmora/ui';

export function formatDataRequestDateTime(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Invalid date'
    : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(date);
}

export function DataRequestStatus({ label, tone }: {
  label: string;
  tone: 'neutral' | 'warning' | 'success' | 'info' | 'danger';
}) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-700',
    warning: 'bg-amber-50 text-amber-800',
    success: 'bg-emerald-50 text-emerald-800',
    info: 'bg-blue-50 text-blue-800',
    danger: 'bg-red-50 text-red-800',
  };
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${tones[tone]}`}>{label}</span>;
}

export function DataRequestEmptyState({ children }: { children: ReactNode }) {
  return <p className="m-0 rounded-xl border border-line bg-paper px-4 py-10 text-center text-sm text-muted">{children}</p>;
}

export function DataRequestDetailsDialog({ title, subtitle, onClose, children }: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return <ConfirmDialog open title={title} description={subtitle ?? 'Read-only request details.'} confirmLabel="Close"
    cancelLabel="Close" onConfirm={onClose} onClose={onClose} initialFocus="content">
    <dl className="m-0 grid gap-3">{children}</dl>
  </ConfirmDialog>;
}

export function DataRequestDetail({ label, children }: { label: string; children: ReactNode }) {
  return <div className="grid gap-1 border-b border-line pb-2 last:border-b-0">
    <dt className="text-xs font-semibold text-muted">{label}</dt>
    <dd className="m-0 break-words text-sm text-ink">{children}</dd>
  </div>;
}
