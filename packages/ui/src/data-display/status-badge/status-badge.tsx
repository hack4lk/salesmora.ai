export type StatusBadgeTone = 'neutral' | 'info' | 'warning' | 'success' | 'error';

export type StatusBadgeProps = {
  label: string;
  tone?: StatusBadgeTone;
  /** Decorative marker; the visible text always supplies the meaning. */
  dot?: boolean;
};

const tones: Record<StatusBadgeTone, string> = {
  neutral: 'border-line bg-canvas text-muted',
  info: 'border-primary/20 bg-primary/10 text-primary-dark',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  success: 'border-success/20 bg-success/10 text-success',
  error: 'border-error/20 bg-error/10 text-red-800',
};

/** Passive status label, reusable without coupling to a feature's status enum. */
export function StatusBadge({ label, tone = 'neutral', dot = false }: StatusBadgeProps) {
  return <span className={`inline-flex max-w-full min-w-0 items-center gap-2 rounded-full border px-3 py-1 text-sm leading-5 font-semibold ${tones[tone]}`}>
    {dot && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current"/>}
    <span className="min-w-0 wrap-anywhere">{label}</span>
  </span>;
}
