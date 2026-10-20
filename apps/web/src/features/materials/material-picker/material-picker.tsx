'use client';

import { useEffect, useRef, useState } from 'react';
import { formatMoney } from '../material-money';
import { copy } from './material-picker.data';

export type MaterialPickerOption = { id: string; name: string; unit: string; sku: string; priceCents: number | null };
export type MaterialPickerProps = {
  search: (query: string, signal: AbortSignal) => Promise<MaterialPickerOption[]>;
  selected: { id: string; name: string } | null;
  onSelect: (option: MaterialPickerOption) => void;
  onClear: () => void;
  showPrices?: boolean;
  disabled?: boolean;
};

type State = { status: 'idle' | 'loading' | 'error'; options: MaterialPickerOption[] };

/** Type-ahead search over the active catalog. Searches on demand so large catalogs are never loaded whole. */
export function MaterialPicker({ search, selected, onSelect, onClear, showPrices = false, disabled = false }: MaterialPickerProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ status: 'idle', options: [] });
  const sequence = useRef(0);

  useEffect(() => {
    if (!open) return;
    const run = ++sequence.current;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setState(current => ({ ...current, status: 'loading' }));
      search(query, controller.signal).then(
        options => { if (run === sequence.current) setState({ status: 'idle', options }); },
        () => { if (run === sequence.current && !controller.signal.aborted) setState({ status: 'error', options: [] }); },
      );
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, open, search]);

  if (selected) {
    return (
      <div className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-line bg-paper px-3 py-2">
        <span className="min-w-0 text-sm font-semibold text-ink wrap-anywhere">{copy.selected(selected.name)}</span>
        <button type="button" className="min-h-11 shrink-0 rounded-xl px-3 text-sm font-semibold text-primary focus-visible:focus-ring" onClick={() => { setQuery(''); onClear(); }}>{copy.clear}</button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="search" role="combobox" aria-expanded={open} aria-controls="material-picker-results" aria-label={copy.label} autoComplete="off" disabled={disabled}
        className="min-h-11 w-full rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink focus-visible:focus-ring"
        placeholder={copy.placeholder} value={query}
        onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setOpen(true); }}
        onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}
      />
      {open && (
        <div id="material-picker-results" role="listbox" aria-label={copy.results} className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-paper p-1 shadow-lg">
          {state.status === 'loading' && <p className="m-0 p-3 text-sm text-muted" role="status">{copy.searching}</p>}
          {state.status === 'error' && <p className="m-0 p-3 text-sm text-danger" role="alert">{copy.error}</p>}
          {state.status === 'idle' && state.options.length === 0 && <p className="m-0 p-3 text-sm text-muted">{copy.empty}</p>}
          {state.status !== 'error' && state.options.map(option => (
            <button
              key={option.id} type="button" role="option" aria-selected={false}
              className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-canvas focus-visible:focus-ring"
              onClick={() => { setOpen(false); setQuery(''); onSelect(option); }}
            >
              <span className="min-w-0"><span className="block text-sm font-semibold text-ink wrap-anywhere">{option.name}</span><span className="block text-xs text-muted">{option.sku ? `${option.sku} · ` : ''}{option.unit}</span></span>
              {showPrices && option.priceCents !== null && <span className="shrink-0 text-sm text-ink">{formatMoney(option.priceCents)}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
