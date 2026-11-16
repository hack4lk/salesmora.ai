'use client';

import { useId } from 'react';
import { FormFeedback } from '@salesmora/ui';
import { homeAttentionWidgetData as copy } from './home-attention-widget.data';

export type HomeAttentionItem = {
  /** Stable, resource-qualified identity; each readable record appears once. */
  id: string;
  title: string;
  reason: string;
  metadata: string;
  overdue: boolean;
  action: string;
  /** An authorized, workspace-scoped destination, resolved by the caller. */
  href: string;
};

export type HomeAttentionState =
  | { status: 'ready'; items: readonly HomeAttentionItem[]; total: number }
  | { status: 'loading' }
  | { status: 'error'; onRetry: () => void; retrying?: boolean };

export interface HomeAttentionWidgetProps {
  state: HomeAttentionState;
}

/** The caller supplies distinct, authorized records in approved priority order. */
export function HomeAttentionWidget({ state }: HomeAttentionWidgetProps) {
  const id = useId();
  const items = state.status === 'ready' ? state.items.slice(0, 5) : [];
  return (
    <section
      aria-labelledby={`${id}-title`}
      aria-busy={state.status === 'loading' || (state.status === 'error' && state.retrying)}
      className="min-w-0 rounded-2xl border border-line bg-paper"
    >
      <header className="px-6 pb-4 pt-6">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold leading-normal text-ink">{copy.title}</h2>
      </header>
      {state.status === 'loading' && (
        <div className="px-6 pb-6">
          <p role="status" className="m-0 text-sm leading-6 text-muted">{copy.loading}</p>
          <div aria-hidden="true" className="mt-6 grid gap-6">
            <div className="h-3 w-5/6 rounded-full bg-line" />
            <div className="h-3 w-3/5 rounded-full bg-line" />
            <div className="h-3 w-5/6 rounded-full bg-line" />
          </div>
        </div>
      )}
      {state.status === 'error' && (
        <div className="grid gap-4 px-6 pb-6">
          <FormFeedback kind="error" title={copy.errorTitle} message={copy.error} />
          <button
            type="button"
            onClick={state.onRetry}
            disabled={state.retrying}
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted"
          >
            {copy.retry}
          </button>
        </div>
      )}
      {state.status === 'ready' && (
        items.length === 0 ? (
          <p className="m-0 px-6 pb-6 text-sm leading-6 text-muted">{copy.empty}</p>
        ) : (
          <>
            <ul className="m-0 list-none px-6 pb-2">
              {items.map(item => (
                <li key={item.id} className="flex min-w-0 flex-wrap items-center gap-4 border-t border-line py-4">
                  <div className="min-w-0 basis-44 grow">
                    <p className={`m-0 text-xs font-semibold leading-5 wrap-anywhere ${item.overdue ? 'text-error' : 'text-ink'}`}>{item.reason}</p>
                    <h3 className="mb-0 mt-1 text-base font-semibold leading-6 text-ink wrap-anywhere">{item.title}</h3>
                    <p className="mb-0 mt-1 text-sm leading-6 text-muted wrap-anywhere">{item.metadata}</p>
                  </div>
                  <a
                    href={item.href}
                    aria-label={copy.actionName(item.action, item.title)}
                    className="ml-auto inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring"
                  >
                    {item.action}
                  </a>
                </li>
              ))}
            </ul>
            {state.total > items.length && (
              <p className="m-0 px-6 pb-6 text-xs leading-5 text-muted">{copy.remainder(items.length, state.total)}</p>
            )}
          </>
        )
      )}
    </section>
  );
}
