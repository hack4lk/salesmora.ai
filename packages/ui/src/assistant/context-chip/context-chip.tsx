'use client';

import { CloseOutlined } from '../../icons';
import { contextChipData as copy } from './context-chip.data';

export type ContextChipProps = {
  /** Display label only. The host resolves/authorizes the actual context independently. */
  label: string;
  disabled?: boolean;
  /** Controlled removal. The host clears its references and restores focus to the composer. */
  onClear?: () => void;
};
const surface = 'inline-flex min-h-11 min-w-0 max-w-full items-center gap-3 rounded-full border border-assistant-border bg-assistant-message px-4 py-2 text-left text-sm leading-5 font-semibold text-assistant-foreground';

/** Assistant-only presentation. Clearing context never grants access to other records. */
export function ContextChip({ label, disabled = false, onClear }: ContextChipProps) {
  if (!label.trim()) return null;
  const text = <span className="min-w-0 wrap-anywhere">{copy.using(label)}</span>;
  if (!onClear) return <span className={surface}>{text}</span>;
  return <button type="button" disabled={disabled} aria-label={copy.clear(label)}
    className={`${surface} cursor-pointer hover:bg-assistant-header focus-visible:focus-ring focus-visible:outline-assistant-accent disabled:cursor-not-allowed disabled:text-assistant-muted`}
    onClick={() => { if (!disabled) onClear(); }}>
    {text}<CloseOutlined aria-hidden="true" className="size-4 shrink-0 text-assistant-accent"/>
  </button>;
}
