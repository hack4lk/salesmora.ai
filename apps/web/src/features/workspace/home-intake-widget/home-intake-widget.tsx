'use client';

import { useId } from 'react';
import type { IntakeListView } from '@salesmora/contracts';
import { ArrowForwardOutlined, FormFeedback, HelpTooltip } from '@salesmora/ui';
import { intakeReviewListData as intakeCopy } from '../../lead-capture/intake-review-list/intake-review-list.data';
import { homeIntakeWidgetData as copy } from './home-intake-widget.data';

export type HomeIntakeItem = Pick<IntakeListView['rows'][number], 'id' | 'name' | 'summary' | 'source' | 'flags' | 'receivedAt' | 'canReview'> & {
  /** Only readable awaiting items with an authorized detail destination. */
  status: 'awaiting';
  href: string;
};
export type HomeIntakeState =
  | { status: 'ready'; items: readonly HomeIntakeItem[]; total: number }
  | { status: 'loading' }
  | { status: 'error'; onRetry: () => void; retrying?: boolean };
export interface HomeIntakeWidgetProps {
  state: HomeIntakeState;
  timezone: string;
  intakeHref: string;
}

/** The caller supplies distinct authorized awaiting items, flagged first then oldest received. */
export function HomeIntakeWidget({ state, timezone, intakeHref }: HomeIntakeWidgetProps) {
  const id = useId();
  const items = state.status === 'ready' ? state.items.slice(0, 3) : [];
  const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone });
  return (
    <section aria-labelledby={`${id}-title`} aria-busy={state.status === 'loading' || (state.status === 'error' && state.retrying)} className="min-w-0 rounded-2xl border border-line bg-paper">
      <header className="flex flex-wrap items-start justify-between gap-3 px-6 pb-4 pt-6">
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold leading-normal text-ink">{copy.title}</h2>
            <HelpTooltip label={copy.about} paragraphs={[copy.description]} />
          </div>
          {state.status === 'ready' && <p className="mb-0 mt-1 text-sm leading-5 text-muted">{copy.awaiting(state.total)}</p>}
        </div>
        <a href={intakeHref} className="inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold text-primary hover:text-primary-dark focus-visible:focus-ring">{copy.view}<ArrowForwardOutlined aria-hidden="true" className="size-4" /></a>
      </header>
      {state.status === 'loading' && <p role="status" className="m-0 px-6 pb-6 text-sm leading-6 text-muted">{copy.loading}</p>}
      {state.status === 'error' && <div className="grid gap-4 px-6 pb-6">
        <FormFeedback kind="error" title={copy.errorTitle} message={copy.error} />
        <button type="button" disabled={state.retrying} onClick={state.onRetry} className="min-h-11 w-fit rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted">{copy.retry}</button>
      </div>}
      {state.status === 'ready' && (items.length === 0 ? <p className="m-0 px-6 pb-6 text-sm leading-6 text-muted">{copy.empty}</p> : <>
        <ul className="m-0 list-none px-6 pb-2">
          {items.map(item => {
            const name = item.name.trim() || intakeCopy.unnamed;
            const action = item.canReview ? intakeCopy.review : intakeCopy.view;
            return <li key={item.id} className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-t border-line py-2">
              <div className="min-w-0 basis-44 grow">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="m-0 text-sm font-semibold leading-5 text-ink wrap-anywhere">{name}</h3>
                  <p className="m-0 text-sm leading-5 text-muted wrap-anywhere">{item.summary.trim() || intakeCopy.noSummary}</p>
                </div>
                <p className="m-0 text-xs leading-5 text-muted wrap-anywhere">
                  {item.source.name} · {intakeCopy.sources[item.source.type]} · <time dateTime={item.receivedAt}>{formatter.format(new Date(item.receivedAt))}</time>
                </p>
                <p className="m-0 text-xs font-semibold leading-5 text-ink wrap-anywhere">{item.flags.length ? item.flags.map(flag => intakeCopy.flags[flag]).join(' · ') : intakeCopy.clear}</p>
              </div>
              <a href={item.href} aria-label={intakeCopy.actionLabel(action, name)} className="ml-auto inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring">{action}</a>
            </li>;
          })}
        </ul>
        {state.total > items.length && <p className="m-0 px-6 pb-6 text-xs leading-5 text-muted">{copy.remainder(items.length, state.total)}</p>}
      </>)}
    </section>
  );
}
